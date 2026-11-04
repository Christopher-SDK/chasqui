# 0003 · Las reglas XSL oficiales de SUNAT como oráculo de pruebas

- Estado: aceptada · 2026-11-03

## Contexto

El validador de Chasqui tiene que dar el mismo veredicto que SUNAT. Escribir reglas a partir de
una lectura humana de la documentación produce un validador que solo concuerda con quien lo
escribió. SUNAT publica sus reglas en forma ejecutable (XSLT 1.0 del paquete SFS/OSE): 657
llamadas de validación solo para factura.

## Decisión

1. El validador de producción está en TypeScript (`packages/ubl-core`): rápido, sin dependencias
   nativas y apto para mutation testing.
2. Las reglas oficiales se ejecutan **solo en pruebas**, como oráculo: `tools/sunat-oficial/oraculo.py`
   con Python 3 y lxml 6.1.3 (fijado en `requirements.txt`, en un venv propio). La conformidad se
   comprueba por diferencia: para cada documento, el código que da Chasqui debe ser el mismo que da
   la regla oficial.
3. Las reglas están escritas para IBM DataPower, que acepta extensiones que libxslt no. Se adaptan
   en memoria, sin modificar los archivos descargados:

   | Particularidad de DataPower                              | Adaptación                                                 |
   | -------------------------------------------------------- | ---------------------------------------------------------- |
   | `func:function` sin declarar `func` como extensión       | se agrega `func` a `extension-element-prefixes`            |
   | `current-date()` (XSLT 2.0) en una hoja 1.0              | fecha fija `FECHA_ORACULO` (determinista)                  |
   | `matches(x, re, '!')` de Saxon (regex con sintaxis Java) | función de extensión en Python                             |
   | `dyn:evaluate("document(...)")`                          | se resuelve en Python (libxslt no expone `document()` ahí) |
   | Variables redefinidas en la misma plantilla              | se renombran a `nombre__N` respetando el alcance           |

4. Antes de confiar en el oráculo, se le exigen controles negativos (`docs/fuentes.md` §2).

## Alternativas descartadas

- **Usar el XSL en el simulador en tiempo de ejecución.** Agrega Python al runtime de cada
  contenedor, y el primer error que corta la validación impide reportar más de un problema. Queda
  como posible «modo estricto» opcional de `sunat-sim` (se evaluará en la fase 2).
- **Saxon-JS.** Implementa XSLT 3.0 pero no EXSLT (`dyn`, `func`, `date`), que las reglas usan.
- **xsltproc.** libexslt no trae el módulo `regexp`, y las extensiones no se pueden registrar
  desde fuera.

## Consecuencias

- La CI necesita Python 3 y `pnpm sunat:preparar`. Sin el oráculo, las pruebas de conformidad se
  marcan como omitidas y nunca como aprobadas.
- El validador TypeScript implementa un subconjunto de reglas. La cobertura del subconjunto está
  documentada en `docs/fuentes.md`, y cada regla cita su código y su línea del XSL.
