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

## 6. Reglas implementadas en el validador

`packages/ubl-core/src/validador/reglas.ts` porta 84 códigos de los XSL oficiales, en el
**mismo orden de ejecución** que cada hoja (factura, boleta, NC, ND), con su línea de origen en el
campo `fuente` de cada hallazgo (p. ej. `ValidaExprRegFactura-2.0.1.xsl:L1508`). Las expresiones
XPath están copiadas sin cambios. Mensajes: `CatalogoErrores.xml`.

| Código | Mensaje oficial                                                                                                                                          |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1001   | ID - El dato SERIE-CORRELATIVO no cumple con el formato de acuerdo al tipo de comprobante                                                                |
| 1003   | InvoiceTypeCode - El valor del tipo de documento es invalido o no coincide con el nombre del archivo                                                     |
| 1004   | El XML no contiene el tag o no existe informacion de InvoiceTypeCode                                                                                     |
| 1007   | El dato ingresado no cumple con el estandar                                                                                                              |
| 1008   | El XML no contiene el tag o no existe informacion en tipo de documento del emisor.                                                                       |
| 1034   | Número de RUC del nombre del archivo no coincide con el consignado en el contenido del archivo XML                                                       |
| 1035   | Numero de Serie del nombre del archivo no coincide con el consignado en el contenido del archivo XML                                                     |
| 1036   | Número de documento en el nombre del archivo no coincide con el consignado en el contenido del XML                                                       |
| 1037   | El XML no contiene el tag o no existe informacion de RegistrationName del emisor del documento                                                           |
| 2014   | El XML no contiene el tag o no existe informacion del número de documento de identidad del receptor del documento                                        |
| 2015   | El XML no contiene el tag o no existe informacion del tipo de documento de identidad del receptor del documento                                          |
| 2017   | El numero de documento de identidad del receptor debe ser RUC                                                                                            |
| 2021   | El XML no contiene el tag o no existe informacion de RegistrationName del receptor del documento                                                         |
| 2022   | RegistrationName - El dato ingresado no cumple con el estandar                                                                                           |
| 2023   | El Numero de orden del item no cumple con el formato establecido                                                                                         |
| 2024   | El XML no contiene el tag InvoicedQuantity en el detalle de los Items o es cero (0)                                                                      |
| 2025   | InvoicedQuantity El dato ingresado no cumple con el estandar                                                                                             |
| 2026   | El XML no contiene el tag cac:Item/cbc:Description en el detalle de los Items                                                                            |
| 2027   | El XML no contiene el tag o no existe informacion de cac:Item/cbc:Description del item                                                                   |
| 2028   | Debe existir el tag cac:AlternativeConditionPrice                                                                                                        |
| 2031   | El dato ingresado en total valor de venta no cumple con el estandar                                                                                      |
| 2033   | El dato ingresado en TaxAmount de la linea no cumple con el formato establecido                                                                          |
| 2036   | El codigo del tributo es invalido                                                                                                                        |
| 2037   | El XML no contiene el tag cac:TaxCategory/cac:TaxScheme/cbc:ID del Item                                                                                  |
| 2048   | El dato ingresado en TaxAmount no cumple con el formato establecido                                                                                      |
| 2062   | El dato ingresado en PayableAmount no cumple con el formato establecido                                                                                  |
| 2068   | El XML no contiene el tag cac:Price/cbc:PriceAmount en el detalle de los Items                                                                           |
| 2070   | El XML no contiene el tag o no existe informacion de DocumentCurrencyCode                                                                                |
| 2071   | La moneda debe ser la misma en todo el documento. Salvo las percepciones que sólo son en moneda nacional                                                 |
| 2072   | CustomizationID - La versión del documento no es la correcta                                                                                             |
| 2073   | El XML no existe informacion de CustomizationID                                                                                                          |
| 2074   | UBLVersionID - La versión del UBL no es correcta                                                                                                         |
| 2075   | El XML no contiene el tag o no existe informacion de UBLVersionID                                                                                        |
| 2117   | La serie o numero del documento modificado por la Nota de Credito no cumple con el formato establecido                                                   |
| 2128   | El XML no contiene el tag o no existe informacion de ResponseCode                                                                                        |
| 2135   | cac:DiscrepancyResponse/cbc:Description - El dato ingresado no cumple con la estructura                                                                  |
| 2136   | El XML no contiene el tag o no existe informacion de cac:DiscrepancyResponse/cbc:Description                                                             |
| 2172   | ResponseCode - El dato ingresado no cumple con la estructura                                                                                             |
| 2205   | La serie o numero del documento modificado por la Nota de Debito no cumple con el formato establecido                                                    |
| 2369   | El dato ingresado en PriceAmount del Valor de venta unitario por item no cumple con el formato establecido                                               |
| 2370   | El dato ingresado en LineExtensionAmount del item no cumple con el formato establecido                                                                   |
| 2371   | El XML no contiene el tag cbc:TaxExemptionReasonCode de Afectacion al IGV                                                                                |
| 2524   | Debe indicar el documento afectado por la nota                                                                                                           |
| 2679   | El XML no contiene el tag o no existe información del número de documento de identidad del cliente                                                       |
| 2752   | El número de ítem no puede estar duplicado.                                                                                                              |
| 2800   | El dato ingresado en el tipo de documento de identidad del receptor no esta permitido.                                                                   |
| 2801   | El DNI ingresado no cumple con el estandar.                                                                                                              |
| 2802   | El dato ingresado como numero de documento de identidad del receptor no cumple con el formato establecido                                                |
| 2883   | Es obligatorio indicar la unidad de medida del ítem                                                                                                      |
| 2956   | El Monto total de impuestos es obligatorio                                                                                                               |
| 2992   | El XML no contiene el tag de la tasa del tributo de la línea                                                                                             |
| 2993   | El factor de afectación de IGV por linea debe ser diferente a 0.00.                                                                                      |
| 2999   | El dato ingresado en el total valor de venta globales no cumple con el formato establecido                                                               |
| 3003   | El XML no contiene el tag o no existe información de total valor de venta globales                                                                       |
| 3007   | El dato ingresado como codigo de tributo global no corresponde al valor esperado.                                                                        |
| 3019   | El dato ingresado en total precio de venta no cumple con el formato establecido                                                                          |
| 3020   | El dato ingresado en el monto total de impuestos no cumple con el formato establecido                                                                    |
| 3021   | El dato ingresado en el monto total de impuestos por línea no cumple con el formato establecido                                                          |
| 3050   | Afectación de IGV no corresponde al código de tributo de la linea.                                                                                       |
| 3059   | El XML no contiene el tag o no existe información de código de tributo.                                                                                  |
| 3088   | El valor ingresado como moneda del comprobante no es valido (catalogo nro 02).                                                                           |
| 3102   | El dato ingresado como factor de afectacion por linea no cumple con el formato establecido.                                                              |
| 3103   | El producto del factor y monto base de la afectación del IGV/IVAP no corresponde al monto de afectacion de linea.                                        |
| 3105   | El XML debe contener al menos un tributo por linea de afectacion por IGV                                                                                 |
| 3110   | El monto de afectacion de IGV por linea debe ser igual a 0.00 para Exoneradas, Inafectas, Exportación, Gratuitas de exoneradas o Gratuitas de inafectas. |
| 3111   | El monto de afectación de IGV por linea debe ser diferente a 0.00.                                                                                       |
| 3195   | El xml no contiene el tag de impuesto por linea (TaxtTotal).                                                                                             |
| 3279   | La sumatoria del Total del valor de venta más los impuestos no concuerda con la base imponible                                                           |
| 3291   | El cálculo del IGV es Incorrecto                                                                                                                         |
| 3462   | La tasa del IGV debe ser la misma en todas las líneas o ítems del documento y debe corresponder con una tasa vigente.                                    |
| 4207   | El DNI debe tener 8 caracteres numéricos                                                                                                                 |
| 4208   | El dato ingresado como numero de documento de identidad del receptor no cumple con el formato establecido                                                |
| 4287   | El precio unitario de la operación que está informando difiere de los cálculos realizados en base a la información remitida                              |
| 4288   | El valor de venta por ítem difiere de los importes consignados.                                                                                          |
| 4290   | El cálculo del IGV es Incorrecto                                                                                                                         |
| 4293   | El importe total de impuestos por línea no coincide con la sumatoria de los impuestos por línea.                                                         |
| 4294   | La base imponible a nivel de línea difiere de la información consignada en el comprobante                                                                |
| 4296   | La sumatoria del total valor de venta - operaciones inafectas de línea no corresponden al total                                                          |
| 4297   | La sumatoria del total valor de venta - operaciones exoneradas de línea no corresponden al total                                                         |
| 4299   | La sumatoria del total valor de venta - operaciones gravadas de línea no corresponden al total                                                           |
| 4301   | La sumatoria de impuestos globales no corresponde al monto total de impuestos.                                                                           |
| 4309   | La sumatoria de valor de venta no corresponde a los importes consignados                                                                                 |
| 4310   | La sumatoria del Total del valor de venta más los impuestos no concuerda con la base imponible                                                           |
| 4312   | El importe total del comprobante no coincide con el valor calculado                                                                                      |

**Cómo se comprueba la equivalencia** (`packages/ubl-core/test/`):

- `conformidad.test.ts`: 478 casos (mutaciones dirigidas y de borde sobre los 4 tipos); cada veredicto de Chasqui
  (estado, código y lista de observaciones) debe ser idéntico al del XSL oficial.
- `propiedades.test.ts`: 200 comprobantes válidos aleatorios (nadie los rechaza) y 512 pares
  aleatorios comprobante + mutación con el mismo veredicto oficial. Semilla fija `20261103`.

**Fuera del subconjunto** (el documento se valida, pero estas reglas no se aplican): anticipos,
descuentos y cargos, ISC, IVAP, ICBPER, detracción, percepción, exportación, operaciones
gratuitas, guías y documentos relacionados, direcciones de entrega, cuotas de pago a crédito y
los atributos opcionales de catálogo (`listAgencyName`, `listURI`…, observaciones 4251-4257).

**Desviación de la librería `xpath` (npm 0.0.36).** `number()` de un conjunto vacío devuelve `0`
en vez de `NaN` (XPath 1.0 §4.4). El motor usa su propia conversión (`numeroXPath`) donde importa;
la prueba diferencial lo detectó en la regla 4296.

## 7. Firma digital

- Ubicación (`ext:UBLExtensions/ext:UBLExtension/ext:ExtensionContent`), referencia `URI=""` con
  `enveloped-signature` y certificado en `ds:KeyInfo`: plantillas de Greenter y XSD
  `UBL-xmldsig-core-schema-2.1.xsd` del paquete oficial.
- Algoritmos: RSA-SHA1 + SHA-1 + C14N por defecto y RSA-SHA256 + SHA-256 como opción, igual que
  [thegreenter/xmldsig](https://github.com/thegreenter/xmldsig) (`SignedXml::$keyAlgorithm`).
- Códigos de verificación (servidor, no XSL): 1059 sin firma, 2335 documento alterado, 2336 error
  al validar. `TODO verificar`: `CatalogoErrores.xml` da el mismo texto a 2334 y 2335.
- Certificado: autofirmado y sin valor legal (`packages/ubl-core/src/certificado-prueba.ts`). No se
  valida la cadena de confianza ni que el certificado pertenezca al RUC emisor.

## 8. Empaquetado (sendBill)

Códigos de `CatalogoErrores.xml` que aplica `desempaquetar()`: 0151 nombre del ZIP, 0155 ZIP
vacío, 0156 ZIP corrupto, 0159 nombre del XML, 0160 XML vacío, 0161 el XML no coincide con el ZIP.
El parser devuelve 0306 cuando el XML no se puede leer.

## 9. Resumen diario, comunicación de baja y guía de remisión

| Documento                       | XSL oficial                            | Casos idénticos al oráculo |
| ------------------------------- | -------------------------------------- | -------------------------- |
| Comunicación de baja (RA)       | `ValidaExprRegSummaryVoided-1.0.1.xsl` | incluidos en 118           |
| Resumen diario (RC)             | `ValidaExprRegSummary-1.1.0.xsl`       | incluidos en 118           |
| Guía de remisión remitente (09) | `ValidaExprRegGreRemitente-2.0.1.xsl`  | 62                         |

- Las reglas de fecha 2301 y 4036 de la baja están **comentadas** en el XSL oficial («hasta conseguir
  las librerías para reconocer la función seconds()»): no se aplican.
- La guía cubre transporte privado (modalidad 02). La hoja oficial incluye `validate_utils.xsl` con
  la ruta absoluta de una instalación del SFS (`/cpe/data/sunat_archivos/sfs/VALI/commons/`); el
  oráculo la traduce a la carpeta descargada.
- Estructura: plantillas de Greenter `voided.xml.twig`, `summary.xml.twig` y `despatch2022.xml.twig`.

## 10. Servicios web

- **SOAP (billService)**: WSDL y XSD de [Greenter](https://github.com/thegreenter/greenter) (MIT),
  `packages/ws/src/Resources/wsdl/`. La dirección del servicio se reemplaza por la de sunat-sim.
- **API GRE**: rutas y esquemas del OpenAPI de [thegreenter/gre-api](https://github.com/thegreenter/gre-api)
  (MIT): token OAuth2 `password`, `POST /v1/contribuyente/gem/comprobantes/{archivo}` y
  `GET /v1/contribuyente/gem/comprobantes/envios/{numTicket}`.
- **CDR**: estructura de CDR reales incluidos en Greenter (`packages/ws/tests/Resources/R-*.xml`).
  El emisor del CDR es un RUC ficticio del simulador (20000000000), nunca el de SUNAT.
- **Reglas de servidor** (duplicados, firma, plazos y bajas) y su orden: ADR [0006](adr/0006-reglas-de-servidor-en-sunat-sim.md).
