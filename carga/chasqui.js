// Prueba de carga de Chasqui: tres escenarios en paralelo con umbrales por escenario.
//   pnpm carga            (contra localhost:7100-7300; ver carga/README.md)
import exec from 'k6/execution';
import http from 'k6/http';
import { check } from 'k6';
import { SharedArray } from 'k6/data';

const SUNAT = __ENV.SUNAT_URL || 'http://localhost:7100';
const PAGOS = __ENV.PAGOS_URL || 'http://localhost:7200';
const IDENTIDAD = __ENV.IDENTIDAD_URL || 'http://localhost:7300';
const DURACION = __ENV.DURACION || '30s';
const SIN_CAOS = { 'x-chasqui-chaos': __ENV.CAOS || 'ninguno' };

const comprobantes = new SharedArray('comprobantes', () =>
  JSON.parse(open('./.datos/comprobantes.json')),
);

export const options = {
  scenarios: {
    sunat: {
      executor: 'constant-arrival-rate',
      rate: 20,
      timeUnit: '1s',
      duration: DURACION,
      preAllocatedVUs: 20,
      maxVUs: 60,
      exec: 'enviarFactura',
    },
    pagos: {
      executor: 'constant-arrival-rate',
      rate: 30,
      timeUnit: '1s',
      duration: DURACION,
      preAllocatedVUs: 20,
      maxVUs: 60,
      exec: 'transferir',
    },
    identidad: {
      executor: 'constant-arrival-rate',
      rate: 50,
      timeUnit: '1s',
      duration: DURACION,
      preAllocatedVUs: 20,
      maxVUs: 60,
      exec: 'consultarRuc',
    },
  },
  thresholds: {
    // k6 aprueba un umbral sin datos: se exige que cada escenario haya respondido de verdad.
    'http_reqs{scenario:sunat}': ['count>100'],
    'http_reqs{scenario:pagos}': ['count>100'],
    'http_reqs{scenario:identidad}': ['count>100'],
    'http_req_failed{scenario:sunat}': ['rate<0.01'],
    'http_req_failed{scenario:pagos}': ['rate<0.01'],
    'http_req_failed{scenario:identidad}': ['rate<0.01'],
    'http_req_duration{scenario:sunat}': ['p(95)<800', 'p(99)<1500'],
    'http_req_duration{scenario:pagos}': ['p(95)<300'],
    'http_req_duration{scenario:identidad}': ['p(95)<150'],
    'checks{scenario:sunat}': ['rate>0.99'],
    'checks{scenario:pagos}': ['rate>0.99'],
    'checks{scenario:identidad}': ['rate>0.99'],
  },
};

export function enviarFactura() {
  const i = exec.scenario.iterationInTest;
  if (i >= comprobantes.length)
    exec.test.abort(`Faltan facturas pregeneradas: corre «pnpm carga:preparar ${String(i + 500)}»`);
  const r = http.post(`${SUNAT}/api/v1/comprobantes`, JSON.stringify(comprobantes[i]), {
    headers: { 'content-type': 'application/json', ...SIN_CAOS },
    tags: { name: 'POST /api/v1/comprobantes' },
  });
  check(r, { 'factura aceptada': (x) => x.status === 200 && x.json('estado') === 'aceptado' });
}

// 10 cuentas sembradas; montos chicos para no tocar los límites diarios en la corrida.
export function transferir() {
  const i = exec.scenario.iterationInTest;
  const origen = `9000000${String((i % 10) + 1).padStart(2, '0')}`;
  const destino = `9000000${String(((i + 3) % 10) + 1).padStart(2, '0')}`;
  const r = http.post(
    `${PAGOS}/api/v1/transferencias`,
    JSON.stringify({ origen, destino, monto: '0.10' }),
    {
      headers: {
        'content-type': 'application/json',
        'idempotency-key': `k6-${String(Date.now())}-${String(i)}`,
        ...SIN_CAOS,
      },
      tags: { name: 'POST /api/v1/transferencias' },
    },
  );
  check(r, {
    'transferencia creada': (x) =>
      x.status === 201 && ['completada', 'pendiente'].includes(x.json('estado')),
  });
}

// RUC con dígito verificador válido calculado aquí (módulo 11), como haría un cliente real.
const PESOS = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
function ruc(n) {
  const base = `20${String(n).padStart(8, '0')}`;
  const s = PESOS.reduce((a, p, k) => a + p * Number(base[k]), 0);
  const d = 11 - (s % 11);
  return base + String(d === 10 ? 0 : d === 11 ? 1 : d);
}

export function consultarRuc() {
  const r = http.get(`${IDENTIDAD}/api/v1/ruc/${ruc(exec.scenario.iterationInTest % 100000)}`, {
    headers: SIN_CAOS,
    tags: { name: 'GET /api/v1/ruc/:numero' },
    // 404 = «no existe» en el dataset ficticio (3 %): respuesta válida, no un fallo.
    responseCallback: http.expectedStatuses(200, 404),
  });
  check(r, { 'consulta respondida': (x) => x.status === 200 || x.status === 404 });
}

export function handleSummary(datos) {
  return { 'reports/carga/resumen.json': JSON.stringify(datos, null, 2) };
}
