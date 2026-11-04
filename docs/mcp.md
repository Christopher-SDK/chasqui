# Servidor MCP

Permite que un agente de IA (Claude Code, Claude Desktop u otro cliente MCP) pruebe integraciones
contra Chasqui: emitir comprobantes, validar XML, transferir, consultar RUC/DNI y activar fallas.

## Conectar

Con los simuladores corriendo (`docker compose up -d` o `pnpm todo-en-uno`):

```bash
claude mcp add chasqui -- pnpm --silent --dir /ruta/a/chasqui --filter @chasqui/mcp-server dev
```

O en `.mcp.json` / la configuración de Claude Desktop:

```json
{
  "mcpServers": {
    "chasqui": {
      "command": "pnpm",
      "args": ["--silent", "--dir", "/ruta/a/chasqui", "--filter", "@chasqui/mcp-server", "dev"],
      "env": { "CHASQUI_SUNAT_URL": "http://localhost:7100" }
    }
  }
}
```

`--silent` es obligatorio: stdout es el canal MCP y cualquier línea de pnpm lo corrompería.
Variables opcionales: `CHASQUI_SUNAT_URL`, `CHASQUI_PAGOS_URL`, `CHASQUI_IDENTIDAD_URL`,
`CHASQUI_CAOS_URL`.

## Herramientas

| Herramienta                                | Efecto                                                    |
| ------------------------------------------ | --------------------------------------------------------- |
| `emitir_comprobante`                       | Factura o boleta: calcula, firma, envía y devuelve el CDR |
| `estado_comprobante`                       | Estado de un comprobante enviado                          |
| `validar_xml`                              | Valida un XML UBL 2.1 sin enviarlo                        |
| `consultar_ruc` / `_dni`                   | Dataset ficticio y determinista                           |
| `transferir`                               | Transferencia idempotente (clave opcional)                |
| `consultar_transferencia`                  | Estado: pendiente, completada, rechazada o revertida      |
| `saldo`                                    | Saldo de una cuenta de prueba                             |
| `caos_estado` / `_activar` / `_desactivar` | Fallas reproducibles con semilla                          |

`emitir_comprobante` acepta además las operaciones especiales: afectaciones gratuitas, IVAP y
exportación, ISC, ICBPER, descuentos, cargos, IGV del 10 %, cuotas, detracción, percepción y
anticipos (las cuatro últimas, solo en facturas).

Las lecturas llevan `readOnlyHint`. Los errores de la API vuelven como resultado con `isError` y
su código (p. ej. `1033`, `LIMITE_DIARIO`), para que el agente razone sobre ellos.

## Ejemplo de pedido a un agente

> Activa el perfil `red-inestable` con semilla `demo`, emite 5 boletas y dime cuántas llegaron,
> qué fallas aparecieron y si alguna quedó duplicada. Luego desactiva el caos.
