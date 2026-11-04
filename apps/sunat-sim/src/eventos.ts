import { EventEmitter } from 'node:events';

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
