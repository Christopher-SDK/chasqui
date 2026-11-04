import { describe, expect, test } from 'vitest';
import { firmar } from '../src/firma.js';
import { generarGuia, nombreGuia, type GuiaRemision } from '../src/guia.js';
import { validarXml } from '../src/validador/index.js';
import { emisor } from './fixtures.js';
import { mutar } from './mutaciones.js';
import { comoOficial, consultarOraculo, oraculoDisponible } from './oraculo.js';

// Datos ficticios: placa, licencia y documentos no corresponden a personas reales.
export const guia = (): GuiaRemision => ({
  serie: 'T001',
  correlativo: 1,
  fechaEmision: '2026-11-03',
  horaEmision: '10:00:00',
  emisor,
  destinatario: { tipoDocumento: '6', numeroDocumento: '20000000002', nombre: 'CLIENTE DEMO S.A.' },
  motivo: '01',
  fechaTraslado: '2026-11-03',
  pesoBrutoKg: '12.5',
  partida: { ubigeo: '150101', linea: 'AV. FICTICIA 123' },
  llegada: { ubigeo: '150122', linea: 'JR. INVENTADO 456' },
  vehiculo: { placa: 'ABC123' },
  conductor: {
    tipoDocumento: '1',
    numeroDocumento: '00000001',
    nombres: 'JUAN',
    apellidos: 'PEREZ FICTICIO',
    licencia: 'Q00000001',
  },
  items: [
    { descripcion: 'Producto de prueba', cantidad: 3, unidad: 'NIU', codigo: 'P001' },
    { descripcion: 'Caja de insumos', cantidad: '1.5', unidad: 'KGM', codigo: 'P002' },
  ],
});

type Sel = (x: string) => Element[];
const cada = (expr: string, f: (e: Element) => void) => (sel: Sel) => {
  sel(expr).forEach(f);
};
const texto = (v: string) => (e: Element) => {
  e.textContent = v;
};
const quitar = (e: Element) => e.parentNode?.removeChild(e);
const attr = (k: string, v: string) => (e: Element) => {
  e.setAttribute(k, v);
};

const r = '/*';
const dest = `${r}/cac:DeliveryCustomerParty/cac:Party/cac:PartyIdentification/cbc:ID`;
const cond = `${r}/cac:Shipment/cac:ShipmentStage/cac:DriverPerson`;
const linea = `${r}/cac:DespatchLine[1]`;

const MUTACIONES: {
  nombre: string;
  nombreArchivo?: (n: string) => string;
  aplicar?: (s: Sel) => void;
}[] = [
  { nombre: 'UBLVersionID 2.0', aplicar: cada(`${r}/cbc:UBLVersionID`, texto('2.0')) },
  { nombre: 'sin UBLVersionID', aplicar: cada(`${r}/cbc:UBLVersionID`, quitar) },
  { nombre: 'CustomizationID 1.0', aplicar: cada(`${r}/cbc:CustomizationID`, texto('1.0')) },
  { nombre: 'sin CustomizationID', aplicar: cada(`${r}/cbc:CustomizationID`, quitar) },
  {
    nombre: 'serie de factura',
    nombreArchivo: (n) => n.replace('-T001-', '-F001-'),
    aplicar: cada(`${r}/cbc:ID`, texto('F001-1')),
  },
  { nombre: 'RUC del nombre distinto', nombreArchivo: (n) => n.replace(/^\d{11}/, '20999999999') },
  { nombre: 'serie del nombre distinta', aplicar: cada(`${r}/cbc:ID`, texto('T002-1')) },
  { nombre: 'número del nombre distinto', aplicar: cada(`${r}/cbc:ID`, texto('T001-2')) },
  {
    nombre: 'fecha de emisión mal formada',
    aplicar: cada(`${r}/cbc:IssueDate`, texto('03/11/2026')),
  },
  { nombre: 'hora mal formada', aplicar: cada(`${r}/cbc:IssueTime`, texto('10:00')) },
  { nombre: 'sin hora', aplicar: cada(`${r}/cbc:IssueTime`, quitar) },
  { nombre: 'tipo de documento 01', aplicar: cada(`${r}/cbc:DespatchAdviceTypeCode`, texto('01')) },
  { nombre: 'sin tipo de documento', aplicar: cada(`${r}/cbc:DespatchAdviceTypeCode`, quitar) },
  {
    nombre: 'remitente con schemeID 1',
    aplicar: cada(
      `${r}/cac:DespatchSupplierParty/cac:Party/cac:PartyIdentification/cbc:ID`,
      attr('schemeID', '1'),
    ),
  },
  {
    nombre: 'remitente sin razón social',
    aplicar: cada(
      `${r}/cac:DespatchSupplierParty/cac:Party/cac:PartyLegalEntity/cbc:RegistrationName`,
      quitar,
    ),
  },
  { nombre: 'destinatario sin documento', aplicar: cada(dest, texto('')) },
  {
    nombre: 'destinatario sin tipo',
    aplicar: cada(dest, (e) => {
      e.removeAttribute('schemeID');
    }),
  },
  {
    nombre: 'destinatario con tipo fuera del catálogo',
    aplicar: cada(dest, attr('schemeID', 'Z')),
  },
  { nombre: 'destinatario con RUC de 10 dígitos', aplicar: cada(dest, texto('2000000000')) },
  { nombre: 'destinatario con RUC que empieza en 3', aplicar: cada(dest, texto('30000000002')) },
  {
    nombre: 'destinatario con DNI de 7 dígitos',
    aplicar: cada(dest, (e) => {
      e.setAttribute('schemeID', '1');
      e.textContent = '1234567';
    }),
  },
  {
    nombre: 'destinatario con carné de 16 caracteres',
    aplicar: cada(dest, (e) => {
      e.setAttribute('schemeID', '4');
      e.textContent = 'X'.repeat(16);
    }),
  },
  {
    nombre: 'destinatario con carné con espacio',
    aplicar: cada(dest, (e) => {
      e.setAttribute('schemeID', '4');
      e.textContent = 'X 1';
    }),
  },
  {
    nombre: 'destinatario sin nombre',
    aplicar: cada(
      `${r}/cac:DeliveryCustomerParty/cac:Party/cac:PartyLegalEntity/cbc:RegistrationName`,
      quitar,
    ),
  },
  { nombre: 'sin motivo de traslado', aplicar: cada(`${r}/cac:Shipment/cbc:HandlingCode`, quitar) },
  {
    nombre: 'motivo fuera del catálogo 20',
    aplicar: cada(`${r}/cac:Shipment/cbc:HandlingCode`, texto('99')),
  },
  { nombre: 'sin peso bruto', aplicar: cada(`${r}/cac:Shipment/cbc:GrossWeightMeasure`, quitar) },
  {
    nombre: 'peso con 3 decimales',
    aplicar: cada(`${r}/cac:Shipment/cbc:GrossWeightMeasure`, texto('12.505')),
  },
  {
    nombre: 'peso sin unidad',
    aplicar: cada(`${r}/cac:Shipment/cbc:GrossWeightMeasure`, (e) => {
      e.removeAttribute('unitCode');
    }),
  },
  {
    nombre: 'peso en libras',
    aplicar: cada(`${r}/cac:Shipment/cbc:GrossWeightMeasure`, attr('unitCode', 'LBR')),
  },
  {
    nombre: 'peso en toneladas',
    aplicar: cada(`${r}/cac:Shipment/cbc:GrossWeightMeasure`, attr('unitCode', 'TNE')),
  },
  {
    nombre: 'modalidad 03',
    aplicar: cada(`${r}/cac:Shipment/cac:ShipmentStage/cbc:TransportModeCode`, texto('03')),
  },
  {
    nombre: 'sin modalidad',
    aplicar: cada(`${r}/cac:Shipment/cac:ShipmentStage/cbc:TransportModeCode`, quitar),
  },
  {
    nombre: 'sin fecha de traslado',
    aplicar: cada(`${r}/cac:Shipment/cac:ShipmentStage/cac:TransitPeriod/cbc:StartDate`, quitar),
  },
  {
    nombre: 'fecha de traslado mal formada',
    aplicar: cada(
      `${r}/cac:Shipment/cac:ShipmentStage/cac:TransitPeriod/cbc:StartDate`,
      texto('2026/11/03'),
    ),
  },
  {
    nombre: 'traslado antes de la emisión',
    aplicar: cada(
      `${r}/cac:Shipment/cac:ShipmentStage/cac:TransitPeriod/cbc:StartDate`,
      texto('2026-11-02'),
    ),
  },
  {
    nombre: 'sin placa',
    aplicar: cada(
      `${r}/cac:Shipment/cac:TransportHandlingUnit/cac:TransportEquipment/cbc:ID`,
      quitar,
    ),
  },
  {
    nombre: 'placa de 5 caracteres',
    aplicar: cada(
      `${r}/cac:Shipment/cac:TransportHandlingUnit/cac:TransportEquipment/cbc:ID`,
      texto('ABC12'),
    ),
  },
  {
    nombre: 'placa con guion',
    aplicar: cada(
      `${r}/cac:Shipment/cac:TransportHandlingUnit/cac:TransportEquipment/cbc:ID`,
      texto('ABC-123'),
    ),
  },
  { nombre: 'conductor sin documento', aplicar: cada(`${cond}/cbc:ID`, quitar) },
  {
    nombre: 'conductor sin tipo',
    aplicar: cada(`${cond}/cbc:ID`, (e) => {
      e.removeAttribute('schemeID');
    }),
  },
  { nombre: 'conductor con RUC', aplicar: cada(`${cond}/cbc:ID`, attr('schemeID', '6')) },
  {
    nombre: 'conductor con tipo fuera del catálogo',
    aplicar: cada(`${cond}/cbc:ID`, attr('schemeID', 'Z')),
  },
  { nombre: 'conductor con DNI de 9 dígitos', aplicar: cada(`${cond}/cbc:ID`, texto('123456789')) },
  { nombre: 'conductor sin nombres', aplicar: cada(`${cond}/cbc:FirstName`, quitar) },
  { nombre: 'conductor sin apellidos', aplicar: cada(`${cond}/cbc:FamilyName`, quitar) },
  {
    nombre: 'conductor sin licencia',
    aplicar: cada(`${cond}/cac:IdentityDocumentReference/cbc:ID`, quitar),
  },
  {
    nombre: 'licencia de 8 caracteres',
    aplicar: cada(`${cond}/cac:IdentityDocumentReference/cbc:ID`, texto('Q0000001')),
  },
  {
    nombre: 'licencia en minúsculas',
    aplicar: cada(`${cond}/cac:IdentityDocumentReference/cbc:ID`, texto('q00000001')),
  },
  { nombre: 'conductor sin cargo', aplicar: cada(`${cond}/cbc:JobTitle`, quitar) },
  {
    nombre: 'ubigeo de partida de 5 dígitos',
    aplicar: cada(
      `${r}/cac:Shipment/cac:Delivery/cac:Despatch/cac:DespatchAddress/cbc:ID`,
      texto('15010'),
    ),
  },
  {
    nombre: 'ubigeo de partida inexistente',
    aplicar: cada(
      `${r}/cac:Shipment/cac:Delivery/cac:Despatch/cac:DespatchAddress/cbc:ID`,
      texto('999999'),
    ),
  },
  {
    nombre: 'sin dirección de partida',
    aplicar: cada(
      `${r}/cac:Shipment/cac:Delivery/cac:Despatch/cac:DespatchAddress/cac:AddressLine/cbc:Line`,
      quitar,
    ),
  },
  {
    nombre: 'sin ubigeo de llegada',
    aplicar: cada(`${r}/cac:Shipment/cac:Delivery/cac:DeliveryAddress/cbc:ID`, quitar),
  },
  {
    nombre: 'ubigeo de llegada inexistente',
    aplicar: cada(`${r}/cac:Shipment/cac:Delivery/cac:DeliveryAddress/cbc:ID`, texto('999999')),
  },
  {
    nombre: 'sin dirección de llegada',
    aplicar: cada(
      `${r}/cac:Shipment/cac:Delivery/cac:DeliveryAddress/cac:AddressLine/cbc:Line`,
      quitar,
    ),
  },
  { nombre: 'número de línea de 5 dígitos', aplicar: cada(`${linea}/cbc:ID`, texto('10000')) },
  {
    nombre: 'número de línea duplicado',
    aplicar: (s) => {
      const [a, b] = s(`${r}/cac:DespatchLine/cbc:ID`);
      if (a && b) b.textContent = a.textContent;
    },
  },
  { nombre: 'línea sin cantidad', aplicar: cada(`${linea}/cbc:DeliveredQuantity`, quitar) },
  {
    nombre: 'cantidad sin unidad',
    aplicar: cada(`${linea}/cbc:DeliveredQuantity`, (e) => {
      e.removeAttribute('unitCode');
    }),
  },
  {
    nombre: 'cantidad 0 (sin documento relacionado: no se valida)',
    aplicar: cada(`${linea}/cbc:DeliveredQuantity`, texto('0')),
  },
  // ── Anclas de las expresiones regulares (basura antes o después de un valor válido) ──
  ...['x2.1', '2.1x'].map((v) => ({
    nombre: `UBLVersionID «${v}»`,
    aplicar: cada(`${r}/cbc:UBLVersionID`, texto(v)),
  })),
  ...['x2.0', '2.0x'].map((v) => ({
    nombre: `CustomizationID «${v}»`,
    aplicar: cada(`${r}/cbc:CustomizationID`, texto(v)),
  })),
  ...['XT001-1', 'T001-1X'].map((v) => ({
    nombre: `ID «${v}»`,
    aplicar: cada(`${r}/cbc:ID`, texto(v)),
  })),
  ...['x2026-11-03', '2026-11-03x'].map((v) => ({
    nombre: `IssueDate «${v}»`,
    aplicar: cada(`${r}/cbc:IssueDate`, texto(v)),
  })),
  ...['x10:00:00', '10:00:00x'].map((v) => ({
    nombre: `IssueTime «${v}»`,
    aplicar: cada(`${r}/cbc:IssueTime`, texto(v)),
  })),
  ...['x09', '09x'].map((v) => ({
    nombre: `tipo de documento «${v}»`,
    aplicar: cada(`${r}/cbc:DespatchAdviceTypeCode`, texto(v)),
  })),
  ...['x6', '6x'].map((v) => ({
    nombre: `remitente con schemeID «${v}»`,
    aplicar: cada(
      `${r}/cac:DespatchSupplierParty/cac:Party/cac:PartyIdentification/cbc:ID`,
      attr('schemeID', v),
    ),
  })),
  ...(
    [
      ['1', '12345678', 'DNI válido'],
      ['1', 'a12345678', 'DNI con letra delante'],
      ['1', '12345678a', 'DNI con letra detrás'],
      ['6', 'x20000000002', 'RUC con letra delante'],
      ['6', '20000000002x', 'RUC con letra detrás'],
      ['4', 'X1234567', 'carné válido'],
    ] as const
  ).map(([tipo, numero, titulo]) => ({
    nombre: `destinatario: ${titulo}`,
    aplicar: cada(dest, (e: Element) => {
      e.setAttribute('schemeID', tipo);
      e.textContent = numero;
    }),
  })),
  ...['xKGM', 'TNEx', 'KGMx'].map((v) => ({
    nombre: `peso con unidad «${v}»`,
    aplicar: cada(`${r}/cac:Shipment/cbc:GrossWeightMeasure`, attr('unitCode', v)),
  })),
  ...['x02', '02x', '01'].map((v) => ({
    nombre: `modalidad «${v}»`,
    aplicar: cada(`${r}/cac:Shipment/cac:ShipmentStage/cbc:TransportModeCode`, texto(v)),
  })),
  ...['x2026-11-03', '2026-11-03x'].map((v) => ({
    nombre: `fecha de traslado «${v}»`,
    aplicar: cada(`${r}/cac:Shipment/cac:ShipmentStage/cac:TransitPeriod/cbc:StartDate`, texto(v)),
  })),
  ...['000000', '0AB123', 'xABC123', 'ABC123x'].map((v) => ({
    nombre: `placa «${v}»`,
    aplicar: cada(
      `${r}/cac:Shipment/cac:TransportHandlingUnit/cac:TransportEquipment/cbc:ID`,
      texto(v),
    ),
  })),
  ...['000000000', '0Q0000001', 'xQ00000001', 'Q00000001x'].map((v) => ({
    nombre: `licencia «${v}»`,
    aplicar: cada(`${cond}/cac:IdentityDocumentReference/cbc:ID`, texto(v)),
  })),
  ...['x150101', '150101x'].flatMap((v) => [
    {
      nombre: `ubigeo de partida «${v}»`,
      aplicar: cada(
        `${r}/cac:Shipment/cac:Delivery/cac:Despatch/cac:DespatchAddress/cbc:ID`,
        texto(v),
      ),
    },
    {
      nombre: `ubigeo de llegada «${v}»`,
      aplicar: cada(`${r}/cac:Shipment/cac:Delivery/cac:DeliveryAddress/cbc:ID`, texto(v)),
    },
  ]),
  { nombre: 'número de línea de 2 dígitos', aplicar: cada(`${linea}/cbc:ID`, texto('12')) },
  // ── Ramas del conductor ──
  ...(
    [
      ['4', 'X1234567', 'con carné de extranjería'],
      ['4', 'X123456789012345', 'con carné de 16 caracteres'],
      ['4', 'X 1234', 'con carné con espacio'],
    ] as const
  ).map(([tipo, numero, titulo]) => ({
    nombre: `conductor ${titulo}`,
    aplicar: cada(`${cond}/cbc:ID`, (e: Element) => {
      e.setAttribute('schemeID', tipo);
      e.textContent = numero;
    }),
  })),
  ...['Secundario', 'Ayudante'].map((v) => ({
    nombre: `conductor con cargo «${v}»`,
    aplicar: cada(`${cond}/cbc:JobTitle`, texto(v)),
  })),
  {
    nombre: 'dos conductores principales',
    aplicar: cada(cond, (e: Element) => e.parentNode?.insertBefore(e.cloneNode(true), e)),
  },
  {
    nombre: 'conductor secundario además del principal',
    aplicar: cada(cond, (e: Element) => {
      const otro = e.cloneNode(true) as Element;
      const cargo = otro.getElementsByTagName('cbc:JobTitle')[0];
      if (cargo) cargo.textContent = 'Secundario';
      e.parentNode?.insertBefore(otro, e.nextSibling);
    }),
  },
  { nombre: 'motivo 18', aplicar: cada(`${r}/cac:Shipment/cbc:HandlingCode`, texto('18')) },
  // ── Reglas 2554/2555 (destinatario frente a remitente) y 3616-3619 (modalidad 01) ──
  ...(
    [
      ['02', true, 'motivo 02 con destinatario = remitente'],
      ['01', true, 'motivo 01 con destinatario = remitente'],
      ['04', false, 'motivo 04 con destinatario distinto'],
    ] as const
  ).map(([motivo, mismo, titulo]) => ({
    nombre: titulo,
    aplicar: (sel: Sel) => {
      cada(`${r}/cac:Shipment/cbc:HandlingCode`, texto(motivo))(sel);
      if (mismo) cada(dest, texto(emisor.ruc))(sel);
    },
  })),
  ...(
    [
      ['2026-11-03', 'modalidad 01 con entrega al transportista'],
      ['2026-11-02', 'modalidad 01 con entrega antes de la emisión'],
      ['03/11/2026', 'modalidad 01 con fecha de entrega mal formada'],
    ] as const
  ).map(([fecha, titulo]) => ({
    nombre: titulo,
    aplicar: (sel: Sel) => {
      cada(`${r}/cac:Shipment/cac:ShipmentStage/cbc:TransportModeCode`, texto('01'))(sel);
      cada(`${r}/cac:Shipment/cac:ShipmentStage/cac:TransitPeriod`, (e: Element) => {
        const doc = e.ownerDocument;
        const ns = 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2';
        const nsb = 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2';
        const evento = doc.createElementNS(ns, 'cac:LoadingTransportEvent');
        const f = doc.createElementNS(nsb, 'cbc:OccurrenceDate');
        f.textContent = fecha;
        evento.appendChild(f);
        e.parentNode?.insertBefore(evento, e.nextSibling);
      })(sel);
    },
  })),
  { nombre: 'línea sin descripción', aplicar: cada(`${linea}/cac:Item/cbc:Description`, quitar) },
];

const base = () => ({ nombre: nombreGuia(guia()), xml: generarGuia(guia()) });

describe.runIf(oraculoDisponible)(
  'guía de remisión remitente: conformidad con el XSL oficial',
  () => {
    test('la guía generada pasa sin errores ni observaciones', () => {
      const { nombre, xml } = base();
      const caso = { tipo: '09' as const, nombre: `${nombre}.xml`, xml: firmar(xml) };
      const [oficial] = consultarOraculo([caso]);
      expect(oficial).toEqual({ estado: 'ok', codigo: null, observaciones: [] });
      expect(comoOficial(validarXml(caso.xml, caso.nombre))).toEqual(oficial);
    });

    const casos = MUTACIONES.map((m) => {
      const { nombre, xml } = base();
      return {
        titulo: m.nombre,
        tipo: '09' as const,
        nombre: `${m.nombreArchivo ? m.nombreArchivo(nombre) : nombre}.xml`,
        xml: m.aplicar ? mutar(xml, m.aplicar) : xml,
      };
    });

    test('cada mutación da el mismo veredicto que el XSL oficial', () => {
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
        casos.map((c) => {
          const v = validarXml(c.xml, c.nombre);
          const fmt = (h: { codigo: string; fuente: string }) => `${h.codigo} @ ${h.fuente}`;
          return [c.titulo, [...v.observaciones.map(fmt), ...(v.error ? [fmt(v.error)] : [])]];
        }),
      );
      await expect(JSON.stringify(citas, null, 2)).toMatchFileSnapshot(
        '__snapshots__/citas-guia.json',
      );
    });
  },
);
