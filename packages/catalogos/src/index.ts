import * as g from './generado.js';

export * from './generado.js';

/** Catálogos disponibles, indexados por su número en el Anexo 8. */
export const catalogos = {
  '01': g.catalogo01,
  '02': g.catalogo02,
  '03': g.catalogo03,
  '05': g.catalogo05,
  '06': g.catalogo06,
  '07': g.catalogo07,
  '09': g.catalogo09,
  '10': g.catalogo10,
  '11': g.catalogo11,
  '12': g.catalogo12,
  '16': g.catalogo16,
  '19': g.catalogo19,
  '51': g.catalogo51,
} as const;

export type NumeroCatalogo = keyof typeof catalogos;
export type TipoDocumento = keyof typeof g.catalogo01;
export type Moneda = keyof typeof g.catalogo02;
export type UnidadMedida = keyof typeof g.catalogo03;
export type Tributo = keyof typeof g.catalogo05;
export type TipoDocIdentidad = keyof typeof g.catalogo06;
export type AfectacionIgv = keyof typeof g.catalogo07;
export type MotivoNotaCredito = keyof typeof g.catalogo09;
export type MotivoNotaDebito = keyof typeof g.catalogo10;
export type TipoOperacion = keyof typeof g.catalogo51;

/** ¿`codigo` existe en el catálogo `numero`? */
export function enCatalogo(numero: NumeroCatalogo, codigo: string): boolean {
  return Object.hasOwn(catalogos[numero], codigo);
}

/** Mensaje oficial de un código de error u observación de SUNAT. */
export function mensajeError(codigo: string): string {
  return g.codigosError[codigo] ?? `Código ${codigo} no registrado en CatalogoErrores.xml`;
}

const tributoPorMarca = Object.fromEntries(
  Object.entries(g.catalogo05).map(([id, t]) => [t.name.toLowerCase().slice(0, 3), id as Tributo]),
);

/**
 * Tributos (catálogo 05) válidos para un tipo de afectación del IGV (catálogo 07).
 * Fuente: las marcas de cada fila de cat_07.xml (`igv`, `iva`, `exo`, `ina`, `exp`, `gra`), que el
 * XSL oficial consulta con findElementInCatalogProperty (ValidaExprRegFactura-2.0.1.xsl, regla 2040).
 */
export function tributosDeAfectacion(afectacion: AfectacionIgv): Tributo[] {
  return Object.keys(g.catalogo07[afectacion])
    .filter((k) => k !== 'nombre')
    .map((k) => tributoPorMarca[k])
    .filter((t): t is Tributo => t !== undefined);
}

/** Tributo de una operación onerosa con esa afectación; si solo admite gratuita, 9996. */
export function tributoDeAfectacion(afectacion: AfectacionIgv): Tributo {
  const t = tributosDeAfectacion(afectacion);
  return t.find((x) => x !== '9996') ?? '9996';
}
