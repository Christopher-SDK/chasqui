/**
 * Validador en el navegador: el mismo validarXml de @chasqui/ubl-core con las hojas oficiales
 * compiladas (las pide oficial-navegador.ts por fetch). El XML nunca sale del equipo.
 */
import { req } from './dom.js';
import { validarXml, type Veredicto } from '../../../packages/ubl-core/src/validador/index.js';
import { precargar, type NombreHoja } from './oficial-navegador.js';

const HOJA: Record<string, NombreHoja> = {
  '01': 'factura',
  '03': 'boleta',
  '07': 'nota-credito',
  '08': 'nota-debito',
  '09': 'guia-remitente',
  RC: 'resumen',
  RA: 'baja',
};
const TIPO = /^\d{11}-(01|03|07|08|09|RC|RA)-/;

const TEXTOS = {
  es: {
    aceptado: 'Aceptado',
    observado: 'Con observaciones',
    rechazado: 'Rechazado',
    codigo: 'código',
    cargando: 'Cargando las reglas oficiales…',
    validando: 'Validando…',
    sinNombre:
      'El nombre del archivo no sigue el formato de SUNAT (RUC-TT-SERIE-NUMERO.xml); se valida igual y SUNAT respondería 0159.',
    errorRed: 'No se pudieron cargar las reglas. Revisa tu conexión y vuelve a intentar.',
    noXml: 'Ese archivo no es un XML.',
    meta: (ms: number, kb: number, hoja: string) =>
      `${hoja} · ${kb.toFixed(1)} KB · ${ms.toFixed(0)} ms en tu navegador`,
    regla: 'regla',
    sinHallazgos:
      'Ninguna regla oficial objetó el comprobante. SUNAT respondería con el CDR código 0.',
  },
  en: {
    aceptado: 'Accepted',
    observado: 'With observations',
    rechazado: 'Rejected',
    codigo: 'code',
    cargando: 'Loading the official rules…',
    validando: 'Validating…',
    sinNombre:
      'The file name does not follow SUNAT’s format (RUC-TT-SERIES-NUMBER.xml); it is validated anyway and SUNAT would answer 0159.',
    errorRed: 'The rules could not be loaded. Check your connection and try again.',
    noXml: 'That file is not XML.',
    meta: (ms: number, kb: number, hoja: string) =>
      `${hoja} · ${kb.toFixed(1)} KB · ${ms.toFixed(0)} ms in your browser`,
    regla: 'rule',
    sinHallazgos: 'No official rule objected to the document. SUNAT would answer with CDR code 0.',
  },
};

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c);

for (const raiz of document.querySelectorAll<HTMLElement>('[data-validador]')) {
  const t = TEXTOS[raiz.dataset.lang === 'en' ? 'en' : 'es'];
  const resultado = req('[data-resultado]', raiz);
  const soltar = req('[data-soltar]', raiz);
  const archivo = req('input[type=file]', soltar) as HTMLInputElement;
  const ejemplos = [...raiz.querySelectorAll<HTMLButtonElement>('[data-ejemplo]')];
  let turno = 0;

  async function validar(xml: string, nombre: string) {
    const mio = ++turno;
    const tipo = TIPO.exec(nombre)?.[1];
    const hoja = HOJA[tipo ?? '01'] ?? 'factura';
    resultado.dataset.estado = '';
    resultado.innerHTML = `<p class="resultado-vacio">${t.cargando}</p>`;
    try {
      await precargar(hoja);
    } catch {
      if (mio === turno) resultado.innerHTML = `<p class="resultado-vacio">${t.errorRed}</p>`;
      return;
    }
    if (mio !== turno) return;
    const t0 = performance.now();
    // Sin un nombre válido, SUNAT corta con 0159 antes de las reglas; aquí se muestra el aviso y
    // se valida igual como el tipo que declara el contenido (por defecto, factura).
    const nombreUsado = tipo ? nombre : `20000000001-01-F001-1.xml`;
    const v: Veredicto = validarXml(xml, nombreUsado);
    const ms = performance.now() - t0;
    pintar(v, ms, xml.length / 1024, hoja, !tipo);
  }

  function pintar(v: Veredicto, ms: number, kb: number, hoja: string, sinNombre: boolean) {
    const hallazgos = [...v.observaciones, ...(v.error ? [v.error] : [])];
    resultado.dataset.estado = v.estado;
    resultado.innerHTML = `
      <div class="resultado-estado"><strong>${t[v.estado]}</strong><span class="resultado-codigo">${t.codigo} ${esc(v.error?.codigo ?? '0')}</span></div>
      ${sinNombre ? `<p class="dato" style="margin-top:12px">${t.sinNombre}</p>` : ''}
      ${
        hallazgos.length
          ? `<ul class="hallazgos">${hallazgos
              .map(
                (h) =>
                  `<li><span class="codigo">${esc(h.codigo)}</span><span class="mensaje">${esc(h.mensaje)}</span><span class="fuente">${t.regla} ${esc(h.fuente)}</span></li>`,
              )
              .join('')}</ul>`
          : `<p style="margin-top:14px">${t.sinHallazgos}</p>`
      }
      <p class="resultado-meta">${t.meta(ms, kb, hoja)}</p>`;
    resultado.animate(
      [
        { opacity: 0, transform: 'translateY(10px)' },
        { opacity: 1, transform: 'none' },
      ],
      {
        duration: 420,
        easing: 'cubic-bezier(.19,1,.22,1)',
      },
    );
  }

  async function leer(f: File) {
    ejemplos.forEach((b) => {
      b.setAttribute('aria-pressed', 'false');
    });
    const texto = await f.text();
    if (!/^\s*(\uFEFF)?\s*</.test(texto)) {
      resultado.dataset.estado = '';
      resultado.innerHTML = `<p class="resultado-vacio">${t.noXml}</p>`;
      return;
    }
    await validar(texto, f.name);
  }

  archivo.addEventListener('change', () => {
    const f = archivo.files?.[0];
    if (f) void leer(f);
    archivo.value = '';
  });
  for (const ev of ['dragenter', 'dragover'] as const)
    soltar.addEventListener(ev, (e) => {
      e.preventDefault();
      soltar.classList.add('encima');
    });
  for (const ev of ['dragleave', 'drop'] as const)
    soltar.addEventListener(ev, () => {
      soltar.classList.remove('encima');
    });
  soltar.addEventListener('drop', (e) => {
    e.preventDefault();
    const f = e.dataTransfer?.files[0];
    if (f) void leer(f);
  });

  for (const b of ejemplos) b.addEventListener('click', () => void elegir(b));

  async function elegir(b: HTMLButtonElement) {
    ejemplos.forEach((o) => {
      o.setAttribute('aria-pressed', String(o === b));
    });
    const nombre = b.dataset.ejemplo ?? '';
    const r = await fetch(`/ejemplos/${nombre}`);
    if (!r.ok) {
      resultado.innerHTML = `<p class="resultado-vacio">${t.errorRed}</p>`;
      return;
    }
    await validar(await r.text(), nombre);
  }

  // Las reglas se piden cuando el validador se acerca a la pantalla, no al cargar la página.
  new IntersectionObserver(
    (es, o) => {
      if (es.some((e) => e.isIntersecting)) {
        void precargar('factura').catch(() => undefined);
        o.disconnect();
      }
    },
    { rootMargin: '400px' },
  ).observe(raiz);
}
