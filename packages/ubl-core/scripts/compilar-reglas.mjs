#!/usr/bin/env node
// Compila las hojas XSL oficiales de SUNAT (paquete SFS/OSE, descargadas y verificadas con SHA-256
// por tools/sunat-oficial/descargar.mjs) a un árbol JSON que ejecuta src/validador/xslt.ts.
// El resultado se versiona; regenerarlo es determinista (docs/adr/0011).
//
// Solo se conserva lo que afecta al veredicto: plantillas, parámetros, variables, llamadas,
// condiciones, iteraciones y texto. La salida (copy-of, elementos literales) se descarta.
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DOMParser } from '@xmldom/xmldom';
import xpath from 'xpath';

const aqui = dirname(fileURLToPath(import.meta.url));
const BASE = resolve(aqui, '../../../.cache/sunat-oficial/validation');
const SALIDA = resolve(aqui, '../src/validador/oficial');
const XSL = 'http://www.w3.org/1999/XSL/Transform';

export const HOJAS = {
  factura: 'xsl/2.X/ValidaExprRegFactura-2.0.1.xsl',
  boleta: 'xsl/2.X/ValidaExprRegBoleta-2.0.1.xsl',
  'nota-credito': 'xsl/2.X/ValidaExprRegNC-2.0.1.xsl',
  'nota-debito': 'xsl/2.X/ValidaExprRegND-2.0.1.xsl',
  'guia-remitente': 'xsl/2.X/ValidaExprRegGreRemitente-2.0.1.xsl',
  resumen: 'xsl/1.X/ValidaExprRegSummary-1.1.0.xsl',
  baja: 'xsl/1.X/ValidaExprRegSummaryVoided-1.0.1.xsl',
};

// La hoja de GRE incluye con la ruta absoluta de una instalación del SFS.
const SFS = /^(file:\/\/)?\/cpe\/data\/sunat_archivos\/sfs\/VALI\/commons\//;
const sha = (texto) => createHash('sha256').update(texto).digest('hex');

/** Expresiones compiladas una vez para fallar aquí, y no en producción, si alguna no se entiende. */
// XPath admite espacio entre el nombre de una función y «(» («not (x)»); la librería `xpath` no.
// Quitarlo no cambia el significado. Solo con nombres de función: «and (x)» es un operador.
const FUNCIONES =
  /\b(not|count|sum|string|number|boolean|concat|substring|string-length|translate|round|floor|ceiling|contains|starts-with|normalize-space|local-name|name|position|last|true|false|key)\s+\(/g;

function verificarXPath(original, donde) {
  const expr = original.replace(FUNCIONES, '$1(');
  try {
    xpath.parse(expr);
  } catch (e) {
    throw new Error(`${donde}: XPath no soportado: ${expr}`, { cause: e });
  }
  return expr;
}

function hijos(nodo) {
  const out = [];
  for (let n = nodo.firstChild; n; n = n.nextSibling) out.push(n);
  return out;
}

/**
 * Instrucciones: tuplas compactas.
 *   ['if', test, cuerpo]            ['choose', [[test, cuerpo]...], cuerpoOtherwise|null]
 *   ['var', nombre, select|null, cuerpo|null]
 *   ['call', nombre, linea, params]  ['apply', select, modo|null, linea, params]
 *   ['each', select, cuerpo]        ['value', select]            ['text', texto]
 * params: [[nombre, select|null, cuerpo|null]...]
 */
function compilarCuerpo(nodo, archivo) {
  const out = [];
  for (const n of hijos(nodo)) {
    if (n.nodeType === 3 || n.nodeType === 4) {
      // Texto literal: solo cuenta dentro de variables (xsl:text o texto no vacío).
      if (n.data.trim()) out.push(['text', n.data]);
      continue;
    }
    if (n.nodeType !== 1) continue;
    const donde = `${archivo}:L${n.lineNumber}`;
    if (n.namespaceURI !== XSL) {
      // Elemento literal (salida o extensiones de DataPower): no afecta al veredicto.
      continue;
    }
    const a = (k) => (n.hasAttribute(k) ? n.getAttribute(k) : null);
    const x = (k) => (a(k) === null ? null : verificarXPath(a(k), donde));
    switch (n.localName) {
      case 'if':
        out.push(['if', x('test'), compilarCuerpo(n, archivo)]);
        break;
      case 'choose': {
        const cuando = [];
        let otro = null;
        for (const h of hijos(n).filter((h) => h.nodeType === 1)) {
          if (h.localName === 'when')
            cuando.push([
              verificarXPath(h.getAttribute('test'), donde),
              compilarCuerpo(h, archivo),
            ]);
          else if (h.localName === 'otherwise') otro = compilarCuerpo(h, archivo);
          else throw new Error(`${donde}: hijo inesperado en choose: ${h.localName}`);
        }
        out.push(['choose', cuando, otro]);
        break;
      }
      case 'variable':
      case 'param':
        out.push([
          'var',
          a('name'),
          x('select'),
          a('select') === null ? compilarCuerpo(n, archivo) : null,
        ]);
        break;
      case 'call-template':
        out.push(['call', a('name'), n.lineNumber, compilarParams(n, archivo)]);
        break;
      case 'apply-templates':
        out.push([
          'apply',
          x('select') ?? 'node()',
          a('mode'),
          n.lineNumber,
          compilarParams(n, archivo),
        ]);
        break;
      case 'for-each':
        if (hijos(n).some((h) => h.nodeType === 1 && h.localName === 'sort'))
          throw new Error(`${donde}: xsl:sort no soportado`);
        out.push(['each', x('select'), compilarCuerpo(n, archivo)]);
        break;
      case 'value-of':
        out.push(['value', x('select')]);
        break;
      case 'text':
        out.push(['text', n.textContent]);
        break;
      case 'copy-of':
      case 'message':
      case 'element':
      case 'attribute':
      case 'comment':
        // Salida: se descarta. Los mensajes de error se interceptan en rejectCall/addWarning.
        break;
      default:
        throw new Error(`${donde}: instrucción XSLT no soportada: xsl:${n.localName}`);
    }
  }
  return out;
}

function compilarParams(n, archivo) {
  return hijos(n)
    .filter((h) => h.nodeType === 1 && h.localName === 'with-param')
    .map((h) => [
      h.getAttribute('name'),
      h.hasAttribute('select')
        ? verificarXPath(h.getAttribute('select'), `${archivo}:L${h.lineNumber}`)
        : null,
      h.hasAttribute('select') ? null : compilarCuerpo(h, archivo),
    ]);
}

async function compilarHoja(ruta, acumulado) {
  const texto = await readFile(ruta, 'utf8');
  const archivo = basename(ruta);
  acumulado.fuentes[archivo] = sha(texto);
  const doc = new DOMParser().parseFromString(texto, 'text/xml');
  const raiz = doc.documentElement;
  for (const n of hijos(raiz).filter((h) => h.nodeType === 1)) {
    const donde = `${archivo}:L${n.lineNumber}`;
    if (n.namespaceURI !== XSL) {
      if (n.localName === 'function') continue; // func:function (gemfunc:is-blank): no se usa.
      throw new Error(`${donde}: elemento de nivel superior inesperado: ${n.nodeName}`);
    }
    switch (n.localName) {
      case 'include': {
        const href = n.getAttribute('href');
        const destino = SFS.test(href)
          ? join(BASE, href.replace(SFS, ''))
          : resolve(dirname(ruta), href);
        if (!acumulado.incluidos.has(destino)) {
          acumulado.incluidos.add(destino);
          await compilarHoja(destino, acumulado);
        }
        break;
      }
      case 'key':
        acumulado.claves[n.getAttribute('name')] = {
          match: verificarXPath(n.getAttribute('match'), donde),
          use: verificarXPath(n.getAttribute('use'), donde),
        };
        break;
      case 'param':
      case 'variable':
        acumulado.globales.push([
          n.getAttribute('name'),
          n.hasAttribute('select') ? verificarXPath(n.getAttribute('select'), donde) : null,
          n.hasAttribute('select') ? null : compilarCuerpo(n, archivo),
        ]);
        break;
      case 'template': {
        const cuerpo = hijos(n);
        const params = cuerpo
          .filter((h) => h.nodeType === 1 && h.namespaceURI === XSL && h.localName === 'param')
          .map((h) => [
            h.getAttribute('name'),
            h.hasAttribute('select') ? verificarXPath(h.getAttribute('select'), donde) : null,
            h.hasAttribute('select') ? null : compilarCuerpo(h, archivo),
          ]);
        // Los xsl:param ya se recogieron: se quitan del cuerpo antes de compilarlo.
        for (const h of cuerpo)
          if (h.nodeType === 1 && h.namespaceURI === XSL && h.localName === 'param')
            n.removeChild(h);
        acumulado.plantillas.push({
          ...(n.hasAttribute('match') && { match: verificarXPath(n.getAttribute('match'), donde) }),
          ...(n.hasAttribute('name') && { name: n.getAttribute('name') }),
          ...(n.hasAttribute('mode') && { mode: n.getAttribute('mode') }),
          ...(n.hasAttribute('priority') && { priority: Number(n.getAttribute('priority')) }),
          archivo,
          linea: n.lineNumber,
          params,
          cuerpo: compilarCuerpo(n, archivo),
        });
        break;
      }
      case 'output':
      case 'strip-space':
      case 'preserve-space':
        break;
      default:
        throw new Error(`${donde}: elemento de nivel superior no soportado: xsl:${n.localName}`);
    }
  }
  // Prefijos de la hoja (cac, cbc, ext, sac, ds...) para resolver XPath y patrones.
  for (let i = 0; i < raiz.attributes.length; i++) {
    const at = raiz.attributes.item(i);
    if (at.name.startsWith('xmlns:')) acumulado.espacios[at.name.slice(6)] ??= at.value;
  }
}

// ── Catálogos que las reglas leen con document() ────────────────────────────────────────────

const CATALOGO_GRANDE = 100_000; // bytes: en cat_25 (53 317 códigos de producto) solo se guarda @id.

async function compilarCatalogos() {
  const dir = join(BASE, 'catalogo');
  const lock = await readFile(
    resolve(aqui, '../../../tools/sunat-oficial/activos.lock.tsv'),
    'utf8',
  );
  // Todos los cat_*.xml del paquete: las hojas arman el nombre en tiempo de ejecución.
  const usados = new Set([...lock.matchAll(/\/catalogo\/(cat_[^\s/]+\.xml)$/gm)].map((m) => m[1]));
  usados.add('cat_66.xml');
  const catalogos = {};
  for (const archivo of [...usados].sort()) {
    if (!lock.includes(`/catalogo/${archivo}`)) {
      // cat_66 lo citan las hojas pero no viene en el paquete: document() devuelve un conjunto
      // vacío, igual que libxslt cuando el archivo no existe.
      catalogos[archivo] = null;
      continue;
    }
    const xml = (await readFile(join(dir, archivo), 'utf8')).replace(/^[\s\ufeff]+/, '');
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    const filas = [];
    const soloId = xml.length > CATALOGO_GRANDE;
    for (const c of hijos(doc.documentElement).filter((h) => h.nodeType === 1)) {
      const attrs = {};
      for (let i = 0; i < c.attributes.length; i++)
        attrs[c.attributes.item(i).name] = c.attributes.item(i).value;
      filas.push(soloId ? attrs.id : [attrs, c.textContent.trim()]);
    }
    catalogos[archivo] = soloId ? { ids: filas.join('\n') } : { filas };
  }
  return catalogos;
}

await mkdir(SALIDA, { recursive: true });
const resumen = [];
for (const [nombre, ruta] of Object.entries(HOJAS)) {
  const acumulado = {
    fuentes: {},
    incluidos: new Set(),
    claves: {},
    globales: [],
    plantillas: [],
    espacios: {},
  };
  await compilarHoja(join(BASE, ruta), acumulado);
  const { fuentes, claves, globales, plantillas, espacios } = acumulado;
  const hoja = { fuentes, claves, globales, plantillas, espacios };
  const json = JSON.stringify({ archivo: basename(ruta), ...hoja });
  await writeFile(join(SALIDA, `${nombre}.json`), json + '\n');
  resumen.push(
    `${nombre}: ${hoja.plantillas.length} plantillas, ${(json.length / 1024).toFixed(0)} KB`,
  );
}
const catalogos = await compilarCatalogos();
await writeFile(join(SALIDA, 'catalogos.json'), JSON.stringify(catalogos) + '\n');
console.log(resumen.join('\n'));
console.log(`catálogos: ${Object.keys(catalogos).length}`);
