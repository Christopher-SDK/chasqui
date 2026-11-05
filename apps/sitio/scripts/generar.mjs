// Genera las páginas HTML del sitio (Vite multipágina) en web/, en español e inglés.
// Los datos salen del código real de Chasqui (scripts/datos.ts): la factura del quipu, los ejemplos
// con su veredicto oficial y los perfiles de caos.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const R = path.resolve(import.meta.dirname, '..');
execFileSync('pnpm', ['exec', 'tsx', '--conditions=source', 'scripts/datos.ts'], {
  cwd: R,
  stdio: 'inherit',
});

const Q = JSON.parse(fs.readFileSync(`${R}/datos/quipu.json`, 'utf8'));
const EJ = JSON.parse(fs.readFileSync(`${R}/datos/ejemplos.json`, 'utf8'));
const CAOS = JSON.parse(fs.readFileSync(`${R}/datos/caos.json`, 'utf8'));
const LAM = JSON.parse(fs.readFileSync(`${R}/datos/laminas.json`, 'utf8'));
const SITIO = 'https://chasqui-lab.netlify.app';
const REPO = 'https://github.com/Christopher-SDK/chasqui';
/** Panel y simuladores corriendo de verdad (Dockerfile.demo). */
const PANEL = 'https://demo-production-8400.up.railway.app/';
const WEB = R; // páginas en carpetas por ruta (index.html, probar/, en/…), ignoradas por git
const GENERADAS = [
  'index.html',
  '404.html',
  'probar',
  'como-funciona',
  'caos',
  'calidad',
  'empezar',
  'en',
];

/** Script en línea del <head> (su hash va en la CSP de public/_headers): marca JS y, si se llega
 * desde otra página del sitio, pinta la cortina ya cerrada para que suba. */
export const CORTINA_HEAD =
  "document.documentElement.classList.add('js');try{if(sessionStorage.getItem('cortina')){document.documentElement.classList.add('llega');sessionStorage.removeItem('cortina')}}catch(e){}";

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
const sol = (c) => (c / 100).toFixed(2);

// ── Textos por idioma ─────────────────────────────────────────────────────────────────────────
const T = {
  es: {
    lang: 'es-PE',
    aviso:
      'Simulador para pruebas. No afiliado a SUNAT ni a ninguna entidad financiera. Todos los datos son ficticios.',
    saltar: 'Saltar al contenido',
    nav: [
      ['/probar/', 'Probar'],
      ['/como-funciona/', 'Cómo funciona'],
      ['/caos/', 'Caos'],
      ['/calidad/', 'Calidad'],
      ['/empezar/', 'Empezar'],
    ],
    otro: ['EN', 'English'],
    menu: 'Menú',
    cta: 'Valida tu XML',
    github: 'Ver en GitHub',
    copiar: 'Copiar',
    copiado: 'Copiado',
    pieLema: 'Laboratorio local para probar integraciones peruanas antes de producción.',
    pieAutor: 'Hecho por Christopher Arias · Montreach, Lima. Código abierto, licencia MIT.',
    pieSecciones: ['Producto', 'Recursos', 'Proyecto'],
    pieRecursos: [
      ['/empezar/', 'Instalación'],
      ['/calidad/', 'Evidencia'],
      [`${REPO}#readme`, 'Documentación ↗'],
    ],
    pieProyecto: [
      [REPO, 'GitHub ↗'],
      [`${REPO}/blob/main/LICENSE`, 'Licencia MIT ↗'],
      ['https://montreach.com', 'Montreach ↗'],
    ],
    lamina: [
      'Quipu, registro de nudos peruano',
      'L. Leland Locke, «The Ancient Quipu», American Anthropologist, 1912 · lámina XXII · AMNH B8705 · dominio público',
    ],
  },
  en: {
    lang: 'en',
    aviso:
      'Testing simulator. Not affiliated with SUNAT or any financial institution. All data is fictitious.',
    saltar: 'Skip to content',
    nav: [
      ['/en/probar/', 'Try it'],
      ['/en/como-funciona/', 'How it works'],
      ['/en/caos/', 'Chaos'],
      ['/en/calidad/', 'Quality'],
      ['/en/empezar/', 'Get started'],
    ],
    otro: ['ES', 'Español'],
    menu: 'Menu',
    cta: 'Validate your XML',
    github: 'View on GitHub',
    copiar: 'Copy',
    copiado: 'Copied',
    pieLema: 'A local lab to test Peruvian integrations before production.',
    pieAutor: 'Built by Christopher Arias · Montreach, Lima. Open source, MIT license.',
    pieSecciones: ['Product', 'Resources', 'Project'],
    pieRecursos: [
      ['/en/empezar/', 'Installation'],
      ['/en/calidad/', 'Evidence'],
      [`${REPO}/blob/main/README.en.md`, 'Documentation ↗'],
    ],
    pieProyecto: [
      [REPO, 'GitHub ↗'],
      [`${REPO}/blob/main/LICENSE`, 'MIT license ↗'],
      ['https://montreach.com', 'Montreach ↗'],
    ],
    lamina: [
      'Quipu, Peruvian knot-record',
      'L. Leland Locke, “The Ancient Quipu”, American Anthropologist, 1912 · plate XXII · AMNH B8705 · public domain',
    ],
  },
};

const enRuta = (ruta) => (ruta.startsWith('/en/') ? 'en' : 'es');
const parDe = (ruta) => (ruta.startsWith('/en/') ? ruta.slice(3) || '/' : `/en${ruta}`);

function nudo(n = 's', clase = 'nudo') {
  return `<img class="${clase}" src="/nudos/cuerpo-${n}.webp" alt="" width="${LAM.cuerpos[n][0]}" height="${LAM.cuerpos[n][1]}" decoding="async">`;
}
const boton = (t, href, extra = '') =>
  `<a class="boton" href="${href}"${extra}>${nudo('s')}<span>${esc(t)}</span></a>`;
const comando = (cmd, t) =>
  `<div class="comando"><code>${esc(cmd)}</code><button class="copiar" type="button" data-copiar="${esc(cmd)}" data-hecho="${esc(t.copiado)}">${esc(t.copiar)}</button></div>`;

/** Titular con líneas fijas (sin salto automático) y máscara por línea. */
function titular(lineas, clase = 't1', etiqueta = 'h1', extra = '') {
  // Las mayúsculas ocupan más: cuentan 1,3 para que la línea más ancha nunca se corte.
  const w = Math.max(...lineas.map((l) => l.length + 0.3 * (l.match(/[A-ZÁÉÍÓÚÑ]/g) ?? []).length));
  return `<${etiqueta} class="${clase}" style="--w:${w}"${extra} aria-label="${esc(lineas.join(' '))}">${lineas
    .map(
      (l, i) =>
        `<span class="mascara" style="--i:${i}" aria-hidden="true"><span class="linea linea-in">${esc(l)}</span></span>`,
    )
    .join('')}</${etiqueta}>`;
}

function lamina22(t, { prioridad = false, sizes = '(min-width: 901px) 38vw, 92vw' } = {}) {
  const ws = LAM.lamina22.tamanos;
  const set = (ext) => ws.map((w) => `/m/lamina22-${w}.${ext} ${w}w`).join(', ');
  const w = ws.includes(1080) ? 1080 : ws[ws.length - 1];
  return `<figure class="heroe-lamina">
  <picture class="revela">
    <source type="image/avif" srcset="${set('avif')}" sizes="${sizes}">
    <img src="/m/lamina22-${w}.webp" srcset="${set('webp')}" sizes="${sizes}" width="${LAM.lamina22.ancho}" height="${LAM.lamina22.alto}" alt="${esc(t.lamina[0])}: ${t === T.es ? 'un cordón principal con 95 cordones colgantes anudados' : 'a main cord with 95 knotted pendant cords'}"${prioridad ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">
  </picture>
  <figcaption class="pie-lamina">${esc(t.lamina[0])}<span>${esc(t.lamina[1])}</span></figcaption>
</figure>`;
}

function lamina(
  n,
  t,
  alt,
  { sizes = '(min-width: 901px) 50vw, 92vw', clase = '', ya = false } = {},
) {
  const d = LAM[n],
    ws = d.tamanos,
    w = ws.includes(1080) ? 1080 : ws[ws.length - 1];
  const set = (ext) => ws.map((x) => `/m/${n}-${x}.${ext} ${x}w`).join(', ');
  return `<figure class="figura ${clase}"><picture class="revela"><source type="image/avif" srcset="${set('avif')}" sizes="${sizes}"><img src="/m/${n}-${w}.webp" srcset="${set('webp')}" sizes="${sizes}" width="${d.ancho}" height="${d.alto}" alt="${esc(alt)}"${ya ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async"></picture><figcaption class="pie-lamina">${t}</figcaption></figure>`;
}

function pagina({ ruta, titulo, desc, cuerpo, js = [], clase = '' }) {
  const L = enRuta(ruta),
    t = T[L],
    par = parDe(ruta);
  const inicio = L === 'en' ? '/en/' : '/';
  const nav = t.nav
    .map(
      ([h, x]) => `<a href="${h}"${ruta.startsWith(h) ? ' aria-current="page"' : ''}>${esc(x)}</a>`,
    )
    .join('');
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Chasqui',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Linux, macOS, Windows (Docker / Node.js 22)',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'PEN' },
    license: 'https://opensource.org/licenses/MIT',
    codeRepository: REPO,
    author: {
      '@type': 'Person',
      name: 'Christopher Arias',
      worksFor: { '@type': 'Organization', name: 'Montreach', url: 'https://montreach.com' },
    },
    description: desc,
    url: SITIO + ruta,
    inLanguage: t.lang,
  };
  return `<!doctype html>
<html lang="${t.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${SITIO}${ruta}">
<link rel="alternate" hreflang="${L === 'en' ? 'en' : 'es-PE'}" href="${SITIO}${ruta}">
<link rel="alternate" hreflang="${L === 'en' ? 'es-PE' : 'en'}" href="${SITIO}${par}">
<link rel="alternate" hreflang="x-default" href="${SITIO}${L === 'en' ? par : ruta}">
<meta name="theme-color" content="#0d0d0b">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Chasqui">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${SITIO}${ruta}">
<meta property="og:image" content="${SITIO}/${L === 'en' ? 'og-en' : 'og'}.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="${L === 'en' ? 'en_US' : 'es_PE'}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<style>html,body{background:#0d0d0b;color:#ece8df}</style>
<script>${CORTINA_HEAD}</script>
<script type="application/ld+json">${JSON.stringify(ld)}</script>${
    ruta === '/' || ruta === '/en/' || ruta.endsWith('404')
      ? ''
      : `
<script type="application/ld+json">${JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Chasqui',
              item: SITIO + (L === 'en' ? '/en/' : '/'),
            },
            { '@type': 'ListItem', position: 2, name: titulo.split(' · ')[0], item: SITIO + ruta },
          ],
        })}</script>`
  }
<link rel="manifest" href="/site.webmanifest">
<link rel="stylesheet" href="/src/estilos.css">
</head>
<body class="pagina-${clase || 'interna'}">
<div class="cortina" aria-hidden="true">${'<i></i>'.repeat(12)}</div>
<a class="saltar" href="#contenido">${esc(t.saltar)}</a>
<p class="franja">${esc(t.aviso)}</p>
<header class="cabecera">
  <div class="cabecera-in">
    <a class="marca" href="${inicio}" aria-label="Chasqui, ${L === 'en' ? 'home' : 'inicio'}">${nudo('s', '')}<span>Chasqui</span></a>
    <button class="boton-menu" type="button" aria-expanded="false" aria-controls="nav">${esc(t.menu)}</button>
    <nav class="nav" id="nav" aria-label="${L === 'en' ? 'Main' : 'Principal'}">${nav}<a class="idioma" href="${par}" hreflang="${L === 'en' ? 'es' : 'en'}" lang="${L === 'en' ? 'es' : 'en'}" aria-label="${esc(t.otro[1])}">${t.otro[0]}</a></nav>
  </div>
</header>
<main id="contenido">
${cuerpo}
</main>
<footer class="pie">
  <div class="contenedor">
    <div class="pie-in">
      <div>
        <a class="marca" href="${inicio}">${nudo('s', '')}<span>Chasqui</span></a>
        <p>${esc(t.pieLema)}</p>
        <p>${esc(t.pieAutor)}</p>
      </div>
      <div><h2>${t.pieSecciones[0]}</h2><ul>${t.nav.map(([h, x]) => `<li><a href="${h}">${esc(x)}</a></li>`).join('')}<li><a href="${PANEL}" rel="noopener">${L === 'en' ? 'Live panel ↗' : 'Panel en vivo ↗'}</a></li></ul></div>
      <div><h2>${t.pieSecciones[1]}</h2><ul>${t.pieRecursos.map(([h, x]) => `<li><a href="${h}"${h.startsWith('http') ? ' rel="noopener"' : ''}>${esc(x)}</a></li>`).join('')}</ul></div>
      <div><h2>${t.pieSecciones[2]}</h2><ul>${t.pieProyecto.map(([h, x]) => `<li><a href="${h}" rel="noopener">${esc(x)}</a></li>`).join('')}</ul></div>
    </div>
    <div class="pie-legal"><span>${esc(t.aviso)}</span><span>© ${new Date().getFullYear()} Christopher Arias</span></div>
  </div>
</footer>
<div class="barra-movil">${boton(t.cta, L === 'en' ? '/en/probar/' : '/probar/')}<a class="enlace" href="${REPO}" rel="noopener">GitHub</a></div>
<script type="module" src="/src/app.ts"></script>
${js.map((j) => `<script type="module" src="/src/${j}"></script>`).join('\n')}
</body>
</html>
`;
}

// ── Inicio ────────────────────────────────────────────────────────────────────────────────────
const DIG = (n) => String(n).padStart(4, '0').split('').map(Number); // millares, centenas, decenas, unidades

/** Un cordón colgante con sus nudos en el sistema decimal de Locke (1912): grupos de nudos simples
 * para millares, centenas y decenas; un nudo largo de n vueltas para las unidades (el 1 es un nudo
 * en ocho). */
function cordon(l, i, L) {
  const [m, c, d, u] = DIG(l.centimos);
  const grupo = (k, cant, pos) =>
    `<span class="grupo" data-pos="${pos}">${Array.from({ length: cant }, () => `<img src="/nudos/cuerpo-s.webp" alt="" width="${LAM.cuerpos.s[0]}" height="${LAM.cuerpos.s[1]}" decoding="async">`).join('')}</span>`;
  const unidades = u
    ? `<span class="grupo" data-pos="u"><img class="largo" src="/nudos/cuerpo-${u === 1 ? '1' : u}.webp" alt="" width="${LAM.cuerpos[u === 1 ? '1' : String(u)][0]}" height="${LAM.cuerpos[u === 1 ? '1' : String(u)][1]}" decoding="async"></span>`
    : '<span class="grupo" data-pos="u"></span>';
  const exo = l.afectacion === '20' ? (L === 'en' ? ' · VAT-exempt' : ' · exonerado') : '';
  return `<li class="cordon" style="--i:${i}" data-centimos="${l.centimos}">
  <span class="cordon-dato"><strong>S/ ${sol(l.centimos)}</strong><span>${l.cantidad} × ${esc(l.descripcion)}${exo}</span></span>
  <span class="nudos" aria-hidden="true">${grupo('m', m, 'm')}${grupo('c', c, 'c')}${grupo('d', d, 'd')}${unidades}</span>
</li>`;
}

function inicio(L) {
  const t = T[L],
    en = L === 'en';
  const pre = en ? '/en' : '';
  const hero = `<section class="heroe" aria-labelledby="titulo-heroe">
  <div class="heroe-in">
    <div class="heroe-texto">
      <p class="antetitulo" data-entra>${en ? '<b>SUNAT, a digital wallet and DNI/RUC</b>, simulated on your machine' : '<b>SUNAT, billetera y DNI/RUC</b>, simulados en tu máquina'}</p>
      ${titular(en ? ['Let it fail here,', 'not at SUNAT.'] : ['Que falle aquí,', 'no en SUNAT.'], 't1', 'h1', ' id="titulo-heroe"')}
      <p class="bajada" data-entra style="--i:2">${en ? 'A local lab that runs SUNAT’s official rules, a wallet and DNI/RUC lookups, with failures you can replay.' : 'Laboratorio local que ejecuta las reglas oficiales de SUNAT, una billetera y DNI/RUC, con fallas que puedes repetir.'}</p>
      <div class="heroe-acciones" data-entra style="--i:3">${boton(t.cta, `${pre}/probar/`)}${comando('docker compose up -d', t)}</div>
    </div>
    ${lamina22(t, { prioridad: true })}
  </div>
</section>`;

  const quipu = `<section class="quipu-escena" aria-labelledby="titulo-quipu" data-quipu>
  <div class="quipu-fijo contenedor">
    <div class="quipu-cabeza">
      <div>
        ${titular(en ? ['An invoice', 'is a quipu.'] : ['Un comprobante', 'es un quipu.'], 't2', 'h2', ' id="titulo-quipu"')}
        <p class="quipu-ayuda" data-entra>${
          en
            ? `Each line is a pendant cord; its amount (in cents) is tied in knots the way Locke read them in 1912. The main cord adds them up. SUNAT checks the same thing: if the total does not match, it flags 4312.`
            : `Cada línea es un cordón colgante; su importe (en céntimos) va en nudos, como los leyó Locke en 1912. El cordón principal los suma. SUNAT revisa lo mismo: si el total no cuadra, observa con la 4312.`
        }</p>
      </div>
      <div class="quipu-total">
        <span class="etiqueta">${en ? 'Main cord · total' : 'Cordón principal · total'}</span>
        <span class="odometro mono" data-odometro data-total="${Q.total}" aria-live="polite" aria-label="S/ ${sol(Q.total)}">S/ ${sol(Q.total)}</span>
        <p class="quipu-veredicto" data-veredicto data-ok="${en ? `total = Σ lines · CDR 0 · no 4312` : `total = Σ líneas · CDR 0 · sin 4312`}">${en ? 'Scroll to tie the knots' : 'Baja para anudar'}</p>
      </div>
    </div>
    <div class="quipu" style="--n:${Q.lineas.length}">
      <span class="quipu-principal" aria-hidden="true"></span>
      <ol class="quipu-cordones">${Q.lineas.map((l, i) => cordon(l, i, L)).join('')}</ol>
    </div>
  </div>
</section>`;

  const pasos = [
    [
      en ? 'Start it' : 'Levanta',
      en
        ? 'One command brings up SUNAT, the wallet, DNI/RUC, chaos and the live panel.'
        : 'Un comando levanta SUNAT, la billetera, DNI/RUC, el caos y el panel en vivo.',
    ],
    [
      en ? 'Point to it' : 'Apunta',
      en
        ? 'Your system sends to localhost:7100 instead of SUNAT beta. Same SOAP, same codes.'
        : 'Tu sistema envía a localhost:7100 en vez de a SUNAT beta. El mismo SOAP, los mismos códigos.',
    ],
    [
      en ? 'Break it' : 'Rompe',
      en
        ? 'Turn on sunat-caida and see what your system does with a 503 at month-end.'
        : 'Activa sunat-caida y mira qué hace tu sistema con un 503 a fin de mes.',
    ],
  ];
  const pantallas = [
    `<span class="p">$</span> docker compose up -d
<span class="ok">✔</span> chasqui-sunat-sim       <span class="p">:7100</span>
<span class="ok">✔</span> chasqui-pagos-sim       <span class="p">:7200</span>
<span class="ok">✔</span> chasqui-identidad-sim   <span class="p">:7300</span>
<span class="ok">✔</span> chasqui-chaos-control   <span class="p">:7400</span>
<span class="ok">✔</span> chasqui-panel           <span class="p">:7500</span>
<span class="ok">✔</span> chasqui-tienda-demo     <span class="p">:7600</span>

<span class="p">$</span> curl localhost:7100/salud
{"estado":"ok","servicio":"sunat-sim"}`,
    `<span class="p">POST</span> http://localhost:7100/api/v1/comprobantes
<span class="p">archivo</span>  ${esc(Q.nombre.replace('.xml', '.zip'))}
<span class="p">firma</span>    XML-DSig · rsa-sha1 · ${en ? 'verified' : 'verificada'}
<span class="p">reglas</span>   ValidaExprRegFactura-2.0.1.xsl
<span class="p">total</span>    S/ ${sol(Q.total)} = Σ ${Q.lineas.map((l) => sol(l.centimos)).join(' + ')}

<span class="ok">200</span> {"estado":"aceptado","codigo":"0",
     "mensaje":"La Factura numero F001-00000001,
                ha sido aceptada"}`,
    `<span class="p">$</span> curl -X PUT localhost:7400/api/v1/caos \\
    -d '{"perfil":"sunat-caida","semilla":"cierre"}'

<span class="p">POST</span> /api/v1/comprobantes  <span class="mal">503</span> ${en ? 'Fault injected' : 'Falla inyectada'}
<span class="p">POST</span> billService           <span class="mal">soap:Client.0100</span>
<span class="p">${en ? 'retry' : 'reintento'} 1</span>  Idempotency-Key ped-118  <span class="mal">503</span>
<span class="p">${en ? 'retry' : 'reintento'} 2</span>  Idempotency-Key ped-118  <span class="mal">503</span>

<span class="obs">${en ? 'payment kept · invoice pending · no double charge' : 'pago a salvo · comprobante pendiente · sin doble cobro'}</span>`,
  ];
  const tres = `<section class="pasos-escena" aria-labelledby="titulo-pasos" data-pasos>
  <div class="pasos-fijo contenedor">
    <div>
      ${titular(en ? ['Three steps,', 'one bad day.'] : ['Tres pasos,', 'un mal día.'], 't2', 'h2', ' id="titulo-pasos"')}
      <ol class="pasos-lista">${pasos.map(([a, b], i) => `<li class="paso${i === 0 ? ' activo' : ''}" data-paso="${i}"><span class="marca-paso">${nudo(String(i + 1) === '1' ? '1' : String(i + 1), '')}</span><span><b>${esc(a)}</b><p>${esc(b)}</p><pre class="pantalla-movil">${pantallas[i]}</pre></span></li>`).join('')}</ol>
    </div>
    <div class="terminal" role="img" aria-label="${en ? 'Terminal showing the three steps' : 'Terminal con los tres pasos'}">
      <div class="terminal-barra"><span>~/chasqui</span><span data-paso-titulo>1 / 3</span></div>
      <div class="terminal-cuerpo">${pantallas.map((p, i) => `<pre class="pantalla${i === 0 ? ' activa' : ''}" data-pantalla="${i}">${p}</pre>`).join('')}</div>
    </div>
  </div>
</section>`;

  const huaico = `<section class="seccion" aria-labelledby="titulo-huaico" data-huaico>
  <div class="contenedor">
    ${titular(en ? ['The huaico', 'falls the same way.'] : ['El huaico', 'cae igual.'], 't2', 'h2', ' id="titulo-huaico"')}
    <p class="bajada" data-entra style="margin-top:22px">${
      en
        ? 'Every fault is decided by sha256(seed, rule, key#attempt). Two runs, same seed: the cords break at the same points. On your machine and in your CI.'
        : 'Cada falla sale de sha256(semilla, regla, clave#intento). Dos corridas con la misma semilla: los cordones se cortan en los mismos puntos. En tu máquina y en tu CI.'
    }</p>
    <form class="huaico-controles" data-entra data-huaico-form>
      <div class="campo"><label for="semilla">${en ? 'Seed' : 'Semilla'}</label><input id="semilla" name="semilla" value="cierre-de-mes" maxlength="40" autocomplete="off" spellcheck="false"></div>
      <div class="campo"><label for="perfil">${en ? 'Profile' : 'Perfil'}</label><select id="perfil" name="perfil">${CAOS.filter(
        (p) => p.reglas.some((r) => !r.servicio || r.servicio === 'sunat-sim'),
      )
        .map(
          (p) =>
            `<option value="${p.nombre}"${p.nombre === 'red-inestable' ? ' selected' : ''}>${p.nombre}</option>`,
        )
        .join('')}</select></div>
      <button class="boton" type="submit">${nudo('s')}<span>${en ? 'Unleash the huaico' : 'Desata el huaico'}</span></button>
    </form>
    <div class="corridas">
      <div class="corrida"><span class="corrida-nombre">${en ? 'run A · 40 requests' : 'corrida A · 40 envíos'}</span><div class="peticiones" data-corrida="a" aria-hidden="true">${'<span class="pet"></span>'.repeat(40)}</div></div>
      <div class="corrida"><span class="corrida-nombre">${en ? 'run B · same seed' : 'corrida B · misma semilla'}</span><div class="peticiones" data-corrida="b" aria-hidden="true">${'<span class="pet"></span>'.repeat(40)}</div></div>
    </div>
    <p class="huaico-resumen" data-huaico-resumen aria-live="polite"></p>
    <p class="leyenda"><span><i></i>${en ? 'delivered' : 'entregado'}</span><span class="l"><i></i>${en ? 'injected latency' : 'latencia inyectada'}</span><span class="f"><i></i>${en ? 'cut: disconnect, truncated or 503' : 'cortado: desconexión, truncada o 503'}</span></p>
    <p style="margin-top:28px" data-entra><a class="enlace" href="${pre}/caos/">${en ? 'See the four chaos profiles' : 'Ver los 4 perfiles de caos'} <span class="flecha">→</span></a></p>
  </div>
</section>`;

  const valida = `<section class="seccion" aria-labelledby="titulo-valida">
  <div class="contenedor">
    ${titular(en ? ['Hand over your quipu.', 'Get SUNAT’s verdict.'] : ['Entrega tu quipu.', 'Recibe el veredicto.'], 't2', 'h2', ' id="titulo-valida"')}
    <p class="bajada" data-entra style="margin-top:22px">${
      en
        ? 'The 2,131 official checks run right here, in your browser. Your XML never leaves your device.'
        : 'Las 2 131 validaciones oficiales corren aquí mismo, en tu navegador. Tu XML no sale de tu equipo.'
    }</p>
    ${validador(L, ['valida', 'observada'], 'observada')}
  </div>
</section>`;

  const cifras = `<section class="seccion" aria-labelledby="titulo-cifras">
  <div class="contenedor">
    ${titular(en ? ['Measured,', 'not promised.'] : ['Medido,', 'no prometido.'], 't2', 'h2', ' id="titulo-cifras"')}
    <div class="cifras">${[
      [
        en ? '2,131' : '2 131',
        en
          ? 'official checks from SUNAT’s XSL sheets, run as published'
          : 'validaciones de los XSL oficiales de SUNAT, ejecutadas tal cual',
        en ? 'docs/fuentes.md §6' : 'docs/fuentes.md §6',
        `${REPO}/blob/main/docs/fuentes.md`,
      ],
      [
        '41/41',
        en
          ? 'real third-party UBL 2.1 invoices with the same verdict as the official sheet'
          : 'XML UBL 2.1 reales de terceros con el mismo veredicto que la hoja oficial',
        en ? 'audit, 2026-11-04' : 'auditoría, 2026-11-04',
        `${REPO}/blob/main/docs/PROGRESO.md`,
      ],
      [
        en ? '88.76 %' : '88,76 %',
        en
          ? 'mutation score (Stryker) on the validator, totals and XML'
          : 'mutation score (Stryker) del validador, el cálculo y el XML',
        'Stryker',
        `${REPO}/blob/main/docs/PROGRESO.md`,
      ],
      [
        en ? '19.8 ms' : '19,8 ms',
        en
          ? 'p95 to receive and validate an invoice under load (k6), 0 % errors'
          : 'p95 para recibir y validar una factura bajo carga (k6), 0 % errores',
        'k6',
        `${REPO}/tree/main/carga`,
      ],
    ]
      .map(
        ([v, q, f, h], i) =>
          `<div class="cifra" data-entra style="--i:${i}"><span class="valor">${esc(v.replace(/ /g, '\u202f'))}</span><span class="que">${esc(q)}</span><span class="fuente"><a href="${h}" rel="noopener">${esc(f)} ↗</a></span></div>`,
      )
      .join('')}</div>
    <p style="margin-top:32px" data-entra><a class="enlace" href="${pre}/calidad/">${en ? 'How we measure it' : 'Cómo lo medimos'} <span class="flecha">→</span></a></p>
  </div>
</section>`;

  const cierre = `<section class="seccion cierre" aria-labelledby="titulo-cierre">
  <div class="contenedor" style="container-type:inline-size">
    ${titular(en ? ['Break it today.', 'Ship it calm.'] : ['Rómpelo hoy.', 'Factura tranquilo.'], 't1', 'h2', ' id="titulo-cierre"')}
    <div class="heroe-acciones" data-entra>${boton(t.cta, `${pre}/probar/`)}<a class="enlace" href="${PANEL}" rel="noopener">${en ? 'Open the live panel' : 'Abre el panel en vivo'} <span class="flecha">↗</span></a><a class="enlace" href="${REPO}" rel="noopener">${esc(t.github)} <span class="flecha">↗</span></a></div>
    <p class="dato" style="margin-top:20px" data-entra>${en ? 'Runs in your browser. Your XML never leaves your device.' : 'Corre en tu navegador. Tu XML no sale de tu equipo.'}</p>
  </div>
</section>`;

  return hero + quipu + tres + videoPanel(L) + huaico + valida + cifras + cierre;
}

/** Validador: soltar o elegir un ejemplo; el veredicto lo calcula el navegador con las reglas oficiales. */
function validador(L, ids = EJ.map((e) => e.id), auto = '') {
  const en = L === 'en';
  const nombres = {
    valida: en ? 'Valid invoice' : 'Factura válida',
    rechazada: en ? 'UBL 2.0 instead of 2.1' : 'UBL 2.0 en vez de 2.1',
    observada: en ? 'Total off by S/ 3' : 'Total desfasado en S/ 3',
    credito: en
      ? 'Credit sale with SPOT withholding · 3249'
      : 'Crédito con detracción · observa 3249',
    consumo: en ? 'Excise, bag tax and a free sample' : 'ISC, bolsas y una muestra gratuita',
    boleta: en ? 'Receipt with 10 % VAT (Law 31556)' : 'Boleta con IGV del 10 % (Ley 31556)',
  };
  return `<div class="validador" data-validador data-lang="${L}"${auto ? ` data-auto="${EJ.find((e) => e.id === auto)?.archivo ?? ''}"` : ''}>
  <div data-entra>
    <div class="soltar" data-soltar>
      <input type="file" accept=".xml,text/xml,application/xml" aria-label="${en ? 'Choose an XML file' : 'Elige un archivo XML'}">
      <div><strong>${en ? 'Drop your XML here' : 'Suelta tu XML aquí'}</strong><br><small>${en ? 'Invoice, receipt or note in UBL 2.1. Name it like SUNAT: RUC-01-F001-1.xml' : 'Factura, boleta o nota en UBL 2.1. Nómbralo como SUNAT: RUC-01-F001-1.xml'}</small></div>
    </div>
    <div class="ejemplos" role="group" aria-label="${en ? 'Examples' : 'Ejemplos'}">${EJ.filter(
      (e) => ids.includes(e.id),
    )
      .map(
        (e) =>
          `<button class="ejemplo" type="button" aria-pressed="false" data-ejemplo="${e.archivo}">${esc(nombres[e.id])}<span class="mono">${esc(e.archivo)}</span></button>`,
      )
      .join('')}</div>
  </div>
  <div class="resultado" data-resultado aria-live="polite" data-entra style="--i:1">
    <p class="resultado-vacio">${en ? 'The verdict will appear here: status, SUNAT code, official message and the exact line of the XSL rule.' : 'Aquí aparecerá el veredicto: estado, código SUNAT, mensaje oficial y la línea exacta de la regla XSL.'}</p>
  </div>
</div>`;
}

// ── Páginas internas (contenido real del repo) ───────────────────────────────────────────────
function videoPanel(L, { poster = 'panel-poster', texto } = {}) {
  const en = L === 'en';
  return `<figure class="video-panel" data-entra>
  <video data-video muted playsinline loop preload="none" poster="/v/${poster}.jpg" width="1440" height="860" aria-label="${en ? 'Recording of the live panel: invoices arriving, the detail of an observed one and sunat-caida turned on' : 'Grabación del panel en vivo: comprobantes que llegan, el detalle de uno observado y sunat-caida activado'}">
    <source media="(max-width: 600px)" src="/v/panel-movil.mp4" type="video/mp4">
    <source media="(max-width: 900px)" src="/v/panel-960.mp4" type="video/mp4">
    <source src="/v/panel-1440.mp4" type="video/mp4">
  </video>
  <figcaption><span>${texto ?? (en ? 'The real panel, recorded on the live demo. Nothing staged: every row is an invoice that went through the official rules.' : 'El panel real, grabado sobre la demo en vivo. Nada armado: cada fila es un comprobante que pasó por las reglas oficiales.')}</span><span><button class="pausa" type="button" data-pausa>${en ? 'Pause' : 'Pausar'}</button> <a class="enlace" href="${PANEL}" rel="noopener">${en ? 'Open the live panel' : 'Abre el panel en vivo'} <span class="flecha">↗</span></a></span></figcaption>
</figure>`;
}

function aperturaConLamina(n, pie, alt, lineas, bajada) {
  return `<section class="apertura apertura-lamina"><div class="contenedor apertura-in"><div>${titular(lineas)}<p class="bajada" data-entra style="--i:2">${bajada}</p></div>${lamina(n, esc(pie), alt, { sizes: '(min-width: 901px) 34vw, 92vw', ya: true })}</div></section>`;
}

function apertura(lineas, bajada) {
  return `<section class="apertura"><div class="contenedor">${titular(lineas)}<p class="bajada" data-entra style="--i:2">${bajada}</p></div></section>`;
}

function probar(L) {
  const en = L === 'en';
  return `${aperturaConLamina(
    'lamina24',
    en
      ? 'Quipu as a number record · plate XXIV, AMNH B8713 · Locke, 1912 · public domain'
      : 'Quipu como registro numérico · lámina XXIV, AMNH B8713 · Locke, 1912 · dominio público',
    en
      ? 'Quipu photographed in 1912: pendant cords fanning out from a main cord, with knots at different heights'
      : 'Quipu fotografiado en 1912: cordones colgantes que salen en abanico de un cordón principal, con nudos a distintas alturas',
    en ? ['Validate', 'your XML.'] : ['Valida', 'tu XML.'],
    en
      ? 'SUNAT’s official XSL rules, run in your browser: same code, same message, same order as the sheet.'
      : 'Las reglas XSL oficiales de SUNAT, ejecutadas en tu navegador: el mismo código, mensaje y orden que la hoja.',
  )}
<section class="seccion" style="padding-top:0;border-top:0"><div class="contenedor">${validador(L)}</div></section>
<section class="seccion"><div class="contenedor rejilla-2">
  <div class="lamina-bloque" data-entra><h3 class="t3">${en ? 'What runs here' : 'Qué corre aquí'}</h3><p>${en ? 'The XSLT interpreter of @chasqui/ubl-core with the 7 official sheets (2,131 checks, 597 codes). The XML signature and server rules (duplicates, deadlines) are checked by sunat-sim, not here.' : 'El intérprete XSLT de @chasqui/ubl-core con las 7 hojas oficiales (2 131 validaciones, 597 códigos). La firma y las reglas de servidor (duplicados, plazos) las revisa sunat-sim, no esta página.'}</p></div>
  <div class="lamina-bloque" data-entra style="--i:1"><h3 class="t3">${en ? 'Why it matches SUNAT' : 'Por qué coincide con SUNAT'}</h3><p>${en ? 'A differential test compares every verdict with the same sheets run by libxslt: about 2,180 identical cases.' : 'Una prueba diferencial compara cada veredicto con las mismas hojas ejecutadas por libxslt: unos 2 180 casos idénticos.'} <a class="enlace" href="${en ? '/en' : ''}/calidad/">${en ? 'See the evidence' : 'Ver la evidencia'} <span class="flecha">→</span></a></p></div>
</div></section>`;
}

function comoFunciona(L) {
  const en = L === 'en';
  const servicios = [
    [
      'sunat-sim',
      ':7100',
      en
        ? 'Electronic invoices over SOAP (WSDL) and REST: signed CDR, dispatch guides, summaries and voids, with the official rules.'
        : 'Comprobantes por SOAP (WSDL) y REST: CDR firmado, guías de remisión, resúmenes y bajas, con las reglas oficiales.',
      'POST /api/v1/comprobantes\n{ "nombreArchivo": "20000000001-01-F001-1.zip",\n  "contenido": "<ZIP en base64>" }\n→ 200 { "estado": "aceptado", "codigo": "0" }',
    ],
    [
      'pagos-sim',
      ':7200',
      en
        ? 'An interoperable wallet: P2P transfers by phone number, EMVCo QR charges, HMAC-signed webhooks with retries, idempotency enforced by the database.'
        : 'Billetera interoperable: transferencias por celular, cobros QR EMVCo, webhooks firmados con HMAC y reintentos, idempotencia garantizada por la base.',
      'POST /api/v1/transferencias\nIdempotency-Key: ped-118\n{ "origen": "900000001", "destino": "900000002",\n  "monto": "15.00" }\n→ 201 { "estado": "pendiente" }',
    ],
    [
      'identidad-sim',
      ':7300',
      en
        ? 'Fictitious DNI and RUC with valid check digits and taxpayer statuses (active, suspended, cancelled…).'
        : 'DNI y RUC ficticios con dígito verificador y estados de contribuyente (activo, baja, suspendido…).',
      'GET /api/v1/ruc/20000000001\n→ 200 { "estado": "ACTIVO", "condicion": "HABIDO" }',
    ],
    [
      'chaos-control',
      ':7400',
      en
        ? '10 injectable faults in 4 profiles, decided by a seed: latency, timeouts, 5xx, SOAP faults, truncated responses, disconnects, rate limits and duplicates.'
        : '10 fallas inyectables en 4 perfiles, decididas por una semilla: latencia, timeouts, 5xx, SOAP fault, respuestas truncadas, desconexiones, rate limit y duplicados.',
      'PUT /api/v1/caos\n{ "perfil": "red-inestable", "semilla": "ci-1234" }',
    ],
    [
      'panel',
      ':7500',
      en
        ? 'Live panel: invoices, payments and identity in real time (SSE), with the received XML, the returned CDR and the chaos switches.'
        : 'Panel en vivo: comprobantes, pagos e identidad en tiempo real (SSE), con el XML recibido, el CDR devuelto y los interruptores de caos.',
      'http://localhost:7500',
      PANEL,
    ],
    [
      'tienda-demo',
      ':7600',
      en
        ? 'A demo shop that uses the SDK end to end: validates the RUC, charges with QR and issues the invoice; if SUNAT is down the payment is safe.'
        : 'Tienda de ejemplo que usa el SDK de punta a punta: valida el RUC, cobra con QR y emite el comprobante; si SUNAT cae, el pago queda a salvo.',
      'http://localhost:7600',
    ],
  ];
  return `${apertura(
    en ? ['Four simulators,', 'one lab.'] : ['Cuatro simuladores,', 'un laboratorio.'],
    en
      ? 'Everything runs on your machine, in Docker or in a single Node process. TypeScript SDK, 11 MCP tools for AI agents, OpenTelemetry traces and a Bruno collection.'
      : 'Todo corre en tu máquina, en Docker o en un solo proceso de Node. SDK en TypeScript, 11 herramientas MCP para agentes de IA, trazas con OpenTelemetry y colección Bruno.',
  )}
<section class="banda-nudos" aria-hidden="true"><div class="banda-in">${['9', '8', '7', '6', '5', '4', '3', '2', '1', 's'].map((k) => `<img src="/nudos/nudo-${k}.webp" alt="" width="${LAM.nudos[k][0]}" height="${LAM.nudos[k][1]}" loading="lazy" decoding="async">`).join('')}</div><p class="pie-lamina">${en ? 'The ten knots of plate XXI, values 9 to 1 and the single knot · Locke, 1912 · public domain' : 'Los diez nudos de la lámina XXI, del 9 al 1 y el nudo simple · Locke, 1912 · dominio público'}</p></section>
<section class="seccion" style="border-top:0"><div class="contenedor rejilla-2">${servicios.map(([n, p, d, c, vivo], i) => `<article class="lamina-bloque" id="${n}" data-entra style="--i:${i % 2}"><h2 class="t3"><span class="mono">${n}</span> <span class="dato">${p}</span></h2><p>${esc(d)}</p><pre class="codigo">${esc(c)}</pre>${vivo ? `<p style="margin-top:14px"><a class="enlace" href="${vivo}" rel="noopener">${en ? 'Open it live' : 'Ábrelo en vivo'} <span class="flecha">↗</span></a></p>` : ''}</article>`).join('')}</div></section>
<section class="seccion"><div class="contenedor rejilla-2">
  <div data-entra>${titular(en ? ['SDK in', 'TypeScript.'] : ['SDK en', 'TypeScript.'], 't2', 'h2')}<p class="bajada" style="margin-top:20px">${en ? 'Fluent builders for every special operation, idempotent retries and chaos for one test.' : 'Builders fluidos para cada operación especial, reintentos idempotentes y caos para una sola prueba.'}</p></div>
  <pre class="codigo" data-entra style="--i:1">${esc(`import { Chasqui, factura } from '@chasqui/sdk';

const chasqui = new Chasqui();
const f = factura()
  .serie('F001', 1)
  .emisor(miEmpresa)
  .cliente('20123456786', 'CLIENTE S.A.C.')
  .item('Café de altura 250 g', 2, '21.10')
  .bolsas(2, '0.10')
  .construir();

await chasqui.chaos.con('sunat-caida', async () => {
  await chasqui.sunat.enviar(f); // ErrorChasqui 503
});`)}</pre>
</div></section>
<section class="seccion"><div class="contenedor rejilla-2">
  <div data-entra>${titular(en ? ['MCP for', 'AI agents.'] : ['MCP para', 'agentes de IA.'], 't2', 'h2')}<p class="bajada" style="margin-top:20px">${en ? '11 tools so an agent can issue invoices, validate XML, transfer money and toggle faults.' : '11 herramientas para que un agente emita comprobantes, valide XML, transfiera y active fallas.'}</p></div>
  <pre class="codigo" data-entra style="--i:1">${esc('claude mcp add chasqui -- pnpm --silent --dir /ruta/a/chasqui \\\n  --filter @chasqui/mcp-server dev')}</pre>
</div></section>`;
}

function caos(L) {
  const en = L === 'en';
  const fila = (p) =>
    `<tr><td class="mono">${p.nombre}</td><td>${esc(p.descripcion)}</td><td class="mono">${p.reglas.map((r) => `${r.porcentaje} % ${r.falla.tipo}${r.servicio ? ` · ${r.servicio}` : ''}`).join('<br>')}</td></tr>`;
  return `${apertura(
    en ? ['SUNAT down,', 'on demand.'] : ['SUNAT caída,', 'a voluntad.'],
    en
      ? 'Provoke outages, latency, truncated responses and duplicates with a seed: the same sequence on your machine and in your CI.'
      : 'Provoca caídas, latencia, respuestas truncadas y duplicados con una semilla: la misma secuencia en tu máquina y en tu CI.',
  )}
<section class="seccion" style="border-top:0;padding-top:0"><div class="contenedor"><table class="tabla" data-entra><thead><tr><th>${en ? 'Profile' : 'Perfil'}</th><th>${en ? 'What it simulates' : 'Qué simula'}</th><th>${en ? 'Rules' : 'Reglas'}</th></tr></thead><tbody>${CAOS.map(fila).join('')}</tbody></table>
<p class="dato" style="margin-top:14px">${en ? 'Profile descriptions are shown as defined in @chasqui/chaos-engine (Spanish).' : 'Perfiles tal como están definidos en @chasqui/chaos-engine.'}</p></div></section>
${videoPanel(L, { poster: 'panel-poster-caos', texto: en ? 'The live panel with sunat-caida on: the shop’s submissions come back as injected 503s, the payment is kept.' : 'El panel en vivo con sunat-caida activado: los envíos vuelven como 503 inyectados y el pago queda a salvo.' })}
<section class="seccion" data-huaico><div class="contenedor">
  ${titular(en ? ['Try the seed.'] : ['Prueba la semilla.'], 't2', 'h2')}
  <form class="huaico-controles" data-huaico-form>
    <div class="campo"><label for="semilla">${en ? 'Seed' : 'Semilla'}</label><input id="semilla" name="semilla" value="ci-1234" maxlength="40" autocomplete="off" spellcheck="false"></div>
    <div class="campo"><label for="perfil">${en ? 'Profile' : 'Perfil'}</label><select id="perfil" name="perfil">${CAOS.filter(
      (p) => p.reglas.some((r) => !r.servicio || r.servicio === 'sunat-sim'),
    )
      .map(
        (p) =>
          `<option value="${p.nombre}"${p.nombre === 'red-inestable' ? ' selected' : ''}>${p.nombre}</option>`,
      )
      .join('')}</select></div>
    <button class="boton" type="submit">${nudo('s')}<span>${en ? 'Unleash the huaico' : 'Desata el huaico'}</span></button>
  </form>
  <div class="corridas">
    <div class="corrida"><span class="corrida-nombre">${en ? 'run A · 40 requests' : 'corrida A · 40 envíos'}</span><div class="peticiones" data-corrida="a" aria-hidden="true">${'<span class="pet"></span>'.repeat(40)}</div></div>
    <div class="corrida"><span class="corrida-nombre">${en ? 'run B · same seed' : 'corrida B · misma semilla'}</span><div class="peticiones" data-corrida="b" aria-hidden="true">${'<span class="pet"></span>'.repeat(40)}</div></div>
  </div>
  <p class="huaico-resumen" data-huaico-resumen aria-live="polite"></p>
</div></section>
<section class="seccion"><div class="contenedor rejilla-2">
  <div data-entra>${titular(en ? ['In your CI.'] : ['En tu CI.'], 't2', 'h2')}<p class="bajada" style="margin-top:20px">${en ? 'A retry with the same Idempotency-Key can recover, like a real transient fault. Fix the seed and the test is reproducible.' : 'Un reintento con la misma Idempotency-Key puede recuperarse, como una falla transitoria real. Fija la semilla y la prueba es reproducible.'}</p></div>
  <pre class="codigo" data-entra style="--i:1">${esc(`await chasqui.chaos.activar('red-inestable', 'ci-1234');
// …tu prueba de resiliencia
await chasqui.chaos.desactivar();

# o por petición, sin estado global:
curl -H 'X-Chasqui-Chaos: sunat-caida' …`)}</pre>
</div></section>`;
}

function calidad(L) {
  const en = L === 'en';
  const filas = en
    ? [
        [
          'Official rules',
          'XSLT interpreter running SUNAT’s 7 sheets: 2,131 checks, 597 codes',
          'ADR 0011',
        ],
        [
          'Differential test',
          '~2,180 cases identical to the same sheets run by libxslt (code, observations and order)',
          'ADR 0003',
        ],
        [
          'Real-world XML',
          '41/41 public UBL 2.1 invoices from third-party projects: same verdict',
          'PROGRESO, phase 10',
        ],
        [
          'Tests',
          '245 tests: unit, property-based, conformance, HTTP integration, Pact contracts',
          'pnpm test',
        ],
        ['E2E', 'Playwright on desktop and mobile, with traces and video', 'pnpm e2e'],
        ['Mutation', '88.76 % (Stryker) on the validator, totals and XML', 'pnpm mutation'],
        [
          'Load',
          'k6: p95 19.8 ms (sunat), 2.3 ms (payments), 7.6 ms (identity), 0 % errors',
          'carga/',
        ],
      ]
    : [
        [
          'Reglas oficiales',
          'Intérprete XSLT con las 7 hojas de SUNAT: 2 131 validaciones, 597 códigos',
          'ADR 0011',
        ],
        [
          'Prueba diferencial',
          '~2 180 casos idénticos a las mismas hojas ejecutadas por libxslt (código, observaciones y orden)',
          'ADR 0003',
        ],
        [
          'XML reales',
          '41/41 comprobantes UBL 2.1 públicos de terceros: mismo veredicto',
          'PROGRESO, fase 10',
        ],
        [
          'Pruebas',
          '245 pruebas: unitarias, de propiedades, de conformidad, integración HTTP y contratos Pact',
          'pnpm test',
        ],
        ['E2E', 'Playwright en escritorio y móvil, con trazas y video', 'pnpm e2e'],
        ['Mutation', '88,76 % (Stryker) del validador, el cálculo y el XML', 'pnpm mutation'],
        [
          'Carga',
          'k6: p95 19,8 ms (sunat), 2,3 ms (pagos), 7,6 ms (identidad), 0 % errores',
          'carga/',
        ],
      ];
  const hallazgos = en
    ? [
        [
          '3249 on every credit sale',
          'The official invoice sheet flags 3249 on every credit sale, even with correct installments: a relative XPath that never finds nodes. Chasqui reproduces it on purpose.',
        ],
        [
          'A mis-encoded byte',
          'The invoice sheet compares against “Configuracion Veh�cular” with a broken byte; the receipt sheet has it right. Chasqui compiles the literal as is.',
        ],
        [
          'BOM from .NET',
          'Real XML from .NET often starts with a UTF-8 BOM; it used to be unreadable (0306). Found with third-party files, fixed with a regression test.',
        ],
      ]
    : [
        [
          '3249 en toda venta al crédito',
          'La hoja oficial de factura observa toda venta al crédito con la 3249, aunque las cuotas estén bien: una ruta XPath relativa que nunca encuentra nodos. Chasqui lo reproduce a propósito.',
        ],
        [
          'Un byte mal codificado',
          'La hoja de factura compara contra «Configuracion Veh�cular» con un byte roto; la de boleta lo trae bien. Chasqui compila el literal tal cual.',
        ],
        [
          'El BOM de .NET',
          'Los XML reales de .NET suelen empezar con un BOM UTF-8; antes daban ilegible (0306). Se halló con archivos de terceros y se corrigió con su regresión.',
        ],
      ];
  return `${apertura(
    en ? ['Measured,', 'not promised.'] : ['Medido,', 'no prometido.'],
    en
      ? 'Validation rules are not interpreted from documentation: Chasqui runs SUNAT’s published XSL sheets and compares every verdict with them.'
      : 'Las validaciones no se interpretan de la documentación: Chasqui ejecuta las hojas XSL que publica SUNAT y compara cada veredicto con ellas.',
  )}
<section class="seccion" style="border-top:0;padding-top:0"><div class="contenedor"><table class="tabla" data-entra><tbody>${filas.map(([a, b, c]) => `<tr><th scope="row">${esc(a)}</th><td>${esc(b)}</td><td class="mono">${esc(c)}</td></tr>`).join('')}</tbody></table>
<p style="margin-top:24px" data-entra><a class="enlace" href="${REPO}/blob/main/docs/PROGRESO.md" rel="noopener">${en ? 'Full progress log' : 'Bitácora completa'} <span class="flecha">↗</span></a> · <a class="enlace" href="${REPO}/actions" rel="noopener">CI <span class="flecha">↗</span></a></p></div></section>
<figure class="figura figura-captura" data-entra><div class="contenedor"><picture class="revela"><img src="/m/stryker-1280.webp" width="1280" height="465" alt="${en ? 'Stryker mutation report: 1,533 mutants, 1,272 detected, score 88.76 %' : 'Reporte de mutation de Stryker: 1 533 mutantes, 1 272 detectados, puntaje 88,76 %'}" loading="lazy" decoding="async"></picture><figcaption class="pie-lamina">${en ? 'Stryker report of the full run · validator, totals and XML' : 'Reporte de Stryker de la corrida completa · validador, cálculo y XML'}</figcaption></div></figure>
${locke(L)}
<section class="seccion"><div class="contenedor">
  ${titular(en ? ['What the official', 'sheets taught us.'] : ['Lo que enseñaron', 'las hojas oficiales.'], 't2', 'h2')}
  <div class="rejilla-3" style="margin-top:40px">${hallazgos.map(([a, b], i) => `<div class="lamina-bloque" data-entra style="--i:${i % 2}"><h3 class="t3">${esc(a)}</h3><p>${esc(b)}</p></div>`).join('')}</div>
</div></section>`;
}

/** 1912: Locke comprobó a mano que cada cordón principal suma sus colgantes (tabla de la p. 331). */
function locke(L) {
  const en = L === 'en';
  const D = JSON.parse(fs.readFileSync(`${R}/datos/locke.json`, 'utf8'));
  const n = (x) => (x === null ? '?' : String(x));
  const filas = D.grupos
    .map((g) => {
      const lectura = g.alt ?? g.colgantes;
      const suma = lectura.includes(null) ? null : lectura.reduce((a, b) => a + b, 0);
      const estado =
        suma === null
          ? en
            ? 'cannot be checked: fragmentary cord'
            : 'no verificable: cordón fragmentario'
          : suma === g.cordon
            ? (en ? 'matches' : 'cuadra') +
              (g.alt
                ? en
                  ? ' (Locke’s alternative readings)'
                  : ' (con las lecturas alternativas de Locke)'
                : '')
            : en
              ? `off by ${String(Math.abs(suma - g.cordon))} — noted by Locke`
              : `discrepancia de ${String(Math.abs(suma - g.cordon))}: Locke la anotó`;
      const clase = suma === null ? '' : suma === g.cordon ? 'ok' : 'mal';
      return `<tr><td class="mono">${g.id}</td><td class="mono">${lectura.map(n).join(' + ')}</td><td class="mono">${suma === null ? '—' : suma}</td><td class="mono">${g.cordon}</td><td class="estado-${clase}">${esc(estado)}</td></tr>`;
    })
    .join('');
  return `<section class="seccion"><div class="contenedor">
  ${titular(en ? ['1912: the first', 'conformance test.'] : ['1912: la primera', 'prueba de conformidad.'], 't2', 'h2')}
  <p class="bajada" data-entra style="margin-top:22px">${
    en
      ? 'Locke read every knot of the quipu AMNH B8713 and checked that each main cord adds up its pendants: the same check SUNAT runs on an invoice total (4312). Group b does not add up, and he wrote it down.'
      : 'Locke leyó cada nudo del quipu AMNH B8713 y comprobó que cada cordón principal suma sus colgantes: la misma revisión que hace SUNAT sobre el total de un comprobante (4312). El grupo b no cuadra, y lo dejó escrito.'
  }</p>
  <table class="tabla tabla-locke" style="margin-top:36px" data-entra><thead><tr><th>${en ? 'Group' : 'Grupo'}</th><th>${en ? 'Pendant cords' : 'Colgantes'}</th><th>Σ</th><th>${en ? 'Main cord' : 'Cordón'}</th><th>${en ? 'Verdict' : 'Veredicto'}</th></tr></thead><tbody>${filas}</tbody></table>
  <p class="dato" style="margin-top:14px">${en ? 'Footnote to b in the original:' : 'Nota al grupo b en el original:'} «${esc(D.nota_b)}» · Locke, <i>American Anthropologist</i> 14 (1912), p. 331.</p>
</div>
${lamina('lamina23', esc(en ? 'Plate XXIII: the same quipu B8713 drawn knot by knot. “The top strand SUMS the numbers on the four pendent strands.” · Locke, 1912 · public domain' : 'Lámina XXIII: el mismo quipu B8713 dibujado nudo a nudo. «The top strand SUMS the numbers on the four pendent strands.» · Locke, 1912 · dominio público'), en ? 'Locke’s diagram of quipu B8713: six groups a to f, each main cord with its value (17, 1417, 805, 612, 135, 658) and the sum of its four pendants below (17, 1517, 805, 612, 88, 658)' : 'Diagrama de Locke del quipu B8713: seis grupos de la a a la f, cada cordón principal con su valor (17, 1417, 805, 612, 135, 658) y abajo la suma de sus cuatro colgantes (17, 1517, 805, 612, 88, 658)', { sizes: '100vw', clase: 'figura-sangre' })}
</section>`;
}

function empezar(L) {
  const en = L === 'en',
    t = T[L];
  const puertos = [
    ['sunat-sim', '7100', 'SOAP /billService?wsdl · REST /api/v1 · /docs'],
    ['pagos-sim', '7200', '/docs'],
    ['identidad-sim', '7300', '/docs'],
    ['chaos-control', '7400', '/docs'],
    ['panel', '7500', '/'],
    ['tienda-demo', '7600', '/'],
    [
      'Grafana · Jaeger · Prometheus',
      '3000 · 16686 · 9090',
      en ? 'observability profile' : 'perfil observabilidad',
    ],
  ];
  return `${apertura(
    en ? ['Up in', 'one minute.'] : ['Arriba en', 'un minuto.'],
    en
      ? 'Docker is enough. Without Docker: Node.js 22.13+ or 24 and pnpm.'
      : 'Basta con Docker. Sin Docker: Node.js 22.13+ o 24 y pnpm.',
  )}
<section class="seccion" style="border-top:0;padding-top:0"><div class="contenedor rejilla-2">
  <div class="lamina-bloque" data-entra><h2 class="t3">Docker</h2><p>${en ? 'Simulators, panel and demo shop.' : 'Simuladores, panel y tienda demo.'}</p><div style="margin-top:14px">${comando('docker compose up -d', t)}</div></div>
  <div class="lamina-bloque" data-entra style="--i:1"><h2 class="t3">${en ? 'Without Docker' : 'Sin Docker'}</h2><p>${en ? 'The four services in one process.' : 'Los cuatro servicios en un proceso.'}</p><div style="margin-top:14px">${comando('pnpm install && pnpm todo-en-uno', t)}</div></div>
</div></section>
${videoPanel(L, { texto: en ? 'What you get at localhost:7500 after docker compose up: the live panel, recorded on the public demo.' : 'Lo que ves en localhost:7500 después de docker compose up: el panel en vivo, grabado sobre la demo pública.' })}
<section class="seccion"><div class="contenedor">
  ${titular(en ? ['Ports.'] : ['Puertos.'], 't2', 'h2')}
  <table class="tabla" style="margin-top:32px" data-entra><thead><tr><th>${en ? 'Service' : 'Servicio'}</th><th>${en ? 'Port' : 'Puerto'}</th><th>${en ? 'Entry points' : 'Entradas'}</th></tr></thead><tbody>${puertos.map(([a, b, c]) => `<tr><td class="mono">${a}</td><td class="mono">${b}</td><td>${esc(c)}</td></tr>`).join('')}</tbody></table>
  <p class="dato" style="margin-top:16px">${esc(en ? 'SOAP test credentials (as in the beta environment): user <RUC>MODDATOS, password moddatos.' : 'Credenciales SOAP de prueba (como en el ambiente beta): usuario <RUC>MODDATOS, clave moddatos.')}</p>
</div></section>
<section class="seccion"><div class="contenedor rejilla-2">
  <div data-entra>${titular(en ? ['Your first', 'invoice.'] : ['Tu primer', 'comprobante.'], 't2', 'h2')}<p class="bajada" style="margin-top:20px">${en ? 'Point your system to localhost:7100 instead of SUNAT beta, or send one with curl.' : 'Apunta tu sistema a localhost:7100 en vez de SUNAT beta, o envía uno con curl.'}</p></div>
  <pre class="codigo" data-entra style="--i:1">${esc(`curl -X POST localhost:7100/_chasqui/demo \\
  -H 'content-type: application/json' \\
  -d '{"escenario":"valida"}'

→ {"estado":"aceptado","codigo":"0"}`)}</pre>
</div></section>`;
}

function noEncontrada(L) {
  const en = L === 'en',
    t = T[L];
  return `${apertura(en ? ['0404.', 'Cord not found.'] : ['0404.', 'Cordón perdido.'], en ? 'This page does not exist (yes, that is not a real SUNAT code either).' : 'Esta página no existe (y no, ese tampoco es un código real de SUNAT).')}
<section class="seccion" style="border-top:0;padding-top:0"><div class="contenedor"><img class="cordon-cortado" data-entra src="/nudos/nudo-s.webp" alt="" width="${LAM.nudos.s[0]}" height="${LAM.nudos.s[1]}" decoding="async"><div class="heroe-acciones" style="margin-top:40px">${boton(t.cta, en ? '/en/probar/' : '/probar/')}<a class="enlace" href="${en ? '/en/' : '/'}">${en ? 'Back to home' : 'Volver al inicio'} <span class="flecha">→</span></a></div></div></section>`;
}

// ── Escritura ─────────────────────────────────────────────────────────────────────────────────
const SEO = {
  es: {
    '/': [
      'Simulador de SUNAT para pruebas · Chasqui',
      'Laboratorio local con las reglas oficiales de SUNAT, una billetera y DNI/RUC, y fallas que puedes repetir. Gratis y de código abierto.',
    ],
    '/probar/': [
      'Validar XML de SUNAT online, en tu navegador · Chasqui',
      'Suelta tu factura o boleta UBL 2.1 y mira el veredicto de las 2 131 reglas oficiales de SUNAT. Tu XML no sale de tu equipo.',
    ],
    '/empezar/': [
      'Ambiente de pruebas de facturación electrónica · Chasqui',
      'Levanta SUNAT, billetera y DNI/RUC simulados con docker compose en un minuto. Puertos, credenciales SOAP y primer envío.',
    ],
    '/caos/': [
      'Pruebas de resiliencia: SUNAT caída, a voluntad · Chasqui',
      'Provoca caídas, latencia, respuestas truncadas y duplicados con una semilla: la misma secuencia en tu máquina y en tu CI.',
    ],
    '/como-funciona/': [
      'Cómo funciona: SUNAT, billetera, DNI/RUC y caos · Chasqui',
      'Cuatro simuladores, un panel en vivo, SDK en TypeScript y servidor MCP para agentes. Arquitectura y ejemplos reales.',
    ],
    '/calidad/': [
      'Calidad verificable: reglas oficiales y pruebas · Chasqui',
      '~2 180 casos idénticos a las reglas oficiales, 41 XML reales, 245 pruebas, mutation 88,76 % y carga con k6. Toda la evidencia.',
    ],
    404: ['Página no encontrada · Chasqui', 'Esta página no existe.'],
  },
  en: {
    '/': [
      'SUNAT sandbox for testing Peruvian e-invoicing · Chasqui',
      'A local lab with SUNAT’s official rules, a digital wallet and DNI/RUC, plus failures you can replay. Free and open source.',
    ],
    '/probar/': [
      'Validate SUNAT XML online, in your browser · Chasqui',
      'Drop your UBL 2.1 invoice or receipt and get the verdict of SUNAT’s 2,131 official checks. Your XML never leaves your device.',
    ],
    '/empezar/': [
      'Peru e-invoicing test environment in one minute · Chasqui',
      'Bring up simulated SUNAT, wallet and DNI/RUC with docker compose. Ports, SOAP credentials and your first invoice.',
    ],
    '/caos/': [
      'Resilience testing: SUNAT down, on demand · Chasqui',
      'Provoke outages, latency, truncated responses and duplicates with a seed: the same sequence on your machine and in CI.',
    ],
    '/como-funciona/': [
      'How it works: SUNAT, wallet, DNI/RUC and chaos · Chasqui',
      'Four simulators, a live panel, a TypeScript SDK and an MCP server for agents. Architecture and real examples.',
    ],
    '/calidad/': [
      'Verifiable quality: official rules and tests · Chasqui',
      '~2,180 cases identical to the official rules, 41 real XML files, 245 tests, 88.76 % mutation score and k6 load tests.',
    ],
    404: ['Page not found · Chasqui', 'This page does not exist.'],
  },
};
const PAGINAS = [
  ['/', inicio, ['inicio.ts', 'validador.ts', 'huaico.ts'], 'inicio'],
  ['/probar/', probar, ['validador.ts'], 'probar'],
  ['/como-funciona/', comoFunciona, [], 'como-funciona'],
  ['/caos/', caos, ['huaico.ts'], 'caos'],
  ['/calidad/', calidad, [], 'calidad'],
  ['/empezar/', empezar, [], 'empezar'],
];

for (const g of GENERADAS) fs.rmSync(path.join(WEB, g), { recursive: true, force: true });
const escribir = (ruta, html) => {
  const archivo = ruta === '404' ? path.join(WEB, '404.html') : path.join(WEB, ruta, 'index.html');
  fs.mkdirSync(path.dirname(archivo), { recursive: true });
  fs.writeFileSync(archivo, html);
};
for (const L of ['es', 'en']) {
  const pre = L === 'en' ? '/en' : '';
  for (const [r, fn, js, clase] of PAGINAS) {
    const ruta = r === '/' ? `${pre}/` : `${pre}${r}`;
    const [titulo, desc] = SEO[L][r];
    escribir(ruta, pagina({ ruta, titulo, desc, cuerpo: fn(L), js, clase }));
  }
}
// 404 bilingüe por idioma: Netlify sirve /404.html (es) y /en/404.html (en)
escribir(
  '404',
  pagina({
    ruta: '/404',
    titulo: SEO.es['404'][0],
    desc: SEO.es['404'][1],
    cuerpo: noEncontrada('es'),
    clase: 'no-encontrada',
  }),
);
fs.mkdirSync(path.join(WEB, 'en'), { recursive: true });
fs.writeFileSync(
  path.join(WEB, 'en', '404.html'),
  pagina({
    ruta: '/en/404',
    titulo: SEO.en['404'][0],
    desc: SEO.en['404'][1],
    cuerpo: noEncontrada('en'),
    clase: 'no-encontrada',
  }),
);
// Sitemap con sus pares de idioma.
const rutas = PAGINAS.map(([r]) => r);
fs.writeFileSync(
  path.join(R, 'public', 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${rutas
  .flatMap((r) => [r, `/en${r}`])
  .map((r) => {
    const es = r.startsWith('/en/') ? r.slice(3) : r;
    return `  <url><loc>${SITIO}${r}</loc><xhtml:link rel="alternate" hreflang="es-PE" href="${SITIO}${es}"/><xhtml:link rel="alternate" hreflang="en" href="${SITIO}/en${es}"/></url>`;
  })
  .join('\n')}
</urlset>
`,
);
console.log('páginas generadas');
