import type { Contexto } from './motor.js';

/**
 * Guía de remisión remitente (ValidaExprRegGreRemitente-2.0.1.xsl): subconjunto de cabecera,
 * remitente, destinatario, envío, conductor, direcciones y líneas, en el orden de la hoja.
 * Las condiciones sobre indicadores (SpecialInstructions) se copian sin cambios.
 * Fuera del subconjunto: documentos relacionados, contenedores, puertos, comprador y terceros.
 */

const M1L =
  "count(cac:Shipment/cbc:SpecialInstructions[text() = 'SUNAT_Envio_IndicadorTrasladoVehiculoM1L']) = 0";
const CONDUCTORES =
  "count(cac:Shipment/cbc:SpecialInstructions[text() = 'SUNAT_Envio_IndicadorVehiculoConductoresTransp']) = 1";
const CON_VEHICULO = `$modalidadTraslado = '02' or ($modalidadTraslado = '01' and ${M1L} and ${CONDUCTORES})`;
const CON_VEHICULO_02 = `($modalidadTraslado = '02' and ${M1L}) or ($modalidadTraslado = '01' and ${M1L} and ${CONDUCTORES})`;
const DESTINATARIO = 'cac:DeliveryCustomerParty/cac:Party/cac:PartyIdentification/cbc:ID';

export function validarGuia(ctx: Contexto): void {
  const c = ctx.en(ctx.raiz);
  c.existeYCumple('2111', '2110', 'cbc:UBLVersionID', /^(2.1)$/, { l: 87 });
  c.existeYCumple('2113', '2112', 'cbc:CustomizationID', /^(2.0)$/, { l: 96 });
  c.cumpleSiExiste('1001', 'cbc:ID', /^[T][A-Z0-9]{3}-[0-9]{1,8}?$/, { l: 105 });
  c.falla(
    '1034',
    '$numeroRuc != cac:DespatchSupplierParty/cac:Party/cac:PartyIdentification/cbc:ID',
    { l: 114 },
  );
  c.falla('1035', '$numeroSerie != substring(cbc:ID, 1, 4)', { l: 121 });
  c.falla('1036', '$numeroComprobante != substring(cbc:ID, 6)', { l: 128 });
  c.cumpleSiExiste('3436', 'cbc:IssueDate', /^[0-9]{4}-[0-9]{2}-[0-9]{2}?$/, { l: 135 });
  c.existeYCumple('3437', '3438', 'cbc:IssueTime', /^[0-9]{2}:[0-9]{2}:[0-9]{2}?$/, { l: 148 });
  c.existeYCumple('1050', '1051', 'cbc:DespatchAdviceTypeCode', /^(09)$/, { l: 156 });
  c.existeYCumple(
    '2678',
    '2511',
    'cac:DespatchSupplierParty/cac:Party/cac:PartyIdentification/cbc:ID/@schemeID',
    /^(6)$/,
    { l: 190 },
  );
  c.existe(
    '1037',
    'cac:DespatchSupplierParty/cac:Party/cac:PartyLegalEntity/cbc:RegistrationName',
    { l: 221 },
  );

  c.existe('2757', DESTINATARIO, { l: 267 });
  c.existe('2759', `${DESTINATARIO}/@schemeID`, { l: 272 });
  c.enCatalogo('2760', `${DESTINATARIO}/@schemeID`, '06', { l: 277 });
  if (c.verdad(`${DESTINATARIO}/@schemeID = '1'`))
    c.cumpleSiExiste('2758', DESTINATARIO, /^[0-9]{8}$/, { l: 322 });
  else if (c.verdad(`${DESTINATARIO}/@schemeID = '6'`))
    c.cumpleSiExiste('2758', DESTINATARIO, /^[1-2][0-9]{10}$/, { l: 330 });
  else if (c.verdad(`string-length(${DESTINATARIO}) > 15 or string-length(${DESTINATARIO}) < 1`))
    c.falla('2758', true, { l: 340 });
  else c.cumpleSiExiste('2758', DESTINATARIO, /^[^\s]{1,}$/, { l: 348 });
  c.existe(
    '2761',
    'cac:DeliveryCustomerParty/cac:Party/cac:PartyLegalEntity/cbc:RegistrationName',
    { l: 379 },
  );

  c.existe('3404', 'cac:Shipment/cbc:HandlingCode', { l: 733 });
  c.enCatalogo('3405', 'cac:Shipment/cbc:HandlingCode', '20', { l: 738 });
  const sinDam = c.verdad(
    "count(cac:AdditionalDocumentReference[cbc:DocumentTypeCode[text() = '92']]) = 0",
  );
  if (sinDam) c.existe('2880', 'cac:Shipment/cbc:GrossWeightMeasure', { l: 957 });
  c.decimalSiExiste('2523', 'cac:Shipment/cbc:GrossWeightMeasure', { l: 963, decimales: 3 });
  if (sinDam) c.existe('2881', 'cac:Shipment/cbc:GrossWeightMeasure/@unitCode', { l: 971 });
  c.cumpleSiExiste('2523', 'cac:Shipment/cbc:GrossWeightMeasure/@unitCode', /^(KGM)|(TNE)$/, {
    l: 977,
  });

  c.existeYCumple(
    '2532',
    '2773',
    'cac:Shipment/cac:ShipmentStage/cbc:TransportModeCode',
    /^(01|02)$/,
    { l: 1159 },
  );
  if (c.verdad(CON_VEHICULO)) {
    c.existe('3406', 'cac:Shipment/cac:ShipmentStage/cac:TransitPeriod/cbc:StartDate', { l: 1196 });
    c.cumpleSiExiste(
      '3407',
      'cac:Shipment/cac:ShipmentStage/cac:TransitPeriod/cbc:StartDate',
      /^[0-9]{4}-[0-9]{2}-[0-9]{2}?$/,
      { l: 1201 },
    );
    if (c.verdad("$modalidadTraslado = '02'"))
      c.falla(
        '3343',
        "number(translate(cac:Shipment/cac:ShipmentStage/cac:TransitPeriod/cbc:StartDate,'-','')) < number(translate(cbc:IssueDate,'-',''))",
        { l: 1208 },
      );
  }
  if (c.verdad(CON_VEHICULO_02))
    c.existe('2566', 'cac:Shipment/cac:TransportHandlingUnit/cac:TransportEquipment/cbc:ID', {
      l: 1634,
    });
  if (c.verdad("cac:Shipment/cac:TransportHandlingUnit/cac:TransportEquipment/cbc:ID != ''"))
    c.cumpleSiExiste(
      '2567',
      'cac:Shipment/cac:TransportHandlingUnit/cac:TransportEquipment/cbc:ID',
      /^(?!0+$)([0-9A-Z]{6,8})$/,
      { l: 1650 },
    );

  const principales =
    "count(cac:Shipment/cac:ShipmentStage/cac:DriverPerson/cbc:JobTitle[text()='Principal'])";
  if (c.verdad(CON_VEHICULO_02)) c.falla('3357', `${principales} < 1`, { l: 1802 });
  c.falla('3358', `${principales} > 1`, { l: 1809 });

  // Conductores (plantilla L3440, aplicada en L1831).
  c.cada('cac:Shipment/cac:ShipmentStage/cac:DriverPerson', (d) => {
    if (!d.verdad("cbc:JobTitle[text() = 'Principal' or text() = 'Secundario']")) return;
    const exigido = d.verdad(CON_VEHICULO_02.replaceAll('cac:Shipment', '$root/cac:Shipment'));
    if (exigido && d.verdad("cbc:JobTitle[text() = 'Principal']")) {
      d.existe('2568', 'cbc:ID', { l: 3463 });
      d.existe('2570', 'cbc:ID/@schemeID', { l: 3469 });
    }
    if (d.verdad("cbc:ID/@schemeID != ''")) {
      d.enCatalogo('2571', 'cbc:ID/@schemeID', '06', { l: 3518 });
      d.falla('2571', "cbc:ID/@schemeID = '6'", { l: 3525 });
      if (d.verdad("cbc:ID/@schemeID = '1'"))
        d.cumpleSiExiste('2569', 'cbc:ID', /^[0-9]{8}$/, { l: 3584 });
      else if (d.verdad('string-length(cbc:ID) > 15 or string-length(cbc:ID) < 1'))
        d.falla('2569', true, { l: 3594 });
      else d.cumpleSiExiste('2569', 'cbc:ID', /^[^\s]{1,}$/, { l: 3602 });
    }
    if (
      exigido &&
      d.verdad(
        "(cbc:JobTitle[text() = 'Principal']) or (cbc:JobTitle[text() = 'Secundario'] and cac:IdentityDocumentReference/cbc:ID != '')",
      )
    ) {
      d.existe('3360', 'cbc:FirstName', { l: 3620 });
      d.existe('3361', 'cbc:FamilyName', { l: 3626 });
    }
    if (
      exigido &&
      d.verdad(
        "cbc:JobTitle[text() = 'Principal'] or (cbc:JobTitle[text() = 'Secundario'] and cbc:ID != '')",
      )
    )
      d.existe('2572', 'cac:IdentityDocumentReference/cbc:ID', { l: 3749 });
    if (d.verdad("cac:IdentityDocumentReference/cbc:ID != ''"))
      d.cumpleSiExiste(
        '2573',
        'cac:IdentityDocumentReference/cbc:ID',
        /^(?!0+$)([0-9A-Z]{9,10})$/,
        { l: 3781 },
      );
  });

  c.existeYCumple(
    '2775',
    '2776',
    'cac:Shipment/cac:Delivery/cac:Despatch/cac:DespatchAddress/cbc:ID',
    /^[0-9]{6}$/,
    { l: 1840 },
  );
  c.enCatalogo('3363', 'cac:Shipment/cac:Delivery/cac:Despatch/cac:DespatchAddress/cbc:ID', '13', {
    l: 1848,
  });
  c.existe(
    '2577',
    'cac:Shipment/cac:Delivery/cac:Despatch/cac:DespatchAddress/cac:AddressLine/cbc:Line',
    { l: 1879 },
  );
  if (c.verdad("$motivoTraslado != '18'")) {
    c.existeYCumple(
      '2775',
      '2776',
      'cac:Shipment/cac:Delivery/cac:DeliveryAddress/cbc:ID',
      /^[0-9]{6}$/,
      { l: 2003 },
    );
    c.enCatalogo('3368', 'cac:Shipment/cac:Delivery/cac:DeliveryAddress/cbc:ID', '13', { l: 2011 });
    c.existe('2574', 'cac:Shipment/cac:Delivery/cac:DeliveryAddress/cac:AddressLine/cbc:Line', {
      l: 2036,
    });
  }

  // Líneas (plantilla L3799, aplicada en L2423).
  const ids = c.nodos('cac:DespatchLine/cbc:ID').map((n) => Number(n.textContent?.trim()));
  const totalDam =
    "count($root/cac:Shipment/cbc:SpecialInstructions[text() = 'SUNAT_Envio_IndicadorTrasladoTotalDAMoDS' or text() = 'SUNAT_Envio_IndicadorTrasladoContenedorManifiestoCarga']) = 0";
  c.cada('cac:DespatchLine', (l) => {
    l.existeYCumple('2023', '2023', 'cbc:ID', /^\d{1,4}$/, { l: 3809 });
    const propio = l.numero('number(cbc:ID)');
    l.falla('2752', ids.filter((x) => x === propio).length > 1, { l: 3832 });
    if (l.verdad(`${totalDam} and $motivoTraslado[text() != '08' and text() != '19']`))
      l.falla('2580', 'not(cbc:DeliveredQuantity)', { l: 3848 });
    if (l.verdad("$root/cac:AdditionalDocumentReference/cbc:DocumentTypeCode[text() != '91']"))
      l.cumpleSiExiste(
        '2780',
        'cbc:DeliveredQuantity',
        /^(?!0[0-9]*(\.0*)?$)[0-9]{1,12}(\.[0-9]{1,10})?$/,
        { l: 3862 },
      );
    if (l.verdad(`${totalDam} and not($tipoDocumentoCita) and cbc:DeliveredQuantity`))
      l.existe('2883', 'cbc:DeliveredQuantity/@unitCode', { l: 3890 });
    if (
      l.verdad(
        "count($root/cac:Shipment/cbc:SpecialInstructions[text() = 'SUNAT_Envio_IndicadorTrasladoTotalDAMoDS']) = 0 and not($tipoDocumentoCita) and not($condicionTrasladoDAM_DS)",
      )
    )
      l.existe('2781', 'cac:Item/cbc:Description', { l: 3960 });
  });
}
