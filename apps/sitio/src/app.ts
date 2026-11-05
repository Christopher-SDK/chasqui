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
const cierre = document.querySelector<HTMLElement>('.cierre');
if (barra) {
  // Visible solo cuando el CTA del héroe ya pasó y el CTA del cierre no está a la vista
  // (un CTA primario por pantallazo).
  let pasoHeroe = !primerBoton;
  let enCierre = false;
  const pintar = () => barra.classList.toggle('visible', pasoHeroe && !enCierre);
  if (primerBoton)
    new IntersectionObserver((es) => {
      for (const e of es) pasoHeroe = !e.isIntersecting && e.boundingClientRect.top < 0;
      pintar();
    }).observe(primerBoton);
  if (cierre)
    new IntersectionObserver((es) => {
      for (const e of es) enCierre = e.isIntersecting;
      pintar();
    }).observe(cierre);
  pintar();
}

// ── Videos: solo corren en pantalla, con pausa visible (sin movimiento si se pide reducirlo) ──
for (const v of document.querySelectorAll<HTMLVideoElement>('video[data-video]')) {
  const boton = v.closest('figure')?.querySelector<HTMLButtonElement>('[data-pausa]');
  let pausadoPorUsuario = reducido;
  const textos = boton
    ? [boton.textContent, document.documentElement.lang === 'en' ? 'Play' : 'Reproducir']
    : [];
  const pintar = () => {
    if (boton) boton.textContent = v.paused ? (textos[1] ?? '') : (textos[0] ?? '');
  };
  v.addEventListener('play', pintar);
  v.addEventListener('pause', pintar);
  boton?.addEventListener('click', () => {
    pausadoPorUsuario = !v.paused;
    if (v.paused) void v.play();
    else v.pause();
  });
  new IntersectionObserver(
    (es) => {
      for (const e of es) {
        if (e.isIntersecting && !pausadoPorUsuario) {
          v.preload = 'auto';
          void v.play().catch(() => undefined);
        } else v.pause();
      }
    },
    { threshold: 0.35 },
  ).observe(v);
  pintar();
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

// ── Cortina de cordones entre páginas ─────────────────────────────────────────────────────
// Al salir, los cordones caen y tapan (cada uno con un nudo real); al llegar, la página nueva se
// pinta ya tapada (script en línea del <head>) y los cordones suben. Ida ≤ 700 ms.
const cortina = document.querySelector<HTMLElement>('.cortina');
const cordones = cortina ? [...cortina.querySelectorAll<HTMLElement>('i')] : [];
const curva = 'cubic-bezier(.38,.005,.215,1)';
const visibles = () =>
  cordones.filter((c) => c.offsetParent !== null || getComputedStyle(c).display !== 'none');

if (document.documentElement.classList.contains('llega')) {
  const anims = visibles().map((c, i) =>
    c.animate(
      [
        { transform: 'scaleY(1)', transformOrigin: 'top' },
        { transform: 'scaleY(0)', transformOrigin: 'top' },
      ],
      {
        duration: reducido ? 1 : 420,
        delay: reducido ? 0 : 60 + i * 22,
        easing: curva,
        fill: 'forwards',
      },
    ),
  );
  void Promise.all(anims.map((a) => a.finished)).then(() => {
    document.documentElement.classList.remove('llega');
    anims.forEach((a) => {
      a.cancel();
    });
  });
}

if (cortina && !reducido)
  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest('a');
    if (
      !a ||
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      a.target ||
      a.hasAttribute('download')
    )
      return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname === location.pathname) return;
    e.preventDefault();
    const lista = visibles();
    lista.forEach((c, i) =>
      c.animate(
        [
          { transform: 'scaleY(0)', transformOrigin: 'top' },
          { transform: 'scaleY(1)', transformOrigin: 'top' },
        ],
        {
          duration: 420,
          delay: i * 22,
          easing: curva,
          fill: 'forwards',
        },
      ),
    );
    try {
      sessionStorage.setItem('cortina', '1');
    } catch {
      /* sin almacenamiento: la página nueva llega sin cortina */
    }
    setTimeout(
      () => {
        location.href = url.href;
      },
      420 + lista.length * 22,
    );
  });

// M5: al volver con atrás/adelante también sube la cortina (misma duración a la ida y a la vuelta).
addEventListener('pageshow', (e) => {
  if (!e.persisted || !cortina) return;
  cordones.forEach((c) => {
    c.getAnimations().forEach((a) => {
      a.cancel();
    });
  });
  if (reducido) return;
  visibles().forEach((c, i) =>
    c.animate(
      [
        { transform: 'scaleY(1)', transformOrigin: 'top' },
        { transform: 'scaleY(0)', transformOrigin: 'top' },
      ],
      {
        duration: 420,
        delay: 40 + i * 22,
        easing: curva,
        fill: 'forwards',
      },
    ),
  );
});
