import type {
  AfectacionSoportada,
  Cliente,
  Comprobante,
  DocumentoReferencia,
  Emisor,
  Item,
  NotaCredito,
  NotaDebito,
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
    extra: { afectacion?: AfectacionSoportada; unidad?: Item['unidad']; codigo?: string } = {},
  ): this {
    this.c.items.push({
      descripcion,
      cantidad,
      valorUnitario,
      unidad: extra.unidad ?? 'NIU',
      afectacion: extra.afectacion ?? '10',
      ...(extra.codigo ? { codigo: extra.codigo } : {}),
    });
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
