import type { Perfil } from './modelo.js';

/** Perfiles predefinidos. El catálogo con su explicación está en docs/guia-caos.md. */
export const PERFILES: readonly Perfil[] = [
  {
    nombre: 'cierre-de-mes',
    descripcion:
      'Último día del mes: todos facturan a la vez. Latencia alta en todo y timeouts intermitentes.',
    reglas: [
      { servicio: 'sunat-sim', porcentaje: 100, falla: { tipo: 'latencia', ms: [800, 4000] } },
      { servicio: 'sunat-sim', porcentaje: 10, falla: { tipo: 'timeout', ms: 30_000 } },
    ],
  },
  {
    nombre: 'sunat-caida',
    descripcion:
      'El servicio de recepción no responde: 503 en REST y SOAP fault 0100 en billService.',
    reglas: [
      {
        servicio: 'sunat-sim',
        ruta: '/billService',
        porcentaje: 100,
        falla: { tipo: 'soapFault', codigo: '0100' },
      },
      {
        servicio: 'sunat-sim',
        ruta: '/ol-ti-itcpfegem-beta/billService',
        porcentaje: 100,
        falla: { tipo: 'soapFault', codigo: '0100' },
      },
      {
        servicio: 'sunat-sim',
        ruta: '/api/',
        porcentaje: 100,
        falla: { tipo: 'error5xx', estado: 503 },
      },
      {
        servicio: 'sunat-sim',
        ruta: '/v1/',
        porcentaje: 100,
        falla: { tipo: 'error5xx', estado: 503 },
      },
    ],
  },
  {
    nombre: 'red-inestable',
    descripcion:
      'Red móvil o VPN deficiente: cortes a mitad de respuesta, respuestas truncadas y picos de latencia.',
    reglas: [
      { porcentaje: 15, falla: { tipo: 'desconexion' } },
      { porcentaje: 10, falla: { tipo: 'malformada' } },
      { porcentaje: 30, falla: { tipo: 'latencia', ms: [100, 800] } },
    ],
  },
  {
    nombre: 'pagos-saturados',
    descripcion: 'La billetera está saturada: rate limiting, latencia y algunos 503.',
    reglas: [
      { servicio: 'pagos-sim', porcentaje: 100, falla: { tipo: 'rateLimit', porSegundo: 5 } },
      { servicio: 'pagos-sim', porcentaje: 50, falla: { tipo: 'latencia', ms: [300, 1500] } },
      { servicio: 'pagos-sim', porcentaje: 10, falla: { tipo: 'error5xx', estado: 503 } },
    ],
  },
];

export const perfil = (nombre: string): Perfil | undefined =>
  PERFILES.find((p) => p.nombre === nombre);
