import type { TipoDocIdentidad, UnidadMedida } from '@chasqui/catalogos';
import { Decimal, type DecimalLike } from './decimal.js';
import type { Emisor } from './modelo.js';
import { NS } from './xml.js';

/**
 * Guía de remisión remitente (09) en DespatchAdvice UBL 2.1, modalidad de transporte privado
 * (catálogo 18: 02). Estructura de la plantilla despatch2022.xml.twig de Greenter, validada
 * contra ValidaExprRegGreRemitente-2.0.1.xsl.
 */

export interface Direccion {
  ubigeo: string;
  linea: string;
}

export interface GuiaRemision {
  serie: string;
  correlativo: number;
  fechaEmision: string;
  horaEmision?: string;
  emisor: Emisor;
  destinatario: { tipoDocumento: TipoDocIdentidad; numeroDocumento: string; nombre: string };
  /** Catálogo 20: 01 venta, 04 traslado entre establecimientos de la misma empresa, etc. */
  motivo: string;
  descripcionMotivo?: string;
  fechaTraslado: string;
  pesoBrutoKg: DecimalLike;
  partida: Direccion;
  llegada: Direccion;
  vehiculo: { placa: string };
  conductor: {
    tipoDocumento: TipoDocIdentidad;
    numeroDocumento: string;
    nombres: string;
    apellidos: string;
    licencia: string;
  };
  items: { descripcion: string; cantidad: DecimalLike; unidad: UnidadMedida; codigo: string }[];
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const cat = (n: string) => `urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo${n}`;
const idDoc = (tipo: string, num: string) =>
  `<cbc:ID schemeID="${tipo}" schemeName="Documento de Identidad" schemeAgencyName="PE:SUNAT" schemeURI="${cat('06')}">${esc(num)}</cbc:ID>`;

export const nombreGuia = (g: GuiaRemision) =>
  `${g.emisor.ruc}-09-${g.serie}-${String(g.correlativo)}`;

function direccion(etiqueta: string, d: Direccion) {
  return (
    `<cac:${etiqueta}><cbc:ID schemeAgencyName="PE:INEI" schemeName="Ubigeos">${esc(d.ubigeo)}</cbc:ID>` +
    `<cac:AddressLine><cbc:Line>${esc(d.linea)}</cbc:Line></cac:AddressLine></cac:${etiqueta}>`
  );
}

export function generarGuia(g: GuiaRemision): string {
  const e = g.emisor;
  const c = g.conductor;
  const lineas = g.items
    .map(
      (it, i) =>
        `<cac:DespatchLine><cbc:ID>${String(i + 1)}</cbc:ID>` +
        `<cbc:DeliveredQuantity unitCode="${it.unidad}">${Decimal.de(it.cantidad).aTextoCompacto()}</cbc:DeliveredQuantity>` +
        `<cac:OrderLineReference><cbc:LineID>${String(i + 1)}</cbc:LineID></cac:OrderLineReference>` +
        `<cac:Item><cbc:Description>${esc(it.descripcion)}</cbc:Description>` +
        `<cac:SellersItemIdentification><cbc:ID>${esc(it.codigo)}</cbc:ID></cac:SellersItemIdentification></cac:Item></cac:DespatchLine>`,
    )
    .join('');
  return (
    '<?xml version="1.0" encoding="UTF-8"?>' +
    `<DespatchAdvice xmlns="urn:oasis:names:specification:ubl:schema:xsd:DespatchAdvice-2" xmlns:cac="${NS.cac}" xmlns:cbc="${NS.cbc}" xmlns:ds="${NS.ds}" xmlns:ext="${NS.ext}">` +
    '<ext:UBLExtensions><ext:UBLExtension><ext:ExtensionContent/></ext:UBLExtension></ext:UBLExtensions>' +
    '<cbc:UBLVersionID>2.1</cbc:UBLVersionID><cbc:CustomizationID>2.0</cbc:CustomizationID>' +
    `<cbc:ID>${esc(g.serie)}-${String(g.correlativo)}</cbc:ID><cbc:IssueDate>${g.fechaEmision}</cbc:IssueDate><cbc:IssueTime>${g.horaEmision ?? '00:00:00'}</cbc:IssueTime>` +
    `<cbc:DespatchAdviceTypeCode listAgencyName="PE:SUNAT" listName="Tipo de Documento" listURI="${cat('01')}">09</cbc:DespatchAdviceTypeCode>` +
    `<cac:Signature><cbc:ID>${e.ruc}</cbc:ID><cac:SignatoryParty><cac:PartyIdentification><cbc:ID>${e.ruc}</cbc:ID></cac:PartyIdentification>` +
    `<cac:PartyName><cbc:Name>${esc(e.razonSocial)}</cbc:Name></cac:PartyName></cac:SignatoryParty>` +
    '<cac:DigitalSignatureAttachment><cac:ExternalReference><cbc:URI>#SignatureSP</cbc:URI></cac:ExternalReference></cac:DigitalSignatureAttachment></cac:Signature>' +
    `<cac:DespatchSupplierParty><cac:Party><cac:PartyIdentification>${idDoc('6', e.ruc)}</cac:PartyIdentification>` +
    `<cac:PartyLegalEntity><cbc:RegistrationName>${esc(e.razonSocial)}</cbc:RegistrationName></cac:PartyLegalEntity></cac:Party></cac:DespatchSupplierParty>` +
    `<cac:DeliveryCustomerParty><cac:Party><cac:PartyIdentification>${idDoc(g.destinatario.tipoDocumento, g.destinatario.numeroDocumento)}</cac:PartyIdentification>` +
    `<cac:PartyLegalEntity><cbc:RegistrationName>${esc(g.destinatario.nombre)}</cbc:RegistrationName></cac:PartyLegalEntity></cac:Party></cac:DeliveryCustomerParty>` +
    '<cac:Shipment><cbc:ID>SUNAT_Envio</cbc:ID>' +
    `<cbc:HandlingCode listAgencyName="PE:SUNAT" listName="Motivo de traslado" listURI="${cat('20')}">${esc(g.motivo)}</cbc:HandlingCode>` +
    (g.descripcionMotivo
      ? `<cbc:HandlingInstructions>${esc(g.descripcionMotivo)}</cbc:HandlingInstructions>`
      : '') +
    `<cbc:GrossWeightMeasure unitCode="KGM">${Decimal.de(g.pesoBrutoKg).aTexto(3)}</cbc:GrossWeightMeasure>` +
    `<cac:ShipmentStage><cbc:TransportModeCode listName="Modalidad de traslado" listAgencyName="PE:SUNAT" listURI="${cat('18')}">02</cbc:TransportModeCode>` +
    `<cac:TransitPeriod><cbc:StartDate>${g.fechaTraslado}</cbc:StartDate></cac:TransitPeriod>` +
    `<cac:DriverPerson>${idDoc(c.tipoDocumento, c.numeroDocumento)}<cbc:FirstName>${esc(c.nombres)}</cbc:FirstName><cbc:FamilyName>${esc(c.apellidos)}</cbc:FamilyName>` +
    `<cbc:JobTitle>Principal</cbc:JobTitle><cac:IdentityDocumentReference><cbc:ID>${esc(c.licencia)}</cbc:ID></cac:IdentityDocumentReference></cac:DriverPerson></cac:ShipmentStage>` +
    `<cac:Delivery>${direccion('DeliveryAddress', g.llegada)}<cac:Despatch>${direccion('DespatchAddress', g.partida)}</cac:Despatch></cac:Delivery>` +
    `<cac:TransportHandlingUnit><cac:TransportEquipment><cbc:ID>${esc(g.vehiculo.placa)}</cbc:ID></cac:TransportEquipment></cac:TransportHandlingUnit>` +
    '</cac:Shipment>' +
    lineas +
    '</DespatchAdvice>'
  );
}
