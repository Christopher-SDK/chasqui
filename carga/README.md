# Pruebas de carga (k6)

Tres escenarios en paralelo, con tasa de llegada constante y umbrales por escenario:

| Escenario   | Operación                        | Tasa | Umbrales                  |
| ----------- | -------------------------------- | ---- | ------------------------- |
| `sunat`     | POST de facturas firmadas reales | 20/s | p95 < 800 ms, p99 < 1,5 s |
| `pagos`     | Transferencias idempotentes      | 30/s | p95 < 300 ms              |
| `identidad` | Consulta de RUC (DV calculado)   | 50/s | p95 < 150 ms              |

En todos: errores < 1 %, checks > 99 % y al menos 100 peticiones respondidas (k6 da por cumplido
un umbral sin datos; el mínimo evita ese falso verde).

```bash
pnpm carga:preparar 1200   # facturas firmadas (firmar XML-DSig desde k6 no es práctico)
pnpm carga                 # contra localhost:7100-7300; DURACION=60s para más tiempo
```

Reporte HTML en `reports/carga/reporte.html` y resumen JSON en `reports/carga/resumen.json`.
Variables: `SUNAT_URL`, `PAGOS_URL`, `IDENTIDAD_URL`, `DURACION`, `CAOS` (perfil para probar bajo
fallas; por defecto `ninguno`).

Los umbrales se fijaron midiendo la máquina de CI (`ubuntu-latest`, servicios en un proceso):
ver el job nocturno en `.github/workflows/nocturno.yml`.
