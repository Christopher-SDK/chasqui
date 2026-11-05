/**
 * Inicio: el quipu que suma (escena fijada con position: sticky) y los tres pasos.
 * El scroll ata los nudos en orden; el cordón principal suma el valor de los nudos atados (sistema
 * decimal de Locke) hasta igualar el total del comprobante.
 */
import { req } from './dom.js';
const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
const POS = { m: 1000, c: 100, d: 10, u: 1 } as const;

/** Progreso [0, 1] de una escena fija: 0 cuando su tope llega arriba, 1 cuando termina. */
function progreso(escena: HTMLElement): number {
  const r = escena.getBoundingClientRect();
  const recorrido = r.height - innerHeight;
  return recorrido <= 0 ? 1 : Math.min(1, Math.max(0, -r.top / recorrido));
}

// ── Odómetro ──────────────────────────────────────────────────────────────────────────────────
function odometro(el: HTMLElement) {
  const formato = (c: number) => `S/ ${(c / 100).toFixed(2).padStart(6, '0')}`;
  const plantilla = formato(0);
  el.textContent = '';
  const columnas: HTMLElement[] = [];
  for (const ch of plantilla) {
    if (/\d/.test(ch)) {
      const d = document.createElement('span');
      d.className = 'd';
      d.innerHTML = `<span>${Array.from({ length: 10 }, (_, i) => `<span>${String(i)}</span>`).join('')}</span>`;
      el.append(d);
      columnas.push(d.firstElementChild as HTMLElement);
    } else el.append(ch === ' ' ? '\u00a0' : ch);
  }
  return (centimos: number) => {
    const digitos = formato(centimos).replace(/\D/g, '');
    columnas.forEach((c, i) => (c.style.transform = `translateY(-${digitos[i] ?? '0'}em)`));
  };
}

// ── El quipu que suma ─────────────────────────────────────────────────────────────────────────
const escena = document.querySelector<HTMLElement>('[data-quipu]');
if (escena) {
  const total = Number(req('[data-odometro]', escena).dataset.total);
  const veredicto = req('[data-veredicto]', escena);
  const principal = req('.quipu-principal', escena);
  const poner = odometro(req('[data-odometro]', escena));
  // Nudos en orden de atado: cordón por cordón, de millares a unidades (de arriba abajo).
  const nudos: { img: HTMLImageElement; valor: number; grupo: HTMLElement }[] = [];
  for (const g of escena.querySelectorAll<HTMLElement>('.grupo')) {
    const imgs = [...g.querySelectorAll('img')];
    const pos = g.dataset.pos as keyof typeof POS;
    // Un nudo largo vale sus vueltas; cada nudo simple vale la potencia de su posición.
    const unidades =
      pos === 'u' ? Number(g.closest<HTMLElement>('.cordon')?.dataset.centimos) % 10 : 0;
    imgs.forEach((img) => nudos.push({ img, valor: pos === 'u' ? unidades : POS[pos], grupo: g }));
  }
  const cordones = [...escena.querySelectorAll<HTMLElement>('.cordon')];
  // El nudo se dimensiona con el alto disponible: el cordón con más nudos debe caber entero.
  const quipu = req('.quipu', escena);
  const medir = () => {
    const maximo = Math.max(
      ...cordones.map((c) => c.querySelectorAll('.grupo img:not(.largo)').length + 3),
    );
    const libre = cordones[0]?.querySelector<HTMLElement>('.nudos')?.clientHeight ?? 0;
    quipu.style.setProperty(
      '--nh',
      `${String(Math.max(matchMedia('(min-width: 901px)').matches ? 28 : 18, Math.min(40, (libre - 24) / (maximo * 0.82))))}px`,
    );
  };
  medir();
  addEventListener('resize', medir);
  const textoOk = veredicto.dataset.ok ?? '';
  const textoInicial = veredicto.textContent;
  let atados = -1;

  const pintar = () => {
    const p = reducido ? 1 : progreso(escena);
    // 0–8 %: caen los cordones; 8–88 %: se atan los nudos; el resto es la pausa con el veredicto.
    const caida = Math.min(1, p / 0.08);
    principal.style.transform = `scaleX(${String(caida)})`;
    cordones.forEach((c, i) => {
      c.style.setProperty('--caida', String(Math.min(1, Math.max(0, caida * 1.6 - i * 0.15))));
    });
    const n = Math.round(Math.min(1, Math.max(0, (p - 0.08) / 0.8)) * nudos.length);
    if (n === atados) return;
    atados = n;
    let suma = 0;
    nudos.forEach((k, i) => {
      const atado = i < n;
      k.img.classList.toggle('atado', atado);
      if (atado) suma += k.valor;
      k.grupo.classList.toggle('visible', k.grupo.querySelector('img.atado') !== null);
    });
    poner(suma);
    const listo = suma === total;
    veredicto.classList.toggle('listo', listo);
    veredicto.textContent = listo
      ? textoOk
      : n > 0
        ? `Σ S/ ${(suma / 100).toFixed(2)}`
        : textoInicial;
  };
  pintar();
  addEventListener('scroll', pintar, { passive: true });
  addEventListener('resize', pintar);
}

// ── Tres pasos ────────────────────────────────────────────────────────────────────────────────
const pasos = document.querySelector<HTMLElement>('[data-pasos]');
if (pasos) {
  const items = [...pasos.querySelectorAll<HTMLElement>('[data-paso]')];
  const pantallas = [...pasos.querySelectorAll<HTMLElement>('[data-pantalla]')];
  const titulo = pasos.querySelector<HTMLElement>('[data-paso-titulo]');
  const fijo = getComputedStyle(req('.pasos-fijo', pasos)).position === 'sticky';
  let actual = 0;
  const mostrar = (i: number) => {
    if (i === actual) return;
    actual = i;
    items.forEach((el, j) => el.classList.toggle('activo', j === i));
    pantallas.forEach((el, j) => el.classList.toggle('activa', j === i));
    if (titulo) titulo.textContent = `${String(i + 1)} / ${String(items.length)}`;
  };
  if (fijo) {
    const pintar = () => {
      mostrar(Math.min(items.length - 1, Math.floor(progreso(pasos) * items.length * 0.999)));
    };
    addEventListener('scroll', pintar, { passive: true });
    pintar();
  }
  // En móvil (sin escena fija) y con teclado o toque, cada paso se elige tocándolo.
  items.forEach((el, i) => {
    el.tabIndex = 0;
    el.addEventListener('click', () => {
      mostrar(i);
    });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        mostrar(i);
      }
    });
  });
}
