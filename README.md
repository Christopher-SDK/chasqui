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

## Autor

Christopher Arias — [Montreach](https://montreach.com), Lima, Perú.
