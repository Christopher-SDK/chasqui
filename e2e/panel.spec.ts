import { expect, test } from '@playwright/test';
import { Panel } from './paginas/panel.js';

const CAOS = 'http://127.0.0.1:7410/api/v1/caos';

test.beforeEach(async ({ request }) => {
  await request.delete(CAOS);
});

test('muestra el aviso legal en todas las vistas', async ({ page }) => {
  const panel = new Panel(page);
  for (const v of ['comprobantes', 'pagos', 'identidad'] as const) {
    await panel.abrir(v);
    await expect(panel.aviso).toBeVisible();
  }
});

test('comprobantes: una factura válida y una rechazada llegan en vivo con su detalle', async ({
  page,
}) => {
  const panel = new Panel(page);
  await panel.abrir();
  await panel.probar('Factura válida');
  await expect(panel.fila('Aceptado').first()).toBeVisible();
  await panel.probar('Rechazada');
  const rechazada = panel.fila('2074');
  await expect(rechazada).toBeVisible();
  await rechazada.click();
  const detalle = page.getByRole('dialog');
  await expect(detalle).toContainText('2074');
  await detalle.getByRole('button', { name: 'Cerrar', exact: true }).click();
  await expect(detalle).toBeHidden();
});

test('caos: activar «sunat-caida» desde el panel hace fallar el envío y apagarlo lo recupera', async ({
  page,
}) => {
  const panel = new Panel(page);
  await panel.abrir();
  const sw = panel.interruptor('sunat-caida');
  await sw.click();
  await expect(sw).toHaveAttribute('aria-checked', 'true');
  await panel.probar('Factura válida');
  await expect(panel.fila('Falla inyectada')).toBeVisible();
  await sw.click();
  await expect(sw).toHaveAttribute('aria-checked', 'false');
});

test('pagos: transferir actualiza saldos y la lista; se puede revertir', async ({ page }) => {
  const panel = new Panel(page);
  await panel.abrir('pagos');
  const antes = Number((await panel.saldo('900000005').innerText()).replace(/[^\d.]/g, ''));
  await panel.transferir('900000005', '900000007', '12.50');
  await expect(
    page.getByRole('status').filter({ hasText: 'Transferencia completada' }),
  ).toBeVisible();
  await expect(panel.saldo('900000005')).toHaveText(`S/ ${(antes - 12.5).toFixed(2)}`);
  await page.getByRole('button', { name: 'Revertir' }).first().click();
  await expect(page.getByRole('status').filter({ hasText: 'revertida' })).toBeVisible();
  await expect(panel.saldo('900000005')).toHaveText(`S/ ${antes.toFixed(2)}`);
});

test('pagos: un rechazo muestra el motivo', async ({ page }) => {
  const panel = new Panel(page);
  await panel.abrir('pagos');
  await panel.transferir('900000001', '900000003', '999.00');
  await expect(page.getByRole('status').filter({ hasText: 'LIMITE_OPERACION' })).toBeVisible();
});

test('pagos: genera un QR de cobro', async ({ page }) => {
  const panel = new Panel(page);
  await panel.abrir('pagos');
  await panel.cobrarQr('8.00');
  await expect(page.getByAltText('Código QR del cobro (ficticio)')).toBeVisible();
  await expect(page.locator('code').filter({ hasText: /^000201/ })).toBeVisible();
});

test('identidad: consulta un DNI y rechaza un RUC con dígito verificador incorrecto', async ({
  page,
}) => {
  const panel = new Panel(page);
  await panel.abrir('identidad');
  await panel.consultar('12345678');
  await expect(page.getByText('Nombres')).toBeVisible();
  await panel.consultar('20000000002');
  await expect(page.getByRole('alert')).toContainText('RUC_INVALIDO');
});

test('la navegación por pestañas cambia el hash y sobrevive a la recarga', async ({ page }) => {
  const panel = new Panel(page);
  await panel.abrir();
  await panel.irA('Pagos');
  await expect(page).toHaveURL(/#pagos$/);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Cuentas de prueba' })).toBeVisible();
});

test('pagos: los valores por defecto del formulario son una transferencia válida', async ({
  page,
}) => {
  const panel = new Panel(page);
  await panel.abrir('pagos');
  const f = page.getByRole('form', { name: 'Transferir' });
  await expect(f.getByLabel('Origen')).toHaveValue('900000001');
  await expect(f.getByLabel('Destino')).toHaveValue('900000002');
});
