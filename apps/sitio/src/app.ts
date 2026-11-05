/**
 * Comportamiento común a todas las páginas: scroll suave (Lenis), entradas al aparecer, cabecera
 * que se esconde al bajar, menú móvil, copiar comandos y la cortina de cordones entre páginas.
 */
import Lenis from 'lenis';

const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Scroll suave: nativo con interpolación; nunca secuestra la rueda (09-B f42) ─────────────
const lenis = reducido ? null : new Lenis({ lerp: 0.14, smoothWheel: true });
if (lenis) {
  const bucle = (t: number) => {
    lenis.raf(t);
    requestAnimationFrame(bucle);
  };
  requestAnimationFrame(bucle);
}
(window as unknown as { lenis: Lenis | null }).lenis = lenis;

// ── Entradas: todo texto, imagen y bloque tiene la suya (capa de movimiento total) ──────────
// Chrome recorta la intersección con el clip-path del propio elemento: una máscara cerrada
// (inset 100 %) nunca «entra». Se observa su contenedor y se marca el elemento.
const entra = document.querySelectorAll<HTMLElement>('[data-entra], .revela, .mascara');
const marcar = new Map<Element, HTMLElement[]>();
const io = new IntersectionObserver(
  (es) => {
    for (const e of es) {
      if (!e.isIntersecting) continue;
      for (const el of marcar.get(e.target) ?? []) el.classList.add('dentro');
      io.unobserve(e.target);
    }
  },
  { rootMargin: '0px 0px -8% 0px', threshold: 0.01 },
);
for (const el of entra) {
  const blanco = el.parentElement ?? el;
  marcar.set(blanco, [...(marcar.get(blanco) ?? []), el]);
  io.observe(blanco);
}

// ── Cabecera que se esconde al bajar y vuelve al subir ──────────────────────────────────────
const cabecera = document.querySelector<HTMLElement>('.cabecera');
let ultimo = scrollY;
addEventListener(
  'scroll',
  () => {
    const y = scrollY;
    if (cabecera && !document.querySelector('.nav.abierta'))
      cabecera.classList.toggle('oculta', y > 240 && y > ultimo);
    ultimo = y;
  },
  { passive: true },
);

// ── Menú móvil: el fondo no se mueve mientras está abierto ─────────────────────────────────
const boton = document.querySelector<HTMLButtonElement>('.boton-menu');
const nav = document.getElementById('nav');
function menu(abrir: boolean) {
  if (!boton || !nav) return;
  boton.setAttribute('aria-expanded', String(abrir));
  nav.classList.toggle('abierta', abrir);
  document.documentElement.style.overflow = abrir ? 'hidden' : '';
  if (abrir) lenis?.stop();
  else lenis?.start();
}
boton?.addEventListener('click', () => {
  menu(boton.getAttribute('aria-expanded') !== 'true');
});
addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && nav?.classList.contains('abierta')) {
    menu(false);
    boton?.focus();
  }
});

// ── Barra móvil: aparece cuando el CTA del héroe (o el primer botón) sale de la pantalla ───────
const barra = document.querySelector<HTMLElement>('.barra-movil');
const primerBoton = document.querySelector<HTMLElement>('main .boton');
if (barra) {
  if (!primerBoton) barra.classList.add('visible');
  else
    new IntersectionObserver((es) => {
      for (const e of es)
        barra.classList.toggle('visible', !e.isIntersecting && e.boundingClientRect.top < 0);
    }).observe(primerBoton);
}

// ── Copiar comandos ─────────────────────────────────────────────────────────────────────────
for (const b of document.querySelectorAll<HTMLButtonElement>('[data-copiar]')) {
  const original = b.textContent;
  b.addEventListener('click', () => {
    void navigator.clipboard.writeText(b.dataset.copiar ?? '').then(() => {
      b.textContent = b.dataset.hecho ?? original;
      setTimeout(() => (b.textContent = original), 1600);
    });
  });
}

// ── Cortina de cordones entre páginas (sin View Transitions: Firefox y Safari antiguos) ─────
// Con View Transitions entre documentos (Chrome, Safari 18.2+), el navegador anima solo.
const conVT = 'onpagereveal' in window;
if (!conVT && !reducido) {
  const cortina = document.createElement('div');
  cortina.className = 'cortina';
  cortina.setAttribute('aria-hidden', 'true');
  const n = innerWidth < 700 ? 6 : 12;
  cortina.style.setProperty('--n', String(n));
  cortina.innerHTML = '<i></i>'.repeat(n);
  document.body.append(cortina);
  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest('a');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
    e.preventDefault();
    cortina.querySelectorAll('i').forEach((c, i) => {
      c.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], {
        duration: 380,
        delay: i * 22,
        easing: 'cubic-bezier(.38,.005,.215,1)',
        fill: 'forwards',
      });
    });
    setTimeout(() => (location.href = url.href), 380 + n * 22);
  });
  addEventListener('pageshow', () => {
    cortina.querySelectorAll('i').forEach((c) => {
      c.getAnimations().forEach((a) => {
        a.cancel();
      });
    });
  });
}
