import { expect, type Locator, type Page } from '@playwright/test';

/** Page Object del panel: las pruebas hablan de intenciones, no de selectores. */
export class Panel {
  readonly aviso: Locator;
  readonly enVivo: Locator;

  constructor(readonly page: Page) {
    this.aviso = page.getByText('No afiliado a SUNAT ni a ninguna entidad financiera');
    this.enVivo = page.getByRole('status').filter({ hasText: 'En vivo' });
  }

  async abrir(vista: 'comprobantes' | 'pagos' | 'identidad' = 'comprobantes') {
    await this.page.goto(`/#${vista}`);
    await expect(this.enVivo).toBeVisible();
  }

  irA(vista: 'Comprobantes' | 'Pagos' | 'Identidad') {
    return this.page
      .getByRole('navigation', { name: 'Servicios' })
      .getByRole('link', { name: vista })
      .click();
  }

  // ── Comprobantes ──
  probar(escenario: string) {
    // El nombre accesible incluye la ayuda: «Factura válida Pasa todas las reglas…».
    return this.page.getByRole('button', { name: new RegExp(`^${escenario}`) }).click();
  }

  fila(texto: string | RegExp) {
    return this.page.locator('main ul li').filter({ hasText: texto }).first();
  }

  // ── Caos ──
  interruptor(perfil: string) {
    return this.page.getByRole('switch').filter({ hasText: perfil });
  }

  // ── Pagos ──
  async transferir(origen: string, destino: string, monto: string) {
    const f = this.page.getByRole('form', { name: 'Transferir' });
    await f.getByLabel('Origen').selectOption(origen);
    await f.getByLabel('Destino').selectOption(destino);
    await f.getByLabel('Monto (S/)').fill(monto);
    await f.getByRole('button', { name: 'Transferir' }).click();
  }

  saldo(celular: string) {
    return this.page.locator(`[data-saldo="${celular}"]`);
  }

  async cobrarQr(monto: string) {
    const f = this.page.getByRole('form', { name: 'Cobrar con QR' });
    await f.getByLabel(/Monto/).fill(monto);
    await f.getByRole('button', { name: 'Generar QR' }).click();
  }

  // ── Identidad ──
  async consultar(numero: string) {
    const f = this.page.getByRole('form', { name: 'Consultar documento' });
    await f.getByLabel(/Número de DNI/).fill(numero);
    await f.getByRole('button', { name: 'Consultar' }).click();
  }
}
