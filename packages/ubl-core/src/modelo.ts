import type {
  AfectacionIgv,
  Moneda,
  MotivoNotaCredito,
  MotivoNotaDebito,
  TipoDocIdentidad,
  TipoOperacion,
  UnidadMedida,
} from '@chasqui/catalogos';
import type { DecimalLike } from './decimal.js';

/** Tipos de comprobante soportados (catálogo 01). */
export type TipoComprobante = '01' | '03' | '07' | '08';

/**
 * Afectaciones soportadas: operaciones onerosas gravadas, exoneradas e inafectas.
 * Gratuitas, IVAP, exportación, ISC e ICBPER: ver «Limitaciones conocidas» en el README.
 */
export type AfectacionSoportada = Extract<AfectacionIgv, '10' | '20' | '30'>;

export interface Direccion {
  /** Ubigeo INEI de 6 dígitos. */
  ubigeo: string;
  departamento: string;
  provincia: string;
  distrito: string;
  linea: string;
  /** Código de establecimiento anexo (4 dígitos; '0000' = domicilio fiscal). */
  codigoLocal?: string;
}

export interface Emisor {
  ruc: string;
  razonSocial: string;
  nombreComercial?: string;
  direccion: Direccion;
}

export interface Cliente {
  tipoDocumento: TipoDocIdentidad;
  numeroDocumento: string;
  nombre: string;
}

export interface Item {
  descripcion: string;
  cantidad: DecimalLike;
  unidad: UnidadMedida;
  /** Valor unitario SIN impuestos. */
  valorUnitario: DecimalLike;
  afectacion: AfectacionSoportada;
  codigo?: string;
}

/** Documento al que modifica una nota de crédito o débito. */
export interface DocumentoReferencia {
  tipo: '01' | '03';
  /** Serie y número, p. ej. 'F001-123'. */
  serieNumero: string;
}

interface Base {
  serie: string;
  correlativo: number;
  /** AAAA-MM-DD */
  fechaEmision: string;
  /** hh:mm:ss */
  horaEmision?: string;
  moneda: Moneda;
  emisor: Emisor;
  cliente: Cliente;
  items: Item[];
}

export interface Factura extends Base {
  tipo: '01';
  tipoOperacion?: TipoOperacion;
}

export interface Boleta extends Base {
  tipo: '03';
  tipoOperacion?: TipoOperacion;
}

export interface NotaCredito extends Base {
  tipo: '07';
  motivo: MotivoNotaCredito;
  sustento: string;
  referencia: DocumentoReferencia;
}

export interface NotaDebito extends Base {
  tipo: '08';
  motivo: MotivoNotaDebito;
  sustento: string;
  referencia: DocumentoReferencia;
}

export type Comprobante = Factura | Boleta | NotaCredito | NotaDebito;
