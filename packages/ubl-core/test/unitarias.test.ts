import fc from 'fast-check';
import { describe, expect, test } from 'vitest';
import { calcular, calcularLinea } from '../src/calculos.js';
import { Decimal } from '../src/decimal.js';
import { firmar, verificarFirma } from '../src/firma.js';
import { emitir } from '../src/index.js';
import { validarComoOraculo as validarXml } from './oraculo.js';
import { DOMParser } from '@xmldom/xmldom';
import xpath from 'xpath';
import { generarXml, nombreArchivo } from '../src/xml.js';
import { desempaquetar, empaquetar } from '../src/zip.js';
import { zipSync, strToU8 } from 'fflate';
import { SEMILLA } from './arbitrarios.js';
import { factura } from './fixtures.js';

describe('Decimal', () => {
  test('evita el error de punto flotante en el redondeo', () => {
    expect(1.005 * 100).not.toBe(100.5); // el problema que motiva la clase
    expect(Decimal.de('1.005').redondear(2).aTexto(2)).toBe('1.01');
    expect(Decimal.de('-1.005').redondear(2).aTexto(2)).toBe('-1.01');
    expect(Decimal.de('2.5').redondear(0).aTexto(0)).toBe('3');
  });

  test('parsea números y textos, y rechaza entradas inválidas', () => {
    expect(Decimal.de(0.1).sumar(0.2).aTexto(2)).toBe('0.30');
    expect(Decimal.de(' 12.5 ').aTextoCompacto()).toBe('12.5');
    expect(Decimal.de('100').toString()).toBe('100');
    expect(Decimal.de('0').aTextoCompacto()).toBe('0');
    expect(() => Decimal.de('1e5')).toThrow(RangeError);
    expect(() => Decimal.de('abc')).toThrow(RangeError);
    expect(() => Decimal.de('1.12345678901')).toThrow(/decimales/);
    expect(() => Decimal.de(Number.NaN)).toThrow(RangeError);
  });

  test('divide con redondeo y rechaza la división por cero', () => {
    expect(Decimal.de(1).dividir(3).aTextoCompacto()).toBe('0.3333333333');
    expect(Decimal.de(2).dividir(3).aTextoCompacto()).toBe('0.6666666667');
    expect(Decimal.de(-2).dividir(3).aTextoCompacto()).toBe('-0.6666666667');
    expect(Decimal.de(2).dividir(-3).aTextoCompacto()).toBe('-0.6666666667');
    expect(() => Decimal.de(1).dividir(0)).toThrow(/cero/);
  });

  test('comparar y esCero', () => {
    expect(Decimal.de('1.10').comparar('1.1')).toBe(0);
    expect(Decimal.de('1').comparar('2')).toBe(-1);
    expect(Decimal.de('3').comparar('2')).toBe(1);
    expect(Decimal.CERO.esCero()).toBe(true);
    expect(Decimal.de('0.01').esCero()).toBe(false);
  });

  test('suma y multiplicación coinciden con aritmética entera exacta (property)', () => {
    const centimos = fc.integer({ min: -10_000_000, max: 10_000_000 });
    fc.assert(
      fc.property(centimos, centimos, (a, b) => {
        const A = Decimal.de((a / 100).toFixed(2));
        const B = Decimal.de((b / 100).toFixed(2));
        expect(A.sumar(B).aTexto(2)).toBe(((a + b) / 100).toFixed(2));
        expect(A.restar(B).comparar(Decimal.de(((a - b) / 100).toFixed(2)))).toBe(0);
        // (a/100)*(b/100) = a*b/10^4, exacto con BigInt.
        const exacto = BigInt(a) * BigInt(b);
        const signo = exacto < 0n ? '-' : '';
        const abs = (exacto < 0n ? -exacto : exacto).toString().padStart(5, '0');
        expect(A.multiplicar(B).aTexto(4)).toBe(
          `${signo}${abs.slice(0, -4)}.${abs.slice(-4)}`.replace(/^-0\.0000$/, '0.0000'),
        );
      }),
      { seed: SEMILLA, numRuns: 500 },
    );
  });
});

describe('cálculos', () => {
  const item = {
    descripcion: 'x',
    cantidad: 1,
    unidad: 'NIU' as const,
    valorUnitario: 10,
    afectacion: '10' as const,
  };

  test('ejemplo de factura con línea gravada y exonerada', () => {
    const { totales, lineas } = calcular(factura());
    expect(lineas.map((l) => l.igv.aTexto())).toEqual(['18.00', '0.00']);
    expect(totales.valorVenta.aTexto()).toBe('130.00');
    expect(totales.igv.aTexto()).toBe('18.00');
    expect(totales.importeTotal.aTexto()).toBe('148.00');
    expect(totales.porTributo.map((t) => t.tributo)).toEqual(['1000', '9997']);
  });

  test('rechaza ítems fuera de dominio', () => {
    expect(() => calcularLinea({ ...item, cantidad: 0 }, 1)).toThrow(/cantidad/);
    expect(() => calcularLinea({ ...item, valorUnitario: -1 }, 1)).toThrow(/negativo/);
    expect(() => calcularLinea({ ...item, valorUnitario: '0.001' }, 1)).toThrow(/valor de venta/);
    expect(() => calcularLinea({ ...item, valorUnitario: '0.02' }, 1)).toThrow(/IGV/);
    expect(() => calcular({ ...factura(), items: [] })).toThrow(/al menos un ítem/);
  });
});

describe('XML', () => {
  test('escapa caracteres especiales', () => {
    const c = factura();
    c.cliente.nombre = 'A & B <S.A.> "x"';
    const xml = generarXml(calcular(c));
    expect(xml).toContain('A &amp; B &lt;S.A.&gt; &quot;x&quot;');
    expect(validarXml(xml, `${nombreArchivo(c)}.xml`).estado).toBe('aceptado');
  });
});

describe('firma XML-DSig', () => {
  const xml = generarXml(calcular(factura()));

  test('firma con SHA-1 (por defecto) y SHA-256, y verifica', () => {
    for (const algoritmo of ['sha1', 'sha256'] as const) {
      const firmado = firmar(xml, { algoritmo });
      expect(firmado).toContain('<ds:Signature');
      expect(firmado).toMatch(/<ext:ExtensionContent><ds:Signature[^>]*Id="SignatureSP"/);
      const r = verificarFirma(firmado);
      expect(r.valida).toBe(true);
      if (r.valida) expect(r.certificado).toContain('BEGIN CERTIFICATE');
    }
  });

  test('sin firma → 1059', () => {
    expect(verificarFirma(xml)).toMatchObject({ valida: false, codigo: '1059' });
  });

  test('documento alterado después de firmar → 2335', () => {
    const alterado = firmar(xml).replace(
      '>148.00</cbc:PayableAmount>',
      '>999.00</cbc:PayableAmount>',
    );
    expect(verificarFirma(alterado)).toMatchObject({ valida: false, codigo: '2335' });
  });

  test('SignatureValue manipulado → 2335', () => {
    const alterado = firmar(xml).replace(
      /<ds:SignatureValue>(.)/,
      (_, c: string) => `<ds:SignatureValue>${c === 'A' ? 'B' : 'A'}`,
    );
    expect(verificarFirma(alterado)).toMatchObject({ valida: false });
  });

  test('dos firmas o referencia parcial → 2336 (protección contra signature wrapping)', () => {
    const firmado = firmar(xml);
    const firma = /<ds:Signature[\s\S]*<\/ds:Signature>/.exec(firmado)?.[0] ?? '';
    expect(
      verificarFirma(firmado.replace('</Invoice>', `<x>${firma}</x></Invoice>`)),
    ).toMatchObject({ codigo: '2336' });
    expect(
      verificarFirma(firmado.replace('<ds:Reference URI=""', '<ds:Reference URI="#otro"')),
    ).toMatchObject({ codigo: '2336' });
  });

  test('XML de firma ilegible → 2336', () => {
    const roto = firmar(xml).replace(/<ds:SignedInfo>[\s\S]*<\/ds:SignedInfo>/, '<ds:SignedInfo/>');
    expect(verificarFirma(roto)).toMatchObject({ valida: false, codigo: '2336' });
  });
});

describe('ZIP de sendBill', () => {
  const { nombreZip, zip, xml } = emitir(factura());

  test('roundtrip y determinismo', () => {
    expect(desempaquetar(nombreZip, zip)).toEqual({
      ok: true,
      nombreXml: nombreZip.replace('.zip', '.xml'),
      xml,
    });
    expect(emitir(factura()).zip).toEqual(zip);
  });

  test.each([
    ['nombre inválido', 'factura.zip', zip, '0151'],
    ['ZIP corrupto', nombreZip, new Uint8Array([1, 2, 3]), '0156'],
    ['ZIP vacío', nombreZip, zipSync({}), '0155'],
    ['entrada que no es XML', nombreZip, zipSync({ 'a.txt': strToU8('x') }), '0159'],
    ['XML con otro nombre', nombreZip, empaquetar('20000000001-01-F001-2', xml), '0161'],
    [
      'XML vacío',
      nombreZip,
      zipSync({ [nombreZip.replace('.zip', '.xml')]: new Uint8Array() }),
      '0160',
    ],
  ])('%s → %s', (_, nombre, datos, codigo) => {
    expect(desempaquetar(nombre, datos)).toMatchObject({ ok: false, codigo });
  });
});

describe('validador: bordes', () => {
  const xml = generarXml(calcular(factura()));
  const nombre = `${nombreArchivo(factura())}.xml`;

  test('nombre de archivo inválido → 0159', () => {
    expect(validarXml(xml, 'factura.xml').error?.codigo).toBe('0159');
  });

  test('XML ilegible → 0306', () => {
    expect(validarXml('<Invoice><sin cerrar>', nombre).error?.codigo).toBe('0306');
    expect(validarXml('', nombre).error?.codigo).toBe('0306');
  });

  test('cada hallazgo trae mensaje oficial y su regla de origen', () => {
    const v = validarXml(xml.replace('<cbc:UBLVersionID>2.1', '<cbc:UBLVersionID>2.0'), nombre);
    expect(v.error).toEqual({
      codigo: '2074',
      mensaje: expect.stringMatching(/UBLVersionID/) as string,
      fuente: 'ValidaExprRegFactura-2.0.1.xsl:L73',
    });
  });

  test('observaciones sin error → estado «observado»', () => {
    const v = validarXml(
      xml.replace(
        '<cbc:PayableAmount currencyID="PEN">148.00',
        '<cbc:PayableAmount currencyID="PEN">152.00',
      ),
      nombre,
    );
    expect(v.estado).toBe('observado');
    expect(v.observaciones.map((o) => o.codigo)).toEqual(['4312']);
  });

  // patches/xpath@0.0.36.patch: sin el parche, number() de un conjunto de nodos daba 0 para el
  // texto vacío y aceptaba '1e3', y la regla 4296 se disparaba en facturas sin inafectas.
  test('number() de un conjunto de nodos sigue XPath 1.0 (parche de la librería xpath)', () => {
    const doc = new DOMParser().parseFromString(
      '<r><a> 12.50 </a><b>.5</b><c></c><d>1e3</d><e>+1</e></r>',
      'text/xml',
    ) as unknown as Node;
    const n = (e: string) => xpath.parse(e).evaluateNumber({ node: doc });
    expect(n('number(/r/a)')).toBe(12.5);
    expect(n('/r/b + 0')).toBe(0.5);
    expect(n('/r/c + 1')).toBeNaN();
    expect(n('/r/nada + 1')).toBeNaN();
    expect(n('number(/r/d)')).toBeNaN();
    expect(n('number(/r/e)')).toBeNaN();
    expect(xpath.parse('(/r/nada + 1) < 5').evaluateBoolean({ node: doc })).toBe(false);
  });
});
