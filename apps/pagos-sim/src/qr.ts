/**
 * Payload de cobro con la estructura TLV del estándar EMVCo Merchant-Presented Mode (ID de dos
 * dígitos + largo de dos dígitos + valor) y CRC16-CCITT al final, que es la base de los QR de pago
 * interoperables. El identificador de la cuenta es ficticio («PE.CHASQUI.SIM»): no es un QR de
 * ninguna billetera real. Fuente: docs/fuentes.md §12.
 */

const tlv = (id: string, valor: string) => `${id}${String(valor.length).padStart(2, '0')}${valor}`;

/** CRC16-CCITT (polinomio 0x1021, valor inicial 0xFFFF), en 4 dígitos hexadecimales. */
export function crc16(texto: string): string {
  let crc = 0xffff;
  for (const byte of Buffer.from(texto, 'utf8')) {
    crc ^= byte << 8;
    for (let i = 0; i < 8; i++)
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export interface DatosQr {
  celular: string;
  titular: string;
  /** Céntimos; sin monto, el QR es estático (el pagador lo escribe). */
  monto: number | null;
  referencia: string;
}

export function payloadQr(d: DatosQr): string {
  const cuerpo =
    tlv('00', '01') +
    tlv('01', d.monto === null ? '11' : '12') +
    tlv('26', tlv('00', 'PE.CHASQUI.SIM') + tlv('01', d.celular)) +
    tlv('52', '0000') +
    tlv('53', '604') +
    (d.monto === null ? '' : tlv('54', (d.monto / 100).toFixed(2))) +
    tlv('58', 'PE') +
    tlv('59', d.titular.slice(0, 25)) +
    tlv('60', 'LIMA') +
    tlv('62', tlv('05', d.referencia.slice(0, 25)));
  const conCrc = `${cuerpo}6304`;
  return conCrc + crc16(conCrc);
}

/** Lee un payload TLV y verifica su CRC. */
export function leerQr(payload: string): { valido: boolean; campos: Record<string, string> } {
  const campos: Record<string, string> = {};
  let i = 0;
  while (i + 4 <= payload.length) {
    const id = payload.slice(i, i + 2);
    const largo = Number(payload.slice(i + 2, i + 4));
    campos[id] = payload.slice(i + 4, i + 4 + largo);
    i += 4 + largo;
  }
  const valido = payload.length > 4 && crc16(payload.slice(0, -4)) === payload.slice(-4);
  return { valido, campos };
}
