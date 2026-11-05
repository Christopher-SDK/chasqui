/**
 * Huaico: dos corridas de 40 envíos con la misma semilla y el mismo perfil. Cada decisión la toma
 * el algoritmo del motor real (caos-navegador.ts, probado contra @chasqui/chaos-engine); las dos
 * corridas se cortan en los mismos cordones.
 */
import { PERFILES, decidir, milisegundos } from './caos-navegador.js';

const RUTA = '/api/v1/comprobantes';
const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
const en = document.documentElement.lang === 'en';

interface Envio {
  tipo: 'ok' | 'lenta' | 'falla';
  detalle: string;
  ms: number;
}

async function corrida(perfil: string, semilla: string): Promise<Envio[]> {
  const p = PERFILES.find((x) => x.nombre === perfil);
  const reglas = p?.reglas ?? [];
  const envios: Envio[] = [];
  for (let n = 1; n <= 40; n++) {
    const clave = `ped-${String(n)}#1`;
    const fallas = await decidir(reglas, semilla, { servicio: 'sunat-sim', ruta: RUTA, clave });
    const corte = fallas.find((f) => f.tipo !== 'latencia');
    const lat = fallas.find((f) => f.tipo === 'latencia');
    const ms = lat?.tipo === 'latencia' ? await milisegundos(lat.ms, semilla, clave) : 0;
    if (corte) {
      const d =
        corte.tipo === 'error5xx'
          ? String(corte.estado)
          : corte.tipo === 'soapFault'
            ? `SOAP ${corte.codigo}`
            : corte.tipo;
      envios.push({ tipo: 'falla', detalle: d, ms });
    } else
      envios.push({ tipo: lat ? 'lenta' : 'ok', detalle: lat ? `+${String(ms)} ms` : '200', ms });
  }
  return envios;
}

function pintar(fila: HTMLElement, envios: Envio[], retraso: number) {
  const pets = [...fila.querySelectorAll<HTMLElement>('.pet')];
  pets.forEach((el, i) => {
    const e = envios[i];
    if (!e) return;
    el.className = 'pet';
    el.style.setProperty(
      '--largo',
      e.tipo === 'lenta' ? `${String(Math.round(100 - Math.min(e.ms, 4000) / 60))}%` : '100%',
    );
    if (e.tipo !== 'ok') el.classList.add(e.tipo);
    el.title = `ped-${String(i + 1)} · ${e.detalle}`;
    const marcar = () => {
      el.classList.add('lista');
    };
    if (reducido) marcar();
    else setTimeout(marcar, retraso + i * 28);
  });
}

for (const seccion of document.querySelectorAll<HTMLElement>('[data-huaico]')) {
  const form = seccion.querySelector<HTMLFormElement>('[data-huaico-form]');
  const a = seccion.querySelector<HTMLElement>('[data-corrida="a"]');
  const b = seccion.querySelector<HTMLElement>('[data-corrida="b"]');
  const resumen = seccion.querySelector<HTMLElement>('[data-huaico-resumen]');
  if (!form || !a || !b || !resumen) continue;

  const correr = async () => {
    const datos = new FormData(form);
    const valor = (k: string, def: string) => {
      const v = datos.get(k);
      return typeof v === 'string' && v.trim() ? v.trim() : def;
    };
    const semilla = valor('semilla', 'chasqui');
    const perfil = valor('perfil', 'red-inestable');
    const [ra, rb] = await Promise.all([corrida(perfil, semilla), corrida(perfil, semilla)]);
    pintar(a, ra, 0);
    pintar(b, rb, 160);
    const cortes = ra.filter((e) => e.tipo === 'falla').length;
    const lentas = ra.filter((e) => e.tipo === 'lenta').length;
    const iguales = ra.every((e, i) => e.tipo === rb[i]?.tipo && e.detalle === rb[i].detalle);
    const lista = ra
      .map((e, i) => (e.tipo === 'falla' ? `ped-${String(i + 1)}` : ''))
      .filter(Boolean)
      .slice(0, 6)
      .join(', ');
    resumen.innerHTML = en
      ? `${String(cortes)} cut · ${String(lentas)} slow · ${String(40 - cortes - lentas)} clean${lista ? ` · first cuts: ${lista}` : ''}<br><span class="igual">${iguales ? 'Run A = run B, request by request.' : 'Runs differ.'}</span>`
      : `${String(cortes)} cortados · ${String(lentas)} lentos · ${String(40 - cortes - lentas)} limpios${lista ? ` · primeros cortes: ${lista}` : ''}<br><span class="igual">${iguales ? 'Corrida A = corrida B, envío por envío.' : 'Las corridas difieren.'}</span>`;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    void correr();
  });
  // Primera corrida al llegar a la sección, para que se vea sin tener que pulsar.
  new IntersectionObserver(
    (es, o) => {
      if (es.some((x) => x.isIntersecting)) {
        void correr();
        o.disconnect();
      }
    },
    { threshold: 0.35 },
  ).observe(a);
}
