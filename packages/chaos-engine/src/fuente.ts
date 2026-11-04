import { EstadoCaos, SIN_CAOS } from './modelo.js';

/**
 * Estado del caos compartido: cada simulador se suscribe al flujo SSE de chaos-control y guarda el
 * último estado en memoria. Si chaos-control no está, el servicio funciona sin caos y reintenta.
 */
export class FuenteCaos {
  private actual: EstadoCaos = SIN_CAOS;
  private detenido = false;
  private abort?: AbortController;
  private avisarListo!: () => void;
  /** Se resuelve al recibir el primer estado de chaos-control (o al fijarlo a mano). */
  readonly listo = new Promise<void>((ok) => (this.avisarListo = ok));

  constructor(private readonly url?: string) {}

  estado = (): EstadoCaos => this.actual;

  /** Fija el estado localmente (pruebas o servicios sin chaos-control). */
  fijar(e: EstadoCaos): void {
    this.actual = EstadoCaos.parse(e);
    this.avisarListo();
  }

  /** Conecta con `${url}/api/v1/caos/flujo` y reconecta con espera creciente si se corta. */
  iniciar(): this {
    if (!this.url) return this;
    void this.bucle();
    return this;
  }

  detener(): void {
    this.detenido = true;
    this.abort?.abort();
  }

  private terminado(): boolean {
    return this.detenido;
  }

  private async bucle() {
    let espera = 500;
    while (!this.detenido) {
      try {
        this.abort = new AbortController();
        const r = await fetch(`${String(this.url)}/api/v1/caos/flujo`, {
          signal: this.abort.signal,
        });
        if (!r.ok || !r.body) throw new Error(`chaos-control respondió ${String(r.status)}`);
        espera = 500;
        let resto = '';
        for await (const trozo of r.body as unknown as AsyncIterable<Uint8Array>) {
          resto += new TextDecoder().decode(trozo);
          const eventos = resto.split('\n\n');
          resto = eventos.pop() ?? '';
          for (const ev of eventos) {
            const linea = ev.split('\n').find((l) => l.startsWith('data: '));
            if (linea) this.fijar(JSON.parse(linea.slice(6)) as EstadoCaos);
          }
        }
      } catch {
        /* sin chaos-control: se sigue sin caos y se reintenta */
      }
      if (this.terminado()) return;
      await new Promise((ok) => setTimeout(ok, espera));
      espera = Math.min(espera * 2, 10_000);
    }
  }
}
