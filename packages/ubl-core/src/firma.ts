import { DOMParser } from '@xmldom/xmldom';
import { SignedXml } from 'xml-crypto';
import xpath from 'xpath';
import { CERTIFICADO_PRUEBA, CLAVE_PRUEBA } from './certificado-prueba.js';
import { ID_FIRMA } from './xml.js';

/**
 * Firma XML-DSig enveloped, en la forma que exige SUNAT: el ds:Signature va dentro de
 * ext:UBLExtensions/ext:UBLExtension/ext:ExtensionContent, la referencia es el documento completo
 * (URI="") con la transformación enveloped-signature y el certificado viaja en ds:KeyInfo.
 *
 * Algoritmos: RSA-SHA1 + SHA-1 + C14N por defecto, igual que Greenter (thegreenter/xmldsig);
 * también se admite RSA-SHA256 + SHA-256. Fuente: docs/fuentes.md §7.
 */

const ALGORITMOS = {
  sha1: {
    firma: 'http://www.w3.org/2000/09/xmldsig#rsa-sha1',
    digest: 'http://www.w3.org/2000/09/xmldsig#sha1',
  },
  sha256: {
    firma: 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256',
    digest: 'http://www.w3.org/2001/04/xmlenc#sha256',
  },
} as const;

const C14N = 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315';
const ENVELOPED = 'http://www.w3.org/2000/09/xmldsig#enveloped-signature';
const DS = 'http://www.w3.org/2000/09/xmldsig#';

export interface OpcionesFirma {
  certificado?: string;
  clave?: string;
  algoritmo?: keyof typeof ALGORITMOS;
}

export function firmar(xml: string, o: OpcionesFirma = {}): string {
  const alg = ALGORITMOS[o.algoritmo ?? 'sha1'];
  const sig = new SignedXml({
    privateKey: o.clave ?? CLAVE_PRUEBA,
    publicCert: o.certificado ?? CERTIFICADO_PRUEBA,
    signatureAlgorithm: alg.firma,
    canonicalizationAlgorithm: C14N,
  });
  sig.addReference({
    xpath: '/*',
    transforms: [ENVELOPED, C14N],
    digestAlgorithm: alg.digest,
    isEmptyUri: true,
  });
  sig.computeSignature(xml, {
    prefix: 'ds',
    attrs: { Id: ID_FIRMA },
    location: {
      reference:
        "/*/*[local-name()='UBLExtensions']/*[local-name()='UBLExtension']/*[local-name()='ExtensionContent']",
      action: 'append',
    },
  });
  return sig.getSignedXml();
}

export type ResultadoFirma =
  | { valida: true; certificado: string }
  /** Códigos oficiales: 1059 sin firma, 2335 documento alterado, 2336 error al validar la firma. */
  | { valida: false; codigo: '1059' | '2335' | '2336'; detalle: string };

export function verificarFirma(xml: string): ResultadoFirma {
  let doc: Document;
  try {
    doc = new DOMParser().parseFromString(xml, 'text/xml') as unknown as Document;
  } catch (e) {
    return { valida: false, codigo: '2336', detalle: `XML ilegible: ${String(e)}` };
  }
  const firmas = xpath.select(
    "//*[local-name()='Signature' and namespace-uri()='" + DS + "']",
    doc,
  ) as Node[];
  const [firma] = firmas;
  if (!firma) return { valida: false, codigo: '1059', detalle: 'El XML no contiene ds:Signature' };
  if (firmas.length > 1)
    return { valida: false, codigo: '2336', detalle: 'Hay más de un ds:Signature' };

  const sig = new SignedXml({ getCertFromKeyInfo: (k) => SignedXml.getCertFromKeyInfo(k) });
  try {
    sig.loadSignature(firma);
    // Contra signature wrapping: la única referencia debe cubrir el documento completo.
    const refs = sig.getReferences();
    if (refs.length !== 1 || (refs[0]?.uri ?? '') !== '') {
      return {
        valida: false,
        codigo: '2336',
        detalle: 'La firma debe tener una sola referencia con URI=""',
      };
    }
    // TODO verificar: CatalogoErrores.xml da el mismo mensaje a 2334 y 2335 («ha sido
    // alterado»); no se encontró fuente que diga cuál corresponde al digest y cuál al valor.
    if (!sig.checkSignature(xml))
      return {
        valida: false,
        codigo: '2335',
        detalle: 'El digest o el valor de la firma no coinciden',
      };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    // xml-crypto lanza cuando el digest o el SignatureValue no coinciden.
    if (/invalid signature|digest/i.test(msg))
      return { valida: false, codigo: '2335', detalle: msg };
    return { valida: false, codigo: '2336', detalle: msg };
  }
  const cert = SignedXml.getCertFromKeyInfo(
    xpath.select1(".//*[local-name()='KeyInfo']", firma) as Node,
  );
  return { valida: true, certificado: cert ?? '' };
}
