import type {
  Ajuste,
  Anticipo,
  Cliente,
  Comprobante,
  Cuota,
  Detraccion,
  DocumentoReferencia,
  Emisor,
  Factura,
  Item,
  NotaCredito,
  NotaDebito,
  Percepcion,
} from '@chasqui/ubl-core';

type Tipo = Comprobante['tipo'];
type Moneda = Comprobante['moneda'];

/**
 * Builder fluido de comprobantes. Valida lo mínimo para fallar pronto (campos obligatorios); las
 * reglas de SUNAT las aplica el validador de ubl-core al enviar.
 *
 *   factura().serie('F001', 1).emisor(e).cliente(c).item('Café', 2, '8.50').construir()
 */
export class ConstructorComprobante {
  private c: Partial<Comprobante> & { items: Item[] };

  constructor(tipo: Tipo) {
    const ahora = new Date(Date.now() - 5 * 3600_000).toISOString();
    this.c = {
      tipo,
      moneda: 'PEN',
      fechaEmision: ahora.slice(0, 10),
      horaEmision: ahora.slice(11, 19),
      items: [],
    };
  }

  serie(serie: string, correlativo: number): this {
    Object.assign(this.c, { serie, correlativo });
    return this;
  }

  fecha(fechaEmision: string, horaEmision?: string): this {
    Object.assign(this.c, { fechaEmision, ...(horaEmision ? { horaEmision } : {}) });
    return this;
  }

  moneda(moneda: Moneda): this {
    this.c.moneda = moneda;
    return this;
  }

  emisor(emisor: Emisor): this {
    this.c.emisor = emisor;
    return this;
  }

  /** Cliente con RUC (tipo 6), DNI (tipo 1) u otro documento del catálogo 06. */
  cliente(numeroDocumento: string, nombre: string, tipoDocumento?: Cliente['tipoDocumento']): this {
    const tipo =
      tipoDocumento ??
      (numeroDocumento.length === 11 ? '6' : numeroDocumento.length === 8 ? '1' : '0');
    this.c.cliente = { tipoDocumento: tipo, numeroDocumento, nombre };
    return this;
  }

  /** Línea con valor unitario SIN IGV. Afectación por defecto: gravado (10). */
  item(
    descripcion: string,
    cantidad: Item['cantidad'],
    valorUnitario: Item['valorUnitario'],
    extra: Partial<
      Pick<Item, 'afectacion' | 'unidad' | 'codigo' | 'descuento' | 'isc' | 'icbper'>
    > = {},
  ): this {
    const { unidad = 'NIU', afectacion = '10', ...resto } = extra;
    this.c.items.push({ descripcion, cantidad, valorUnitario, unidad, afectacion, ...resto });
    return this;
  }

  /** Bolsas de plástico (ICBPER, tributo 7152): `cantidad` bolsas a la tarifa vigente o la dada. */
  bolsas(
    cantidad: Item['cantidad'],
    valorUnitario: Item['valorUnitario'],
    tarifa?: Item['valorUnitario'],
  ): this {
    return this.item('Bolsa de plástico', cantidad, valorUnitario, {
      icbper: tarifa === undefined ? {} : { tarifa },
    });
  }

  /** IGV del 18 % (por defecto) o del 10 % del régimen MYPE de la Ley 31556. */
  tasaIgv(tasa: '18' | '10'): this {
    this.c.tasaIgv = tasa;
    return this;
  }

  /** Descuento global que reduce la base imponible (código 02): por monto o por factor. */
  descuento(ajuste: Ajuste): this {
    this.c.descuentoGlobal = ajuste;
    return this;
  }

  /** Descuento global que NO reduce la base imponible (código 03). */
  descuentoNoAfecto(monto: NonNullable<Ajuste['monto']>): this {
    this.c.descuentoNoAfecto = monto;
    return this;
  }

  /** Cargo global fuera de la base imponible (código 50). */
  cargo(monto: NonNullable<Ajuste['monto']>): this {
    this.c.cargo = monto;
    return this;
  }

  /** Solo facturas: al contado (sin argumentos) o al crédito con sus cuotas. */
  formaPago(...cuotas: Cuota[]): this {
    return this.factura({
      formaPago: cuotas.length ? { tipo: 'Credito', cuotas } : { tipo: 'Contado' },
    });
  }

  /** Solo facturas: detracción (SPOT). Fija el tipo de operación 1001. */
  detraccion(detraccion: Detraccion): this {
    return this.factura({ detraccion, tipoOperacion: '1001' });
  }

  /** Solo facturas: percepción del IGV. Fija el tipo de operación 2001. */
  percepcion(regimen: Percepcion['regimen']): this {
    return this.factura({ percepcion: { regimen }, tipoOperacion: '2001' });
  }

  /** Solo facturas: deduce un anticipo ya facturado. Se puede llamar varias veces. */
  anticipo(anticipo: Anticipo): this {
    const previos = (this.c as Partial<Factura>).anticipos ?? [];
    return this.factura({ anticipos: [...previos, anticipo] });
  }

  private factura(campos: Partial<Factura>): this {
    if (this.c.tipo !== '01') throw new TypeError('Solo las facturas (01) admiten esta operación');
    Object.assign(this.c, campos);
    return this;
  }

  /** Solo notas: documento modificado, motivo (catálogo 09 o 10) y sustento. */
  modifica(
    referencia: DocumentoReferencia,
    motivo: NotaCredito['motivo'] | NotaDebito['motivo'],
    sustento: string,
  ): this {
    Object.assign(this.c, { referencia, motivo, sustento });
    return this;
  }

  construir(): Comprobante {
    const faltan = (['serie', 'emisor', 'cliente'] as const).filter((k) => this.c[k] === undefined);
    if (this.c.items.length === 0) faltan.push('items' as never);
    if ((this.c.tipo === '07' || this.c.tipo === '08') && !('referencia' in this.c))
      faltan.push('referencia' as never);
    if (faltan.length) throw new TypeError(`Comprobante incompleto: falta ${faltan.join(', ')}`);
    return structuredClone(this.c) as Comprobante;
  }
}

export const factura = () => new ConstructorComprobante('01');
export const boleta = () => new ConstructorComprobante('03');
export const notaCredito = () => new ConstructorComprobante('07');
export const notaDebito = () => new ConstructorComprobante('08');
