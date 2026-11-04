# Chasqui

> **Simulador para pruebas. No afiliado a SUNAT ni a ninguna entidad financiera.**
> Todos los datos (RUC, DNI, personas y billeteras) son ficticios.

Laboratorio local (_digital twin_) para probar integraciones con los servicios del ecosistema digital peruano: comprobantes electrónicos compatibles con el formato UBL 2.1 que usa SUNAT, guías de remisión, billeteras interoperables y consulta de identidad. Las fallas se inyectan a voluntad.

🚧 En construcción por fases: ver [docs/PROGRESO.md](docs/PROGRESO.md).

## Arranque

```bash
docker compose up
```

| Servicio                   | URL                                       |
| -------------------------- | ----------------------------------------- |
| Panel en vivo              | http://localhost:7500                     |
| sunat-sim · SOAP (WSDL)    | http://localhost:7100/billService?wsdl    |
| sunat-sim · REST + OpenAPI | http://localhost:7100/docs                |
| pagos-sim · billetera      | http://localhost:7200/docs                |
| identidad-sim · DNI y RUC  | http://localhost:7300/docs                |
| chaos-control              | http://localhost:7400/docs                |
| sunat-sim · GRE (OAuth)    | `POST /v1/clientessol/{id}/oauth2/token/` |

Credenciales de prueba (como en el ambiente beta): usuario `<RUC>MODDATOS`, clave `moddatos`.

## Caos

Activa fallas reproducibles desde el panel, la API de chaos-control (`:7400`) o la cabecera
`X-Chasqui-Chaos`. Perfiles: `cierre-de-mes`, `sunat-caida`, `red-inestable`, `pagos-saturados`.
Tutorial completo en [docs/guia-caos.md](docs/guia-caos.md).

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
- **Plazos** de envío (3 días, 2108) y de baja (7 días, 2958): configurables; varían por norma.
- **hashZip inválido en la GRE**: no se halló el código oficial; Chasqui responde 0156.
- **Orden de las reglas de servidor** (duplicado, firma, plazos): decisión documentada en el ADR 0006.

Fuera del alcance actual del generador y del validador:

- Operaciones gratuitas, IVAP, exportación, ISC, ICBPER, detracción, percepción, anticipos,
  descuentos y cargos, pago a crédito con cuotas.
- La firma no valida la cadena de confianza del certificado ni su pertenencia al RUC emisor.
- La guía de remisión cubre transporte privado (modalidad 02); no incluye transportista, puertos ni contenedores.

## Autor

Christopher Arias — [Montreach](https://montreach.com), Lima, Perú.
