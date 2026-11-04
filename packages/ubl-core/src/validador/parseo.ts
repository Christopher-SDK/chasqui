import { DOMParser } from '@xmldom/xmldom';

export interface Hallazgo {
  codigo: string;
  mensaje: string;
  /** Regla de origen, p. ej. `ValidaExprRegFactura-2.0.1.xsl:L1508`. */
  fuente: string;
}

export class XmlIlegible extends Error {}

export function parsear(xml: string): Document {
  const errores: string[] = [];
  let doc: Document;
  try {
    doc = new DOMParser({
      onError: (nivel, msg) => {
        if (nivel !== 'warning') errores.push(msg);
      },
    }).parseFromString(xml.replace(/^\uFEFF/, ''), 'text/xml') as unknown as Document;
  } catch (e) {
    // xmldom 0.9 lanza ParseError ante errores fatales en lugar de notificarlos por onError.
    throw new XmlIlegible(e instanceof Error ? e.message : String(e));
  }
  if (errores.length || !(doc.documentElement as Element | null))
    throw new XmlIlegible(errores.join('; ') || 'XML vacío');
  return doc;
}
