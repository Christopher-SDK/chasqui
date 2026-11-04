import type { AddressInfo } from 'node:net';
import { construirServidor as caosControl } from '@chasqui/chaos-control';
import { FuenteCaos } from '@chasqui/chaos-engine';
import { construirServidor as identidadSim } from '@chasqui/identidad-sim';
import { construirServidor as pagosSim, type OpcionesPagos } from '@chasqui/pagos-sim';
import { construirServidor as sunatSim, type OpcionesServidor } from '@chasqui/sunat-sim';

interface Escuchable {
  listen: (o: { port: number; host: string }) => Promise<string>;
  close: () => Promise<unknown>;
  server: { address: () => unknown };
}

export interface Ecosistema {
  urls: { sunat: string; pagos: string; identidad: string; caos: string };
  pagos: Awaited<ReturnType<typeof pagosSim>>;
  sunat: Awaited<ReturnType<typeof sunatSim>>;
  cerrar: () => Promise<void>;
}

export interface OpcionesEcosistema {
  /** Puertos fijos; 0 (por defecto) = puerto libre al azar. */
  puertos?: Partial<Record<keyof Ecosistema['urls'], number>>;
  host?: string;
  registro?: boolean;
  sunat?: OpcionesServidor;
  pagos?: OpcionesPagos;
}

/**
 * Levanta los cuatro servicios en este proceso, con el caos de chaos-control conectado por SSE
 * como en Docker. Bases de datos en memoria salvo que se pasen en `sunat.db` / `pagos.db`.
 */
export async function levantarEcosistema(o: OpcionesEcosistema = {}): Promise<Ecosistema> {
  const host = o.host ?? '127.0.0.1';
  const abiertos: Escuchable[] = [];
  const fuentes: FuenteCaos[] = [];
  const escuchar = async (app: Escuchable, puerto = 0) => {
    await app.listen({ port: puerto, host });
    abiertos.push(app);
    return `http://${host}:${String((app.server.address() as AddressInfo).port)}`;
  };
  const registro = o.registro ?? false;
  const caos = await escuchar(await caosControl({ registro }), o.puertos?.caos);
  const fuente = async () => {
    const f = new FuenteCaos(caos).iniciar();
    fuentes.push(f);
    // Espera el primer estado del flujo SSE para que el caos rija desde la primera petición.
    await f.listo;
    return f;
  };
  const sunat = await sunatSim({ registro, caos: await fuente(), ...o.sunat });
  const pagos = await pagosSim({ registro, caos: await fuente(), ...o.pagos });
  const identidad = await identidadSim({ registro, caos: await fuente() });
  const urls = {
    caos,
    sunat: await escuchar(sunat, o.puertos?.sunat),
    pagos: await escuchar(pagos, o.puertos?.pagos),
    identidad: await escuchar(identidad, o.puertos?.identidad),
  };
  return {
    urls,
    sunat,
    pagos,
    cerrar: async () => {
      for (const f of fuentes) f.detener();
      for (const a of abiertos.reverse()) await a.close();
    },
  };
}
