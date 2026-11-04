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
import { validarXml } from '../src/validador/index.js';
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
