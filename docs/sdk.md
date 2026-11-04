# SDK de Chasqui

```ts
import { Chasqui, factura } from '@chasqui/sdk';

const chasqui = new Chasqui(); // localhost:7100/7200/7300/7400 por defecto

const f = factura()
  .serie('F001', 1)
  .emisor(miEmpresa)
  .cliente('20123456786', 'CLIENTE S.A.C.') // 11 dígitos → RUC; 8 → DNI
  .item('Café de altura 250 g', 2, '21.10') // valor unitario SIN IGV
  .item('Libro', 1, '35.00', { afectacion: '20' })
  .construir();

const r = await chasqui.sunat.enviar(f); // calcula, firma, empaqueta y envía
r.estado; // 'aceptado' | 'observado' | 'rechazado'

const t = await chasqui.pagos.transferir({
  origen: '900000001',
  destino: '900000002',
  monto: '15.00',
});
await chasqui.pagos.esperar(t.id); // pendiente → completada

await chasqui.chaos.con('cierre-de-mes', async () => {
  // tu prueba de resiliencia aquí; el caos se desactiva al salir, aunque falle
});
```

| Módulo      | Métodos                                                                                            |
| ----------- | -------------------------------------------------------------------------------------------------- |
| `sunat`     | `enviar`, `estado`                                                                                 |
| `pagos`     | `transferir`, `transferencia`, `esperar`, `revertir`, `saldo`, `cobrar`, `pagarCobro`, `suscribir` |
| `identidad` | `ruc`, `dni`                                                                                       |
| `chaos`     | `activar(perfil \| reglas, semilla?)`, `desactivar`, `estado`, `con`                               |

- Errores: `ErrorChasqui` con `status` y `codigo` (p. ej. `'1033'`, `'LIMITE_DIARIO'`).
- Reintentos: 3 por defecto, solo en peticiones idempotentes (ver decisión 0009).
- Webhooks: `verificarWebhook(secreto, cuerpo, cabeceraFirma)` en tiempo constante y con
  tolerancia de 300 s contra replay.
- Ejemplo completo: `apps/tienda-demo` (checkout con RUC, cobro QR y comprobante, y qué hacer si
  SUNAT no responde después de cobrar).
