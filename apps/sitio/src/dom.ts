/** querySelector que exige el elemento: si el HTML generado cambia, falla con un mensaje claro. */
export function req(selector: string, raiz: ParentNode = document): HTMLElement {
  const el = raiz.querySelector<HTMLElement>(selector);
  if (!el) throw new Error(`Falta el elemento ${selector}`);
  return el;
}
