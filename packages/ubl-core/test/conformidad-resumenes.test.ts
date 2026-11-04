import fc from 'fast-check';
import { describe, expect, test } from 'vitest';
import { calcular } from '../src/calculos.js';
import { firmar } from '../src/firma.js';
import {
  generarBaja,
  generarResumen,
  lineaResumen,
  nombreBaja,
  nombreResumen,
  type ComunicacionBaja,
  type ResumenDiario,
} from '../src/resumenes.js';
import { validarComoOraculo as validarXml } from './oraculo.js';
import { SEMILLA, arbComprobante } from './arbitrarios.js';
import { boleta, emisor } from './fixtures.js';
import { mutar } from './mutaciones.js';
import { comoOficial, consultarOraculo, oraculoDisponible } from './oraculo.js';

const baja = (): ComunicacionBaja => ({
  emisor,
  correlativo: 1,
  fechaComunicacion: '2026-11-03',
  fechaReferencia: '2026-11-02',
  lineas: [
    { tipo: '01', serie: 'F001', numero: 1, motivo: 'Error en la operación' },
    { tipo: '07', serie: 'F001', numero: 2, motivo: 'Nota emitida por error' },
  ],
});

const resumen = (): ResumenDiario => {
  const b1 = calcular(boleta());
  const b2 = calcular({ ...boleta(), correlativo: 2 });
  return {
    emisor,
    correlativo: 1,
    fechaResumen: '2026-11-03',
    fechaReferencia: '2026-11-02',
    moneda: 'PEN',
    lineas: [lineaResumen(b1, '1'), lineaResumen(b2, '3')],
  };
};

const raiz = '/*';
const linea = `${raiz}/*[local-name()='VoidedDocumentsLine' or local-name()='SummaryDocumentsLine'][1]`;
const cada = (expr: string, f: (e: Element) => void) => (sel: (x: string) => Element[]) => {
  sel(expr).forEach(f);
};
const texto = (v: string) => (e: Element) => {
  e.textContent = v;
};
const quitar = (e: Element) => e.parentNode?.removeChild(e);

interface MutacionResumen {
  nombre: string;
  tipos?: ('RA' | 'RC')[];
  nombreArchivo?: (n: string) => string;
  aplicar?: (sel: (x: string) => Element[]) => void;
}

const MUTACIONES: MutacionResumen[] = [
  { nombre: 'UBLVersionID 2.1', aplicar: cada(`${raiz}/cbc:UBLVersionID`, texto('2.1')) },
  { nombre: 'sin UBLVersionID', aplicar: cada(`${raiz}/cbc:UBLVersionID`, quitar) },
  { nombre: 'CustomizationID 2.0', aplicar: cada(`${raiz}/cbc:CustomizationID`, texto('2.0')) },
  {
    nombre: 'ID distinto al nombre',
    aplicar: cada(`${raiz}/cbc:ID`, (e) => (e.textContent = `${e.textContent}9`)),
  },
  {
    nombre: 'fecha distinta a la del nombre',
    aplicar: cada(`${raiz}/cbc:IssueDate`, texto('2026-11-04')),
  },
  { nombre: 'sin IssueDate', tipos: ['RA'], aplicar: cada(`${raiz}/cbc:IssueDate`, quitar) },
  {
    nombre: 'sin ReferenceDate',
    tipos: ['RA'],
    aplicar: cada(`${raiz}/cbc:ReferenceDate`, quitar),
  },
  { nombre: 'RUC del nombre distinto', nombreArchivo: (n) => n.replace(/^\d{11}/, '20999999999') },
  {
    nombre: 'sin RUC del emisor',
    aplicar: cada(`${raiz}/cac:AccountingSupplierParty/cbc:CustomerAssignedAccountID`, quitar),
  },
  {
    nombre: 'tipo de documento del emisor 1',
    aplicar: cada(`${raiz}/cac:AccountingSupplierParty/cbc:AdditionalAccountID`, texto('1')),
  },
  {
    nombre: 'razón social de 2 caracteres',
    aplicar: cada(
      `${raiz}/cac:AccountingSupplierParty/cac:Party/cac:PartyLegalEntity/cbc:RegistrationName`,
      texto('AB'),
    ),
  },
  { nombre: 'LineID 0', aplicar: cada(`${linea}/cbc:LineID`, texto('0')) },
  {
    nombre: 'LineID duplicado',
    aplicar: (sel) => {
      const [a, b] = sel(`${raiz}/*/cbc:LineID`);
      if (a && b) b.textContent = a.textContent;
    },
  },
  { nombre: 'LineID con cero inicial', aplicar: cada(`${linea}/cbc:LineID`, texto('01')) },
  {
    nombre: 'tipo de documento 03 en baja',
    tipos: ['RA'],
    aplicar: cada(`${linea}/cbc:DocumentTypeCode`, texto('03')),
  },
  {
    nombre: 'tipo de documento 01 en resumen',
    tipos: ['RC'],
    aplicar: cada(`${linea}/cbc:DocumentTypeCode`, texto('01')),
  },
  {
    nombre: 'serie de boleta en baja de factura',
    tipos: ['RA'],
    aplicar: cada(`${linea}/*[local-name()='DocumentSerialID']`, texto('B001')),
  },
  {
    nombre: 'serie inválida en baja',
    tipos: ['RA'],
    aplicar: cada(`${linea}/*[local-name()='DocumentSerialID']`, texto('X1')),
  },
  {
    nombre: 'número de 9 dígitos en baja',
    tipos: ['RA'],
    aplicar: cada(`${linea}/*[local-name()='DocumentNumberID']`, texto('123456789')),
  },
  {
    nombre: 'motivo de baja de 2 caracteres',
    tipos: ['RA'],
    aplicar: cada(`${linea}/*[local-name()='VoidReasonDescription']`, texto('XY')),
  },
  {
    nombre: 'documento repetido en la baja',
    tipos: ['RA'],
    aplicar: (sel) => {
      const [a, b] = sel(`${raiz}/*[local-name()='VoidedDocumentsLine']`);
      if (a && b) b.parentNode?.replaceChild(a.cloneNode(true), b);
    },
  },
  {
    nombre: 'sin condición del ítem',
    tipos: ['RC'],
    aplicar: cada(`${linea}/cac:Status/cbc:ConditionCode`, quitar),
  },
  {
    nombre: 'condición fuera del catálogo 19',
    tipos: ['RC'],
    aplicar: cada(`${linea}/cac:Status/cbc:ConditionCode`, texto('9')),
  },
  {
    nombre: 'serie-número de factura en resumen',
    tipos: ['RC'],
    aplicar: cada(`${linea}/cbc:ID`, texto('F001-1')),
  },
  {
    nombre: 'total con 3 decimales',
    tipos: ['RC'],
    aplicar: cada(
      `${linea}/*[local-name()='TotalAmount']`,
      (e) => (e.textContent = `${e.textContent}1`),
    ),
  },
  {
    nombre: 'moneda distinta en un monto',
    tipos: ['RC'],
    aplicar: cada(`${linea}/cac:TaxTotal/cbc:TaxAmount`, (e) => {
      e.setAttribute('currencyID', 'USD');
    }),
  },
  {
    nombre: 'total mayor a 700 sin cliente',
    tipos: ['RC'],
    aplicar: (sel) => {
      sel(`${linea}/*[local-name()='TotalAmount']`).forEach(texto('800.00'));
      sel(`${linea}/cac:AccountingCustomerParty`).forEach(quitar);
    },
  },
  {
    nombre: 'cliente con RUC de 10 dígitos',
    tipos: ['RC'],
    aplicar: (sel) => {
      sel(`${linea}/cac:AccountingCustomerParty/cbc:AdditionalAccountID`).forEach(texto('6'));
      sel(`${linea}/cac:AccountingCustomerParty/cbc:CustomerAssignedAccountID`).forEach(
        texto('2000000000'),
      );
    },
  },
  {
    nombre: 'cliente con DNI de 7 dígitos',
    tipos: ['RC'],
    aplicar: cada(
      `${linea}/cac:AccountingCustomerParty/cbc:CustomerAssignedAccountID`,
      texto('1234567'),
    ),
  },
  {
    nombre: 'cliente con documento fuera del catálogo',
    tipos: ['RC'],
    aplicar: cada(`${linea}/cac:AccountingCustomerParty/cbc:AdditionalAccountID`, texto('Z')),
  },
  {
    nombre: 'pago con monto 0',
    tipos: ['RC'],
    aplicar: cada(`${linea}/*[local-name()='BillingPayment']/cbc:PaidAmount`, texto('0.00')),
  },
  {
    nombre: 'pago sin tipo',
    tipos: ['RC'],
    aplicar: cada(`${linea}/*[local-name()='BillingPayment']/cbc:InstructionID`, quitar),
  },
  {
    nombre: 'pago con tipo fuera del catálogo 11',
    tipos: ['RC'],
    aplicar: cada(`${linea}/*[local-name()='BillingPayment']/cbc:InstructionID`, texto('99')),
  },
  {
    nombre: 'pagos con el mismo tipo',
    tipos: ['RC'],
    aplicar: cada(`${linea}/*[local-name()='BillingPayment']/cbc:InstructionID`, texto('01')),
  },
  { nombre: 'sin IGV', tipos: ['RC'], aplicar: cada(`${linea}/cac:TaxTotal`, quitar) },
  {
    nombre: 'IGV de subtotal distinto al total',
    tipos: ['RC'],
    aplicar: cada(`${linea}/cac:TaxTotal/cac:TaxSubtotal/cbc:TaxAmount`, texto('1.00')),
  },
  {
    nombre: 'nombre de tributo distinto a IGV',
    tipos: ['RC'],
    aplicar: cada(
      `${linea}/cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme/cbc:Name`,
      texto('XYZ'),
    ),
  },
  {
    nombre: 'boleta con documento de referencia',
    tipos: ['RC'],
    aplicar: (sel) => {
      sel(`${linea}/cac:Status`).forEach((s) => {
        const r = s.ownerDocument.createElementNS(
          'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
          'cac:BillingReference',
        );
        s.parentNode?.insertBefore(r, s);
      });
    },
  },
  ...(
    [
      ['RUC de 10 dígitos', '6', '2000000000'],
      ['DNI de 7 dígitos', '1', '1234567'],
      ['documento fuera del catálogo', 'Z', 'X1'],
      ['carné con caracteres inválidos', '4', 'X 1'],
    ] as const
  ).map(([n, tipo, num]) => ({
    nombre: `total 800 y cliente con ${n}`,
    tipos: ['RC' as const],
    aplicar: (sel: (x: string) => Element[]) => {
      sel(`${linea}/*[local-name()='TotalAmount']`).forEach(texto('800.00'));
      sel(`${linea}/cac:AccountingCustomerParty/cbc:AdditionalAccountID`).forEach(texto(tipo));
      sel(`${linea}/cac:AccountingCustomerParty/cbc:CustomerAssignedAccountID`).forEach(texto(num));
    },
  })),
  ...(
    [
      ['RA', 'serie numérica de contingencia', 'DocumentSerialID', '0001'],
      ['RA', 'serie de 3 caracteres', 'DocumentSerialID', 'F01'],
      ['RA', 'serie numérica de 5 dígitos', 'DocumentSerialID', '12345'],
      ['RA', 'serie con sufijo', 'DocumentSerialID', 'F0011'],
      ['RA', 'número de 8 dígitos', 'DocumentNumberID', '99999999'],
      ['RA', 'número no numérico', 'DocumentNumberID', 'A1'],
      ['RA', 'motivo de 3 caracteres', 'VoidReasonDescription', 'ABC'],
      ['RA', 'motivo con espacio inicial', 'VoidReasonDescription', ' ABC'],
      ['RA', 'tipo 070', 'DocumentTypeCode', '070'],
      ['RA', 'tipo 99', 'DocumentTypeCode', '99'],
      ['RC', 'serie-número de contingencia', 'ID', '0001-1'],
      ['RC', 'correlativo 0', 'ID', 'B001-0'],
      ['RC', 'correlativo de 9 dígitos', 'ID', 'B001-123456789'],
      ['RC', 'serie de 3 caracteres', 'ID', 'B01-1'],
      ['RC', 'tipo 030', 'DocumentTypeCode', '030'],
      ['RC', 'total negativo', 'TotalAmount', '-1.00'],
    ] as const
  ).flatMap(([tipo, n, campo, valor]) =>
    ['', '-x'].map((sufijo) => ({
      nombre: `${n}${sufijo ? ' (segunda línea)' : ''}`,
      tipos: [tipo],
      aplicar: (sel: (x: string) => Element[]) => {
        const lineas = sel(
          `${raiz}/*[local-name()='VoidedDocumentsLine' or local-name()='SummaryDocumentsLine']`,
        );
        const l = lineas[sufijo ? 1 : 0];
        const e = l && Array.from(l.childNodes).find((c) => (c as Element).localName === campo);
        if (e) e.textContent = valor;
      },
    })),
  ),
  ...(
    [
      ['LineID 001', 'LineID', '001'],
      ['LineID de 6 dígitos', 'LineID', '100000'],
      ['LineID de 5 dígitos', 'LineID', '99999'],
    ] as const
  ).map(([n, campo, valor]) => ({
    nombre: n,
    aplicar: cada(`${linea}/cbc:${campo}`, texto(valor)),
  })),
  {
    nombre: 'CustomizationID con sufijo',
    aplicar: cada(`${raiz}/cbc:CustomizationID`, (e) => (e.textContent = `${e.textContent}x`)),
  },
  {
    nombre: 'CustomizationID con prefijo',
    aplicar: cada(`${raiz}/cbc:CustomizationID`, (e) => (e.textContent = `x${e.textContent}`)),
  },
  { nombre: 'UBLVersionID 2.00', aplicar: cada(`${raiz}/cbc:UBLVersionID`, texto('2.00')) },
  { nombre: 'UBLVersionID x2.0', aplicar: cada(`${raiz}/cbc:UBLVersionID`, texto('x2.0')) },
  {
    nombre: 'tipo de documento del emisor 66',
    aplicar: cada(`${raiz}/cac:AccountingSupplierParty/cbc:AdditionalAccountID`, texto('66')),
  },
  {
    nombre: 'razón social de 101 caracteres',
    aplicar: cada(
      `${raiz}/cac:AccountingSupplierParty/cac:Party/cac:PartyLegalEntity/cbc:RegistrationName`,
      texto('R'.repeat(101)),
    ),
  },
  {
    nombre: 'razón social de 100 caracteres',
    aplicar: cada(
      `${raiz}/cac:AccountingSupplierParty/cac:Party/cac:PartyLegalEntity/cbc:RegistrationName`,
      texto('R'.repeat(100)),
    ),
  },
  {
    nombre: 'razón social con espacio inicial',
    aplicar: cada(
      `${raiz}/cac:AccountingSupplierParty/cac:Party/cac:PartyLegalEntity/cbc:RegistrationName`,
      texto(' RAZON'),
    ),
  },
  {
    nombre: 'baja de un documento tipo 14 con serie S',
    tipos: ['RA'],
    aplicar: (sel) => {
      sel(`${linea}/cbc:DocumentTypeCode`).forEach(texto('14'));
      sel(`${linea}/*[local-name()='DocumentSerialID']`).forEach(texto('S001'));
    },
  },
  {
    nombre: 'baja de un documento tipo 14 con serie F',
    tipos: ['RA'],
    aplicar: cada(`${linea}/cbc:DocumentTypeCode`, texto('14')),
  },
  {
    nombre: 'mismo documento en dos líneas con igual LineID',
    tipos: ['RA'],
    aplicar: (sel) => {
      const [a, b] = sel(`${raiz}/*[local-name()='VoidedDocumentsLine']`);
      if (a && b) {
        const c = a.cloneNode(true);
        b.parentNode?.replaceChild(c, b);
      }
    },
  },
  {
    nombre: 'total +4 (dentro de la tolerancia de 5)',
    tipos: ['RC'],
    aplicar: cada(
      `${linea}/*[local-name()='TotalAmount']`,
      (e) => (e.textContent = (Number(e.textContent) + 4).toFixed(2)),
    ),
  },
  {
    nombre: 'total -6',
    tipos: ['RC'],
    aplicar: cada(
      `${linea}/*[local-name()='TotalAmount']`,
      (e) => (e.textContent = (Number(e.textContent) - 6).toFixed(2)),
    ),
  },
  {
    nombre: 'tributo IGV repetido en la línea',
    tipos: ['RC'],
    aplicar: (sel) => {
      sel(`${linea}/cac:TaxTotal/cac:TaxSubtotal`).forEach((st) =>
        st.parentNode?.appendChild(st.cloneNode(true)),
      );
    },
  },
  {
    nombre: 'tributo de la línea fuera del catálogo',
    tipos: ['RC'],
    aplicar: cada(
      `${linea}/cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme/cbc:ID`,
      texto('1234'),
    ),
  },
  {
    nombre: 'sin nombre del tributo',
    tipos: ['RC'],
    aplicar: cada(
      `${linea}/cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme/cbc:Name`,
      quitar,
    ),
  },
  {
    nombre: 'IGV con 3 decimales',
    tipos: ['RC'],
    aplicar: cada(
      `${linea}/cac:TaxTotal/cbc:TaxAmount`,
      (e) => (e.textContent = `${e.textContent}1`),
    ),
  },
  {
    nombre: 'pago con 3 decimales',
    tipos: ['RC'],
    aplicar: cada(
      `${linea}/*[local-name()='BillingPayment']/cbc:PaidAmount`,
      (e) => (e.textContent = `${e.textContent}1`),
    ),
  },
];

const BASES = {
  RA: () => ({ nombre: nombreBaja(baja()), xml: generarBaja(baja()) }),
  RC: () => ({ nombre: nombreResumen(resumen()), xml: generarResumen(resumen()) }),
};

describe.runIf(oraculoDisponible)('baja y resumen: conformidad con el XSL oficial', () => {
  test.each(Object.entries(BASES))(
    '%s generado pasa sin errores ni observaciones',
    (tipo, crear) => {
      const { nombre, xml } = crear();
      const caso = { tipo: tipo as 'RA' | 'RC', nombre: `${nombre}.xml`, xml: firmar(xml) };
      const [oficial] = consultarOraculo([caso]);
      expect(oficial).toEqual({ estado: 'ok', codigo: null, observaciones: [] });
      expect(comoOficial(validarXml(caso.xml, caso.nombre))).toEqual(oficial);
    },
  );

  test('cada mutación da el mismo veredicto que el XSL oficial', () => {
    const casos = (['RA', 'RC'] as const).flatMap((tipo) =>
      MUTACIONES.filter((m) => !m.tipos || m.tipos.includes(tipo)).map((m) => {
        const { nombre, xml } = BASES[tipo]();
        return {
          titulo: `${tipo}: ${m.nombre}`,
          tipo,
          nombre: `${m.nombreArchivo ? m.nombreArchivo(nombre) : nombre}.xml`,
          xml: m.aplicar ? mutar(xml, m.aplicar) : xml,
        };
      }),
    );
    const oficiales = consultarOraculo(casos);
    const diferencias = casos
      .map((c, i) => ({
        caso: c.titulo,
        oficial: oficiales[i],
        chasqui: comoOficial(validarXml(c.xml, c.nombre)),
      }))
      .filter((d) => JSON.stringify(d.oficial) !== JSON.stringify(d.chasqui));
    expect(diferencias).toEqual([]);
    expect(oficiales.filter((o) => o.estado === 'rechazo').length).toBeGreaterThan(
      casos.length * 0.7,
    );
  });

  test('cada hallazgo cita su regla de origen en el XSL oficial', async () => {
    const citas = Object.fromEntries(
      (['RA', 'RC'] as const).flatMap((tipo) =>
        MUTACIONES.filter((m) => !m.tipos || m.tipos.includes(tipo)).map((m) => {
          const { nombre, xml } = BASES[tipo]();
          const v = validarXml(
            m.aplicar ? mutar(xml, m.aplicar) : xml,
            `${m.nombreArchivo ? m.nombreArchivo(nombre) : nombre}.xml`,
          );
          const fmt = (h: { codigo: string; fuente: string }) => `${h.codigo} @ ${h.fuente}`;
          return [
            `${tipo}: ${m.nombre}`,
            [...v.observaciones.map(fmt), ...(v.error ? [fmt(v.error)] : [])],
          ];
        }),
      ),
    );
    await expect(JSON.stringify(citas, null, 2)).toMatchFileSnapshot(
      '__snapshots__/citas-resumenes.json',
    );
  });

  test('resúmenes aleatorios de boletas válidas: ninguno rechazado', () => {
    const boletas = fc.sample(
      arbComprobante.filter((c) => c.tipo === '03'),
      { seed: SEMILLA, numRuns: 60 },
    );
    const r: ResumenDiario = {
      emisor,
      correlativo: 2,
      fechaResumen: '2026-11-03',
      fechaReferencia: '2026-11-03',
      moneda: 'PEN',
      lineas: boletas
        .filter((b) => b.moneda === 'PEN')
        .map((b, i) => lineaResumen(calcular({ ...b, correlativo: i + 1 }))),
    };
    const caso = { tipo: 'RC' as const, nombre: `${nombreResumen(r)}.xml`, xml: generarResumen(r) };
    const [oficial] = consultarOraculo([caso]);
    expect(oficial?.estado).toBe('ok');
    expect(comoOficial(validarXml(caso.xml, caso.nombre))).toEqual(oficial);
  });
});
