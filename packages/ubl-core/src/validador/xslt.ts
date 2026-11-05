import { DOMImplementation } from '@xmldom/xmldom';
import { mensajeError } from '@chasqui/catalogos';
import xpath, { type XPathResult } from 'xpath';
import type { Hallazgo } from './parseo.js';

/**
 * Intérprete del subconjunto de XSLT 1.0 que usan las hojas de validación oficiales de SUNAT
 * (paquete SFS/OSE), compiladas a JSON por scripts/compilar-reglas.mjs. Ejecuta las reglas
 * oficiales completas, en su orden, sin Python ni libxslt (docs/adr/0011).
 *
 * Semántica de XSLT que se reproduce: plantillas con match/mode/priority y reglas implícitas,
 * call-template y apply-templates con parámetros, alcance de variables (incluida la redefinición
 * que tolera DataPower), fragmentos de árbol resultado, key(), document() y position()/last().
 * Igual que el SFS, el primer rejectCall detiene la validación y cada addWarning es una
 * observación.
 */

type Expr = string;
type Cuerpo = Instr[];
export type Param = [nombre: string, select: Expr | null, cuerpo: Cuerpo | null];
export type Instr =
  | ['if', Expr, Cuerpo]
  | ['choose', [Expr, Cuerpo][], Cuerpo | null]
  | ['var', string, Expr | null, Cuerpo | null]
  | ['call', string, number, Param[]]
  | ['apply', Expr, string | null, number, Param[]]
  | ['each', Expr, Cuerpo]
  | ['value', Expr]
  | ['text', string];

interface Plantilla {
  match?: string;
  name?: string;
  mode?: string;
  priority?: number;
  archivo: string;
  linea: number;
  params: Param[];
  cuerpo: Cuerpo;
}

export interface HojaCompilada {
  archivo: string;
  fuentes: Record<string, string>;
  claves: Record<string, { match: string; use: string }>;
  globales: Param[];
  plantillas: Plantilla[];
  espacios: Record<string, string>;
}

type Catalogo = { ids: string } | { filas: [Record<string, string>, string][] } | null;
export type Catalogos = Record<string, Catalogo>;

/** Excepción interna: equivale a xsl:message terminate="yes" en rejectCall. */
export class Rechazo extends Error {
  constructor(readonly hallazgo: Hallazgo) {
    super(`${hallazgo.codigo}: ${hallazgo.mensaje}`);
  }
}

type Valor = XPathResult | string | number | boolean | Node[];
type Alcance = Record<string, Valor>;

interface Contexto {
  nodo: Node;
  pos: number;
  tam: number;
  vars: Alcance;
  /** Salida de texto (solo dentro de una variable o parámetro con contenido). */
  salida: string[] | null;
}

const EXSLT_FECHAS = 'http://exslt.org/dates-and-times';
const EXSLT_DINAMICO = 'http://exslt.org/dynamic';
const EXSLT_REGEX = 'http://exslt.org/regular-expressions';
const DATAPOWER = 'http://www.datapower.com/extensions';

const compiladas = new Map<string, ReturnType<typeof xpath.parse>>();
function compilar(expr: string) {
  let c = compiladas.get(expr);
  if (!c) {
    c = xpath.parse(expr);
    compiladas.set(expr, c);
  }
  return c;
}

const regexes = new Map<string, RegExp>();
/** matches() de DataPower con la bandera '!': sintaxis de expresiones regulares de Java. */
function regex(patron: string): RegExp {
  let r = regexes.get(patron);
  if (!r) {
    r = new RegExp(patron, /\\p\{/.test(patron) ? 'u' : '');
    regexes.set(patron, r);
  }
  return r;
}

const dom = new DOMImplementation();
const documentoRtf = dom.createDocument(null, 'rtf', null);

/** Fragmento de árbol resultado: un nodo cuyo valor de texto es lo que produjo la variable. */
function fragmento(texto: string): Node[] {
  const e = documentoRtf.createElement('rtf');
  if (texto) e.appendChild(documentoRtf.createTextNode(texto));
  return [e as unknown as Node];
}

const ORDEN = Symbol('orden');
type ConOrden = Node & { [ORDEN]?: number };
const compararOriginal = Reflect.get(
  dom.createDocument(null, 'x', null),
  'compareDocumentPosition',
) as unknown as (this: Node, otro: Node) => number;

/**
 * La librería `xpath` ordena cada conjunto de nodos con compareDocumentPosition, que en xmldom
 * sube por los ancestros en cada comparación (el 80 % del tiempo de validación). Los documentos
 * que valida el intérprete no cambian mientras se ejecuta, así que el orden se numera una vez.
 */
function compararRapido(this: ConOrden, otro: ConOrden): number {
  const a = this[ORDEN];
  const b = otro[ORDEN];
  if (a === undefined || b === undefined) return compararOriginal.call(this, otro);
  if (a === b) return 0;
  return b < a ? 0x02 : 0x04; // DOCUMENT_POSITION_PRECEDING : DOCUMENT_POSITION_FOLLOWING
}

/** Numera el documento en orden de documento (atributos después de su elemento). */
export function numerar(doc: Document): void {
  let i = 0;
  const visitar = (n: Node) => {
    const o = n as ConOrden & { compareDocumentPosition: typeof compararRapido };
    o[ORDEN] = i++;
    o.compareDocumentPosition = compararRapido;
    const attrs = (n as Element).attributes as NamedNodeMap | undefined;
    if (attrs) for (let k = 0; k < attrs.length; k++) visitar(attrs.item(k) as Node);
    for (let h = n.firstChild; h; h = h.nextSibling) visitar(h);
  };
  visitar(doc);
}

const esNodos = (v: XPathResult): v is XPathResult & { toArray(): Node[] } =>
  typeof (v as { toArray?: unknown }).toArray === 'function';

/** Prioridad implícita de un patrón (XSLT 1.0, §5.5). */
function prioridad(alternativa: string): number {
  const p = alternativa.trim();
  if (/^@?[\w.-]+(:[\w.-]+)?$/.test(p)) return 0;
  if (/^@?[\w.-]+:\*$/.test(p)) return -0.25;
  if (/^(@?\*|node\(\)|text\(\)|comment\(\))$/.test(p)) return -0.5;
  return 0.5;
}

interface Regla {
  plantilla: Plantilla;
  patron: string;
  prioridad: number;
  orden: number;
}

/** Hoja lista para ejecutar: índices que no dependen del documento. */
export class Hoja {
  readonly porNombre = new Map<string, Plantilla>();
  readonly porModo = new Map<string, Regla[]>();

  constructor(
    readonly compilada: HojaCompilada,
    readonly catalogos: Catalogos,
  ) {
    compilada.plantillas.forEach((p, orden) => {
      if (p.name) this.porNombre.set(p.name, p);
      if (!p.match) return;
      const modo = p.mode ?? '';
      const reglas = this.porModo.get(modo) ?? [];
      for (const patron of p.match.split('|'))
        reglas.push({
          plantilla: p,
          patron: patron.trim(),
          prioridad: p.priority ?? prioridad(patron),
          orden,
        });
      // Gana la de mayor prioridad y, a igual prioridad, la última de la hoja.
      reglas.sort((a, b) => b.prioridad - a.prioridad || b.orden - a.orden);
      this.porModo.set(modo, reglas);
    });
  }

  private readonly docsCatalogo = new Map<string, Document | null>();

  /** document() sobre un catálogo oficial: árbol `<l><c id=".." ...>texto</c></l>`. */
  catalogo(url: string): Document | null {
    const archivo = url.slice(url.lastIndexOf('/') + 1);
    if (this.docsCatalogo.has(archivo)) return this.docsCatalogo.get(archivo) ?? null;
    if (!(archivo in this.catalogos))
      throw new Error(
        `document(): catálogo no compilado: ${archivo} (scripts/compilar-reglas.mjs)`,
      );
    const datos = this.catalogos[archivo];
    let doc: Document | null = null;
    if (datos) {
      const nuevo = dom.createDocument(null, 'l', null) as unknown as Document;
      doc = nuevo;
      const l = nuevo.documentElement as Element;
      const filas: [Record<string, string>, string][] =
        'ids' in datos ? datos.ids.split('\n').map((id) => [{ id }, '']) : datos.filas;
      for (const [attrs, texto] of filas) {
        const c = nuevo.createElement('c');
        for (const [k, v] of Object.entries(attrs)) c.setAttribute(k, v);
        if (texto) c.appendChild(nuevo.createTextNode(texto));
        l.appendChild(c);
      }
    }
    if (doc) numerar(doc);
    this.docsCatalogo.set(archivo, doc);
    return doc;
  }
}

export interface OpcionesEjecucion {
  /** Parámetros globales de la hoja (p. ej. nombreArchivoEnviado). */
  parametros: Record<string, string>;
  /** Fecha de hoy (AAAA-MM-DD) para current-date() y date:date(). */
  hoy: string;
}

export interface Resultado {
  error?: Hallazgo;
  observaciones: Hallazgo[];
}

/** Ejecuta la hoja sobre un documento, como lo haría el SFS de SUNAT. */
export function ejecutarHoja(hoja: Hoja, doc: Document, o: OpcionesEjecucion): Resultado {
  const e = new Ejecucion(hoja, doc, o);
  try {
    e.correr();
  } catch (err) {
    if (err instanceof Rechazo) return { error: err.hallazgo, observaciones: e.observaciones };
    throw err;
  }
  return { observaciones: e.observaciones };
}

class Ejecucion {
  readonly observaciones: Hallazgo[] = [];
  /** Sitios de llamada (archivo, línea) para citar la regla de la hoja principal. */
  private readonly pila: [string, number][] = [];
  private readonly coincidencias = new Map<string, Set<Node>>();
  private readonly indices = new Map<string, Map<string, Node[]>>();
  private readonly globales: Alcance = {};
  private readonly opcionesXPath;

  constructor(
    private readonly hoja: Hoja,
    private readonly doc: Document,
    private readonly o: OpcionesEjecucion,
  ) {
    numerar(doc);
    const { espacios } = hoja.compilada;
    this.opcionesXPath = {
      namespaces: espacios,
      functions: (nombre: string, ns: string | null) => this.funcion(nombre, ns ?? ''),
    };
  }

  correr(): void {
    const ctx: Contexto = { nodo: this.doc, pos: 1, tam: 1, vars: this.globales, salida: null };
    for (const [nombre, select, cuerpo] of this.hoja.compilada.globales) {
      this.globales[nombre] =
        nombre in this.o.parametros
          ? (this.o.parametros[nombre] as string)
          : this.valorDe(select, cuerpo, ctx);
    }
    this.aplicar([this.doc], '', {}, ctx);
  }

  // ── XPath ────────────────────────────────────────────────────────────────────────────────

  evaluar(expr: string, ctx: Contexto): XPathResult {
    return compilar(expr).evaluate({
      ...this.opcionesXPath,
      node: ctx.nodo,
      position: ctx.pos,
      size: ctx.tam,
      variables: (nombre: string) => {
        if (!(nombre in ctx.vars)) throw new Error(`Variable no declarada: $${nombre}`);
        return ctx.vars[nombre];
      },
    });
  }

  private nodos(expr: string, ctx: Contexto): Node[] {
    const r = this.evaluar(expr, ctx);
    if (!esNodos(r)) throw new Error(`Se esperaba un conjunto de nodos: ${expr}`);
    return r.toArray();
  }

  private funcion(nombre: string, ns: string) {
    const texto = (v: XPathResult) => v.stringValue();
    if (ns === '') {
      switch (nombre) {
        case 'key':
          return (_: unknown, n: XPathResult, v: XPathResult) => this.key(texto(n), v);
        case 'document':
          return (_: unknown, url: XPathResult) => {
            const d = this.hoja.catalogo(texto(url));
            return d ? [d] : [];
          };
        case 'current-date':
          return () => this.o.hoy;
        case 'matches':
          return (_: unknown, v: XPathResult, re: XPathResult) => regex(texto(re)).test(texto(v));
        case 'format-number':
          return (_: unknown, n: XPathResult, patron: XPathResult) =>
            formatNumber(n.numberValue(), texto(patron));
      }
    }
    if (ns === EXSLT_FECHAS) {
      if (nombre === 'date') return () => this.o.hoy;
      if (nombre === 'seconds') return (_: unknown, v: XPathResult) => segundos(texto(v));
      if (nombre === 'difference')
        return (_: unknown, a: XPathResult, b: XPathResult) => diferencia(texto(a), texto(b));
    }
    if (ns === EXSLT_DINAMICO && nombre === 'evaluate')
      return (c: { contextNode: Node }, e: XPathResult) =>
        this.evaluar(texto(e), {
          nodo: c.contextNode,
          pos: 1,
          tam: 1,
          vars: this.globales,
          salida: null,
        });
    if (ns === EXSLT_REGEX && nombre === 'match')
      return (_: unknown, v: XPathResult, re: XPathResult) => {
        const m = regex(texto(re)).exec(texto(v));
        return m ? fragmento(m[0]) : [];
      };
    if (ns === DATAPOWER && nombre === 'variable') return () => '';
    return undefined;
  }

  /** key(): índice por documento de los nodos que cumplen `match`, por el valor de `use`. */
  private key(nombre: string, valor: XPathResult): Node[] {
    let indice = this.indices.get(nombre);
    if (!indice) {
      const clave = this.hoja.compilada.claves[nombre];
      if (!clave) throw new Error(`key(): clave no declarada: ${nombre}`);
      indice = new Map();
      for (const n of this.coincidentes(clave.match)) {
        const ctx: Contexto = { nodo: n, pos: 1, tam: 1, vars: this.globales, salida: null };
        const usos = this.evaluar(clave.use, ctx);
        for (const u of esNodos(usos)
          ? usos.toArray().map((x) => cadena(x))
          : [usos.stringValue()]) {
          const lista = indice.get(u) ?? [];
          lista.push(n);
          indice.set(u, lista);
        }
      }
      this.indices.set(nombre, indice);
    }
    const buscados = esNodos(valor) ? valor.toArray().map((x) => cadena(x)) : [valor.stringValue()];
    const out = new Set<Node>();
    for (const b of buscados) for (const n of indice.get(b) ?? []) out.add(n);
    return [...out];
  }

  /** Nodos del documento que cumplen un patrón de match (XSLT 1.0, §5.2). */
  private coincidentes(patron: string): Set<Node> {
    let s = this.coincidencias.get(patron);
    if (!s) {
      const absoluto = patron.startsWith('/');
      const expr = absoluto ? patron : `//${patron}`;
      const ctx: Contexto = { nodo: this.doc, pos: 1, tam: 1, vars: this.globales, salida: null };
      s = new Set(patron === '/' ? [this.doc] : this.nodos(expr, ctx));
      this.coincidencias.set(patron, s);
    }
    return s;
  }

  // ── Instrucciones ────────────────────────────────────────────────────────────────────────

  private ejecutar(cuerpo: Cuerpo, ctx: Contexto): void {
    for (const ins of cuerpo) {
      switch (ins[0]) {
        case 'if':
          if (this.evaluar(ins[1], ctx).booleanValue()) this.ejecutar(ins[2], hijo(ctx));
          break;
        case 'choose': {
          const rama = ins[1].find(([test]) => this.evaluar(test, ctx).booleanValue());
          const cuerpoRama = rama ? rama[1] : ins[2];
          if (cuerpoRama) this.ejecutar(cuerpoRama, hijo(ctx));
          break;
        }
        case 'var':
          // Se escribe en el alcance actual: una redefinición (que DataPower tolera) reemplaza a
          // la anterior para lo que sigue, y su propio contenido todavía ve la anterior.
          ctx.vars[ins[1]] = this.valorDe(ins[2], ins[3], ctx);
          break;
        case 'call':
          this.llamar(ins[1], ins[2], ins[3], ctx);
          break;
        case 'apply': {
          const params = this.argumentos(ins[4], ctx);
          this.pila.push([this.archivoActual(), ins[3]]);
          try {
            this.aplicar(this.nodos(ins[1], ctx), ins[2] ?? '', params, ctx);
          } finally {
            this.pila.pop();
          }
          break;
        }
        case 'each': {
          const nodos = this.nodos(ins[1], ctx);
          nodos.forEach((nodo, i) => {
            this.ejecutar(ins[2], { ...hijo(ctx), nodo, pos: i + 1, tam: nodos.length });
          });
          break;
        }
        case 'value':
          if (ctx.salida) ctx.salida.push(this.evaluar(ins[1], ctx).stringValue());
          break;
        case 'text':
          if (ctx.salida) ctx.salida.push(ins[1]);
          break;
      }
    }
  }

  private valorDe(select: Expr | null, cuerpo: Cuerpo | null, ctx: Contexto): Valor {
    if (select !== null) return this.evaluar(select, ctx);
    if (!cuerpo || cuerpo.length === 0) return '';
    const salida: string[] = [];
    this.ejecutar(cuerpo, { ...hijo(ctx), salida });
    return fragmento(salida.join(''));
  }

  private argumentos(params: Param[], ctx: Contexto): Alcance {
    const out: Alcance = {};
    for (const [nombre, select, cuerpo] of params) out[nombre] = this.valorDe(select, cuerpo, ctx);
    return out;
  }

  private llamar(nombre: string, linea: number, params: Param[], ctx: Contexto): void {
    const args = this.argumentos(params, ctx);
    if (nombre === 'rejectCall' || nombre === 'addWarning') {
      const codigo = valorTexto(args[nombre === 'rejectCall' ? 'errorCode' : 'warningCode']);
      const hallazgo: Hallazgo = {
        codigo,
        mensaje: mensajeError(codigo),
        fuente: this.fuente(linea),
      };
      if (nombre === 'rejectCall') throw new Rechazo(hallazgo);
      this.observaciones.push(hallazgo);
      return;
    }
    const p = this.hoja.porNombre.get(nombre);
    if (!p) throw new Error(`call-template: plantilla no encontrada: ${nombre}`);
    this.pila.push([this.archivoActual(), linea]);
    try {
      this.invocar(p, args, ctx);
    } finally {
      this.pila.pop();
    }
  }

  private archivoActual(): string {
    return this.enCurso.at(-1) ?? this.hoja.compilada.archivo;
  }

  /** Archivo de cada plantilla en ejecución (las de validate_utils.xsl citan a quien las llamó). */
  private readonly enCurso: string[] = [];

  private invocar(p: Plantilla, args: Alcance, ctx: Contexto): void {
    const vars: Alcance = Object.create(this.globales) as Alcance;
    const local: Contexto = { ...ctx, vars };
    for (const [nombre, select, cuerpo] of p.params)
      vars[nombre] = nombre in args ? (args[nombre] as Valor) : this.valorDe(select, cuerpo, local);
    this.enCurso.push(p.archivo);
    try {
      this.ejecutar(p.cuerpo, local);
    } finally {
      this.enCurso.pop();
    }
  }

  /** La regla se cita por la última llamada hecha desde la hoja principal. */
  private fuente(linea: number): string {
    const principal = this.hoja.compilada.archivo;
    const sitio =
      this.archivoActual() === principal
        ? linea
        : [...this.pila].reverse().find(([archivo]) => archivo === principal)?.[1];
    return `${principal}:L${String(sitio ?? linea)}`;
  }

  private aplicar(nodos: Node[], modo: string, args: Alcance, ctx: Contexto): void {
    const reglas = this.hoja.porModo.get(modo) ?? [];
    nodos.forEach((nodo, i) => {
      const local: Contexto = { ...ctx, nodo, pos: i + 1, tam: nodos.length };
      const regla = reglas.find((r) => this.coincidentes(r.patron).has(nodo));
      if (regla) {
        this.invocar(regla.plantilla, args, local);
        return;
      }
      // Regla implícita: procesar los hijos en el mismo modo, sin parámetros.
      if (nodo.nodeType === 1 || nodo.nodeType === 9) {
        const hijos: Node[] = [];
        for (let h = nodo.firstChild; h; h = h.nextSibling) hijos.push(h);
        this.aplicar(hijos, modo, {}, local);
      }
    });
  }
}

function hijo(ctx: Contexto): Contexto {
  return { ...ctx, vars: Object.create(ctx.vars) as Alcance };
}

function cadena(n: Node): string {
  return n.nodeType === 2 ? (n as Attr).value : (n.textContent ?? '');
}

function valorTexto(v: Valor | undefined): string {
  if (v === undefined) return '';
  if (Array.isArray(v)) return v[0] ? cadena(v[0]) : '';
  if (typeof v === 'object') return v.stringValue();
  return String(v);
}

/** format-number() para los patrones de las hojas («#####0.00»). */
function formatNumber(n: number, patron: string): string {
  const m = /^#*0(\.(0+))?$/.exec(patron);
  if (!m) throw new Error(`format-number(): patrón no soportado: ${patron}`);
  if (Number.isNaN(n)) return 'NaN';
  return n.toFixed((m[2] ?? '').length);
}

// ── EXSLT dates-and-times (solo fechas AAAA-MM-DD, con zona opcional) ────────────────────────

const FECHA = /^(-?\d{4,})-(\d{2})-(\d{2})(Z|[+-]\d{2}:\d{2})?$/;
const DURACION = /^(-)?P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/;

function epoch(fecha: string): number {
  const m = FECHA.exec(fecha);
  if (!m) return Number.NaN;
  const [, a, mes, d, zona] = m;
  let s = Date.UTC(Number(a), Number(mes) - 1, Number(d)) / 1000;
  if (zona && zona !== 'Z') {
    const signo = zona.startsWith('-') ? -1 : 1;
    s -= signo * (Number(zona.slice(1, 3)) * 3600 + Number(zona.slice(4, 6)) * 60);
  }
  return s;
}

/** date:seconds(): segundos de una duración, o desde 1970-01-01 para una fecha. */
function segundos(v: string): number {
  const d = DURACION.exec(v);
  if (d && v !== 'P' && v !== '-P') {
    const [, signo, dias, h, mi, s] = d;
    const total =
      Number(dias ?? 0) * 86400 + Number(h ?? 0) * 3600 + Number(mi ?? 0) * 60 + Number(s ?? 0);
    return signo ? -total : total;
  }
  return epoch(v);
}

/** date:difference(a, b): duración de b − a, o '' si alguna fecha no es válida. */
function diferencia(a: string, b: string): string {
  const s = epoch(b) - epoch(a);
  if (Number.isNaN(s)) return '';
  const abs = Math.abs(s);
  const dias = Math.floor(abs / 86400);
  const resto = abs % 86400;
  const tiempo = resto
    ? `T${resto >= 3600 ? `${String(Math.floor(resto / 3600))}H` : ''}${resto % 3600 >= 60 ? `${String(Math.floor((resto % 3600) / 60))}M` : ''}${resto % 60 ? `${String(resto % 60)}S` : ''}`
    : '';
  const cuerpo = dias || !tiempo ? `${String(dias)}D${tiempo}` : tiempo;
  return `${s < 0 ? '-' : ''}P${cuerpo}`;
}
