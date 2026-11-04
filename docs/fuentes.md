# Fuentes de las reglas de negocio

Chasqui no inventa reglas de SUNAT. Cada regla implementada sale de una de estas fuentes, y la
conformidad se **comprueba ejecutando las reglas oficiales** (ver §2). Si una regla no se pudo
confirmar, está marcada en el código como `TODO verificar` y listada en
[Limitaciones conocidas](../README.md#limitaciones-conocidas).

## 1. Paquete oficial de validación de SUNAT (SFS/OSE)

SUNAT publica en [cpe.sunat.gob.pe › Guías y manuales](https://cpe.sunat.gob.pe/guias-y-manuales)
las reglas de validación de comprobantes UBL 2.1 en dos formas: un Excel y su versión ejecutable en
XSLT, la misma que usa el Facturador SUNAT (SFS) y que deben aplicar los OSE. Ese paquete contiene:

| Archivo                                        | Uso en Chasqui                               |
| ---------------------------------------------- | -------------------------------------------- |
| `xsl/2.X/ValidaExprRegFactura-2.0.1.xsl`       | Reglas de factura (01), oráculo y referencia |
| `xsl/2.X/ValidaExprRegBoleta-2.0.1.xsl`        | Reglas de boleta (03)                        |
| `xsl/2.X/ValidaExprRegNC-2.0.1.xsl`            | Reglas de nota de crédito (07)               |
| `xsl/2.X/ValidaExprRegND-2.0.1.xsl`            | Reglas de nota de débito (08)                |
| `xsl/1.X/ValidaExprRegSummary-1.1.0.xsl`       | Resumen diario (fase 2)                      |
| `xsl/1.X/ValidaExprRegSummaryVoided-1.0.1.xsl` | Comunicación de baja (fase 2)                |
| `xsl/2.X/ValidaExprRegGreRemitente-2.0.1.xsl`  | Guía de remisión remitente (fase 2)          |
| `catalogo/cat_NN.xml`                          | Catálogos del Anexo 8 → `packages/catalogos` |
| `catalogo/CatalogoErrores.xml`                 | 1 998 códigos de error/observación oficiales |

**Cómo se obtiene.** El portal de SUNAT responde `403` a clientes automatizados, y Chasqui no evade
ese bloqueo. Por eso `tools/sunat-oficial/descargar.mjs` toma los archivos de una réplica pública
que los versiona con su SHA-256: [muglerman/ublkit-java](https://github.com/muglerman/ublkit-java)
(MIT), commit `2319342d`, verificada el 2026-10-19 contra la fuente normativa. Cada archivo se
comprueba contra `tools/sunat-oficial/activos.lock.tsv`; si un hash no coincide, la descarga falla.
La réplica solo cambia rutas de `xsl:include`, marcadas con `<!-- Inicio: UBLKit -->`.

Quien quiera usar el paquete original puede descargarlo a mano desde el portal con un navegador y
ponerlo en `.cache/sunat-oficial/validation/`. Los archivos de SUNAT no se versionan en este repo.

## 2. Oráculo de conformidad

`tools/sunat-oficial/oraculo.py` ejecuta las reglas XSL oficiales con libxslt (lxml) y devuelve el
mismo veredicto que el SFS: primer error que detiene la validación y observaciones acumuladas hasta
ese punto. Las reglas están escritas para IBM DataPower; las adaptaciones (todas en memoria y sin
cambiar la lógica de ninguna regla) están en el ADR [0003](adr/0003-oraculo-reglas-oficiales.md).

Controles negativos del oráculo (si alguno no reproduce su código, el oráculo no es confiable):

| Mutación sobre una factura válida          | Código oficial esperado     |
| ------------------------------------------ | --------------------------- |
| `UBLVersionID` = 2.2                       | 2074                        |
| Moneda inexistente (`QQQ`)                 | 3088                        |
| IGV de línea alterado                      | 3103                        |
| Serie distinta a la del nombre del archivo | 1035                        |
| Valor de venta total desfasado en +5       | 3279 (con observación 4309) |

## 3. Tasa del IGV

18 %: 16 % de IGV (TUO de la Ley del IGV e ISC, D. S. 055-99-EF, art. 17) más 2 % del Impuesto de
Promoción Municipal (D. Leg. 776, art. 76). Las reglas oficiales recalculan el IGV de línea con el
`Percent` declarado y aceptan una diferencia de ±1 (reglas 3103 y 3291 de
`ValidaExprRegFactura-2.0.1.xsl`).

## 4. Estructura del XML UBL 2.1

- Estructura y orden de elementos: plantillas de [Greenter](https://github.com/thegreenter/greenter)
  (MIT) `packages/xml/src/Xml/Templates/invoice2.1.xml.twig`, `notacr2.1.xml.twig` y
  `notadb2.1.xml.twig`.
- Comprobación: los cuatro tipos que genera `ubl-core` pasan las reglas oficiales **sin errores ni
  observaciones** (`packages/ubl-core/test/conformidad.test.ts`).

## 5. Relación entre afectación del IGV y tributo

Cada fila del catálogo 07 (`cat_07.xml`) marca con `igv`, `iva`, `exo`, `ina`, `exp` o `gra` los
tributos del catálogo 05 que admite. El XSL oficial la consulta con `findElementInCatalogProperty`
(regla 2040). `tributosDeAfectacion()` se deriva de esos datos y no de una tabla escrita a mano.
