import { numeroXPath, type Contexto, type ContextoNodo } from './motor.js';

/**
 * Comunicación de baja (ValidaExprRegSummaryVoided-1.0.1.xsl) y resumen diario
 * (ValidaExprRegSummary-1.1.0.xsl), en el orden de ejecución de cada hoja. Expresiones XPath
 * copiadas sin cambios; `l` es la línea de origen.
 */

const NOMBRE_EMISOR = /^(?!\s*$)[^\s].{2,100}$/;

function emisor(
  c: ContextoNodo,
  codigos: { rucTipo: [string, string]; l: [number, number, number] },
) {
  c.cada('cac:AccountingSupplierParty', (p) => {
    p.existe('2217', 'cbc:CustomerAssignedAccountID', { l: codigos.l[0] });
    p.existeYCumple(codigos.rucTipo[0], codigos.rucTipo[1], 'cbc:AdditionalAccountID', /^(6)$/, {
      l: codigos.l[1],
    });
    p.existeYCumple(
      '2229',
      '2228',
      'cac:Party/cac:PartyLegalEntity/cbc:RegistrationName',
      NOMBRE_EMISOR,
      { l: codigos.l[2] },
    );
  });
}

/** key('by-…', clave): cuenta los nodos de `expr` que comparten `clave(nodo)`. */
function duplicados(
  c: ContextoNodo,
  expr: string,
  clave: (n: ContextoNodo) => string,
): Map<string, number> {
  const conteo = new Map<string, number>();
  c.cada(expr, (n) => {
    const k = clave(n);
    conteo.set(k, (conteo.get(k) ?? 0) + 1);
  });
  return conteo;
}

export function validarBaja(ctx: Contexto): void {
  const c = ctx.en(ctx.raiz);
  c.existeYCumple('2075', '2074', 'cbc:UBLVersionID', /^(2.0)$/, { l: 55 });
  c.existeYCumple('2072', '2072', 'cbc:CustomizationID', /^(1.0)$/, { l: 67 });
  c.falla('2220', '$idFilename != cbc:ID', { l: 79 });
  c.existe('2299', 'cbc:IssueDate', { l: 89 });
  c.falla('2346', "$fechaEnvioFile != translate(cbc:IssueDate,'-','')", { l: 97 });
  c.existe('2303', 'cbc:ReferenceDate', { l: 116 });
  emisor(c, { rucTipo: ['2288', '2287'], l: [236, 246, 261] });
  c.falla('2221', '$numeroRuc != cac:AccountingSupplierParty/cbc:CustomerAssignedAccountID', {
    l: 148,
  });
  const porLinea = duplicados(c, 'sac:VoidedDocumentsLine', (n) =>
    String(n.numero('number(cbc:LineID)')),
  );
  const porDoc = duplicados(
    c,
    'sac:VoidedDocumentsLine',
    (n) =>
      `${n.texto('cbc:LineID')}${n.texto('cbc:DocumentTypeCode')}${n.texto('sac:DocumentSerialID')}${String(n.numero('number(sac:DocumentNumberID)'))}`,
  );
  c.cada('sac:VoidedDocumentsLine', (l) => {
    l.existeYCumple('2307', '2305', 'cbc:LineID', /^(?!0+(\d+)$)\d{1,5}$/, { l: 295 });
    l.falla('2306', 'cbc:LineID < 1', { l: 309 });
    l.falla('2752', (porLinea.get(String(l.numero('number(cbc:LineID)'))) ?? 0) > 1, { l: 321 });
    // Copia literal: la alternativa sin agrupar equivale a ^01 | 07 | 08 | 14$.
    l.existeYCumple('2309', '2308', 'cbc:DocumentTypeCode', /^01|07|08|14$/, { l: 337 });
    l.existeYCumple('2311', '2310', 'sac:DocumentSerialID', /(^[FS][A-Z0-9]{3}$)|(^[\d]{1,4}$)/, {
      l: 355,
    });
    if (l.verdad("cbc:DocumentTypeCode='01'"))
      l.existeYCumple('2311', '2345', 'sac:DocumentSerialID', /(^[F][A-Z0-9]{3}$)|(^[\d]{1,4}$)/, {
        l: 372,
      });
    if (l.verdad("cbc:DocumentTypeCode='14'"))
      l.existeYCumple('2311', '2345', 'sac:DocumentSerialID', /(^[S][A-Z0-9]{3}$)|(^[\d]{1,4}$)/, {
        l: 393,
      });
    l.existeYCumple('2313', '2312', 'sac:DocumentNumberID', /^\d{1,8}$/, { l: 412 });
    const k = `${l.texto('cbc:LineID')}${l.texto('cbc:DocumentTypeCode')}${l.texto('sac:DocumentSerialID')}${String(l.numero('number(sac:DocumentNumberID)'))}`;
    l.falla('2752', (porDoc.get(k) ?? 0) > 1, { l: 426 });
    l.existeYCumple('2315', '2314', 'sac:VoidReasonDescription', /^(?!\s*$)[^\s].{2,}$/, {
      l: 440,
      esError: false,
    });
  });
}

export function validarResumen(ctx: Contexto): void {
  const c = ctx.en(ctx.raiz);
  c.existeYCumple('2075', '2074', 'cbc:UBLVersionID', /^(2.0)$/, { l: 67 });
  c.existeYCumple('2072', '2072', 'cbc:CustomizationID', /^(1.1)$/, { l: 79 });
  c.falla('2220', '$idFilename != cbc:ID', { l: 91 });
  c.falla('2346', "$fechaEnvioFile != translate(cbc:IssueDate,'-','')", { l: 101 });
  emisor(c, { rucTipo: ['2219', '2218'], l: [212, 222, 237] });
  c.falla('1034', '$numeroRuc != cac:AccountingSupplierParty/cbc:CustomerAssignedAccountID', {
    l: 149,
  });
  c.falla('0158', 'count(sac:SummaryDocumentsLine) > 500', { l: 171 });
  const porLinea = duplicados(c, 'sac:SummaryDocumentsLine', (n) =>
    String(n.numero('number(cbc:LineID)')),
  );
  c.cada(
    'sac:SummaryDocumentsLine',
    (l) => {
      l.existeYCumple('2238', '2238', 'cbc:LineID', /^(?!0+(\d+)$)\d{1,5}$/, { l: 269 });
      l.falla('2239', 'cbc:LineID < 1', { l: 283 });
      l.falla('2752', (porLinea.get(String(l.numero('number(cbc:LineID)'))) ?? 0) > 1, { l: 295 });
      l.existe('2522', 'cac:Status/cbc:ConditionCode', { l: 307 });
      l.enCatalogo('2896', 'cac:Status/cbc:ConditionCode', '19', { l: 315 });
      // Copia literal de la expresión oficial (alternativa sin agrupar).
      l.existeYCumple('2242', '2241', 'cbc:DocumentTypeCode', /^03|07|08$/, { l: 367 });
      l.existeYCumple(
        '2512',
        '2513',
        'cbc:ID',
        /^([B][A-Z0-9]{3}|[\d]{1,4})-(?!0+$)([0-9]{1,8})$/,
        { l: 383 },
      );
      l.existeDecimal('2252', '2251', 'sac:TotalAmount', 2, { l: 400, mayorCero: false });
      // 4027 (L408-L540): total vs. suma de pagos, cargos y tributos, con tolerancia de ±5.
      const valor = (expr: string) => (l.verdad(expr) ? numeroXPath(l.texto(expr)) : 0);
      const total = l.numero('number(sac:TotalAmount)');
      const suma =
        valor(
          "cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:ID='9999']/cbc:TaxAmount",
        ) +
        valor(
          "cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:ID='1000']/cbc:TaxAmount",
        ) +
        valor(
          "cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:ID='2000']/cbc:TaxAmount",
        ) +
        valor('cac:AllowanceCharge/cbc:Amount') +
        valor(
          "cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:ID='7152']/cbc:TaxAmount",
        ) +
        valor("sac:BillingPayment[cbc:InstructionID='03']/cbc:PaidAmount") +
        valor("sac:BillingPayment[cbc:InstructionID='02']/cbc:PaidAmount") +
        valor("sac:BillingPayment[cbc:InstructionID='01']/cbc:PaidAmount");
      l.falla('4027', total + 5 < suma || total - 5 > suma, { l: 531, esError: false });
      l.conVariables({ monedaComprobante: l.nodos('sac:TotalAmount/@currencyID') }).falla(
        '2071',
        'count(descendant::*[@currencyID != $monedaComprobante and not(ancestor-or-self::sac:SUNATPerceptionSummaryDocumentReference)])>0',
        { l: 549 },
      );
      // El cliente solo se exige y se valida si el total supera 700 (L561-L572).
      if (l.verdad('sac:TotalAmount > 700')) {
        l.existe('2514', 'cac:AccountingCustomerParty', { l: 562 });
        l.cada('cac:AccountingCustomerParty', (p) => {
          p.existe('2014', 'cbc:CustomerAssignedAccountID', { l: 917 });
          if (p.verdad("cbc:AdditionalAccountID ='6'"))
            p.cumpleSiExiste('2017', 'cbc:CustomerAssignedAccountID', /^[\d]{11}$/, { l: 930 });
          else if (p.verdad("cbc:AdditionalAccountID ='1'"))
            p.cumpleSiExiste('2027', 'cbc:CustomerAssignedAccountID', /^[\d]{8}$/, {
              l: 942,
              esError: false,
            });
          else
            p.cumpleSiExiste('2018', 'cbc:CustomerAssignedAccountID', /^[\d\w-]{1,20}$/, {
              l: 956,
            });
          p.existe('2015', 'cbc:AdditionalAccountID', { l: 971 });
          if (p.verdad("cbc:AdditionalAccountID != '-'"))
            p.enCatalogo('2016', 'cbc:AdditionalAccountID', '06', { l: 982 });
        });
      }
      const instrucciones = duplicados(l, 'sac:BillingPayment', (b) =>
        b.texto('cbc:InstructionID'),
      );
      l.cada('sac:BillingPayment', (b) => {
        b.existeDecimal('2255', '2254', 'cbc:PaidAmount', 2, { l: 578, mayorCero: false });
        b.falla('2260', 'cbc:PaidAmount <= 0', { l: 592 });
        b.existe('2257', 'cbc:InstructionID', { l: 604 });
        b.enCatalogo('2256', 'cbc:InstructionID', '11', { l: 614 });
        b.falla('2357', (instrucciones.get(b.texto('cbc:InstructionID')) ?? 0) > 1, { l: 626 });
      });
      l.falla(
        '2278',
        "count(cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme/cbc:ID[text()='1000']) = 0 ",
        { l: 693 },
      );
      l.cada('cac:TaxTotal', (t) => {
        t.existeDecimal('2048', '2048', 'cbc:TaxAmount', 2, { l: 811, mayorCero: false });
        t.falla('2344', 'number(cac:TaxSubtotal/cbc:TaxAmount) != number(cbc:TaxAmount)', {
          l: 825,
        });
        t.existe('2269', 'cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme/cbc:ID', { l: 837 });
        t.enCatalogo('2268', 'cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme/cbc:ID', '05', {
          l: 847,
        });
        t.existe('2271', 'cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme/cbc:Name', { l: 859 });
        if (t.verdad("cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme/cbc:ID = '1000'"))
          t.falla(
            '2276',
            "cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme[cbc:ID = '1000']/cbc:Name != 'IGV'",
            { l: 871 },
          );
      });
      const tributos = duplicados(l, 'cac:TaxTotal/cac:TaxSubtotal', (s) =>
        s.texto('cac:TaxCategory/cac:TaxScheme/cbc:ID'),
      );
      l.cada('cac:TaxTotal/cac:TaxSubtotal', (s) => {
        s.falla('2355', (tributos.get(s.texto('cac:TaxCategory/cac:TaxScheme/cbc:ID')) ?? 0) > 1, {
          l: 778,
        });
      });
      // Solo las notas (07/08) llevan documento de referencia (L745).
      l.falla(
        '2512',
        "(not(cac:BillingReference) and (cbc:DocumentTypeCode='07' or cbc:DocumentTypeCode='08')) or (cac:BillingReference and not(cbc:DocumentTypeCode='07' or cbc:DocumentTypeCode='08'))",
        { l: 745 },
      );
    },
    (l) => ({ nroLinea: l.texto('cbc:LineID') }),
  );
}
