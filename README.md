# Chasqui

> **Simulador para pruebas. No afiliado a SUNAT ni a ninguna entidad financiera.**
> Todos los datos (RUC, DNI, personas y billeteras) son ficticios.

Laboratorio local (_digital twin_) para probar integraciones con los servicios del ecosistema digital peruano: comprobantes electrónicos compatibles con el formato UBL 2.1 que usa SUNAT, guías de remisión, billeteras interoperables y consulta de identidad. Las fallas se inyectan a voluntad.

🚧 En construcción por fases: ver [docs/PROGRESO.md](docs/PROGRESO.md).

## Arranque

```bash
docker compose up        # sunat-sim en http://localhost:7100/salud
```

Desarrollo local: Node 22 y `corepack enable`, luego `pnpm install && pnpm test`.

## Fidelidad con SUNAT

Las reglas de Chasqui no son una interpretación de la documentación. Se portan de las **reglas de
validación ejecutables que publica SUNAT** (XSL del paquete SFS/OSE) y una prueba diferencial
comprueba que, para cada documento, Chasqui da el mismo veredicto que la regla oficial: error,
observaciones y orden. Detalle en [docs/fuentes.md](docs/fuentes.md) y en el
[ADR 0003](docs/adr/0003-oraculo-reglas-oficiales.md).

## Limitaciones conocidas

Reglas no confirmadas en una fuente oficial (`TODO verificar` en el código):

- **2334 vs. 2335** (documento alterado): el catálogo oficial da el mismo mensaje a ambos códigos;
  Chasqui usa 2335 para cualquier alteración detectada en la firma.

Fuera del alcance actual del generador y del validador:

- Operaciones gratuitas, IVAP, exportación, ISC, ICBPER, detracción, percepción, anticipos,
  descuentos y cargos, pago a crédito con cuotas.
- La firma no valida la cadena de confianza del certificado ni su pertenencia al RUC emisor.
- Las reglas de servidor (duplicados 1032/1033, plazos 2108/2329) llegan con `sunat-sim` (fase 2).

## Autor

Christopher Arias — [Montreach](https://montreach.com), Lima, Perú.
