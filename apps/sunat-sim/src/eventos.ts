import { EventEmitter } from 'node:events';
import { contador, trazaActual } from '@chasqui/telemetria';

const contarComprobante = contador(
  'chasqui_comprobantes',
  'Comprobantes recibidos por estado y canal',
);

/** Evento publicado en /_chasqui/eventos (SSE) para el panel y las pruebas. */
export interface Evento {
  tipo: string;
  servicio: string;
  en: string;
  [clave: string]: unknown;
}

/** Bus en memoria; guarda los últimos eventos para quien se conecta tarde. */
export class Eventos {
  private readonly emisor = new EventEmitter().setMaxListeners(0);
  private readonly recientes: Evento[] = [];

  constructor(private readonly capacidad = 200) {}

  emitir(e: Evento): void {
    // La traza activa viaja con el evento: el panel enlaza a Jaeger.
    const traza = trazaActual();
    if (traza) e.traza = traza;
    if (e.tipo === 'comprobante' || e.tipo === 'excepcion')
      contarComprobante({
        estado: e.tipo === 'excepcion' ? 'excepcion' : typeof e.estado === 'string' ? e.estado : '',
        canal: typeof e.canal === 'string' ? e.canal : '',
      });
    this.recientes.push(e);
    if (this.recientes.length > this.capacidad) this.recientes.shift();
    this.emisor.emit('evento', e);
  }

  ultimos(): readonly Evento[] {
    return this.recientes;
  }

  suscribir(fn: (e: Evento) => void): () => void {
    this.emisor.on('evento', fn);
    return () => this.emisor.off('evento', fn);
  }
}
