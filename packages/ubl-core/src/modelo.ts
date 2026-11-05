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
 * Tipo de afectación del IGV (catálogo 07): onerosas gravadas (10), IVAP (17), exoneradas (20),
 * inafectas (30) y exportación (40); y las transferencias gratuitas y retiros: gravados (11-16),
 * exonerados (21, 22) e inafectos (31-37).
 */
export type AfectacionSoportada = AfectacionIgv;

/** Sistema de cálculo del ISC (catálogo 08). */
export type SistemaIsc = '01' | '02' | '03';

export interface Isc {
  /** 01: al valor (tasa sobre el valor de venta); 02: específico (monto fijo por unidad); 03: al
   * valor según precio de venta al público (tasa sobre el precio sugerido). */
  sistema: SistemaIsc;
  /** Tasa en tanto por uno (p. ej. 0.17) para los sistemas 01 y 03. */
  tasa?: DecimalLike;
  /** Monto fijo por unidad para el sistema 02. */
  montoFijo?: DecimalLike;
  /** Precio de venta al público sugerido por unidad, con impuestos, para el sistema 03. */
  precioSugerido?: DecimalLike;
}

/** Descuento o cargo: por monto o por factor sobre la base (tanto por uno). */
export interface Ajuste {
  monto?: DecimalLike;
  factor?: DecimalLike;
}

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
  /**
   * En las transferencias gratuitas y retiros, `valorUnitario` es el valor referencial (de
   * mercado) de cada unidad: el XML lleva precio 0 y el valor en PricingReference con tipo 02.
   */
  afectacion: AfectacionSoportada;
  codigo?: string;
  /** Descuento del ítem que reduce la base imponible (catálogo 53, código 00). */
  descuento?: Ajuste;
  /** Impuesto Selectivo al Consumo (tributo 2000). Solo en ítems gravados (10) o IVAP (17). */
  isc?: Isc;
  /**
   * Impuesto al consumo de bolsas de plástico (tributo 7152): la cantidad del ítem es el número
   * de bolsas y el impuesto es cantidad × tarifa por bolsa.
   */
  icbper?: { tarifa?: DecimalLike };
}

/** Cuota del pago al crédito (PaymentTerms FormaPago / CuotaNNN). */
export interface Cuota {
  monto: DecimalLike;
  /** AAAA-MM-DD */
  fechaPago: string;
}

export type FormaPago = { tipo: 'Contado' } | { tipo: 'Credito'; cuotas: Cuota[] };

/** Sistema de detracciones (SPOT): tipo de operación 1001. */
export interface Detraccion {
  /** Código del bien o servicio sujeto a detracción (catálogo 54). */
  codigoBien: string;
  /** Porcentaje (p. ej. 12 para 12 %). Por defecto, la tasa del catálogo 54 para el código. */
  porcentaje?: DecimalLike;
  /** Cuenta de detracciones en el Banco de la Nación (ficticia en Chasqui). */
  cuentaBancoNacion: string;
  /** Medio de pago (catálogo 59). Por defecto '001' (depósito en cuenta). */
  medioPago?: string;
}

/** Régimen de percepción del IGV: tipo de operación 2001. */
export interface Percepcion {
  /** 51: venta interna (2 %); 52: adquisición de combustible (1 %); 53: agente de percepción
   * con tasa especial (0.5 %). Catálogo 53. */
  regimen: '51' | '52' | '53';
}

/** Anticipo recibido antes y deducido en esta factura. */
export interface Anticipo {
  /** 02: factura de anticipo; 03: boleta de anticipo (catálogo 12). */
  tipoDocumento: '02' | '03';
  /** Serie y número del comprobante de anticipo, p. ej. 'F001-10'. */
  serieNumero: string;
  /** Importe total pagado como anticipo (con IGV). */
  monto: DecimalLike;
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
  /**
   * Tasa del IGV en porcentaje: 18 (16 % IGV + 2 % IPM) por defecto, o 10 (8 % + 2 %) del régimen
   * especial de la Ley 31556 para MYPE de restaurantes y hoteles. Chasqui no comprueba si el
   * emisor está acogido al régimen.
   */
  tasaIgv?: '18' | '10';
  /** Descuento global que reduce la base imponible (código 02). Solo con ítems gravados. */
  descuentoGlobal?: Ajuste;
  /** Descuento global que no reduce la base imponible (código 03). */
  descuentoNoAfecto?: DecimalLike;
  /** Otros cargos globales que no forman parte de la base imponible (código 50). */
  cargo?: DecimalLike;
}

export interface Factura extends Base {
  tipo: '01';
  tipoOperacion?: TipoOperacion;
  /** Por defecto, al contado. */
  formaPago?: FormaPago;
  detraccion?: Detraccion;
  percepcion?: Percepcion;
  anticipos?: Anticipo[];
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
