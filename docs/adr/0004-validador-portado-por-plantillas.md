# 0004 · Validador portado por plantillas, en el orden oficial

- Estado: aceptada · 2026-11-03

## Contexto

Las reglas oficiales cortan en el **primer error** en el orden del XSL y acumulan observaciones
hasta ese punto. Dos validadores con las mismas reglas pero otro orden devuelven códigos distintos
para el mismo documento. Además, cada tipo de comprobante (01, 03, 07, 08) tiene su propia hoja,
con variantes reales: posiciones distintas, condiciones distintas (p. ej. el motivo que exime de
referencia es 10 en NC y 03 en ND) y reglas que solo existen en un tipo (3291 no está en boleta).

## Decisión

1. Un **motor** (`validador/motor.ts`) reimplementa las plantillas genéricas de
   `validate_utils.xsl` con su semántica exacta (`existElement` usa `string()`,
   `existElementNoVacio` usa conjunto vacío, `regexpValidateElementIfExist` exige `count >= 1`,
   formatos de 2 y 10 decimales con y sin `isGreaterCero`).
2. Las **secuencias por tipo** (`validador/reglas.ts`) llaman al motor en el orden de ejecución del
   XSL (plantilla principal + `apply-templates`), con la línea de origen en cada regla. Las
   expresiones XPath se copian sin cambios y se evalúan con XPath 1.0. Las variables armadas con
   `xsl:choose` se portan a TypeScript respetando la aritmética de punto flotante de XPath.
3. El subtotal de línea es una **lista explícita de pasos por tipo**, porque cada hoja evalúa las
   reglas 3103, 3110, 3111 y 2371 en distinto orden.

## Alternativas descartadas

- **Interpretar el XSL en tiempo de ejecución** (un mini XSLT en TypeScript): obliga a soportar
  `key()`, `document()`, `dyn:evaluate`, EXSLT y las extensiones de DataPower, y deja el validador
  sin código propio que probar con mutation testing.
- **Reglas escritas desde la documentación**, sin respetar el orden: la prueba diferencial mostró
  que el orden cambia el código devuelto (p. ej. 2370 va después de los tributos de línea en la
  factura, no antes).

## Consecuencias

- La prueba diferencial ([ADR 0003](0003-oraculo-reglas-oficiales.md)) es la red de seguridad:
  478 casos dirigidos + 512 aleatorios + 200 válidos aleatorios, todos idénticos al oficial.
  Mutation score del validador: 84.34 % (Stryker, umbral 80 %).
- Agregar una regla consiste en ubicarla en la secuencia del tipo con su línea y agregar una
  mutación que la ejercite.
