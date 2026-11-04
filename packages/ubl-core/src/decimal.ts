/**
 * Decimal de punto fijo (10 decimales) sobre BigInt. Los montos tributarios no se calculan con
 * `number`: 1.005 * 100 = 100.49999999999999 en IEEE-754, y eso cambia un redondeo.
 */
const ESCALA = 10;
const FACTOR = 10n ** BigInt(ESCALA);

export type DecimalLike = Decimal | number | string;

export class Decimal {
  private constructor(private readonly v: bigint) {}

  static readonly CERO = new Decimal(0n);

  static de(valor: DecimalLike): Decimal {
    if (valor instanceof Decimal) return valor;
    const s = typeof valor === 'number' ? numeroATexto(valor) : valor.trim();
    const m = /^(-)?(\d+)(?:\.(\d+))?$/.exec(s);
    if (!m) throw new RangeError(`Decimal inválido: ${s}`);
    const [, signo, entero = '0', frac = ''] = m;
    if (frac.length > ESCALA) throw new RangeError(`Más de ${String(ESCALA)} decimales: ${s}`);
    const v = BigInt(entero) * FACTOR + BigInt(frac.padEnd(ESCALA, '0'));
    return new Decimal(signo ? -v : v);
  }

  static sumarTodos(valores: Iterable<DecimalLike>): Decimal {
    let total = Decimal.CERO;
    for (const v of valores) total = total.sumar(v);
    return total;
  }

  sumar(o: DecimalLike): Decimal {
    return new Decimal(this.v + Decimal.de(o).v);
  }

  restar(o: DecimalLike): Decimal {
    return new Decimal(this.v - Decimal.de(o).v);
  }

  /** Producto redondeado a 10 decimales (half-up). */
  multiplicar(o: DecimalLike): Decimal {
    return new Decimal(dividirRedondeando(this.v * Decimal.de(o).v, FACTOR));
  }

  /** Cociente redondeado a 10 decimales (half-up). */
  dividir(o: DecimalLike): Decimal {
    const d = Decimal.de(o).v;
    if (d === 0n) throw new RangeError('División por cero');
    return new Decimal(dividirRedondeando(this.v * FACTOR, d));
  }

  /** Redondeo comercial (half-up, simétrico respecto a cero) a `decimales`. */
  redondear(decimales: number): Decimal {
    const paso = 10n ** BigInt(ESCALA - decimales);
    return new Decimal(dividirRedondeando(this.v, paso) * paso);
  }

  comparar(o: DecimalLike): -1 | 0 | 1 {
    const b = Decimal.de(o).v;
    return this.v < b ? -1 : this.v > b ? 1 : 0;
  }

  esCero(): boolean {
    return this.v === 0n;
  }

  /** Texto con exactamente `decimales` cifras decimales (redondeo half-up). */
  aTexto(decimales = 2): string {
    const r = this.redondear(decimales).v;
    const abs = r < 0n ? -r : r;
    const entero = (abs / FACTOR).toString();
    const frac = (abs % FACTOR).toString().padStart(ESCALA, '0').slice(0, decimales);
    return `${r < 0n ? '-' : ''}${entero}${decimales ? `.${frac}` : ''}`;
  }

  /** Texto sin ceros finales (cantidades y precios unitarios, hasta 10 decimales). */
  aTextoCompacto(): string {
    return this.aTexto(ESCALA).replace(/\.?0+$/, '');
  }

  toString(): string {
    return this.aTextoCompacto();
  }
}

/** a / b con redondeo half-up simétrico respecto a cero, para cualquier signo. */
function dividirRedondeando(a: bigint, b: bigint): bigint {
  const negativo = a < 0n !== b < 0n;
  const A = a < 0n ? -a : a;
  const B = b < 0n ? -b : b;
  const q = A / B + ((A % B) * 2n >= B ? 1n : 0n);
  return negativo ? -q : q;
}

function numeroATexto(n: number): string {
  if (!Number.isFinite(n)) throw new RangeError(`Decimal inválido: ${String(n)}`);
  // toFixed(10) evita la notación exponencial (1e-7) y fija la escala.
  return n.toFixed(ESCALA);
}
