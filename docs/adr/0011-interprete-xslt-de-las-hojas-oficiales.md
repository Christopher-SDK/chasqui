# 0011 · Intérprete XSLT de las hojas oficiales completas

- Estado: aceptada · 2026-11-04 · reemplaza a la [0004](0004-validador-portado-por-plantillas.md)

## Contexto

El port manual de la decisión 0004 cubría las reglas de las operaciones comunes. Al sumar
gratuitas, ISC, ICBPER, IVAP, exportación, descuentos, cargos, detracción, percepción, anticipos,
cuotas e IGV del 10 %, hacía falta portar cientos de reglas más, cada una con su orden y sus
variables `xsl:choose`. Las siete hojas oficiales (factura, boleta, NC, ND, GRE remitente, resumen
y baja) suman 2 131 validaciones con 597 códigos distintos: portarlas a mano multiplica los puntos
donde Chasqui puede diferir de SUNAT sin que nadie lo note.

## Decisión

1. Un **intérprete XSLT 1.0** en TypeScript (`validador/xslt.ts`) ejecuta las hojas tal como las
   publica SUNAT, con el subconjunto que usan: plantillas con `match`/`mode`/`priority` y reglas
   implícitas, `call-template` y `apply-templates` con parámetros, alcance de variables (incluida la
   redefinición que tolera DataPower), fragmentos de árbol resultado, `key()`, `document()` sobre los
   catálogos y `position()`/`last()`. Las expresiones regulares de DataPower se evalúan con la
   sintaxis de Java. XPath 1.0 lo evalúa la librería `xpath`. Igual que el SFS, el primer
   `rejectCall` detiene la validación y cada `addWarning` es una observación.
2. Un **compilador** (`scripts/compilar-reglas.mjs`) convierte cada XSL y sus catálogos a JSON una
   sola vez; la salida va versionada en `src/validador/oficial/` y la CI comprueba que regenerarla
   no cambia nada. En ejecución no se lee ningún XSL.
3. Las diferencias con libxslt se corrigen en el origen, no en las reglas: `number()` de un conjunto
   vacío devolvía 0 en vez de NaN (parche `patches/xpath@0.0.36.patch`), y `document()` de un
   catálogo ausente (`cat_66`) devuelve un conjunto vacío, como libxslt.
4. El **orden de documento** se precalcula al parsear: la comparación de nodos pasó de ~900 ms a
   ~16 ms por comprobante.

## Alternativas descartadas

- **Seguir portando a mano** (0004): cada regla nueva es código propio que puede divergir; la prueba
  diferencial detecta la divergencia, pero no evita escribirla.
- **libxslt nativo** (bindings de Node, o Python con lxml como el oráculo): agrega compilación nativa
  o un segundo runtime a la imagen y a cada máquina de desarrollo. El oráculo sigue usándolo, solo
  en las pruebas, como referencia independiente.

## Consecuencias

- Una regla nueva de SUNAT entra actualizando el paquete oficial y regenerando el JSON; no hay código
  de reglas que mantener.
- La prueba diferencial ([0003](0003-oraculo-reglas-oficiales.md)) pasa a probar el intérprete:
  ~2 180 casos (incluidas las 18 operaciones especiales de `test/operaciones.ts`) sin una sola
  diferencia con el oráculo.
- El mutation testing muta el intérprete (`xslt.ts`), el cálculo y el generador de XML en vez de
  las reglas portadas.
- Se reproducen también los defectos de las hojas, a propósito: la regla 3249 observa toda factura
  al crédito y la hoja de factura compara contra `Configuracion Veh�cular` con un byte mal
  codificado ([fuentes §15](../fuentes.md#15-operaciones-especiales-tasas-y-reglas-de-las-hojas)).
