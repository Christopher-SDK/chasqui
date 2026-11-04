import { describe, expect, test } from 'vitest';
import { parsear } from '../src/validador/parseo.js';
import {
  Hoja,
  ejecutarHoja,
  type Catalogos,
  type HojaCompilada,
  type Instr,
} from '../src/validador/xslt.js';

// Hojas mínimas escritas a mano en el formato de scripts/compilar-reglas.mjs, una por regla de
// XSLT 1.0 que el intérprete debe reproducir igual que libxslt (el oráculo) y DataPower.

type Plantillas = HojaCompilada['plantillas'];
const PRINCIPAL = 'principal.xsl';
const UTILS = 'utils.xsl';

const rechazar = (codigo: string, linea = 1): Instr => [
  'call',
  'rejectCall',
  linea,
  [['errorCode', `'${codigo}'`, null]],
];
const avisar = (codigo: string, linea = 1): Instr => [
  'call',
  'addWarning',
  linea,
  [['warningCode', `'${codigo}'`, null]],
];

function hoja(
  plantillas: Plantillas,
  extra: Partial<HojaCompilada> = {},
  catalogos: Catalogos = {},
): Hoja {
  return new Hoja(
    {
      archivo: PRINCIPAL,
      fuentes: {},
      claves: {},
      globales: [],
      espacios: { a: 'urn:a' },
      plantillas,
      ...extra,
    },
    catalogos,
  );
}

const XML = `<r xmlns:a="urn:a">
  <a:item n="1">uno</a:item>
  <a:item n="2">dos</a:item>
  <a:otro>x</a:otro>
</r>`;

function correr(h: Hoja, xml = XML, parametros: Record<string, string> = {}) {
  const r = ejecutarHoja(h, parsear(xml), { parametros, hoy: '2026-11-03' });
  return {
    error: r.error?.codigo ?? null,
    obs: r.observaciones.map((o) => o.codigo),
    fuentes: [...r.observaciones, ...(r.error ? [r.error] : [])].map((o) => o.fuente),
  };
}

const raiz = (cuerpo: Instr[]): Plantillas[number] => ({
  match: '/*',
  archivo: PRINCIPAL,
  linea: 1,
  params: [],
  cuerpo,
});

describe('intérprete XSLT de las hojas oficiales', () => {
  test('el primer rejectCall detiene la ejecución; addWarning acumula observaciones en orden', () => {
    const h = hoja([raiz([avisar('4001'), avisar('4002'), rechazar('2001'), avisar('4003')])]);
    expect(correr(h)).toMatchObject({ error: '2001', obs: ['4001', '4002'] });
  });

  test('sin errores ni observaciones el resultado queda vacío', () => {
    expect(correr(hoja([raiz([['if', 'false()', [rechazar('2001')]]])]))).toEqual({
      error: null,
      obs: [],
      fuentes: [],
    });
  });

  test('la regla se cita por la llamada en la hoja principal, aunque falle dentro de utils', () => {
    const h = hoja([
      raiz([['call', 'existe', 42, [['node', 'a:nada', null]]]]),
      {
        name: 'existe',
        archivo: UTILS,
        linea: 1,
        params: [['node', null, null]],
        cuerpo: [['if', 'not(string($node))', [rechazar('2002', 900)]]],
      },
    ]);
    expect(correr(h)).toMatchObject({ error: '2002', fuentes: [`${PRINCIPAL}:L42`] });
  });

  test('un rejectCall directo en la hoja principal cita su propia línea', () => {
    expect(correr(hoja([raiz([rechazar('2003', 77)])])).fuentes).toEqual([`${PRINCIPAL}:L77`]);
  });

  test('if, choose/when/otherwise y for-each con position() y last()', () => {
    const h = hoja([
      raiz([
        [
          'choose',
          [
            ['false()', [avisar('9001')]],
            ['true()', [avisar('9002')]],
          ],
          [avisar('9003')],
        ],
        ['choose', [['false()', [avisar('9004')]]], [avisar('9005')]],
        ['each', 'a:item', [['if', 'position() = last() and @n = 2', [avisar('9006')]]]],
      ]),
    ]);
    expect(correr(h).obs).toEqual(['9002', '9005', '9006']);
  });

  test('apply-templates: gana la mayor prioridad y, a igual prioridad, la última plantilla', () => {
    const h = hoja([
      raiz([['apply', 'a:item', null, 5, []]]),
      { match: '*', archivo: PRINCIPAL, linea: 2, params: [], cuerpo: [avisar('1')] },
      { match: 'a:item', archivo: PRINCIPAL, linea: 3, params: [], cuerpo: [avisar('2')] },
      { match: 'a:item', archivo: PRINCIPAL, linea: 4, params: [], cuerpo: [avisar('3')] },
      {
        match: 'r/a:item[@n = 9]',
        archivo: PRINCIPAL,
        linea: 5,
        params: [],
        cuerpo: [avisar('4')],
      },
    ]);
    expect(correr(h).obs).toEqual(['3', '3']);
  });

  test('un patrón con ruta (prioridad 0.5) gana a un nombre simple (0)', () => {
    const h = hoja([
      raiz([['apply', 'a:item', null, 5, []]]),
      { match: 'r/a:item', archivo: PRINCIPAL, linea: 2, params: [], cuerpo: [avisar('5')] },
      { match: 'a:item', archivo: PRINCIPAL, linea: 3, params: [], cuerpo: [avisar('6')] },
    ]);
    expect(correr(h).obs).toEqual(['5', '5']);
  });

  test('una prioridad explícita y los patrones con | también cuentan', () => {
    const h = hoja([
      raiz([['apply', '*', null, 5, []]]),
      { match: 'a:item | a:otro', archivo: PRINCIPAL, linea: 2, params: [], cuerpo: [avisar('7')] },
      {
        match: 'a:*',
        priority: -5,
        archivo: PRINCIPAL,
        linea: 3,
        params: [],
        cuerpo: [avisar('8')],
      },
    ]);
    expect(correr(h).obs).toEqual(['7', '7', '7']);
  });

  test('regla implícita: sin plantilla, se procesan los hijos en el mismo modo y sin parámetros', () => {
    const h = hoja([
      {
        match: 'a:item',
        mode: 'm',
        archivo: PRINCIPAL,
        linea: 2,
        params: [['p', "'def'", null]],
        cuerpo: [['if', "$p = 'def'", [avisar('10')]]],
      },
      { match: 'a:item', archivo: PRINCIPAL, linea: 3, params: [], cuerpo: [avisar('11')] },
      raiz([['apply', '/', 'm', 4, [['p', "'pasado'", null]]]]),
    ]);
    // El documento no tiene plantilla en el modo m: la implícita baja hasta los a:item sin $p.
    expect(correr(h).obs).toEqual(['10', '10']);
  });

  test('parámetros: los pasados reemplazan al valor por defecto, que ve a los anteriores', () => {
    const h = hoja([
      raiz([['call', 't', 1, [['a', "'x'", null]]]]),
      {
        name: 't',
        archivo: PRINCIPAL,
        linea: 1,
        params: [
          ['a', "'por-defecto'", null],
          ['b', "concat($a, '-b')", null],
        ],
        cuerpo: [['if', "$b = 'x-b'", [avisar('12')]]],
      },
    ]);
    expect(correr(h).obs).toEqual(['12']);
  });

  test('variables: alcance de bloque y redefinición tolerada por DataPower', () => {
    const h = hoja([
      raiz([
        ['var', 'v', "'1'", null],
        ['if', 'true()', [['var', 'v', "'interna'", null]]],
        ['if', "$v = '1'", [avisar('13')]],
        // La redefinición reemplaza a la anterior y su contenido todavía ve la anterior.
        ['var', 'v', "concat($v, '2')", null],
        ['if', "$v = '12'", [avisar('14')]],
      ]),
    ]);
    expect(correr(h).obs).toEqual(['13', '14']);
  });

  test('una plantilla no ve las variables de quien la llama, pero sí las globales', () => {
    const h = hoja(
      [
        raiz([
          ['var', 'local', "'x'", null],
          ['call', 't', 1, []],
        ]),
        {
          name: 't',
          archivo: PRINCIPAL,
          linea: 1,
          params: [],
          cuerpo: [
            ['if', "$g = 'G' and $p = 'P'", [avisar('15')]],
            ['var', 'y', '$local', null],
          ],
        },
      ],
      {
        globales: [
          ['g', "'G'", null],
          ['p', null, null],
        ],
      },
    );
    expect(() => correr(h, XML, { p: 'P' })).toThrow('Variable no declarada: $local');
  });

  test('fragmento de árbol resultado: su texto es lo producido y siempre es verdadero', () => {
    const h = hoja([
      raiz([
        ['var', 'cero', null, [['value', "'0'"]]],
        ['var', 'vacio', null, [['if', 'false()', [['text', 'nunca']]]]],
        [
          'var',
          'texto',
          null,
          [
            ['text', 'a'],
            ['value', 'count(a:item)'],
            ['call', 'eco', 1, []],
          ],
        ],
        ['if', "boolean($cero) and $cero = '0' and number($cero) = 0", [avisar('16')]],
        ['if', "$vacio = '' and boolean($vacio)", [avisar('17')]],
        ['if', "$texto = 'a2eco'", [avisar('18')]],
      ]),
      { name: 'eco', archivo: PRINCIPAL, linea: 1, params: [], cuerpo: [['text', 'eco']] },
    ]);
    expect(correr(h).obs).toEqual(['16', '17', '18']);
  });

  test('key(): busca por valor de texto o por conjunto de nodos', () => {
    const h = hoja(
      [
        raiz([
          ['if', "count(key('por-n', '2')) = 1 and key('por-n', '2') = 'dos'", [avisar('19')]],
          ['if', "count(key('por-n', a:item/@n)) = 2", [avisar('20')]],
          ['if', "count(key('por-n', '9')) = 0", [avisar('21')]],
        ]),
      ],
      { claves: { 'por-n': { match: 'a:item', use: '@n' } } },
    );
    expect(correr(h).obs).toEqual(['19', '20', '21']);
  });

  test('document(): consulta catálogos compilados; un catálogo ausente es un conjunto vacío', () => {
    const catalogos: Catalogos = {
      'cat_07.xml': { filas: [[{ id: '10', igv: '1' }, 'Gravado']] },
      'cat_25.xml': { ids: '10101501\n10101502' },
      'cat_66.xml': null,
    };
    const h = hoja(
      [
        raiz([
          ['if', "document('../catalogo/cat_07.xml')/l/c[@id='10']/@igv = '1'", [avisar('22')]],
          ['if', "document('cat_07.xml')/l/c[@id='10'] = 'Gravado'", [avisar('23')]],
          ['if', "count(document('cat_25.xml')/l/c[@id='10101502']) = 1", [avisar('24')]],
          ['if', "count(document('cat_66.xml')/l/c) = 0", [avisar('25')]],
        ]),
      ],
      {},
      catalogos,
    );
    expect(correr(h).obs).toEqual(['22', '23', '24', '25']);
    expect(() => correr(hoja([raiz([['if', "document('cat_99.xml')", []]])]))).toThrow(
      'catálogo no compilado',
    );
  });

  test('funciones de DataPower y EXSLT que usan las hojas', () => {
    const h = hoja(
      [
        raiz([
          ['if', "substring(current-date(), 1, 10) = '2026-11-03'", [avisar('26')]],
          [
            'if',
            "matches('F001', '^[F][A-Z0-9]{3}$', '!') and not(matches('B001', '^F'))",
            [avisar('27')],
          ],
          ['if', "format-number(round(100 * 2.5) div 100, '#####0.00') = '2.50'", [avisar('28')]],
          ['if', "dp:variable('var://context/x') = ''", [avisar('29')]],
          [
            'if',
            "date:seconds(date:difference('2026-11-01', '2026-11-03')) = 172800",
            [avisar('30')],
          ],
          [
            'if',
            "date:seconds(date:difference(concat('2026-11-05', '-00:00'), date:date())) < 0",
            [avisar('31')],
          ],
          [
            'if',
            "date:seconds('1970-01-02') = 86400 and string(date:seconds('nada')) = 'NaN'",
            [avisar('32')],
          ],
          ['if', "dyn:evaluate('count(a:item)') = 2", [avisar('33')]],
          [
            'if',
            "regexp:match('abc', 'b') = 'b' and not(regexp:match('abc', 'z'))",
            [avisar('34')],
          ],
        ]),
      ],
      {
        espacios: {
          a: 'urn:a',
          dp: 'http://www.datapower.com/extensions',
          date: 'http://exslt.org/dates-and-times',
          dyn: 'http://exslt.org/dynamic',
          regexp: 'http://exslt.org/regular-expressions',
        },
      },
    );
    expect(correr(h).obs).toEqual(['26', '27', '28', '29', '30', '31', '32', '33', '34']);
  });

  test('date:difference arma duraciones con días, horas, minutos y signo', () => {
    const casos: [string, string, number][] = [
      ['2026-11-03', '2026-11-01', -172800],
      ['2026-11-03-05:00', '2026-11-03Z', -18000],
      ['2026-11-03', '2026-11-03+00:30', -1800],
      ['2026-11-03', '2026-11-03', 0],
    ];
    const h = hoja(
      [
        raiz(
          casos.map(([a, b, s], i) => [
            'if',
            `date:seconds(date:difference('${a}', '${b}')) = ${String(s)}`,
            [avisar(String(100 + i))],
          ]),
        ),
      ],
      { espacios: { date: 'http://exslt.org/dates-and-times' } },
    );
    expect(correr(h).obs).toEqual(['100', '101', '102', '103']);
  });

  test('errores del intérprete: plantilla, clave o patrón de formato desconocidos', () => {
    expect(() => correr(hoja([raiz([['call', 'nada', 1, []]])]))).toThrow(
      'plantilla no encontrada',
    );
    expect(() => correr(hoja([raiz([['if', "key('nada', 'x')", []]])]))).toThrow(
      'clave no declarada',
    );
    expect(() => correr(hoja([raiz([['if', "format-number(1, '#,##0')", []]])]))).toThrow(
      'patrón no soportado',
    );
    expect(() => correr(hoja([raiz([['each', "'texto'", []]])]))).toThrow('conjunto de nodos');
  });
});
