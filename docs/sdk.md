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

Operaciones especiales (todas pasan las reglas oficiales; ver [fuentes §15](fuentes.md#15-operaciones-especiales-tasas-y-reglas-de-las-hojas)):

```ts
// Consumo: ISC al valor, bolsas con ICBPER, una muestra gratuita y descuento global → código 0
factura()
  .serie('F001', 2)
  .emisor(miEmpresa)
  .cliente('20123456786', 'CLIENTE S.A.C.')
  .item('Licor', 2, '40', { isc: { sistema: '01', tasa: '0.25' } })
  .item('Muestra', 1, '5', { afectacion: '13' }) // gratuita: valorUnitario es el referencial
  .bolsas(2, '0.10') // ICBPER a la tarifa vigente (S/ 0.50)
  .descuento({ factor: '0.05' }) // global, reduce la base (02)
  .cargo('3') // fuera de la base (50)
  .construir();

// Crédito con detracción: 2 000 + IGV = 2 360; detracción 10 % = 236; pendiente 2 124
factura()
  .serie('F001', 3)
  .emisor(miEmpresa)
  .cliente('20123456786', 'CLIENTE S.A.C.')
  .item('Mantenimiento de equipos', 1, '2000')
  .detraccion({ codigoBien: '020', cuentaBancoNacion: '00-000-000001' })
  .formaPago({ monto: '1062', fechaPago: '2026-12-15' }, { monto: '1062', fechaPago: '2027-01-15' }) // sin cuotas = contado; observación 3249 siempre (fuentes §15)
  .construir();
```

Además: `.item(..., { descuento })` (por ítem, 00), `.descuentoNoAfecto(monto)` (03),
`.tasaIgv('10')` (Ley 31556), `.percepcion('51' | '52' | '53')` y `.anticipo({...})`. Solo en
facturas: `.detraccion`, `.percepcion`, `.anticipo` y `.formaPago`.

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
