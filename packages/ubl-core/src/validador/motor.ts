import { DOMParser } from '@xmldom/xmldom';
import { enCatalogo, mensajeError, type NumeroCatalogo } from '@chasqui/catalogos';
import xpath from 'xpath';
import { NS } from '../xml.js';

/**
 * Motor que reproduce las plantillas genéricas de validate_utils.xsl (paquete SFS/OSE de SUNAT):
 * existElement, existElementNoVacio, existAndRegexpValidateElement, regexpValidateElementIfExist,
 * findElementInCatalog, isTrueExpresion y los formatos decimales. Las expresiones XPath de cada
 * regla se copian sin cambios del XSL oficial y se evalúan con XPath 1.0, igual que en el SFS.
 *
 * Igual que el SFS, el primer error detiene la validación (xsl:message terminate="yes") y las
 * observaciones se acumulan hasta ese punto.
 */

export type Nodo = Node;
type Variables = Record<string, string | number | boolean | Nodo[]>;

export interface Hallazgo {
  codigo: string;
  mensaje: string;
  /** Regla de origen, p. ej. `ValidaExprRegFactura-2.0.1.xsl:L1508`. */
  fuente: string;
}

/** Excepción interna: equivale a xsl:message terminate="yes". */
export class Rechazo extends Error {
  constructor(readonly hallazgo: Hallazgo) {
    super(`${hallazgo.codigo}: ${hallazgo.mensaje}`);
  }
}

const NAMESPACES = { cac: NS.cac, cbc: NS.cbc, ext: NS.ext, ds: NS.ds };
const cache = new Map<string, ReturnType<typeof xpath.parse>>();

function compilar(expr: string) {
  let c = cache.get(expr);
  if (!c) {
    c = xpath.parse(expr);
    cache.set(expr, c);
  }
  return c;
}

/** Formatos de validate_utils.xsl (existAndValidateValueTwoDecimal / TenDecimal). */
const DECIMAL = {
  2: {
    mayorCero: /^(?!0[0-9]*(\.0*)?$)[0-9]{1,12}(\.[0-9]{1,2})?$/,
    cualquiera: /^(?!(0)[0-9]+$)[0-9]{1,12}(\.[0-9]{1,2})?$/,
  },
  10: {
    mayorCero: /^(?!0[0-9]*(\.0*)?$)[0-9]{1,12}(\.[0-9]{1,10})?$/,
    cualquiera: /^(?!(0)[0-9]+$)[0-9]{1,12}(\.[0-9]{1,10})?$/,
  },
} as const;

export interface OpcionesRegla {
  /** false = observación (isError=false() en el XSL). */
  esError?: boolean;
  /** Línea del XSL oficial de donde se portó la regla. */
  l: number;
}

export class Contexto {
  readonly observaciones: Hallazgo[] = [];

  constructor(
    readonly raiz: Element,
    readonly archivoXsl: string,
    private readonly variablesGlobales: Variables,
  ) {}

  /** Ejecuta `cuerpo` con `nodo` como nodo de contexto y variables locales adicionales. */
  en(nodo: Nodo, variables: Variables = {}): ContextoNodo {
    return new ContextoNodo(this, nodo, {
      ...this.variablesGlobales,
      root: [this.raiz],
      ...variables,
    });
  }

  registrar(codigo: string, o: OpcionesRegla): void {
    const h = {
      codigo,
      mensaje: mensajeError(codigo),
      fuente: `${this.archivoXsl}:L${String(o.l)}`,
    };
    if (o.esError === false) this.observaciones.push(h);
    else throw new Rechazo(h);
  }
}

export class ContextoNodo {
  constructor(
    readonly ctx: Contexto,
    readonly nodo: Nodo,
    readonly variables: Variables,
  ) {}

  private opciones() {
    return { node: this.nodo, namespaces: NAMESPACES, variables: this.variables };
  }

  texto(expr: string): string {
    return compilar(expr).evaluateString(this.opciones());
  }

  numero(expr: string): number {
    return compilar(expr).evaluateNumber(this.opciones());
  }

  verdad(expr: string): boolean {
    return compilar(expr).evaluateBoolean(this.opciones());
  }

  nodos(expr: string): Nodo[] {
    return compilar(expr).select(this.opciones());
  }

  conVariables(extra: Variables): ContextoNodo {
    return new ContextoNodo(this.ctx, this.nodo, { ...this.variables, ...extra });
  }

  // ── Plantillas de validate_utils.xsl ─────────────────────────────────────────────────────

  /** existElement: `not(string($node))`. */
  existe(codigo: string, nodo: string, o: OpcionesRegla): void {
    if (this.texto(nodo) === '') this.ctx.registrar(codigo, o);
  }

  /** existElementNoVacio: `not($node)` (conjunto vacío). */
  existeNodo(codigo: string, nodo: string, o: OpcionesRegla): void {
    if (!this.verdad(nodo)) this.ctx.registrar(codigo, o);
  }

  /** existAndRegexpValidateElement. */
  existeYCumple(
    codigoNoExiste: string,
    codigo: string,
    nodo: string,
    re: RegExp,
    o: OpcionesRegla,
  ): void {
    const v = this.texto(nodo);
    if (v === '') this.ctx.registrar(codigoNoExiste, o);
    else if (!re.test(v)) this.ctx.registrar(codigo, o);
  }

  /** regexpValidateElementIfExist: `count($node) >= 1 and not(matches($node, re))`. */
  cumpleSiExiste(codigo: string, nodo: string, re: RegExp, o: OpcionesRegla): void {
    if (this.numero(`count(${nodo})`) >= 1 && !re.test(this.texto(nodo)))
      this.ctx.registrar(codigo, o);
  }

  /** findElementInCatalog: el valor debe estar en el catálogo si el nodo existe. */
  enCatalogo(codigo: string, nodo: string, catalogo: NumeroCatalogo, o: OpcionesRegla): void {
    if (this.numero(`count(${nodo})`) >= 1 && !enCatalogo(catalogo, this.texto(nodo))) {
      this.ctx.registrar(codigo, o);
    }
  }

  /** isTrueExpresion: la expresión verdadera es el caso de falla. */
  falla(codigo: string, expresion: string | boolean, o: OpcionesRegla): void {
    if (typeof expresion === 'boolean' ? expresion : this.verdad(expresion))
      this.ctx.registrar(codigo, o);
  }

  /** existAndValidateValueTwoDecimal / TenDecimal. */
  existeDecimal(
    codigoNoExiste: string,
    codigo: string,
    nodo: string,
    decimales: 2 | 10,
    o: OpcionesRegla & { mayorCero?: boolean },
  ): void {
    const re = DECIMAL[decimales][o.mayorCero === false ? 'cualquiera' : 'mayorCero'];
    this.existeYCumple(codigoNoExiste, codigo, nodo, re, o);
  }

  /** validateValueTwoDecimalIfExist. */
  decimalSiExiste(codigo: string, nodo: string, o: OpcionesRegla & { mayorCero?: boolean }): void {
    this.cumpleSiExiste(
      codigo,
      nodo,
      DECIMAL[2][o.mayorCero === false ? 'cualquiera' : 'mayorCero'],
      o,
    );
  }

  /** Itera `expr` como xsl:apply-templates / xsl:for-each. */
  cada(
    expr: string,
    cuerpo: (c: ContextoNodo) => void,
    variables: (c: ContextoNodo) => Variables = () => ({}),
  ): void {
    for (const n of this.nodos(expr)) {
      const hijo = new ContextoNodo(this.ctx, n, { ...this.variables });
      cuerpo(hijo.conVariables(variables(hijo)));
    }
  }
}

export class XmlIlegible extends Error {}

export function parsear(xml: string): Document {
  const errores: string[] = [];
  const doc = new DOMParser({
    onError: (nivel, msg) => {
      if (nivel !== 'warning') errores.push(msg);
    },
  }).parseFromString(xml, 'text/xml');
  if (errores.length || !doc.documentElement)
    throw new XmlIlegible(errores.join('; ') || 'XML vacío');
  return doc as unknown as Document;
}
