// ARCHIVO GENERADO por scripts/generar.mjs — no editar a mano.
// Fuente: paquete de validación SFS/OSE de SUNAT (ver docs/fuentes.md §1). SHA-256 por archivo abajo.

/** Catálogo N.° 10: Tipo de nota de débito. Fuente: cat_10.xml (sha256 d506a8fb8fdf84e39cfc07f4e753bb2d3c4b4e70b401b1032f7e945e408f46bb). */
export const catalogo10 = {
  "11": {
    "nombre": "Ajustes de operaciones de exportación"
  },
  "12": {
    "nombre": "Ajustes afectos al IVAP"
  },
  "01": {
    "nombre": "Intereses por mora"
  },
  "02": {
    "nombre": "Aumento en el valor"
  },
  "03": {
    "nombre": "Penalidades/ otros conceptos"
  }
} as const;

/** Catálogo N.° 12: Documentos relacionados tributarios. Fuente: cat_12.xml (sha256 074b7abc6c94b971f8e084b53c48120828e1c2f148a5f8a5f1c6ca161123118c). */
export const catalogo12 = {
  "10": {
    "nombre": "Liquidación de compra - emitida por anticipos"
  },
  "99": {
    "nombre": "Otros"
  },
  "01": {
    "nombre": "Factura – emitida para corregir error en el RUC"
  },
  "02": {
    "nombre": "Factura – emitida por anticipos"
  },
  "03": {
    "nombre": "Boleta de Venta – emitida por anticipos"
  },
  "04": {
    "nombre": "Ticket de Salida - ENAPU"
  },
  "05": {
    "nombre": "Código SCOP"
  },
  "06": {
    "nombre": "Factura electrónica remitente"
  },
  "07": {
    "nombre": "Guia de remisión remitente"
  },
  "08": {
    "nombre": "Declaración de salida del depósito franco"
  },
  "09": {
    "nombre": "Declaración simplificada de importación"
  }
} as const;

/** Catálogo N.° 16: Tipo de precio de venta unitario. Fuente: cat_16.xml (sha256 56a62abec5ea264706ab3b9848a486c2b0392849d1de739293b958e038aaeee9). */
export const catalogo16 = {
  "01": {
    "nombre": "Precio unitario (incluye el IGV)"
  },
  "02": {
    "nombre": "Valor referencial unitario en operaciones no onerosas"
  }
} as const;

/** Catálogo N.° 19: Código de estado del ítem (resumen diario). Fuente: cat_19.xml (sha256 d845291fe7914087ed3db68ba11f51d51939db054a5ac248b348352b7a4f6db4). */
export const catalogo19 = {
  "1": {
    "nombre": "adicionar"
  },
  "2": {
    "nombre": "Modificar"
  },
  "3": {
    "nombre": "Anular"
  }
} as const;

/** Catálogo N.° 51: Tipo de operación. Fuente: cat_51.xml (sha256 22ed4cbe35e78ca96ba4ab2d575d6f3df593f7909980cdcaef1da15a831f69c1). */
export const catalogo51 = {
  "1001": {
    "nombre": "Operación Sujeta a Detracción",
    "factura": "1",
    "boleta": "1"
  },
  "1002": {
    "nombre": "Operación Sujeta a Detracción- Recursos Hidrobiológicos",
    "factura": "1",
    "boleta": "1"
  },
  "1003": {
    "nombre": "Operación Sujeta a Detracción- Servicios de Transporte Pasajeros",
    "factura": "1",
    "boleta": "1"
  },
  "1004": {
    "nombre": "Operación Sujeta a Detracción- Servicios de Transporte Carga",
    "factura": "1",
    "boleta": "1"
  },
  "2001": {
    "nombre": "Operación Sujeta a Percepción",
    "factura": "1",
    "boleta": "1"
  },
  "2100": {
    "nombre": "Créditos a empresas",
    "factura": "1",
    "boleta": "1"
  },
  "2101": {
    "nombre": "Créditos de consumo revolvente",
    "factura": "1",
    "boleta": "1"
  },
  "2102": {
    "nombre": "Créditos de consumo no revolvente",
    "factura": "1",
    "boleta": "1"
  },
  "2103": {
    "nombre": "Otras operaciones no gravadas - empresas del sistema financiero",
    "factura": "1",
    "boleta": "1"
  },
  "2104": {
    "nombre": "Otras operaciones no gravadas - empresas del sistema de seguros",
    "factura": "1",
    "boleta": "1"
  },
  "2105": {
    "nombre": "Comprobante emitido por AFP",
    "factura": "0",
    "boleta": "1"
  },
  "0101": {
    "nombre": "Venta interna",
    "factura": "1",
    "boleta": "1"
  },
  "0112": {
    "nombre": "Venta Interna - Sustenta Gastos Deducibles Persona Natural",
    "factura": "1",
    "boleta": "0"
  },
  "0113": {
    "nombre": "Venta Interna - NRUS",
    "factura": "0",
    "boleta": "1"
  },
  "0200": {
    "nombre": "Exportación de Bienes",
    "factura": "1",
    "boleta": "1"
  },
  "0201": {
    "nombre": "Exportación de Servicios – Prestación servicios realizados íntegramente en el país",
    "factura": "1",
    "boleta": "1"
  },
  "0202": {
    "nombre": "Exportación de Servicios – Prestación de servicios de hospedaje No Domiciliado",
    "factura": "1",
    "boleta": "0"
  },
  "0203": {
    "nombre": "Exportación de Servicios – Transporte de navieras",
    "factura": "1",
    "boleta": "1"
  },
  "0204": {
    "nombre": "Exportación de Servicios – Servicios  a naves y aeronaves de bandera extranjera",
    "factura": "1",
    "boleta": "1"
  },
  "0205": {
    "nombre": "Exportación de Servicios  - Servicios que conformen un Paquete Turístico",
    "factura": "1",
    "boleta": "0"
  },
  "0206": {
    "nombre": "Exportación de Servicios – Servicios complementarios al transporte de carga",
    "factura": "1",
    "boleta": "1"
  },
  "0207": {
    "nombre": "Exportación de Servicios – Suministro de energía eléctrica a favor de sujetos domiciliados en ZED",
    "factura": "1",
    "boleta": "1"
  },
  "0208": {
    "nombre": "Exportación de Servicios – Prestación servicios realizados parcialmente en el extranjero",
    "factura": "1",
    "boleta": "1"
  },
  "0301": {
    "nombre": "Operaciones con Carta de porte aéreo (emitidas en el ámbito nacional)",
    "factura": "1",
    "boleta": "1"
  },
  "0302": {
    "nombre": "Operaciones de Transporte ferroviario de pasajeros",
    "factura": "1",
    "boleta": "1"
  },
  "0303": {
    "nombre": "Operaciones de Pago de regalía petrolera",
    "factura": "0",
    "boleta": "0"
  },
  "0401": {
    "nombre": "Ventas no domiciliados que no califican como exportacion",
    "factura": "1",
    "boleta": "1"
  },
  "0501": {
    "nombre": "Compra interna",
    "factura": "0",
    "liquidacion": "1"
  },
  "0502": {
    "nombre": "Anticipos",
    "factura": "0",
    "liquidacion": "1"
  },
  "0503": {
    "nombre": "Compra de oro",
    "factura": "0",
    "liquidacion": "1"
  }
} as const;

/** Catálogo N.° 01: Tipo de documento. Fuente: cat_01.xml (sha256 cab862f87c881a2bed42304912ea99064ad318699997d4bbed1384b894159c59). */
export const catalogo01 = {
  "11": {
    "nombre": "Póliza emitida por las Bolsas de Valores"
  },
  "12": {
    "nombre": "Ticket de máquina registradora"
  },
  "13": {
    "nombre": "Documento emitido por bancos, instituciones financieras, crediticias y de seguros que se encuentren bajo el control de la Superintendencia de Banca y Seguros"
  },
  "14": {
    "nombre": "Recibo servicios públicos"
  },
  "15": {
    "nombre": "Boletos emitidos por el servicio de transporte terrestre regular urbano de pasajeros y el ferroviario público de pasajeros prestado en vía férrea local"
  },
  "16": {
    "nombre": "Boleto de viaje emitido por las empresas de transporte público interprovincial de pasajeros"
  },
  "18": {
    "nombre": "Documentos emitidos por las AFP"
  },
  "19": {
    "nombre": "Boleto por atracciones y espectáculos públicos"
  },
  "20": {
    "nombre": "Comprobante de retención"
  },
  "21": {
    "nombre": "Conocimiento de embarque por el servicio de transporte de carga marítima"
  },
  "23": {
    "nombre": "Pólizas de Adjudicación por remate o adjudicación de bienes"
  },
  "24": {
    "nombre": "Certificado de pago de regalías emitidas por PERUPETRO S.A."
  },
  "28": {
    "nombre": "Etiquetas por el pago de la Tarifa Unificada de Uso de Aeropuerto – TUUA"
  },
  "29": {
    "nombre": "Documentos emitidos por la COFOPRI"
  },
  "30": {
    "nombre": "Documentos emitidos por las empresas que desempeñan el rol adquirente en los sistemas de pago mediante tarjetas de crédito y débito, emitidas por bancos e instituciones financieras o crediticias, domiciliados o no en el país"
  },
  "31": {
    "nombre": "Guía de remisión transportista"
  },
  "32": {
    "nombre": "Documentos emitidos por recaudadoras de la Garantía de Red Principal"
  },
  "34": {
    "nombre": "Documento del Operador"
  },
  "35": {
    "nombre": "Documento del Partícipe"
  },
  "36": {
    "nombre": "Recibo de Distribución de Gas Natural"
  },
  "37": {
    "nombre": "Documentos que emitan los concesionarios del servicio de revisiones técnicas"
  },
  "40": {
    "nombre": "Comprobante de Percepción"
  },
  "41": {
    "nombre": "Comprobante de Percepción – Venta interna ( físico - formato impreso)"
  },
  "42": {
    "nombre": "Documentos emitidos por los adq. en los sistemas de pago por tarj. de crédito emitidas por ellas mismas"
  },
  "43": {
    "nombre": "Boleto de compañías de aviación transporte aéreo no regular"
  },
  "45": {
    "nombre": "Documentos emitidos por centros educativos y culturales, universidades, asociaciones y fundaciones"
  },
  "55": {
    "nombre": "BVME para transporte ferroviario de pasajeros"
  },
  "56": {
    "nombre": "Comprobante de pago SEAE"
  },
  "71": {
    "nombre": "Guía de remisión remitente complementaria"
  },
  "72": {
    "nombre": "Guía de remisión transportista complementaria"
  },
  "87": {
    "nombre": "Nota de crédito especial"
  },
  "88": {
    "nombre": "Nota de débito especial"
  },
  "01": {
    "nombre": "Factura"
  },
  "03": {
    "nombre": "Boleta de venta"
  },
  "04": {
    "nombre": "Liquidación de compra"
  },
  "05": {
    "nombre": "Boletos de Transporte Aéreo que emiten las Compañías de Aviación Comercial por el servicio de transporte aéreo regular de pasajeros, emitido de manera manual, mecanizada o por medios electrónicos (BME)"
  },
  "06": {
    "nombre": "Carta de porte aéreo"
  },
  "07": {
    "nombre": "Nota de crédito"
  },
  "08": {
    "nombre": "Nota de débito"
  },
  "09": {
    "nombre": "Guía de remisión remitente"
  },
  "RC": {
    "nombre": "Resumen diario"
  },
  "RA": {
    "nombre": "Comunicación de baja"
  },
  "RR": {
    "nombre": "Resumen de reversión"
  }
} as const;

/** Catálogo N.° 02: Monedas (ISO 4217). Fuente: cat_02.xml (sha256 ecc998584480074af3bddeecea30838de6e5998461a4cc1bbfeb2d0c334244a6). */
export const catalogo02 = {
  "AFN": {
    "nombre": "Afghani"
  },
  "EUR": {
    "nombre": "Euro"
  },
  "ALL": {
    "nombre": "Lek"
  },
  "DZD": {
    "nombre": "Algerian Dinar"
  },
  "USD": {
    "nombre": "US Dollar"
  },
  "AOA": {
    "nombre": "Kwanza"
  },
  "XCD": {
    "nombre": "East Caribbean Dollar"
  },
  "ARS": {
    "nombre": "Argentine Peso"
  },
  "AMD": {
    "nombre": "Armenian Dram"
  },
  "AWG": {
    "nombre": "Aruban Florin"
  },
  "AUD": {
    "nombre": "Australian Dollar"
  },
  "AZN": {
    "nombre": "Azerbaijan Manat"
  },
  "BSD": {
    "nombre": "Bahamian Dollar"
  },
  "BHD": {
    "nombre": "Bahraini Dinar"
  },
  "BDT": {
    "nombre": "Taka"
  },
  "BBD": {
    "nombre": "Barbados Dollar"
  },
  "BYN": {
    "nombre": "Belarusian Ruble"
  },
  "BZD": {
    "nombre": "Belize Dollar"
  },
  "XOF": {
    "nombre": "CFA Franc BCEAO"
  },
  "BMD": {
    "nombre": "Bermudian Dollar"
  },
  "INR": {
    "nombre": "Indian Rupee"
  },
  "BTN": {
    "nombre": "Ngultrum"
  },
  "BOB": {
    "nombre": "Boliviano"
  },
  "BOV": {
    "nombre": "Mvdol"
  },
  "BAM": {
    "nombre": "Convertible Mark"
  },
  "BWP": {
    "nombre": "Pula"
  },
  "NOK": {
    "nombre": "Norwegian Krone"
  },
  "BRL": {
    "nombre": "Brazilian Real"
  },
  "BND": {
    "nombre": "Brunei Dollar"
  },
  "BGN": {
    "nombre": "Bulgarian Lev"
  },
  "BIF": {
    "nombre": "Burundi Franc"
  },
  "CVE": {
    "nombre": "Cabo Verde Escudo"
  },
  "KHR": {
    "nombre": "Riel"
  },
  "XAF": {
    "nombre": "CFA Franc BEAC"
  },
  "CAD": {
    "nombre": "Canadian Dollar"
  },
  "KYD": {
    "nombre": "Cayman Islands Dollar"
  },
  "CLP": {
    "nombre": "Chilean Peso"
  },
  "CLF": {
    "nombre": "Unidad de Fomento"
  },
  "CNY": {
    "nombre": "Yuan Renminbi"
  },
  "COP": {
    "nombre": "Colombian Peso"
  },
  "COU": {
    "nombre": "Unidad de Valor Real"
  },
  "KMF": {
    "nombre": "Comorian Franc"
  },
  "CDF": {
    "nombre": "Congolese Franc"
  },
  "NZD": {
    "nombre": "New Zealand Dollar"
  },
  "CRC": {
    "nombre": "Costa Rican Colon"
  },
  "HRK": {
    "nombre": "Kuna"
  },
  "CUP": {
    "nombre": "Cuban Peso"
  },
  "CUC": {
    "nombre": "Peso Convertible"
  },
  "ANG": {
    "nombre": "Netherlands Antillean Guilder"
  },
  "CZK": {
    "nombre": "Czech Koruna"
  },
  "DKK": {
    "nombre": "Danish Krone"
  },
  "DJF": {
    "nombre": "Djibouti Franc"
  },
  "DOP": {
    "nombre": "Dominican Peso"
  },
  "EGP": {
    "nombre": "Egyptian Pound"
  },
  "SVC": {
    "nombre": "El Salvador Colon"
  },
  "ERN": {
    "nombre": "Nakfa"
  },
  "ETB": {
    "nombre": "Ethiopian Birr"
  },
  "FKP": {
    "nombre": "Falkland Islands Pound"
  },
  "FJD": {
    "nombre": "Fiji Dollar"
  },
  "XPF": {
    "nombre": "CFP Franc"
  },
  "GMD": {
    "nombre": "Dalasi"
  },
  "GEL": {
    "nombre": "Lari"
  },
  "GHS": {
    "nombre": "Ghana Cedi"
  },
  "GIP": {
    "nombre": "Gibraltar Pound"
  },
  "GTQ": {
    "nombre": "Quetzal"
  },
  "GBP": {
    "nombre": "Pound Sterling"
  },
  "GNF": {
    "nombre": "Guinean Franc"
  },
  "GYD": {
    "nombre": "Guyana Dollar"
  },
  "HTG": {
    "nombre": "Gourde"
  },
  "HNL": {
    "nombre": "Lempira"
  },
  "HKD": {
    "nombre": "Hong Kong Dollar"
  },
  "HUF": {
    "nombre": "Forint"
  },
  "ISK": {
    "nombre": "Iceland Krona"
  },
  "IDR": {
    "nombre": "Rupiah"
  },
  "XDR": {
    "nombre": "SDR (Special Drawing Right)"
  },
  "IRR": {
    "nombre": "Iranian Rial"
  },
  "IQD": {
    "nombre": "Iraqi Dinar"
  },
  "ILS": {
    "nombre": "New Israeli Sheqel"
  },
  "JMD": {
    "nombre": "Jamaican Dollar"
  },
  "JPY": {
    "nombre": "Yen"
  },
  "JOD": {
    "nombre": "Jordanian Dinar"
  },
  "KZT": {
    "nombre": "Tenge"
  },
  "KES": {
    "nombre": "Kenyan Shilling"
  },
  "KPW": {
    "nombre": "North Korean Won"
  },
  "KRW": {
    "nombre": "Won"
  },
  "KWD": {
    "nombre": "Kuwaiti Dinar"
  },
  "KGS": {
    "nombre": "Som"
  },
  "LAK": {
    "nombre": "Lao Kip"
  },
  "LBP": {
    "nombre": "Lebanese Pound"
  },
  "LSL": {
    "nombre": "Loti"
  },
  "ZAR": {
    "nombre": "Rand"
  },
  "LRD": {
    "nombre": "Liberian Dollar"
  },
  "LYD": {
    "nombre": "Libyan Dinar"
  },
  "CHF": {
    "nombre": "Swiss Franc"
  },
  "MOP": {
    "nombre": "Pataca"
  },
  "MKD": {
    "nombre": "Denar"
  },
  "MGA": {
    "nombre": "Malagasy Ariary"
  },
  "MWK": {
    "nombre": "Malawi Kwacha"
  },
  "MYR": {
    "nombre": "Malaysian Ringgit"
  },
  "MVR": {
    "nombre": "Rufiyaa"
  },
  "MRU": {
    "nombre": "Ouguiya"
  },
  "MUR": {
    "nombre": "Mauritius Rupee"
  },
  "XUA": {
    "nombre": "ADB Unit of Account"
  },
  "MXN": {
    "nombre": "Mexican Peso"
  },
  "MXV": {
    "nombre": "Mexican Unidad de Inversion (UDI)"
  },
  "MDL": {
    "nombre": "Moldovan Leu"
  },
  "MNT": {
    "nombre": "Tugrik"
  },
  "MAD": {
    "nombre": "Moroccan Dirham"
  },
  "MZN": {
    "nombre": "Mozambique Metical"
  },
  "MMK": {
    "nombre": "Kyat"
  },
  "NAD": {
    "nombre": "Namibia Dollar"
  },
  "NPR": {
    "nombre": "Nepalese Rupee"
  },
  "NIO": {
    "nombre": "Cordoba Oro"
  },
  "NGN": {
    "nombre": "Naira"
  },
  "OMR": {
    "nombre": "Rial Omani"
  },
  "PKR": {
    "nombre": "Pakistan Rupee"
  },
  "PAB": {
    "nombre": "Balboa"
  },
  "PGK": {
    "nombre": "Kina"
  },
  "PYG": {
    "nombre": "Guarani"
  },
  "PEN": {
    "nombre": "Sol"
  },
  "PHP": {
    "nombre": "Philippine Piso"
  },
  "PLN": {
    "nombre": "Zloty"
  },
  "QAR": {
    "nombre": "Qatari Rial"
  },
  "RON": {
    "nombre": "Romanian Leu"
  },
  "RUB": {
    "nombre": "Russian Ruble"
  },
  "RWF": {
    "nombre": "Rwanda Franc"
  },
  "SHP": {
    "nombre": "Saint Helena Pound"
  },
  "WST": {
    "nombre": "Tala"
  },
  "STN": {
    "nombre": "Dobra"
  },
  "SAR": {
    "nombre": "Saudi Riyal"
  },
  "RSD": {
    "nombre": "Serbian Dinar"
  },
  "SCR": {
    "nombre": "Seychelles Rupee"
  },
  "SLL": {
    "nombre": "Leone"
  },
  "SGD": {
    "nombre": "Singapore Dollar"
  },
  "XSU": {
    "nombre": "Sucre"
  },
  "SBD": {
    "nombre": "Solomon Islands Dollar"
  },
  "SOS": {
    "nombre": "Somali Shilling"
  },
  "SSP": {
    "nombre": "South Sudanese Pound"
  },
  "LKR": {
    "nombre": "Sri Lanka Rupee"
  },
  "SDG": {
    "nombre": "Sudanese Pound"
  },
  "SRD": {
    "nombre": "Surinam Dollar"
  },
  "SZL": {
    "nombre": "Lilangeni"
  },
  "SEK": {
    "nombre": "Swedish Krona"
  },
  "CHE": {
    "nombre": "WIR Euro"
  },
  "CHW": {
    "nombre": "WIR Franc"
  },
  "SYP": {
    "nombre": "Syrian Pound"
  },
  "TWD": {
    "nombre": "New Taiwan Dollar"
  },
  "TJS": {
    "nombre": "Somoni"
  },
  "TZS": {
    "nombre": "Tanzanian Shilling"
  },
  "THB": {
    "nombre": "Baht"
  },
  "TOP": {
    "nombre": "Pa’anga"
  },
  "TTD": {
    "nombre": "Trinidad and Tobago Dollar"
  },
  "TND": {
    "nombre": "Tunisian Dinar"
  },
  "TRY": {
    "nombre": "Turkish Lira"
  },
  "TMT": {
    "nombre": "Turkmenistan New Manat"
  },
  "UGX": {
    "nombre": "Uganda Shilling"
  },
  "UAH": {
    "nombre": "Hryvnia"
  },
  "AED": {
    "nombre": "UAE Dirham"
  },
  "USN": {
    "nombre": "US Dollar (Next day)"
  },
  "UYU": {
    "nombre": "Peso Uruguayo"
  },
  "UYI": {
    "nombre": "Uruguay Peso en Unidades Indexadas (URUIURUI)"
  },
  "UZS": {
    "nombre": "Uzbekistan Sum"
  },
  "VUV": {
    "nombre": "Vatu"
  },
  "VEF": {
    "nombre": "Bolívar"
  },
  "VND": {
    "nombre": "Dong"
  },
  "YER": {
    "nombre": "Yemeni Rial"
  },
  "ZMW": {
    "nombre": "Zambian Kwacha"
  },
  "ZWL": {
    "nombre": "Zimbabwe Dollar"
  },
  "XBA": {
    "nombre": "Bond Markets Unit European Composite Unit (EURCO)"
  },
  "XBB": {
    "nombre": "Bond Markets Unit European Monetary Unit (E.M.U.-6)"
  },
  "XBC": {
    "nombre": "Bond Markets Unit European Unit of Account 9 (E.U.A.-9)"
  },
  "XBD": {
    "nombre": "Bond Markets Unit European Unit of Account 17 (E.U.A.-17)"
  },
  "XTS": {
    "nombre": "Codes specifically reserved for testing purposes"
  },
  "XXX": {
    "nombre": "The codes assigned for transactions where no currency is involved"
  },
  "XAU": {
    "nombre": "Gold"
  },
  "XPD": {
    "nombre": "Palladium"
  },
  "XPT": {
    "nombre": "Platinum"
  },
  "XAG": {
    "nombre": "Silver"
  }
} as const;

/** Catálogo N.° 03: Unidades de medida (UN/ECE rec 20). Fuente: cat_03.xml (sha256 c8d99b26bde105f62b11a7fff41c2abb3bb3ef77fd5bca0cbe0fb474bd80502c). */
export const catalogo03 = {
  "10": {
    "nombre": "group"
  },
  "11": {
    "nombre": "outfit"
  },
  "13": {
    "nombre": "ration"
  },
  "14": {
    "nombre": "shot"
  },
  "15": {
    "nombre": "stick, military"
  },
  "16": {
    "nombre": "hundred fifteen kg drum"
  },
  "17": {
    "nombre": "hundred lb drum"
  },
  "18": {
    "nombre": "fiftyfive gallon (US) drum"
  },
  "19": {
    "nombre": "tank truck"
  },
  "20": {
    "nombre": "twenty foot container"
  },
  "21": {
    "nombre": "forty foot container"
  },
  "22": {
    "nombre": "decilitre per gram"
  },
  "23": {
    "nombre": "gram per cubic centimetre"
  },
  "24": {
    "nombre": "theoretical pound"
  },
  "25": {
    "nombre": "gram per square centimetre"
  },
  "26": {
    "nombre": "actual ton"
  },
  "27": {
    "nombre": "theoretical ton"
  },
  "28": {
    "nombre": "kilogram per square metre"
  },
  "29": {
    "nombre": "pound per thousand square foot"
  },
  "30": {
    "nombre": "horse power day per air dry metric ton"
  },
  "31": {
    "nombre": "catch weight"
  },
  "32": {
    "nombre": "kilogram per air dry metric ton"
  },
  "33": {
    "nombre": "kilopascal square metre per gram"
  },
  "34": {
    "nombre": "kilopascal per millimetre"
  },
  "35": {
    "nombre": "millilitre per square centimetre second"
  },
  "36": {
    "nombre": "cubic foot per minute per square foot"
  },
  "37": {
    "nombre": "ounce per square foot"
  },
  "38": {
    "nombre": "ounce per square foot per 0,01inch"
  },
  "40": {
    "nombre": "millilitre per second"
  },
  "41": {
    "nombre": "millilitre per minute"
  },
  "43": {
    "nombre": "super bulk bag"
  },
  "44": {
    "nombre": "fivehundred kg bulk bag"
  },
  "45": {
    "nombre": "threehundred kg bulk bag"
  },
  "46": {
    "nombre": "fifty lb bulk bag"
  },
  "47": {
    "nombre": "fifty lb bag"
  },
  "48": {
    "nombre": "bulk car load"
  },
  "53": {
    "nombre": "theoretical kilogram"
  },
  "54": {
    "nombre": "theoretical tonne"
  },
  "56": {
    "nombre": "sitas"
  },
  "57": {
    "nombre": "mesh"
  },
  "58": {
    "nombre": "net kilogram"
  },
  "59": {
    "nombre": "part per million"
  },
  "60": {
    "nombre": "percent weight"
  },
  "61": {
    "nombre": "part per billion (US)"
  },
  "62": {
    "nombre": "percent per 1000 hour"
  },
  "63": {
    "nombre": "failure rate in time"
  },
  "64": {
    "nombre": "pound per square inch, gauge"
  },
  "66": {
    "nombre": "oersted"
  },
  "69": {
    "nombre": "test specific scale"
  },
  "71": {
    "nombre": "volt ampere per pound"
  },
  "72": {
    "nombre": "watt per pound"
  },
  "73": {
    "nombre": "ampere tum per centimetre"
  },
  "74": {
    "nombre": "millipascal"
  },
  "76": {
    "nombre": "gauss"
  },
  "77": {
    "nombre": "milli-inch"
  },
  "78": {
    "nombre": "kilogauss"
  },
  "80": {
    "nombre": "pound per square inch absolute"
  },
  "81": {
    "nombre": "henry"
  },
  "84": {
    "nombre": "kilopound-force per square inch"
  },
  "85": {
    "nombre": "foot pound-force"
  },
  "87": {
    "nombre": "pound per cubic foot"
  },
  "89": {
    "nombre": "poise"
  },
  "90": {
    "nombre": "Saybold universal second"
  },
  "91": {
    "nombre": "stokes"
  },
  "92": {
    "nombre": "calorie per cubic centimetre"
  },
  "93": {
    "nombre": "calorie per gram"
  },
  "94": {
    "nombre": "curl unit"
  },
  "95": {
    "nombre": "twenty thousand gallon (US) tankcar"
  },
  "96": {
    "nombre": "ten thousand gallon (US) tankcar"
  },
  "97": {
    "nombre": "ten kg drum"
  },
  "98": {
    "nombre": "fifteen kg drum"
  },
  "05": {
    "nombre": "lift"
  },
  "06": {
    "nombre": "small spray"
  },
  "08": {
    "nombre": "heat lot"
  },
  "1A": {
    "nombre": "car mile"
  },
  "1B": {
    "nombre": "car count"
  },
  "1C": {
    "nombre": "locomotive count"
  },
  "1D": {
    "nombre": "caboose count"
  },
  "1E": {
    "nombre": "empty car"
  },
  "1F": {
    "nombre": "train mile"
  },
  "1G": {
    "nombre": "fuel usage gallon (US)"
  },
  "1H": {
    "nombre": "caboose mile"
  },
  "1I": {
    "nombre": "fixed rate"
  },
  "1J": {
    "nombre": "ton mile"
  },
  "1K": {
    "nombre": "locomotive mile"
  },
  "1L": {
    "nombre": "total car count"
  },
  "1M": {
    "nombre": "total car mile"
  },
  "1X": {
    "nombre": "quarter mile"
  },
  "2A": {
    "nombre": "radian per second"
  },
  "2B": {
    "nombre": "radian per second squared"
  },
  "2C": {
    "nombre": "roentgen"
  },
  "2G": {
    "nombre": "volt AC"
  },
  "2H": {
    "nombre": "volt DC"
  },
  "2I": {
    "nombre": "British thermal unit (international table) per hour"
  },
  "2J": {
    "nombre": "cubic centimetre per second"
  },
  "2K": {
    "nombre": "cubic foot per hour"
  },
  "2L": {
    "nombre": "cubic foot per minute"
  },
  "2M": {
    "nombre": "centimetre per second"
  },
  "2N": {
    "nombre": "decibel"
  },
  "2P": {
    "nombre": "kilobyte"
  },
  "2Q": {
    "nombre": "kilobecquerel"
  },
  "2R": {
    "nombre": "kilocurie"
  },
  "2U": {
    "nombre": "megagram"
  },
  "2V": {
    "nombre": "megagram per hour"
  },
  "2W": {
    "nombre": "bin"
  },
  "2X": {
    "nombre": "metre per minute"
  },
  "2Y": {
    "nombre": "milliroentgen"
  },
  "2Z": {
    "nombre": "millivolt"
  },
  "3B": {
    "nombre": "megajoule"
  },
  "3C": {
    "nombre": "manmonth"
  },
  "3E": {
    "nombre": "pound per pound of product"
  },
  "3G": {
    "nombre": "pound per piece of product"
  },
  "3H": {
    "nombre": "kilogram per kilogram of product"
  },
  "3I": {
    "nombre": "kilogram per piece of product"
  },
  "4A": {
    "nombre": "bobbin"
  },
  "4B": {
    "nombre": "cap"
  },
  "4C": {
    "nombre": "centistokes"
  },
  "4E": {
    "nombre": "twenty pack"
  },
  "4G": {
    "nombre": "microlitre"
  },
  "4H": {
    "nombre": "micrometre (micron)"
  },
  "4K": {
    "nombre": "milliampere"
  },
  "4L": {
    "nombre": "megabyte"
  },
  "4M": {
    "nombre": "milligram per hour"
  },
  "4N": {
    "nombre": "megabecquerel"
  },
  "4O": {
    "nombre": "microfarad"
  },
  "4P": {
    "nombre": "newton per metre"
  },
  "4Q": {
    "nombre": "ounce inch"
  },
  "4R": {
    "nombre": "ounce foot"
  },
  "4T": {
    "nombre": "picofarad"
  },
  "4U": {
    "nombre": "pound per hour"
  },
  "4W": {
    "nombre": "ton (US) per hour"
  },
  "4X": {
    "nombre": "kilolitre per hour"
  },
  "5A": {
    "nombre": "barrel (US) per minute"
  },
  "5B": {
    "nombre": "batch"
  },
  "5C": {
    "nombre": "gallon(US) per thousand"
  },
  "5E": {
    "nombre": "MMSCF/day"
  },
  "5F": {
    "nombre": "pound per thousand"
  },
  "5G": {
    "nombre": "pump"
  },
  "5H": {
    "nombre": "stage"
  },
  "5I": {
    "nombre": "standard cubic foot"
  },
  "5J": {
    "nombre": "hydraulic horse power"
  },
  "5K": {
    "nombre": "count per minute"
  },
  "5P": {
    "nombre": "seismic level"
  },
  "5Q": {
    "nombre": "seismic line"
  },
  "A10": {
    "nombre": "ampere square metre per joule second"
  },
  "A11": {
    "nombre": "angstrom"
  },
  "A12": {
    "nombre": "astronomical unit"
  },
  "A13": {
    "nombre": "attojoule"
  },
  "A14": {
    "nombre": "barn"
  },
  "A15": {
    "nombre": "barn per electronvolt"
  },
  "A16": {
    "nombre": "barn per steradian electronvolt"
  },
  "A17": {
    "nombre": "barn per steradian"
  },
  "A18": {
    "nombre": "becquerel per kilogram"
  },
  "A19": {
    "nombre": "becquerel per cubic metre"
  },
  "A1": {
    "nombre": "15 у calorie"
  },
  "A20": {
    "nombre": "British thermal unit (international table) per second square foot degree Rankine"
  },
  "A21": {
    "nombre": "British thermal unit (international table) per pound degree Rankine"
  },
  "A22": {
    "nombre": "British thermal unit (international table) per second foot degree Rankine"
  },
  "A23": {
    "nombre": "British thermal unit (international table) per hour square foot degree Rankine"
  },
  "A24": {
    "nombre": "candela per square metre"
  },
  "A25": {
    "nombre": "cheval vapeur"
  },
  "A26": {
    "nombre": "coulomb metre"
  },
  "A27": {
    "nombre": "coulomb metre squared per volt"
  },
  "A28": {
    "nombre": "coulomb per cubic centimetre"
  },
  "A29": {
    "nombre": "coulomb per cubic metre"
  },
  "A2": {
    "nombre": "ampere per centimetre"
  },
  "A30": {
    "nombre": "coulomb per cubic millimetre"
  },
  "A31": {
    "nombre": "coulomb per kilogram second"
  },
  "A32": {
    "nombre": "coulomb per mole"
  },
  "A33": {
    "nombre": "coulomb per square centimetre"
  },
  "A34": {
    "nombre": "coulomb per square metre"
  },
  "A35": {
    "nombre": "coulomb per square millimetre"
  },
  "A36": {
    "nombre": "cubic centimetre per mole"
  },
  "A37": {
    "nombre": "cubic decimetre per mole"
  },
  "A38": {
    "nombre": "cubic metre per coulomb"
  },
  "A39": {
    "nombre": "cubic metre per kilogram"
  },
  "A3": {
    "nombre": "ampere per millimetre"
  },
  "A40": {
    "nombre": "cubic metre per mole"
  },
  "A41": {
    "nombre": "ampere per square metre"
  },
  "A42": {
    "nombre": "curie per kilogram"
  },
  "A43": {
    "nombre": "deadweight tonnage"
  },
  "A44": {
    "nombre": "decalitre"
  },
  "A45": {
    "nombre": "decametre"
  },
  "A47": {
    "nombre": "decitex"
  },
  "A48": {
    "nombre": "degree Rankine"
  },
  "A49": {
    "nombre": "denier"
  },
  "A4": {
    "nombre": "ampere per square centimetre"
  },
  "A50": {
    "nombre": "dyne second per cubic centimetre"
  },
  "A51": {
    "nombre": "dyne second per centimetre"
  },
  "A52": {
    "nombre": "dyne second per centimetre to the fifth power"
  },
  "A53": {
    "nombre": "electronvolt"
  },
  "A54": {
    "nombre": "electronvolt per metre"
  },
  "A55": {
    "nombre": "electronvolt square metre"
  },
  "A56": {
    "nombre": "electronvolt square metre per kilogram"
  },
  "A57": {
    "nombre": "erg"
  },
  "A58": {
    "nombre": "erg per centimetre"
  },
  "A59": {
    "nombre": "8-part cloud cover"
  },
  "A5": {
    "nombre": "ampere square metre"
  },
  "A60": {
    "nombre": "erg per cubic centimetre"
  },
  "A61": {
    "nombre": "erg per gram"
  },
  "A62": {
    "nombre": "erg per gram second"
  },
  "A63": {
    "nombre": "erg per second"
  },
  "A64": {
    "nombre": "erg per second square centimetre"
  },
  "A65": {
    "nombre": "erg per square centimetre second"
  },
  "A66": {
    "nombre": "erg square centimetre"
  },
  "A67": {
    "nombre": "erg square centimetre per gram"
  },
  "A68": {
    "nombre": "exajoule"
  },
  "A69": {
    "nombre": "farad per metre"
  },
  "A6": {
    "nombre": "ampere per square metre kelvin squared"
  },
  "A70": {
    "nombre": "femtojoule"
  },
  "A71": {
    "nombre": "femtometre"
  },
  "A73": {
    "nombre": "foot per second squared"
  },
  "A74": {
    "nombre": "foot pound-force per second"
  },
  "A75": {
    "nombre": "freight ton"
  },
  "A76": {
    "nombre": "gal"
  },
  "A77": {
    "nombre": "Gaussian CGS (Centimetre-Gram-Second system) unit of displacement"
  },
  "A78": {
    "nombre": "Gaussian CGS (Centimetre-Gram-Second system) unit of electric current"
  },
  "A79": {
    "nombre": "Gaussian CGS (Centimetre-Gram-Second system) unit of electric charge"
  },
  "A7": {
    "nombre": "ampere per square millimetre"
  },
  "A80": {
    "nombre": "Gaussian CGS (Centimetre-Gram-Second system) unit of electric field strength"
  },
  "A81": {
    "nombre": "Gaussian CGS (Centimetre-Gram-Second system) unit of electric polarization"
  },
  "A82": {
    "nombre": "Gaussian CGS (Centimetre-Gram-Second system) unit of electric potential"
  },
  "A83": {
    "nombre": "Gaussian CGS (Centimetre-Gram-Second system) unit of magnetization"
  },
  "A84": {
    "nombre": "gigacoulomb per cubic metre"
  },
  "A85": {
    "nombre": "gigaelectronvolt"
  },
  "A86": {
    "nombre": "gigahertz"
  },
  "A87": {
    "nombre": "gigaohm"
  },
  "A88": {
    "nombre": "gigaohm metre"
  },
  "A89": {
    "nombre": "gigapascal"
  },
  "A8": {
    "nombre": "ampere second"
  },
  "A90": {
    "nombre": "gigawatt"
  },
  "A91": {
    "nombre": "grade"
  },
  "A93": {
    "nombre": "gram per cubic metre"
  },
  "A94": {
    "nombre": "gram per mole"
  },
  "A95": {
    "nombre": "gray"
  },
  "A96": {
    "nombre": "gray per second"
  },
  "A97": {
    "nombre": "hectopascal"
  },
  "A98": {
    "nombre": "henry per metre"
  },
  "A99": {
    "nombre": "bit"
  },
  "A9": {
    "nombre": "rate"
  },
  "AA": {
    "nombre": "ball"
  },
  "AB": {
    "nombre": "bulk pack"
  },
  "ACR": {
    "nombre": "acre"
  },
  "ACT": {
    "nombre": "activity"
  },
  "AD": {
    "nombre": "byte"
  },
  "AE": {
    "nombre": "ampere per metre"
  },
  "AH": {
    "nombre": "additional minute"
  },
  "AI": {
    "nombre": "average minute per call"
  },
  "AJ": {
    "nombre": "cop"
  },
  "AK": {
    "nombre": "fathom"
  },
  "AL": {
    "nombre": "access line"
  },
  "AMH": {
    "nombre": "ampere hour"
  },
  "AMP": {
    "nombre": "ampere"
  },
  "AM": {
    "nombre": "ampoule"
  },
  "ANN": {
    "nombre": "year"
  },
  "APZ": {
    "nombre": "troy ounce or apothecary ounce"
  },
  "AP": {
    "nombre": "aluminium pound only"
  },
  "AQ": {
    "nombre": "anti-hemophilic factor (AHF) unit"
  },
  "ARE": {
    "nombre": "are"
  },
  "AR": {
    "nombre": "suppository"
  },
  "ASM": {
    "nombre": "alcoholic strength by mass"
  },
  "ASU": {
    "nombre": "alcoholic strength by volume"
  },
  "AS": {
    "nombre": "assortment"
  },
  "ATM": {
    "nombre": "standard atmosphere"
  },
  "ATT": {
    "nombre": "technical atmosphere"
  },
  "AV": {
    "nombre": "capsule"
  },
  "AWG": {
    "nombre": "american wire gauge"
  },
  "AW": {
    "nombre": "powder filled vial"
  },
  "AY": {
    "nombre": "assembly"
  },
  "AZ": {
    "nombre": "British thermal unit (international table) per pound"
  },
  "B0": {
    "nombre": "Btu per cubic foot"
  },
  "B10": {
    "nombre": "bit per second"
  },
  "B11": {
    "nombre": "joule per kilogram kelvin"
  },
  "B12": {
    "nombre": "joule per metre"
  },
  "B13": {
    "nombre": "joule per square metre"
  },
  "B14": {
    "nombre": "joule per metre to the fourth power"
  },
  "B15": {
    "nombre": "joule per mole"
  },
  "B16": {
    "nombre": "joule per mole kelvin"
  },
  "B17": {
    "nombre": "credit"
  },
  "B18": {
    "nombre": "joule second"
  },
  "B19": {
    "nombre": "digit"
  },
  "B1": {
    "nombre": "barrel (US) per day"
  },
  "B20": {
    "nombre": "joule square metre per kilogram"
  },
  "B21": {
    "nombre": "kelvin per watt"
  },
  "B22": {
    "nombre": "kiloampere"
  },
  "B23": {
    "nombre": "kiloampere per square metre"
  },
  "B24": {
    "nombre": "kiloampere per metre"
  },
  "B25": {
    "nombre": "kilobecquerel per kilogram"
  },
  "B26": {
    "nombre": "kilocoulomb"
  },
  "B27": {
    "nombre": "kilocoulomb per cubic metre"
  },
  "B28": {
    "nombre": "kilocoulomb per square metre"
  },
  "B29": {
    "nombre": "kiloelectronvolt"
  },
  "B2": {
    "nombre": "bunk"
  },
  "B30": {
    "nombre": "gibibit"
  },
  "B31": {
    "nombre": "kilogram metre per second"
  },
  "B32": {
    "nombre": "kilogram metre squared"
  },
  "B33": {
    "nombre": "kilogram metre squared per second"
  },
  "B34": {
    "nombre": "kilogram per cubic decimetre"
  },
  "B35": {
    "nombre": "kilogram per litre"
  },
  "B36": {
    "nombre": "calorie (thermochemical) per gram"
  },
  "B37": {
    "nombre": "kilogram-force"
  },
  "B38": {
    "nombre": "kilogram-force metre"
  },
  "B39": {
    "nombre": "kilogram-force metre per second"
  },
  "B3": {
    "nombre": "batting pound"
  },
  "B40": {
    "nombre": "kilogram-force per square metre"
  },
  "B41": {
    "nombre": "kilojoule per kelvin"
  },
  "B42": {
    "nombre": "kilojoule per kilogram"
  },
  "B43": {
    "nombre": "kilojoule per kilogram kelvin"
  },
  "B44": {
    "nombre": "kilojoule per mole"
  },
  "B45": {
    "nombre": "kilomole"
  },
  "B46": {
    "nombre": "kilomole per cubic metre"
  },
  "B47": {
    "nombre": "kilonewton"
  },
  "B48": {
    "nombre": "kilonewton metre"
  },
  "B49": {
    "nombre": "kiloohm"
  },
  "B4": {
    "nombre": "barrel, imperial"
  },
  "B50": {
    "nombre": "kiloohm metre"
  },
  "B51": {
    "nombre": "kilopond"
  },
  "B52": {
    "nombre": "kilosecond"
  },
  "B53": {
    "nombre": "kilosiemens"
  },
  "B54": {
    "nombre": "kilosiemens per metre"
  },
  "B55": {
    "nombre": "kilovolt per metre"
  },
  "B56": {
    "nombre": "kiloweber per metre"
  },
  "B57": {
    "nombre": "light year"
  },
  "B58": {
    "nombre": "litre per mole"
  },
  "B59": {
    "nombre": "lumen hour"
  },
  "B5": {
    "nombre": "billet"
  },
  "B60": {
    "nombre": "lumen per square metre"
  },
  "B61": {
    "nombre": "lumen per watt"
  },
  "B62": {
    "nombre": "lumen second"
  },
  "B63": {
    "nombre": "lux hour"
  },
  "B64": {
    "nombre": "lux second"
  },
  "B65": {
    "nombre": "maxwell"
  },
  "B66": {
    "nombre": "megaampere per square metre"
  },
  "B67": {
    "nombre": "megabecquerel per kilogram"
  },
  "B68": {
    "nombre": "gigabit"
  },
  "B69": {
    "nombre": "megacoulomb per cubic metre"
  },
  "B6": {
    "nombre": "bun"
  },
  "B70": {
    "nombre": "megacoulomb per square metre"
  },
  "B71": {
    "nombre": "megaelectronvolt"
  },
  "B72": {
    "nombre": "megagram per cubic metre"
  },
  "B73": {
    "nombre": "meganewton"
  },
  "B74": {
    "nombre": "meganewton metre"
  },
  "B75": {
    "nombre": "megaohm"
  },
  "B76": {
    "nombre": "megaohm metre"
  },
  "B77": {
    "nombre": "megasiemens per metre"
  },
  "B78": {
    "nombre": "megavolt"
  },
  "B79": {
    "nombre": "megavolt per metre"
  },
  "B7": {
    "nombre": "cycle"
  },
  "B80": {
    "nombre": "gigabit per second"
  },
  "B81": {
    "nombre": "reciprocal metre squared reciprocal second"
  },
  "B82": {
    "nombre": "inch per linear foot"
  },
  "B83": {
    "nombre": "metre to the fourth power"
  },
  "B84": {
    "nombre": "microampere"
  },
  "B85": {
    "nombre": "microbar"
  },
  "B86": {
    "nombre": "microcoulomb"
  },
  "B87": {
    "nombre": "microcoulomb per cubic metre"
  },
  "B88": {
    "nombre": "microcoulomb per square metre"
  },
  "B89": {
    "nombre": "microfarad per metre"
  },
  "B8": {
    "nombre": "joule per cubic metre"
  },
  "B90": {
    "nombre": "microhenry"
  },
  "B91": {
    "nombre": "microhenry per metre"
  },
  "B92": {
    "nombre": "micronewton"
  },
  "B93": {
    "nombre": "micronewton metre"
  },
  "B94": {
    "nombre": "microohm"
  },
  "B95": {
    "nombre": "microohm metre"
  },
  "B96": {
    "nombre": "micropascal"
  },
  "B97": {
    "nombre": "microradian"
  },
  "B98": {
    "nombre": "microsecond"
  },
  "B99": {
    "nombre": "microsiemens"
  },
  "B9": {
    "nombre": "batt"
  },
  "BAR": {
    "nombre": "bar [unit of pressure]"
  },
  "BB": {
    "nombre": "base box"
  },
  "BD": {
    "nombre": "board"
  },
  "BE": {
    "nombre": "bundle"
  },
  "BFT": {
    "nombre": "board foot"
  },
  "BG": {
    "nombre": "bag"
  },
  "BHP": {
    "nombre": "brake horse power"
  },
  "BH": {
    "nombre": "brush"
  },
  "BIL": {
    "nombre": "billion (EUR)"
  },
  "BJ": {
    "nombre": "bucket"
  },
  "BK": {
    "nombre": "basket"
  },
  "BLD": {
    "nombre": "dry barrel (US)"
  },
  "BLL": {
    "nombre": "barrel (US)"
  },
  "BL": {
    "nombre": "bale"
  },
  "BO": {
    "nombre": "bottle"
  },
  "BPM": {
    "nombre": "beats per minute"
  },
  "BP": {
    "nombre": "hundred board foot"
  },
  "BQL": {
    "nombre": "becquerel"
  },
  "BR": {
    "nombre": "bar [unit of packaging]"
  },
  "BTU": {
    "nombre": "British thermal unit (international table)"
  },
  "BT": {
    "nombre": "bolt"
  },
  "BUA": {
    "nombre": "bushel (US)"
  },
  "BUI": {
    "nombre": "bushel (UK)"
  },
  "BW": {
    "nombre": "base weight"
  },
  "BX": {
    "nombre": "box"
  },
  "BZ": {
    "nombre": "million BTUs"
  },
  "C0": {
    "nombre": "call"
  },
  "C10": {
    "nombre": "millifarad"
  },
  "C11": {
    "nombre": "milligal"
  },
  "C12": {
    "nombre": "milligram per metre"
  },
  "C13": {
    "nombre": "milligray"
  },
  "C14": {
    "nombre": "millihenry"
  },
  "C15": {
    "nombre": "millijoule"
  },
  "C16": {
    "nombre": "millimetre per second"
  },
  "C17": {
    "nombre": "millimetre squared per second"
  },
  "C18": {
    "nombre": "millimole"
  },
  "C19": {
    "nombre": "mole per kilogram"
  },
  "C1": {
    "nombre": "composite product pound (total weight)"
  },
  "C20": {
    "nombre": "millinewton"
  },
  "C21": {
    "nombre": "kibibit"
  },
  "C22": {
    "nombre": "millinewton per metre"
  },
  "C23": {
    "nombre": "milliohm metre"
  },
  "C24": {
    "nombre": "millipascal second"
  },
  "C25": {
    "nombre": "milliradian"
  },
  "C26": {
    "nombre": "millisecond"
  },
  "C27": {
    "nombre": "millisiemens"
  },
  "C28": {
    "nombre": "millisievert"
  },
  "C29": {
    "nombre": "millitesla"
  },
  "C2": {
    "nombre": "carset"
  },
  "C30": {
    "nombre": "millivolt per metre"
  },
  "C31": {
    "nombre": "milliwatt"
  },
  "C32": {
    "nombre": "milliwatt per square metre"
  },
  "C33": {
    "nombre": "milliweber"
  },
  "C34": {
    "nombre": "mole"
  },
  "C35": {
    "nombre": "mole per cubic decimetre"
  },
  "C36": {
    "nombre": "mole per cubic metre"
  },
  "C37": {
    "nombre": "kilobit"
  },
  "C38": {
    "nombre": "mole per litre"
  },
  "C39": {
    "nombre": "nanoampere"
  },
  "C3": {
    "nombre": "microvolt per metre"
  },
  "C40": {
    "nombre": "nanocoulomb"
  },
  "C41": {
    "nombre": "nanofarad"
  },
  "C42": {
    "nombre": "nanofarad per metre"
  },
  "C43": {
    "nombre": "nanohenry"
  },
  "C44": {
    "nombre": "nanohenry per metre"
  },
  "C45": {
    "nombre": "nanometre"
  },
  "C46": {
    "nombre": "nanoohm metre"
  },
  "C47": {
    "nombre": "nanosecond"
  },
  "C48": {
    "nombre": "nanotesla"
  },
  "C49": {
    "nombre": "nanowatt"
  },
  "C4": {
    "nombre": "carload"
  },
  "C50": {
    "nombre": "neper"
  },
  "C51": {
    "nombre": "neper per second"
  },
  "C52": {
    "nombre": "picometre"
  },
  "C53": {
    "nombre": "newton metre second"
  },
  "C54": {
    "nombre": "newton metre squared per kilogram squared"
  },
  "C55": {
    "nombre": "newton per square metre"
  },
  "C56": {
    "nombre": "newton per square millimetre"
  },
  "C57": {
    "nombre": "newton second"
  },
  "C58": {
    "nombre": "newton second per metre"
  },
  "C59": {
    "nombre": "octave"
  },
  "C5": {
    "nombre": "cost"
  },
  "C60": {
    "nombre": "ohm centimetre"
  },
  "C61": {
    "nombre": "ohm metre"
  },
  "C62": {
    "nombre": "one"
  },
  "C63": {
    "nombre": "parsec"
  },
  "C64": {
    "nombre": "pascal per kelvin"
  },
  "C65": {
    "nombre": "pascal second"
  },
  "C66": {
    "nombre": "pascal second per cubic metre"
  },
  "C67": {
    "nombre": "pascal second per metre"
  },
  "C68": {
    "nombre": "petajoule"
  },
  "C69": {
    "nombre": "phon"
  },
  "C6": {
    "nombre": "cell"
  },
  "C70": {
    "nombre": "picoampere"
  },
  "C71": {
    "nombre": "picocoulomb"
  },
  "C72": {
    "nombre": "picofarad per metre"
  },
  "C73": {
    "nombre": "picohenry"
  },
  "C74": {
    "nombre": "kilobit per second"
  },
  "C75": {
    "nombre": "picowatt"
  },
  "C76": {
    "nombre": "picowatt per square metre"
  },
  "C77": {
    "nombre": "pound gage"
  },
  "C78": {
    "nombre": "pound-force"
  },
  "C79": {
    "nombre": "kilovolt ampere hour"
  },
  "C7": {
    "nombre": "centipoise"
  },
  "C80": {
    "nombre": "rad"
  },
  "C81": {
    "nombre": "radian"
  },
  "C82": {
    "nombre": "radian square metre per mole"
  },
  "C83": {
    "nombre": "radian square metre per kilogram"
  },
  "C84": {
    "nombre": "radian per metre"
  },
  "C85": {
    "nombre": "reciprocal angstrom"
  },
  "C86": {
    "nombre": "reciprocal cubic metre"
  },
  "C87": {
    "nombre": "reciprocal cubic metre per second"
  },
  "C88": {
    "nombre": "reciprocal electron volt per cubic metre"
  },
  "C89": {
    "nombre": "reciprocal henry"
  },
  "C8": {
    "nombre": "millicoulomb per kilogram"
  },
  "C90": {
    "nombre": "reciprocal joule per cubic metre"
  },
  "C91": {
    "nombre": "reciprocal kelvin or kelvin to the power minus one"
  },
  "C92": {
    "nombre": "reciprocal metre"
  },
  "C93": {
    "nombre": "reciprocal square metre"
  },
  "C94": {
    "nombre": "reciprocal minute"
  },
  "C95": {
    "nombre": "reciprocal mole"
  },
  "C96": {
    "nombre": "reciprocal pascal or pascal to the power minus one"
  },
  "C97": {
    "nombre": "reciprocal second"
  },
  "C98": {
    "nombre": "reciprocal second per cubic metre"
  },
  "C99": {
    "nombre": "reciprocal second per metre squared"
  },
  "C9": {
    "nombre": "coil group"
  },
  "CA": {
    "nombre": "can"
  },
  "CCT": {
    "nombre": "carrying capacity in metric ton"
  },
  "CDL": {
    "nombre": "candela"
  },
  "CEL": {
    "nombre": "degree Celsius"
  },
  "CEN": {
    "nombre": "hundred"
  },
  "CGM": {
    "nombre": "centigram"
  },
  "CG": {
    "nombre": "card"
  },
  "CH": {
    "nombre": "container"
  },
  "CJ": {
    "nombre": "cone"
  },
  "CKG": {
    "nombre": "coulomb per kilogram"
  },
  "CK": {
    "nombre": "connector"
  },
  "CLF": {
    "nombre": "hundred leave"
  },
  "CLT": {
    "nombre": "centilitre"
  },
  "CL": {
    "nombre": "coil"
  },
  "CMK": {
    "nombre": "square centimetre"
  },
  "CMQ": {
    "nombre": "cubic centimetre"
  },
  "CMT": {
    "nombre": "centimetre"
  },
  "CNP": {
    "nombre": "hundred pack"
  },
  "CNT": {
    "nombre": "cental (UK)"
  },
  "COU": {
    "nombre": "coulomb"
  },
  "CO": {
    "nombre": "carboy"
  },
  "CQ": {
    "nombre": "cartridge"
  },
  "CR": {
    "nombre": "crate"
  },
  "CS": {
    "nombre": "case"
  },
  "CTG": {
    "nombre": "content gram"
  },
  "CTM": {
    "nombre": "metric carat"
  },
  "CTN": {
    "nombre": "content ton (metric)"
  },
  "CT": {
    "nombre": "carton"
  },
  "CUR": {
    "nombre": "curie"
  },
  "CU": {
    "nombre": "cup"
  },
  "CV": {
    "nombre": "cover"
  },
  "CWA": {
    "nombre": "hundred pound (cwt) / hundred weight (US)"
  },
  "CWI": {
    "nombre": "hundred weight (UK)"
  },
  "CY": {
    "nombre": "cylinder"
  },
  "CZ": {
    "nombre": "combo"
  },
  "Code": {
    "nombre": "Name"
  },
  "D03": {
    "nombre": "kilowatt hour per hour"
  },
  "D04": {
    "nombre": "lot  [unit of weight]"
  },
  "D10": {
    "nombre": "siemens per metre"
  },
  "D11": {
    "nombre": "mebibit"
  },
  "D12": {
    "nombre": "siemens square metre per mole"
  },
  "D13": {
    "nombre": "sievert"
  },
  "D14": {
    "nombre": "thousand linear yard"
  },
  "D15": {
    "nombre": "sone"
  },
  "D16": {
    "nombre": "square centimetre per erg"
  },
  "D17": {
    "nombre": "square centimetre per steradian erg"
  },
  "D18": {
    "nombre": "metre kelvin"
  },
  "D19": {
    "nombre": "square metre kelvin per watt"
  },
  "D1": {
    "nombre": "reciprocal second per steradian"
  },
  "D20": {
    "nombre": "square metre per joule"
  },
  "D21": {
    "nombre": "square metre per kilogram"
  },
  "D22": {
    "nombre": "square metre per mole"
  },
  "D23": {
    "nombre": "pen gram (protein)"
  },
  "D24": {
    "nombre": "square metre per steradian"
  },
  "D25": {
    "nombre": "square metre per steradian joule"
  },
  "D26": {
    "nombre": "square metre per volt second"
  },
  "D27": {
    "nombre": "steradian"
  },
  "D28": {
    "nombre": "syphon"
  },
  "D29": {
    "nombre": "terahertz"
  },
  "D2": {
    "nombre": "reciprocal second per steradian metre squared"
  },
  "D30": {
    "nombre": "terajoule"
  },
  "D31": {
    "nombre": "terawatt"
  },
  "D32": {
    "nombre": "terawatt hour"
  },
  "D33": {
    "nombre": "tesla"
  },
  "D34": {
    "nombre": "tex"
  },
  "D35": {
    "nombre": "calorie (thermochemical)"
  },
  "D36": {
    "nombre": "megabit"
  },
  "D37": {
    "nombre": "calorie (thermochemical) per gram kelvin"
  },
  "D38": {
    "nombre": "calorie (thermochemical) per second centimetre kelvin"
  },
  "D39": {
    "nombre": "calorie (thermochemical) per second square centimetre kelvin"
  },
  "D40": {
    "nombre": "thousand litre"
  },
  "D41": {
    "nombre": "tonne per cubic metre"
  },
  "D42": {
    "nombre": "tropical year"
  },
  "D43": {
    "nombre": "unified atomic mass unit"
  },
  "D44": {
    "nombre": "var"
  },
  "D45": {
    "nombre": "volt squared per kelvin squared"
  },
  "D46": {
    "nombre": "volt - ampere"
  },
  "D47": {
    "nombre": "volt per centimetre"
  },
  "D48": {
    "nombre": "volt per kelvin"
  },
  "D49": {
    "nombre": "millivolt per kelvin"
  },
  "D50": {
    "nombre": "volt per metre"
  },
  "D51": {
    "nombre": "volt per millimetre"
  },
  "D52": {
    "nombre": "watt per kelvin"
  },
  "D53": {
    "nombre": "watt per metre kelvin"
  },
  "D54": {
    "nombre": "watt per square metre"
  },
  "D55": {
    "nombre": "watt per square metre kelvin"
  },
  "D56": {
    "nombre": "watt per square metre kelvin to the fourth power"
  },
  "D57": {
    "nombre": "watt per steradian"
  },
  "D58": {
    "nombre": "watt per steradian square metre"
  },
  "D59": {
    "nombre": "weber per metre"
  },
  "D5": {
    "nombre": "kilogram per square centimetre"
  },
  "D60": {
    "nombre": "weber per millimetre"
  },
  "D61": {
    "nombre": "minute [unit of angle]"
  },
  "D62": {
    "nombre": "second [unit of angle]"
  },
  "D63": {
    "nombre": "book"
  },
  "D64": {
    "nombre": "block"
  },
  "D65": {
    "nombre": "round"
  },
  "D66": {
    "nombre": "cassette"
  },
  "D67": {
    "nombre": "dollar per hour"
  },
  "D68": {
    "nombre": "number of words"
  },
  "D69": {
    "nombre": "inch to the fourth power"
  },
  "D6": {
    "nombre": "roentgen per second"
  },
  "D70": {
    "nombre": "calorie (international table)"
  },
  "D71": {
    "nombre": "calorie (international table) per second centimetre kelvin"
  },
  "D72": {
    "nombre": "calorie (international table) per second square centimetre kelvin"
  },
  "D73": {
    "nombre": "joule square metre"
  },
  "D74": {
    "nombre": "kilogram per mole"
  },
  "D75": {
    "nombre": "calorie (international table) per gram"
  },
  "D76": {
    "nombre": "calorie (international table) per gram kelvin"
  },
  "D77": {
    "nombre": "megacoulomb"
  },
  "D78": {
    "nombre": "megajoule per second"
  },
  "D79": {
    "nombre": "beam"
  },
  "D7": {
    "nombre": "sandwich"
  },
  "D80": {
    "nombre": "microwatt"
  },
  "D81": {
    "nombre": "microtesla"
  },
  "D82": {
    "nombre": "microvolt"
  },
  "D83": {
    "nombre": "millinewton metre"
  },
  "D85": {
    "nombre": "microwatt per square metre"
  },
  "D86": {
    "nombre": "millicoulomb"
  },
  "D87": {
    "nombre": "millimole per kilogram"
  },
  "D88": {
    "nombre": "millicoulomb per cubic metre"
  },
  "D89": {
    "nombre": "millicoulomb per square metre"
  },
  "D8": {
    "nombre": "draize score"
  },
  "D90": {
    "nombre": "cubic metre (net)"
  },
  "D91": {
    "nombre": "rem"
  },
  "D92": {
    "nombre": "band"
  },
  "D93": {
    "nombre": "second per cubic metre"
  },
  "D94": {
    "nombre": "second per cubic metre radian"
  },
  "D95": {
    "nombre": "joule per gram"
  },
  "D96": {
    "nombre": "pound gross"
  },
  "D97": {
    "nombre": "pallet/unit load"
  },
  "D98": {
    "nombre": "mass pound"
  },
  "D99": {
    "nombre": "sleeve"
  },
  "D9": {
    "nombre": "dyne per square centimetre"
  },
  "DAA": {
    "nombre": "decare"
  },
  "DAD": {
    "nombre": "ten day"
  },
  "DAY": {
    "nombre": "day"
  },
  "DB": {
    "nombre": "dry pound"
  },
  "DC": {
    "nombre": "disk (disc)"
  },
  "DD": {
    "nombre": "degree [unit of angle]"
  },
  "DEC": {
    "nombre": "decade"
  },
  "DE": {
    "nombre": "deal"
  },
  "DG": {
    "nombre": "decigram"
  },
  "DI": {
    "nombre": "dispenser"
  },
  "DJ": {
    "nombre": "decagram"
  },
  "DLT": {
    "nombre": "decilitre"
  },
  "DMA": {
    "nombre": "cubic decametre"
  },
  "DMK": {
    "nombre": "square decimetre"
  },
  "DMO": {
    "nombre": "standard kilolitre"
  },
  "DMQ": {
    "nombre": "cubic decimetre"
  },
  "DMT": {
    "nombre": "decimetre"
  },
  "DN": {
    "nombre": "decinewton metre"
  },
  "DPC": {
    "nombre": "dozen piece"
  },
  "DPR": {
    "nombre": "dozen pair"
  },
  "DPT": {
    "nombre": "displacement tonnage"
  },
  "DQ": {
    "nombre": "data record"
  },
  "DRA": {
    "nombre": "dram (US)"
  },
  "DRI": {
    "nombre": "dram (UK)"
  },
  "DRL": {
    "nombre": "dozen roll"
  },
  "DRM": {
    "nombre": "drachm (UK)"
  },
  "DR": {
    "nombre": "drum"
  },
  "DS": {
    "nombre": "display"
  },
  "DTN": {
    "nombre": "decitonne"
  },
  "DT": {
    "nombre": "dry ton"
  },
  "DU": {
    "nombre": "dyne"
  },
  "DWT": {
    "nombre": "pennyweight"
  },
  "DX": {
    "nombre": "dyne per centimetre"
  },
  "DY": {
    "nombre": "directory book"
  },
  "DZN": {
    "nombre": "dozen"
  },
  "DZP": {
    "nombre": "dozen pack"
  },
  "E01": {
    "nombre": "newton per square centimetre"
  },
  "E07": {
    "nombre": "megawatt hour per hour"
  },
  "E08": {
    "nombre": "megawatt per hertz"
  },
  "E09": {
    "nombre": "milliampere hour"
  },
  "E10": {
    "nombre": "degree day"
  },
  "E11": {
    "nombre": "gigacalorie"
  },
  "E12": {
    "nombre": "mille"
  },
  "E14": {
    "nombre": "kilocalorie (international table)"
  },
  "E15": {
    "nombre": "kilocalorie (thermochemical) per hour"
  },
  "E16": {
    "nombre": "million Btu(IT) per hour"
  },
  "E17": {
    "nombre": "cubic foot per second"
  },
  "E18": {
    "nombre": "tonne per hour"
  },
  "E19": {
    "nombre": "ping"
  },
  "E20": {
    "nombre": "megabit per second"
  },
  "E21": {
    "nombre": "shares"
  },
  "E22": {
    "nombre": "TEU"
  },
  "E23": {
    "nombre": "tyre"
  },
  "E25": {
    "nombre": "active unit"
  },
  "E27": {
    "nombre": "dose"
  },
  "E28": {
    "nombre": "air dry ton"
  },
  "E2": {
    "nombre": "belt"
  },
  "E30": {
    "nombre": "strand"
  },
  "E31": {
    "nombre": "square metre per litre"
  },
  "E32": {
    "nombre": "litre per hour"
  },
  "E33": {
    "nombre": "foot per thousand"
  },
  "E34": {
    "nombre": "gigabyte"
  },
  "E35": {
    "nombre": "terabyte"
  },
  "E36": {
    "nombre": "petabyte"
  },
  "E37": {
    "nombre": "pixel"
  },
  "E38": {
    "nombre": "megapixel"
  },
  "E39": {
    "nombre": "dots per inch"
  },
  "E3": {
    "nombre": "trailer"
  },
  "E40": {
    "nombre": "part per hundred thousand"
  },
  "E41": {
    "nombre": "kilogram-force per square millimetre"
  },
  "E42": {
    "nombre": "kilogram-force per square centimetre"
  },
  "E43": {
    "nombre": "joule per square centimetre"
  },
  "E44": {
    "nombre": "kilogram-force metre per square centimetre"
  },
  "E45": {
    "nombre": "milliohm"
  },
  "E46": {
    "nombre": "kilowatt hour per cubic metre"
  },
  "E47": {
    "nombre": "kilowatt hour per kelvin"
  },
  "E48": {
    "nombre": "service unit"
  },
  "E49": {
    "nombre": "working day"
  },
  "E4": {
    "nombre": "gross kilogram"
  },
  "E50": {
    "nombre": "accounting unit"
  },
  "E51": {
    "nombre": "job"
  },
  "E52": {
    "nombre": "run foot"
  },
  "E53": {
    "nombre": "test"
  },
  "E54": {
    "nombre": "trip"
  },
  "E55": {
    "nombre": "use"
  },
  "E56": {
    "nombre": "well"
  },
  "E57": {
    "nombre": "zone"
  },
  "E58": {
    "nombre": "exabit per second"
  },
  "E59": {
    "nombre": "exbibyte"
  },
  "E5": {
    "nombre": "metric long ton"
  },
  "E60": {
    "nombre": "pebibyte"
  },
  "E61": {
    "nombre": "tebibyte"
  },
  "E62": {
    "nombre": "gibibyte"
  },
  "E63": {
    "nombre": "mebibyte"
  },
  "E64": {
    "nombre": "kibibyte"
  },
  "E65": {
    "nombre": "exbibit per metre"
  },
  "E66": {
    "nombre": "exbibit per square metre"
  },
  "E67": {
    "nombre": "exbibit per cubic metre"
  },
  "E68": {
    "nombre": "gigabyte per second"
  },
  "E69": {
    "nombre": "gibibit per metre"
  },
  "E70": {
    "nombre": "gibibit per square metre"
  },
  "E71": {
    "nombre": "gibibit per cubic metre"
  },
  "E72": {
    "nombre": "kibibit per metre"
  },
  "E73": {
    "nombre": "kibibit per square metre"
  },
  "E74": {
    "nombre": "kibibit per cubic metre"
  },
  "E75": {
    "nombre": "mebibit per metre"
  },
  "E76": {
    "nombre": "mebibit per square metre"
  },
  "E77": {
    "nombre": "mebibit per cubic metre"
  },
  "E78": {
    "nombre": "petabit"
  },
  "E79": {
    "nombre": "petabit per second"
  },
  "E80": {
    "nombre": "pebibit per metre"
  },
  "E81": {
    "nombre": "pebibit per square metre"
  },
  "E82": {
    "nombre": "pebibit per cubic metre"
  },
  "E83": {
    "nombre": "terabit"
  },
  "E84": {
    "nombre": "terabit per second"
  },
  "E85": {
    "nombre": "tebibit per metre"
  },
  "E86": {
    "nombre": "tebibit per cubic metre"
  },
  "E87": {
    "nombre": "tebibit per square metre"
  },
  "E88": {
    "nombre": "bit per metre"
  },
  "E89": {
    "nombre": "bit per square metre"
  },
  "E90": {
    "nombre": "reciprocal centimetre"
  },
  "E91": {
    "nombre": "reciprocal day"
  },
  "E92": {
    "nombre": "cubic decimetre per hour"
  },
  "E93": {
    "nombre": "kilogram per hour"
  },
  "E94": {
    "nombre": "kilomole per second"
  },
  "E95": {
    "nombre": "mole per second"
  },
  "E96": {
    "nombre": "degree per second"
  },
  "E97": {
    "nombre": "millimetre per degree Celcius metre"
  },
  "E98": {
    "nombre": "degree Celsius per kelvin"
  },
  "E99": {
    "nombre": "hectopascal per bar"
  },
  "EA": {
    "nombre": "each"
  },
  "EB": {
    "nombre": "electronic mail box"
  },
  "EC": {
    "nombre": "each per month"
  },
  "EP": {
    "nombre": "eleven pack"
  },
  "EQ": {
    "nombre": "equivalent gallon"
  },
  "EV": {
    "nombre": "envelope"
  },
  "F01": {
    "nombre": "bit per cubic metre"
  },
  "F02": {
    "nombre": "kelvin per kelvin"
  },
  "F03": {
    "nombre": "kilopascal per bar"
  },
  "F04": {
    "nombre": "millibar per bar"
  },
  "F05": {
    "nombre": "megapascal per bar"
  },
  "F06": {
    "nombre": "poise per bar"
  },
  "F07": {
    "nombre": "pascal per bar"
  },
  "F08": {
    "nombre": "milliampere per inch"
  },
  "F10": {
    "nombre": "kelvin per hour"
  },
  "F11": {
    "nombre": "kelvin per minute"
  },
  "F12": {
    "nombre": "kelvin per second"
  },
  "F13": {
    "nombre": "slug"
  },
  "F14": {
    "nombre": "gram per kelvin"
  },
  "F15": {
    "nombre": "kilogram per kelvin"
  },
  "F16": {
    "nombre": "milligram per kelvin"
  },
  "F17": {
    "nombre": "pound-force per foot"
  },
  "F18": {
    "nombre": "kilogram square centimetre"
  },
  "F19": {
    "nombre": "kilogram square millimetre"
  },
  "F1": {
    "nombre": "thousand cubic foot per day"
  },
  "F20": {
    "nombre": "pound inch squared"
  },
  "F21": {
    "nombre": "pound-force inch"
  },
  "F22": {
    "nombre": "pound-force foot per ampere"
  },
  "F23": {
    "nombre": "gram per cubic decimetre"
  },
  "F24": {
    "nombre": "kilogram per kilomol"
  },
  "F25": {
    "nombre": "gram per hertz"
  },
  "F26": {
    "nombre": "gram per day"
  },
  "F27": {
    "nombre": "gram per hour"
  },
  "F28": {
    "nombre": "gram per minute"
  },
  "F29": {
    "nombre": "gram per second"
  },
  "F30": {
    "nombre": "kilogram per day"
  },
  "F31": {
    "nombre": "kilogram per minute"
  },
  "F32": {
    "nombre": "milligram per day"
  },
  "F33": {
    "nombre": "milligram per minute"
  },
  "F34": {
    "nombre": "milligram per second"
  },
  "F35": {
    "nombre": "gram per day kelvin"
  },
  "F36": {
    "nombre": "gram per hour kelvin"
  },
  "F37": {
    "nombre": "gram per minute kelvin"
  },
  "F38": {
    "nombre": "gram per second kelvin"
  },
  "F39": {
    "nombre": "kilogram per day kelvin"
  },
  "F40": {
    "nombre": "kilogram per hour kelvin"
  },
  "F41": {
    "nombre": "kilogram per minute kelvin"
  },
  "F42": {
    "nombre": "kilogram per second kelvin"
  },
  "F43": {
    "nombre": "milligram per day kelvin"
  },
  "F44": {
    "nombre": "milligram per hour kelvin"
  },
  "F45": {
    "nombre": "milligram per minute kelvin"
  },
  "F46": {
    "nombre": "milligram per second kelvin"
  },
  "F47": {
    "nombre": "newton per millimetre"
  },
  "F48": {
    "nombre": "pound-force per inch"
  },
  "F49": {
    "nombre": "rod [unit of distance]"
  },
  "F50": {
    "nombre": "micrometre per kelvin"
  },
  "F51": {
    "nombre": "centimetre per kelvin"
  },
  "F52": {
    "nombre": "metre per kelvin"
  },
  "F53": {
    "nombre": "millimetre per kelvin"
  },
  "F54": {
    "nombre": "milliohm per metre"
  },
  "F55": {
    "nombre": "ohm per mile (statute mile)"
  },
  "F56": {
    "nombre": "ohm per kilometre"
  },
  "F57": {
    "nombre": "milliampere per pound-force per square inch"
  },
  "F58": {
    "nombre": "reciprocal bar"
  },
  "F59": {
    "nombre": "milliampere per bar"
  },
  "F60": {
    "nombre": "degree Celsius per bar"
  },
  "F61": {
    "nombre": "kelvin per bar"
  },
  "F62": {
    "nombre": "gram per day bar"
  },
  "F63": {
    "nombre": "gram per hour bar"
  },
  "F64": {
    "nombre": "gram per minute bar"
  },
  "F65": {
    "nombre": "gram per second bar"
  },
  "F66": {
    "nombre": "kilogram per day bar"
  },
  "F67": {
    "nombre": "kilogram per hour bar"
  },
  "F68": {
    "nombre": "kilogram per minute bar"
  },
  "F69": {
    "nombre": "kilogram per second bar"
  },
  "F70": {
    "nombre": "milligram per day bar"
  },
  "F71": {
    "nombre": "milligram per hour bar"
  },
  "F72": {
    "nombre": "milligram per minute bar"
  },
  "F73": {
    "nombre": "milligram per second bar"
  },
  "F74": {
    "nombre": "gram per bar"
  },
  "F75": {
    "nombre": "milligram per bar"
  },
  "F76": {
    "nombre": "milliampere per millimetre"
  },
  "F77": {
    "nombre": "pascal second per kelvin"
  },
  "F78": {
    "nombre": "inch of water"
  },
  "F79": {
    "nombre": "inch of mercury"
  },
  "F80": {
    "nombre": "water horse power"
  },
  "F81": {
    "nombre": "bar per kelvin"
  },
  "F82": {
    "nombre": "hectopascal per kelvin"
  },
  "F83": {
    "nombre": "kilopascal per kelvin"
  },
  "F84": {
    "nombre": "millibar per kelvin"
  },
  "F85": {
    "nombre": "megapascal per kelvin"
  },
  "F86": {
    "nombre": "poise per kelvin"
  },
  "F87": {
    "nombre": "volt per litre minute"
  },
  "F88": {
    "nombre": "newton centimetre"
  },
  "F89": {
    "nombre": "newton metre per degree"
  },
  "F90": {
    "nombre": "newton metre per ampere"
  },
  "F91": {
    "nombre": "bar litre per second"
  },
  "F92": {
    "nombre": "bar cubic metre per second"
  },
  "F93": {
    "nombre": "hectopascal litre per second"
  },
  "F94": {
    "nombre": "hectopascal cubic metre per second"
  },
  "F95": {
    "nombre": "millibar litre per second"
  },
  "F96": {
    "nombre": "millibar cubic metre per second"
  },
  "F97": {
    "nombre": "megapascal litre per second"
  },
  "F98": {
    "nombre": "megapascal cubic metre per second"
  },
  "F99": {
    "nombre": "pascal litre per second"
  },
  "F9": {
    "nombre": "fibre per cubic centimetre of air"
  },
  "FAH": {
    "nombre": "degree Fahrenheit"
  },
  "FAR": {
    "nombre": "farad"
  },
  "FBM": {
    "nombre": "fibre metre"
  },
  "FB": {
    "nombre": "field"
  },
  "FC": {
    "nombre": "thousand cubic foot"
  },
  "FD": {
    "nombre": "million particle per cubic foot"
  },
  "FE": {
    "nombre": "track foot"
  },
  "FF": {
    "nombre": "hundred cubic metre"
  },
  "FG": {
    "nombre": "transdermal patch"
  },
  "FH": {
    "nombre": "micromole"
  },
  "FIT": {
    "nombre": "failures in time"
  },
  "FL": {
    "nombre": "flake ton"
  },
  "FM": {
    "nombre": "million cubic foot"
  },
  "FOT": {
    "nombre": "foot"
  },
  "FP": {
    "nombre": "pound per square foot"
  },
  "FR": {
    "nombre": "foot per minute"
  },
  "FS": {
    "nombre": "foot per second"
  },
  "FTK": {
    "nombre": "square foot"
  },
  "FTQ": {
    "nombre": "cubic foot"
  },
  "G01": {
    "nombre": "pascal cubic metre per second"
  },
  "G04": {
    "nombre": "centimetre per bar"
  },
  "G05": {
    "nombre": "metre per bar"
  },
  "G06": {
    "nombre": "millimetre per bar"
  },
  "G08": {
    "nombre": "square inch per second"
  },
  "G09": {
    "nombre": "square metre per second kelvin"
  },
  "G10": {
    "nombre": "stokes per kelvin"
  },
  "G11": {
    "nombre": "gram per cubic centimetre bar"
  },
  "G12": {
    "nombre": "gram per cubic decimetre bar"
  },
  "G13": {
    "nombre": "gram per litre bar"
  },
  "G14": {
    "nombre": "gram per cubic metre bar"
  },
  "G15": {
    "nombre": "gram per millilitre bar"
  },
  "G16": {
    "nombre": "kilogram per cubic centimetre bar"
  },
  "G17": {
    "nombre": "kilogram per litre bar"
  },
  "G18": {
    "nombre": "kilogram per cubic metre bar"
  },
  "G19": {
    "nombre": "newton metre per kilogram"
  },
  "G20": {
    "nombre": "pound-force foot per pound"
  },
  "G21": {
    "nombre": "cup [unit of volume]"
  },
  "G23": {
    "nombre": "peck"
  },
  "G24": {
    "nombre": "tablespoon (US)"
  },
  "G25": {
    "nombre": "teaspoon (US)"
  },
  "G26": {
    "nombre": "stere"
  },
  "G27": {
    "nombre": "cubic centimetre per kelvin"
  },
  "G28": {
    "nombre": "litre per kelvin"
  },
  "G29": {
    "nombre": "cubic metre per kelvin"
  },
  "G2": {
    "nombre": "US gallon per minute"
  },
  "G30": {
    "nombre": "millilitre per kelvin"
  },
  "G31": {
    "nombre": "kilogram per cubic centimetre"
  },
  "G32": {
    "nombre": "ounce (avoirdupois) per cubic yard"
  },
  "G33": {
    "nombre": "gram per cubic centimetre kelvin"
  },
  "G34": {
    "nombre": "gram per cubic decimetre kelvin"
  },
  "G35": {
    "nombre": "gram per litre kelvin"
  },
  "G36": {
    "nombre": "gram per cubic metre kelvin"
  },
  "G37": {
    "nombre": "gram per millilitre kelvin"
  },
  "G38": {
    "nombre": "kilogram per cubic centimetre kelvin"
  },
  "G39": {
    "nombre": "kilogram per litre kelvin"
  },
  "G3": {
    "nombre": "Imperial gallon per minute"
  },
  "G40": {
    "nombre": "kilogram per cubic metre kelvin"
  },
  "G41": {
    "nombre": "square metre per second bar"
  },
  "G42": {
    "nombre": "microsiemens per centimetre"
  },
  "G43": {
    "nombre": "microsiemens per metre"
  },
  "G44": {
    "nombre": "nanosiemens per centimetre"
  },
  "G45": {
    "nombre": "nanosiemens per metre"
  },
  "G46": {
    "nombre": "stokes per bar"
  },
  "G47": {
    "nombre": "cubic centimetre per day"
  },
  "G48": {
    "nombre": "cubic centimetre per hour"
  },
  "G49": {
    "nombre": "cubic centimetre per minute"
  },
  "G50": {
    "nombre": "gallon (US) per hour"
  },
  "G51": {
    "nombre": "litre per second"
  },
  "G52": {
    "nombre": "cubic metre per day"
  },
  "G53": {
    "nombre": "cubic metre per minute"
  },
  "G54": {
    "nombre": "millilitre per day"
  },
  "G55": {
    "nombre": "millilitre per hour"
  },
  "G56": {
    "nombre": "cubic inch per hour"
  },
  "G57": {
    "nombre": "cubic inch per minute"
  },
  "G58": {
    "nombre": "cubic inch per second"
  },
  "G59": {
    "nombre": "milliampere per litre minute"
  },
  "G60": {
    "nombre": "volt per bar"
  },
  "G61": {
    "nombre": "cubic centimetre per day kelvin"
  },
  "G62": {
    "nombre": "cubic centimetre per hour kelvin"
  },
  "G63": {
    "nombre": "cubic centimetre per minute kelvin"
  },
  "G64": {
    "nombre": "cubic centimetre per second kelvin"
  },
  "G65": {
    "nombre": "litre per day kelvin"
  },
  "G66": {
    "nombre": "litre per hour kelvin"
  },
  "G67": {
    "nombre": "litre per minute kelvin"
  },
  "G68": {
    "nombre": "litre per second kelvin"
  },
  "G69": {
    "nombre": "cubic metre per day kelvin"
  },
  "G70": {
    "nombre": "cubic metre per hour kelvin"
  },
  "G71": {
    "nombre": "cubic metre per minute kelvin"
  },
  "G72": {
    "nombre": "cubic metre per second kelvin"
  },
  "G73": {
    "nombre": "millilitre per day kelvin"
  },
  "G74": {
    "nombre": "millilitre per hour kelvin"
  },
  "G75": {
    "nombre": "millilitre per minute kelvin"
  },
  "G76": {
    "nombre": "millilitre per second kelvin"
  },
  "G77": {
    "nombre": "millimetre to the fourth power"
  },
  "G78": {
    "nombre": "cubic centimetre per day bar"
  },
  "G79": {
    "nombre": "cubic centimetre per hour bar"
  },
  "G7": {
    "nombre": "microfiche sheet"
  },
  "G80": {
    "nombre": "cubic centimetre per minute bar"
  },
  "G81": {
    "nombre": "cubic centimetre per second bar"
  },
  "G82": {
    "nombre": "litre per day bar"
  },
  "G83": {
    "nombre": "litre per hour bar"
  },
  "G84": {
    "nombre": "litre per minute bar"
  },
  "G85": {
    "nombre": "litre per second bar"
  },
  "G86": {
    "nombre": "cubic metre per day bar"
  },
  "G87": {
    "nombre": "cubic metre per hour bar"
  },
  "G88": {
    "nombre": "cubic metre per minute bar"
  },
  "G89": {
    "nombre": "cubic metre per second bar"
  },
  "G90": {
    "nombre": "millilitre per day bar"
  },
  "G91": {
    "nombre": "millilitre per hour bar"
  },
  "G92": {
    "nombre": "millilitre per minute bar"
  },
  "G93": {
    "nombre": "millilitre per second bar"
  },
  "G94": {
    "nombre": "cubic centimetre per bar"
  },
  "G95": {
    "nombre": "litre per bar"
  },
  "G96": {
    "nombre": "cubic metre per bar"
  },
  "G97": {
    "nombre": "millilitre per bar"
  },
  "G98": {
    "nombre": "microhenry per kiloohm"
  },
  "G99": {
    "nombre": "microhenry per ohm"
  },
  "GBQ": {
    "nombre": "gigabecquerel"
  },
  "GB": {
    "nombre": "gallon (US) per day"
  },
  "GC": {
    "nombre": "gram per 100 gram"
  },
  "GDW": {
    "nombre": "gram, dry weight"
  },
  "GD": {
    "nombre": "gross barrel"
  },
  "GE": {
    "nombre": "pound per gallon (US)"
  },
  "GFI": {
    "nombre": "gram of fissile isotope"
  },
  "GF": {
    "nombre": "gram per metre (gram per 100 centimetres)"
  },
  "GGR": {
    "nombre": "great gross"
  },
  "GH": {
    "nombre": "half gallon (US)"
  },
  "GIA": {
    "nombre": "gill (US)"
  },
  "GIC": {
    "nombre": "gram, including container"
  },
  "GII": {
    "nombre": "gill (UK)"
  },
  "GIP": {
    "nombre": "gram, including inner packaging"
  },
  "GJ": {
    "nombre": "gram per millilitre"
  },
  "GK": {
    "nombre": "gram per kilogram"
  },
  "GLD": {
    "nombre": "dry gallon (US)"
  },
  "GLI": {
    "nombre": "gallon (UK)"
  },
  "GLL": {
    "nombre": "gallon (US)"
  },
  "GL": {
    "nombre": "gram per litre"
  },
  "GM": {
    "nombre": "gram per square metre"
  },
  "GN": {
    "nombre": "gross gallon"
  },
  "GO": {
    "nombre": "milligram per square metre"
  },
  "GP": {
    "nombre": "milligram per cubic metre"
  },
  "GQ": {
    "nombre": "microgram per cubic metre"
  },
  "GRM": {
    "nombre": "gram"
  },
  "GRN": {
    "nombre": "grain"
  },
  "GRO": {
    "nombre": "gross"
  },
  "GRT": {
    "nombre": "gross register ton"
  },
  "GT": {
    "nombre": "gross ton"
  },
  "GV": {
    "nombre": "gigajoule"
  },
  "GWH": {
    "nombre": "gigawatt hour"
  },
  "GW": {
    "nombre": "gallon per thousand cubic foot"
  },
  "GY": {
    "nombre": "gross yard"
  },
  "GZ": {
    "nombre": "gage system"
  },
  "H03": {
    "nombre": "henry per kiloohm"
  },
  "H04": {
    "nombre": "henry per ohm"
  },
  "H05": {
    "nombre": "millihenry per kiloohm"
  },
  "H06": {
    "nombre": "millihenry per ohm"
  },
  "H07": {
    "nombre": "pascal second per bar"
  },
  "H08": {
    "nombre": "microbecquerel"
  },
  "H09": {
    "nombre": "reciprocal year"
  },
  "H10": {
    "nombre": "reciprocal hour"
  },
  "H11": {
    "nombre": "reciprocal month"
  },
  "H12": {
    "nombre": "degree Celsius per hour"
  },
  "H13": {
    "nombre": "degree Celsius per minute"
  },
  "H14": {
    "nombre": "degree Celsius per second"
  },
  "H15": {
    "nombre": "square centimetre per gram"
  },
  "H16": {
    "nombre": "square decametre"
  },
  "H18": {
    "nombre": "square hectometre"
  },
  "H19": {
    "nombre": "cubic hectometre"
  },
  "H1": {
    "nombre": "half page - electronic"
  },
  "H20": {
    "nombre": "cubic kilometre"
  },
  "H21": {
    "nombre": "blank"
  },
  "H22": {
    "nombre": "volt square inch per pound-force"
  },
  "H23": {
    "nombre": "volt per inch"
  },
  "H24": {
    "nombre": "volt per microsecond"
  },
  "H25": {
    "nombre": "percent per kelvin"
  },
  "H26": {
    "nombre": "ohm per metre"
  },
  "H27": {
    "nombre": "degree per metre"
  },
  "H28": {
    "nombre": "microfarad per kilometre"
  },
  "H29": {
    "nombre": "microgram per litre"
  },
  "H2": {
    "nombre": "half litre"
  },
  "H30": {
    "nombre": "square micrometre (square micron)"
  },
  "H31": {
    "nombre": "ampere per kilogram"
  },
  "H32": {
    "nombre": "ampere squared second"
  },
  "H33": {
    "nombre": "farad per kilometre"
  },
  "H34": {
    "nombre": "hertz metre"
  },
  "H35": {
    "nombre": "kelvin metre per watt"
  },
  "H36": {
    "nombre": "megaohm per kilometre"
  },
  "H37": {
    "nombre": "megaohm per metre"
  },
  "H38": {
    "nombre": "megaampere"
  },
  "H39": {
    "nombre": "megahertz kilometre"
  },
  "H40": {
    "nombre": "newton per ampere"
  },
  "H41": {
    "nombre": "newton metre watt to the power minus 0,5"
  },
  "H42": {
    "nombre": "pascal per metre"
  },
  "H43": {
    "nombre": "siemens per centimetre"
  },
  "H44": {
    "nombre": "teraohm"
  },
  "H45": {
    "nombre": "volt second per metre"
  },
  "H46": {
    "nombre": "volt per second"
  },
  "H47": {
    "nombre": "watt per cubic metre"
  },
  "H48": {
    "nombre": "attofarad"
  },
  "H49": {
    "nombre": "centimetre per hour"
  },
  "H50": {
    "nombre": "reciprocal cubic centimetre"
  },
  "H51": {
    "nombre": "decibel per kilometre"
  },
  "H52": {
    "nombre": "decibel per metre"
  },
  "H53": {
    "nombre": "kilogram per bar"
  },
  "H54": {
    "nombre": "kilogram per cubic decimetre kelvin"
  },
  "H55": {
    "nombre": "kilogram per cubic decimetre bar"
  },
  "H56": {
    "nombre": "kilogram per square metre second"
  },
  "H57": {
    "nombre": "inch per two pi radiant"
  },
  "H58": {
    "nombre": "metre per volt second"
  },
  "H59": {
    "nombre": "square metre per newton"
  },
  "H60": {
    "nombre": "cubic metre per cubic metre"
  },
  "H61": {
    "nombre": "millisiemens per centimetre"
  },
  "H62": {
    "nombre": "millivolt per minute"
  },
  "H63": {
    "nombre": "milligram per square centimetre"
  },
  "H64": {
    "nombre": "milligram per gram"
  },
  "H65": {
    "nombre": "millilitre per cubic metre"
  },
  "H66": {
    "nombre": "millimetre per year"
  },
  "H67": {
    "nombre": "millimetre per hour"
  },
  "H68": {
    "nombre": "millimole per gram"
  },
  "H69": {
    "nombre": "picopascal per kilometre"
  },
  "H70": {
    "nombre": "picosecond"
  },
  "H71": {
    "nombre": "percent per month"
  },
  "H72": {
    "nombre": "percent per hectobar"
  },
  "H73": {
    "nombre": "percent per decakelvin"
  },
  "H74": {
    "nombre": "watt per metre"
  },
  "H75": {
    "nombre": "decapascal"
  },
  "H76": {
    "nombre": "gram per millimetre"
  },
  "H77": {
    "nombre": "module width"
  },
  "H78": {
    "nombre": "conventional centimetre of water"
  },
  "H79": {
    "nombre": "French gauge"
  },
  "H80": {
    "nombre": "rack unit"
  },
  "H81": {
    "nombre": "millimetre per minute"
  },
  "H82": {
    "nombre": "big point"
  },
  "H83": {
    "nombre": "litre per kilogram"
  },
  "H84": {
    "nombre": "gram millimetre"
  },
  "H85": {
    "nombre": "reciprocal week"
  },
  "H87": {
    "nombre": "piece"
  },
  "H88": {
    "nombre": "megaohm kilometre"
  },
  "H89": {
    "nombre": "percent per ohm"
  },
  "H90": {
    "nombre": "percent per degree"
  },
  "H91": {
    "nombre": "percent per ten thousand"
  },
  "H92": {
    "nombre": "percent per one hundred thousand"
  },
  "H93": {
    "nombre": "percent per hundred"
  },
  "H94": {
    "nombre": "percent per thousand"
  },
  "H95": {
    "nombre": "percent per volt"
  },
  "H96": {
    "nombre": "percent per bar"
  },
  "H98": {
    "nombre": "percent per inch"
  },
  "H99": {
    "nombre": "percent per metre"
  },
  "HAR": {
    "nombre": "hectare"
  },
  "HA": {
    "nombre": "hank"
  },
  "HBA": {
    "nombre": "hectobar"
  },
  "HBX": {
    "nombre": "hundred boxes"
  },
  "HC": {
    "nombre": "hundred count"
  },
  "HDW": {
    "nombre": "hundred kilogram, dry weight"
  },
  "HD": {
    "nombre": "half dozen"
  },
  "HEA": {
    "nombre": "head"
  },
  "HE": {
    "nombre": "hundredth of a carat"
  },
  "HF": {
    "nombre": "hundred foot"
  },
  "HGM": {
    "nombre": "hectogram"
  },
  "HH": {
    "nombre": "hundred cubic foot"
  },
  "HIU": {
    "nombre": "hundred international unit"
  },
  "HI": {
    "nombre": "hundred sheet"
  },
  "HJ": {
    "nombre": "metric horse power"
  },
  "HKM": {
    "nombre": "hundred kilogram, net mass"
  },
  "HK": {
    "nombre": "hundred kilogram"
  },
  "HLT": {
    "nombre": "hectolitre"
  },
  "HL": {
    "nombre": "hundred foot (linear)"
  },
  "HMQ": {
    "nombre": "million cubic metre"
  },
  "HMT": {
    "nombre": "hectometre"
  },
  "HM": {
    "nombre": "mile per hour (statute mile)"
  },
  "HN": {
    "nombre": "conventional millimetre of mercury"
  },
  "HO": {
    "nombre": "hundred troy ounce"
  },
  "HPA": {
    "nombre": "hectolitre of pure alcohol"
  },
  "HP": {
    "nombre": "conventional millimetre of water"
  },
  "HS": {
    "nombre": "hundred square foot"
  },
  "HTZ": {
    "nombre": "hertz"
  },
  "HT": {
    "nombre": "half hour"
  },
  "HUR": {
    "nombre": "hour"
  },
  "HY": {
    "nombre": "hundred yard"
  },
  "IA": {
    "nombre": "inch pound (pound inch)"
  },
  "IC": {
    "nombre": "count per inch"
  },
  "IE": {
    "nombre": "person"
  },
  "IF": {
    "nombre": "inches of water"
  },
  "II": {
    "nombre": "column inch"
  },
  "IL": {
    "nombre": "inch per minute"
  },
  "IM": {
    "nombre": "impression"
  },
  "INH": {
    "nombre": "inch"
  },
  "INK": {
    "nombre": "square inch"
  },
  "INQ": {
    "nombre": "cubic inch"
  },
  "IP": {
    "nombre": "insurance policy"
  },
  "ISD": {
    "nombre": "international sugar degree"
  },
  "IT": {
    "nombre": "count per centimetre"
  },
  "IUG": {
    "nombre": "international unit per gram"
  },
  "IU": {
    "nombre": "inch per second"
  },
  "IV": {
    "nombre": "inch per second squared"
  },
  "J10": {
    "nombre": "percent per millimetre"
  },
  "J12": {
    "nombre": "per mille per psi"
  },
  "J13": {
    "nombre": "degree API"
  },
  "J14": {
    "nombre": "degree Baume (origin scale)"
  },
  "J15": {
    "nombre": "degree Baume (US heavy)"
  },
  "J16": {
    "nombre": "degree Baume (US light)"
  },
  "J17": {
    "nombre": "degree Balling"
  },
  "J18": {
    "nombre": "degree Brix"
  },
  "J19": {
    "nombre": "degree Fahrenheit hour square foot per British thermal unit (thermochemical)"
  },
  "J20": {
    "nombre": "degree Fahrenheit per kelvin"
  },
  "J21": {
    "nombre": "degree Fahrenheit per bar"
  },
  "J22": {
    "nombre": "degree Fahrenheit hour square foot per British thermal unit (international table)"
  },
  "J23": {
    "nombre": "degree Fahrenheit per hour"
  },
  "J24": {
    "nombre": "degree Fahrenheit per minute"
  },
  "J25": {
    "nombre": "degree Fahrenheit per second"
  },
  "J26": {
    "nombre": "reciprocal degree Fahrenheit"
  },
  "J27": {
    "nombre": "degree Oechsle"
  },
  "J28": {
    "nombre": "degree Rankine per hour"
  },
  "J29": {
    "nombre": "degree Rankine per minute"
  },
  "J2": {
    "nombre": "joule per kilogram"
  },
  "J30": {
    "nombre": "degree Rankine per second"
  },
  "J31": {
    "nombre": "degree Twaddell"
  },
  "J32": {
    "nombre": "micropoise"
  },
  "J33": {
    "nombre": "microgram per kilogram"
  },
  "J34": {
    "nombre": "microgram per cubic metre kelvin"
  },
  "J35": {
    "nombre": "microgram per cubic metre bar"
  },
  "J36": {
    "nombre": "microlitre per litre"
  },
  "J38": {
    "nombre": "baud"
  },
  "J39": {
    "nombre": "British thermal unit (mean)"
  },
  "J40": {
    "nombre": "British thermal unit (international table) foot per hour square foot degree Fahrenheit"
  },
  "J41": {
    "nombre": "British thermal unit (international table) inch per hour square foot degree Fahrenheit"
  },
  "J42": {
    "nombre": "British thermal unit (international table) inch per second square foot degree Fahrenheit"
  },
  "J43": {
    "nombre": "British thermal unit (international table) per pound degree Fahrenheit"
  },
  "J44": {
    "nombre": "British thermal unit (international table) per minute"
  },
  "J45": {
    "nombre": "British thermal unit (international table) per second"
  },
  "J46": {
    "nombre": "British thermal unit (thermochemical) foot per hour square foot degree Fahrenheit"
  },
  "J47": {
    "nombre": "British thermal unit (thermochemical) per hour"
  },
  "J48": {
    "nombre": "British thermal unit (thermochemical) inch per hour square foot degree Fahrenheit"
  },
  "J49": {
    "nombre": "British thermal unit (thermochemical) inch per second square foot degree Fahrenheit"
  },
  "J50": {
    "nombre": "British thermal unit (thermochemical) per pound degree Fahrenheit"
  },
  "J51": {
    "nombre": "British thermal unit (thermochemical) per minute"
  },
  "J52": {
    "nombre": "British thermal unit (thermochemical) per second"
  },
  "J53": {
    "nombre": "coulomb square metre per kilogram"
  },
  "J54": {
    "nombre": "megabaud"
  },
  "J55": {
    "nombre": "watt second"
  },
  "J56": {
    "nombre": "bar per bar"
  },
  "J57": {
    "nombre": "barrel (UK petroleum)"
  },
  "J58": {
    "nombre": "barrel (UK petroleum) per minute"
  },
  "J59": {
    "nombre": "barrel (UK petroleum) per day"
  },
  "J60": {
    "nombre": "barrel (UK petroleum) per hour"
  },
  "J61": {
    "nombre": "barrel (UK petroleum) per second"
  },
  "J62": {
    "nombre": "barrel (US petroleum) per hour"
  },
  "J63": {
    "nombre": "barrel (US petroleum) per second"
  },
  "J64": {
    "nombre": "bushel (UK) per day"
  },
  "J65": {
    "nombre": "bushel (UK) per hour"
  },
  "J66": {
    "nombre": "bushel (UK) per minute"
  },
  "J67": {
    "nombre": "bushel (UK) per second"
  },
  "J68": {
    "nombre": "bushel (US dry) per day"
  },
  "J69": {
    "nombre": "bushel (US dry) per hour"
  },
  "J70": {
    "nombre": "bushel (US dry) per minute"
  },
  "J71": {
    "nombre": "bushel (US dry) per second"
  },
  "J72": {
    "nombre": "centinewton metre"
  },
  "J73": {
    "nombre": "centipoise per kelvin"
  },
  "J74": {
    "nombre": "centipoise per bar"
  },
  "J75": {
    "nombre": "calorie (mean)"
  },
  "J76": {
    "nombre": "calorie (international table) per gram degree Celsius"
  },
  "J78": {
    "nombre": "calorie (thermochemical) per centimetre second degree Celsius"
  },
  "J79": {
    "nombre": "calorie (thermochemical) per gram degree Celsius"
  },
  "J81": {
    "nombre": "calorie (thermochemical) per minute"
  },
  "J82": {
    "nombre": "calorie (thermochemical) per second"
  },
  "J83": {
    "nombre": "clo"
  },
  "J84": {
    "nombre": "centimetre per second kelvin"
  },
  "J85": {
    "nombre": "centimetre per second bar"
  },
  "J87": {
    "nombre": "cubic centimetre per cubic metre"
  },
  "J89": {
    "nombre": "centimetre of mercury"
  },
  "J90": {
    "nombre": "cubic decimetre per day"
  },
  "J91": {
    "nombre": "cubic decimetre per cubic metre"
  },
  "J92": {
    "nombre": "cubic decimetre per minute"
  },
  "J93": {
    "nombre": "cubic decimetre per second"
  },
  "J94": {
    "nombre": "dyne centimetre"
  },
  "J95": {
    "nombre": "ounce (UK fluid) per day"
  },
  "J96": {
    "nombre": "ounce (UK fluid) per hour"
  },
  "J97": {
    "nombre": "ounce (UK fluid) per minute"
  },
  "J98": {
    "nombre": "ounce (UK fluid) per second"
  },
  "J99": {
    "nombre": "ounce (US fluid) per day"
  },
  "JB": {
    "nombre": "jumbo"
  },
  "JE": {
    "nombre": "joule per kelvin"
  },
  "JG": {
    "nombre": "jug"
  },
  "JK": {
    "nombre": "megajoule per kilogram"
  },
  "JM": {
    "nombre": "megajoule per cubic metre"
  },
  "JNT": {
    "nombre": "pipeline joint"
  },
  "JOU": {
    "nombre": "joule"
  },
  "JO": {
    "nombre": "joint"
  },
  "JPS": {
    "nombre": "hundred metre"
  },
  "JR": {
    "nombre": "jar"
  },
  "JWL": {
    "nombre": "number of jewels"
  },
  "K10": {
    "nombre": "ounce (US fluid) per hour"
  },
  "K11": {
    "nombre": "ounce (US fluid) per minute"
  },
  "K12": {
    "nombre": "ounce (US fluid) per second"
  },
  "K13": {
    "nombre": "foot per degree Fahrenheit"
  },
  "K14": {
    "nombre": "foot per hour"
  },
  "K15": {
    "nombre": "foot pound-force per hour"
  },
  "K16": {
    "nombre": "foot pound-force per minute"
  },
  "K17": {
    "nombre": "foot per psi"
  },
  "K18": {
    "nombre": "foot per second degree Fahrenheit"
  },
  "K19": {
    "nombre": "foot per second psi"
  },
  "K1": {
    "nombre": "kilowatt demand"
  },
  "K20": {
    "nombre": "reciprocal cubic foot"
  },
  "K21": {
    "nombre": "cubic foot per degree Fahrenheit"
  },
  "K22": {
    "nombre": "cubic foot per day"
  },
  "K23": {
    "nombre": "cubic foot per psi"
  },
  "K24": {
    "nombre": "foot of water"
  },
  "K25": {
    "nombre": "foot of mercury"
  },
  "K26": {
    "nombre": "gallon (UK) per day"
  },
  "K27": {
    "nombre": "gallon (UK) per hour"
  },
  "K28": {
    "nombre": "gallon (UK) per second"
  },
  "K2": {
    "nombre": "kilovolt ampere reactive demand"
  },
  "K30": {
    "nombre": "gallon (US liquid) per second"
  },
  "K31": {
    "nombre": "gram-force per square centimetre"
  },
  "K32": {
    "nombre": "gill (UK) per day"
  },
  "K33": {
    "nombre": "gill (UK) per hour"
  },
  "K34": {
    "nombre": "gill (UK) per minute"
  },
  "K35": {
    "nombre": "gill (UK) per second"
  },
  "K36": {
    "nombre": "gill (US) per day"
  },
  "K37": {
    "nombre": "gill (US) per hour"
  },
  "K38": {
    "nombre": "gill (US) per minute"
  },
  "K39": {
    "nombre": "gill (US) per second"
  },
  "K3": {
    "nombre": "kilovolt ampere reactive hour"
  },
  "K40": {
    "nombre": "standard acceleration of free fall"
  },
  "K41": {
    "nombre": "grain per gallon (US)"
  },
  "K42": {
    "nombre": "horsepower (boiler)"
  },
  "K43": {
    "nombre": "horsepower (electric)"
  },
  "K45": {
    "nombre": "inch per degree Fahrenheit"
  },
  "K46": {
    "nombre": "inch per psi"
  },
  "K47": {
    "nombre": "inch per second degree Fahrenheit"
  },
  "K48": {
    "nombre": "inch per second psi"
  },
  "K49": {
    "nombre": "reciprocal cubic inch"
  },
  "K50": {
    "nombre": "kilobaud"
  },
  "K51": {
    "nombre": "kilocalorie (mean)"
  },
  "K52": {
    "nombre": "kilocalorie (international table) per hour metre degree Celsius"
  },
  "K53": {
    "nombre": "kilocalorie (thermochemical)"
  },
  "K54": {
    "nombre": "kilocalorie (thermochemical) per minute"
  },
  "K55": {
    "nombre": "kilocalorie (thermochemical) per second"
  },
  "K58": {
    "nombre": "kilomole per hour"
  },
  "K59": {
    "nombre": "kilomole per cubic metre kelvin"
  },
  "K5": {
    "nombre": "kilovolt ampere (reactive)"
  },
  "K60": {
    "nombre": "kilomole per cubic metre bar"
  },
  "K61": {
    "nombre": "kilomole per minute"
  },
  "K62": {
    "nombre": "litre per litre"
  },
  "K63": {
    "nombre": "reciprocal litre"
  },
  "K64": {
    "nombre": "pound (avoirdupois) per degree Fahrenheit"
  },
  "K65": {
    "nombre": "pound (avoirdupois) square foot"
  },
  "K66": {
    "nombre": "pound (avoirdupois) per day"
  },
  "K67": {
    "nombre": "pound per foot hour"
  },
  "K68": {
    "nombre": "pound per foot second"
  },
  "K69": {
    "nombre": "pound (avoirdupois) per cubic foot degree Fahrenheit"
  },
  "K6": {
    "nombre": "kilolitre"
  },
  "K70": {
    "nombre": "pound (avoirdupois) per cubic foot psi"
  },
  "K71": {
    "nombre": "pound (avoirdupois) per gallon (UK)"
  },
  "K73": {
    "nombre": "pound (avoirdupois) per hour degree Fahrenheit"
  },
  "K74": {
    "nombre": "pound (avoirdupois) per hour psi"
  },
  "K75": {
    "nombre": "pound (avoirdupois) per cubic inch degree Fahrenheit"
  },
  "K76": {
    "nombre": "pound (avoirdupois) per cubic inch psi"
  },
  "K77": {
    "nombre": "pound (avoirdupois) per psi"
  },
  "K78": {
    "nombre": "pound (avoirdupois) per minute"
  },
  "K79": {
    "nombre": "pound (avoirdupois) per minute degree Fahrenheit"
  },
  "K80": {
    "nombre": "pound (avoirdupois) per minute psi"
  },
  "K81": {
    "nombre": "pound (avoirdupois) per second"
  },
  "K82": {
    "nombre": "pound (avoirdupois) per second degree Fahrenheit"
  },
  "K83": {
    "nombre": "pound (avoirdupois) per second psi"
  },
  "K84": {
    "nombre": "pound per cubic yard"
  },
  "K85": {
    "nombre": "pound-force per square foot"
  },
  "K86": {
    "nombre": "pound-force per square inch degree Fahrenheit"
  },
  "K87": {
    "nombre": "psi cubic inch per second"
  },
  "K88": {
    "nombre": "psi litre per second"
  },
  "K89": {
    "nombre": "psi cubic metre per second"
  },
  "K90": {
    "nombre": "psi cubic yard per second"
  },
  "K91": {
    "nombre": "pound-force second per square foot"
  },
  "K92": {
    "nombre": "pound-force second per square inch"
  },
  "K93": {
    "nombre": "reciprocal psi"
  },
  "K94": {
    "nombre": "quart (UK liquid) per day"
  },
  "K95": {
    "nombre": "quart (UK liquid) per hour"
  },
  "K96": {
    "nombre": "quart (UK liquid) per minute"
  },
  "K97": {
    "nombre": "quart (UK liquid) per second"
  },
  "K98": {
    "nombre": "quart (US liquid) per day"
  },
  "K99": {
    "nombre": "quart (US liquid) per hour"
  },
  "KAT": {
    "nombre": "katal"
  },
  "KA": {
    "nombre": "cake"
  },
  "KBA": {
    "nombre": "kilobar"
  },
  "KB": {
    "nombre": "kilocharacter"
  },
  "KCC": {
    "nombre": "kilogram of choline chloride"
  },
  "KDW": {
    "nombre": "kilogram drained net weight"
  },
  "KD": {
    "nombre": "kilogram decimal"
  },
  "KEL": {
    "nombre": "kelvin"
  },
  "KF": {
    "nombre": "kilopacket"
  },
  "KGM": {
    "nombre": "kilogram"
  },
  "KGS": {
    "nombre": "kilogram per second"
  },
  "KG": {
    "nombre": "keg"
  },
  "KHY": {
    "nombre": "kilogram of hydrogen peroxide"
  },
  "KHZ": {
    "nombre": "kilohertz"
  },
  "KIC": {
    "nombre": "kilogram, including container"
  },
  "KIP": {
    "nombre": "kilogram, including inner packaging"
  },
  "KI": {
    "nombre": "kilogram per millimetre width"
  },
  "KJO": {
    "nombre": "kilojoule"
  },
  "KJ": {
    "nombre": "kilosegment"
  },
  "KLK": {
    "nombre": "lactic dry material percentage"
  },
  "KLX": {
    "nombre": "kilolux"
  },
  "KL": {
    "nombre": "kilogram per metre"
  },
  "KMA": {
    "nombre": "kilogram of methylamine"
  },
  "KMH": {
    "nombre": "kilometre per hour"
  },
  "KMK": {
    "nombre": "square kilometre"
  },
  "KMQ": {
    "nombre": "kilogram per cubic metre"
  },
  "KMT": {
    "nombre": "kilometre"
  },
  "KNI": {
    "nombre": "kilogram of nitrogen"
  },
  "KNM": {
    "nombre": "kilonewton per square metre"
  },
  "KNS": {
    "nombre": "kilogram named substance"
  },
  "KNT": {
    "nombre": "knot"
  },
  "KO": {
    "nombre": "milliequivalence caustic potash per gram of product"
  },
  "KPA": {
    "nombre": "kilopascal"
  },
  "KPH": {
    "nombre": "kilogram of potassium hydroxide (caustic potash)"
  },
  "KPO": {
    "nombre": "kilogram of potassium oxide"
  },
  "KPP": {
    "nombre": "kilogram of phosphorus pentoxide (phosphoric anhydride)"
  },
  "KR": {
    "nombre": "kiloroentgen"
  },
  "KSD": {
    "nombre": "kilogram of substance 90 % dry"
  },
  "KSH": {
    "nombre": "kilogram of sodium hydroxide (caustic soda)"
  },
  "KS": {
    "nombre": "thousand pound per square inch"
  },
  "KTM": {
    "nombre": "kilometre"
  },
  "KTN": {
    "nombre": "kilotonne"
  },
  "KT": {
    "nombre": "kit"
  },
  "KUR": {
    "nombre": "kilogram of uranium"
  },
  "KVA": {
    "nombre": "kilovolt - ampere"
  },
  "KVR": {
    "nombre": "kilovar"
  },
  "KVT": {
    "nombre": "kilovolt"
  },
  "KWH": {
    "nombre": "kilowatt hour"
  },
  "KWN": {
    "nombre": "Kilowatt hour per normalized cubic metre"
  },
  "KWO": {
    "nombre": "kilogram of tungsten trioxide"
  },
  "KWS": {
    "nombre": "Kilowatt hour per standard cubic metre"
  },
  "KWT": {
    "nombre": "kilowatt"
  },
  "KW": {
    "nombre": "kilogram per millimetre"
  },
  "KX": {
    "nombre": "millilitre per kilogram"
  },
  "L10": {
    "nombre": "quart (US liquid) per minute"
  },
  "L11": {
    "nombre": "quart (US liquid) per second"
  },
  "L12": {
    "nombre": "metre per second kelvin"
  },
  "L13": {
    "nombre": "metre per second bar"
  },
  "L14": {
    "nombre": "square metre hour degree Celsius per kilocalorie (international table)"
  },
  "L15": {
    "nombre": "millipascal second per kelvin"
  },
  "L16": {
    "nombre": "millipascal second per bar"
  },
  "L17": {
    "nombre": "milligram per cubic metre kelvin"
  },
  "L18": {
    "nombre": "milligram per cubic metre bar"
  },
  "L19": {
    "nombre": "millilitre per litre"
  },
  "L20": {
    "nombre": "reciprocal cubic millimetre"
  },
  "L21": {
    "nombre": "cubic millimetre per cubic metre"
  },
  "L23": {
    "nombre": "mole per hour"
  },
  "L24": {
    "nombre": "mole per kilogram kelvin"
  },
  "L25": {
    "nombre": "mole per kilogram bar"
  },
  "L26": {
    "nombre": "mole per litre kelvin"
  },
  "L27": {
    "nombre": "mole per litre bar"
  },
  "L28": {
    "nombre": "mole per cubic metre kelvin"
  },
  "L29": {
    "nombre": "mole per cubic metre bar"
  },
  "L2": {
    "nombre": "litre per minute"
  },
  "L30": {
    "nombre": "mole per minute"
  },
  "L31": {
    "nombre": "milliroentgen aequivalent men"
  },
  "L32": {
    "nombre": "nanogram per kilogram"
  },
  "L33": {
    "nombre": "ounce (avoirdupois) per day"
  },
  "L34": {
    "nombre": "ounce (avoirdupois) per hour"
  },
  "L35": {
    "nombre": "ounce (avoirdupois) per minute"
  },
  "L36": {
    "nombre": "ounce (avoirdupois) per second"
  },
  "L37": {
    "nombre": "ounce (avoirdupois) per gallon (UK)"
  },
  "L38": {
    "nombre": "ounce (avoirdupois) per gallon (US)"
  },
  "L39": {
    "nombre": "ounce (avoirdupois) per cubic inch"
  },
  "L40": {
    "nombre": "ounce (avoirdupois)-force"
  },
  "L41": {
    "nombre": "ounce (avoirdupois)-force inch"
  },
  "L42": {
    "nombre": "picosiemens per metre"
  },
  "L43": {
    "nombre": "peck (UK)"
  },
  "L44": {
    "nombre": "peck (UK) per day"
  },
  "L45": {
    "nombre": "peck (UK) per hour"
  },
  "L46": {
    "nombre": "peck (UK) per minute"
  },
  "L47": {
    "nombre": "peck (UK) per second"
  },
  "L48": {
    "nombre": "peck (US dry) per day"
  },
  "L49": {
    "nombre": "peck (US dry) per hour"
  },
  "L50": {
    "nombre": "peck (US dry) per minute"
  },
  "L51": {
    "nombre": "peck (US dry) per second"
  },
  "L52": {
    "nombre": "psi per psi"
  },
  "L53": {
    "nombre": "pint (UK) per day"
  },
  "L54": {
    "nombre": "pint (UK) per hour"
  },
  "L55": {
    "nombre": "pint (UK) per minute"
  },
  "L56": {
    "nombre": "pint (UK) per second"
  },
  "L57": {
    "nombre": "pint (US liquid) per day"
  },
  "L58": {
    "nombre": "pint (US liquid) per hour"
  },
  "L59": {
    "nombre": "pint (US liquid) per minute"
  },
  "L60": {
    "nombre": "pint (US liquid) per second"
  },
  "L61": {
    "nombre": "pint (US dry)"
  },
  "L62": {
    "nombre": "quart (US dry)"
  },
  "L63": {
    "nombre": "slug per day"
  },
  "L64": {
    "nombre": "slug per foot second"
  },
  "L65": {
    "nombre": "slug per cubic foot"
  },
  "L66": {
    "nombre": "slug per hour"
  },
  "L67": {
    "nombre": "slug per minute"
  },
  "L68": {
    "nombre": "slug per second"
  },
  "L69": {
    "nombre": "tonne per kelvin"
  },
  "L70": {
    "nombre": "tonne per bar"
  },
  "L71": {
    "nombre": "tonne per day"
  },
  "L72": {
    "nombre": "tonne per day kelvin"
  },
  "L73": {
    "nombre": "tonne per day bar"
  },
  "L74": {
    "nombre": "tonne per hour kelvin"
  },
  "L75": {
    "nombre": "tonne per hour bar"
  },
  "L76": {
    "nombre": "tonne per cubic metre kelvin"
  },
  "L77": {
    "nombre": "tonne per cubic metre bar"
  },
  "L78": {
    "nombre": "tonne per minute"
  },
  "L79": {
    "nombre": "tonne per minute kelvin"
  },
  "L80": {
    "nombre": "tonne per minute bar"
  },
  "L81": {
    "nombre": "tonne per second"
  },
  "L82": {
    "nombre": "tonne per second kelvin"
  },
  "L83": {
    "nombre": "tonne per second bar"
  },
  "L84": {
    "nombre": "ton (UK shipping)"
  },
  "L85": {
    "nombre": "ton long per day"
  },
  "L86": {
    "nombre": "ton (US shipping)"
  },
  "L87": {
    "nombre": "ton short per degree Fahrenheit"
  },
  "L88": {
    "nombre": "ton short per day"
  },
  "L89": {
    "nombre": "ton short per hour degree Fahrenheit"
  },
  "L90": {
    "nombre": "ton short per hour psi"
  },
  "L91": {
    "nombre": "ton short per psi"
  },
  "L92": {
    "nombre": "ton (UK long) per cubic yard"
  },
  "L93": {
    "nombre": "ton (US short) per cubic yard"
  },
  "L94": {
    "nombre": "ton-force (US short)"
  },
  "L95": {
    "nombre": "common year"
  },
  "L96": {
    "nombre": "sidereal year"
  },
  "L98": {
    "nombre": "yard per degree Fahrenheit"
  },
  "L99": {
    "nombre": "yard per psi"
  },
  "LAC": {
    "nombre": "lactose excess percentage"
  },
  "LA": {
    "nombre": "pound per cubic inch"
  },
  "LBR": {
    "nombre": "pound"
  },
  "LBT": {
    "nombre": "troy pound (US)"
  },
  "LC": {
    "nombre": "linear centimetre"
  },
  "LD": {
    "nombre": "litre per day"
  },
  "LEF": {
    "nombre": "leaf"
  },
  "LE": {
    "nombre": "lite"
  },
  "LF": {
    "nombre": "linear foot"
  },
  "LH": {
    "nombre": "labour hour"
  },
  "LI": {
    "nombre": "linear inch"
  },
  "LJ": {
    "nombre": "large spray"
  },
  "LK": {
    "nombre": "link"
  },
  "LM": {
    "nombre": "linear metre"
  },
  "LN": {
    "nombre": "length"
  },
  "LO": {
    "nombre": "lot  [unit of procurement]"
  },
  "LPA": {
    "nombre": "litre of pure alcohol"
  },
  "LP": {
    "nombre": "liquid pound"
  },
  "LR": {
    "nombre": "layer"
  },
  "LS": {
    "nombre": "lump sum"
  },
  "LTN": {
    "nombre": "ton (UK) or long ton (US)"
  },
  "LTR": {
    "nombre": "litre"
  },
  "LUB": {
    "nombre": "metric ton, lubricating oil"
  },
  "LUM": {
    "nombre": "lumen"
  },
  "LUX": {
    "nombre": "lux"
  },
  "LX": {
    "nombre": "linear yard per pound"
  },
  "LY": {
    "nombre": "linear yard"
  },
  "M0": {
    "nombre": "magnetic tape"
  },
  "M10": {
    "nombre": "reciprocal cubic yard"
  },
  "M11": {
    "nombre": "cubic yard per degree Fahrenheit"
  },
  "M12": {
    "nombre": "cubic yard per day"
  },
  "M13": {
    "nombre": "cubic yard per hour"
  },
  "M14": {
    "nombre": "cubic yard per psi"
  },
  "M15": {
    "nombre": "cubic yard per minute"
  },
  "M16": {
    "nombre": "cubic yard per second"
  },
  "M17": {
    "nombre": "kilohertz metre"
  },
  "M18": {
    "nombre": "gigahertz metre"
  },
  "M19": {
    "nombre": "Beaufort"
  },
  "M1": {
    "nombre": "milligram per litre"
  },
  "M20": {
    "nombre": "reciprocal megakelvin or megakelvin to the power minus one"
  },
  "M21": {
    "nombre": "reciprocal kilovolt - ampere reciprocal hour"
  },
  "M22": {
    "nombre": "millilitre per square centimetre minute"
  },
  "M23": {
    "nombre": "newton per centimetre"
  },
  "M24": {
    "nombre": "ohm kilometre"
  },
  "M25": {
    "nombre": "percent per degree Celsius"
  },
  "M26": {
    "nombre": "gigaohm per metre"
  },
  "M27": {
    "nombre": "megahertz metre"
  },
  "M29": {
    "nombre": "kilogram per kilogram"
  },
  "M30": {
    "nombre": "reciprocal volt - ampere reciprocal second"
  },
  "M31": {
    "nombre": "kilogram per kilometre"
  },
  "M32": {
    "nombre": "pascal second per litre"
  },
  "M33": {
    "nombre": "millimole per litre"
  },
  "M34": {
    "nombre": "newton metre per square metre"
  },
  "M35": {
    "nombre": "millivolt - ampere"
  },
  "M36": {
    "nombre": "30-day month"
  },
  "M37": {
    "nombre": "actual/360"
  },
  "M38": {
    "nombre": "kilometre per second squared"
  },
  "M39": {
    "nombre": "centimetre per second squared"
  },
  "M40": {
    "nombre": "yard per second squared"
  },
  "M41": {
    "nombre": "millimetre per second squared"
  },
  "M42": {
    "nombre": "mile (statute mile) per second squared"
  },
  "M43": {
    "nombre": "mil"
  },
  "M44": {
    "nombre": "revolution"
  },
  "M45": {
    "nombre": "degree [unit of angle] per second squared"
  },
  "M46": {
    "nombre": "revolution per minute"
  },
  "M47": {
    "nombre": "circular mil"
  },
  "M48": {
    "nombre": "square mile (based on U.S. survey foot)"
  },
  "M49": {
    "nombre": "chain (based on U.S. survey foot)"
  },
  "M4": {
    "nombre": "monetary value"
  },
  "M50": {
    "nombre": "furlong"
  },
  "M51": {
    "nombre": "foot (U.S. survey)"
  },
  "M52": {
    "nombre": "mile (based on U.S. survey foot)"
  },
  "M53": {
    "nombre": "metre per pascal"
  },
  "M55": {
    "nombre": "metre per radiant"
  },
  "M56": {
    "nombre": "shake"
  },
  "M57": {
    "nombre": "mile per minute"
  },
  "M58": {
    "nombre": "mile per second"
  },
  "M59": {
    "nombre": "metre per second pascal"
  },
  "M5": {
    "nombre": "microcurie"
  },
  "M60": {
    "nombre": "metre per hour"
  },
  "M61": {
    "nombre": "inch per year"
  },
  "M62": {
    "nombre": "kilometre per second"
  },
  "M63": {
    "nombre": "inch per minute"
  },
  "M64": {
    "nombre": "yard per second"
  },
  "M65": {
    "nombre": "yard per minute"
  },
  "M66": {
    "nombre": "yard per hour"
  },
  "M67": {
    "nombre": "acre-foot (based on U.S. survey foot)"
  },
  "M68": {
    "nombre": "cord (128 ft3)"
  },
  "M69": {
    "nombre": "cubic mile (UK statute)"
  },
  "M70": {
    "nombre": "ton, register"
  },
  "M71": {
    "nombre": "cubic metre per pascal"
  },
  "M72": {
    "nombre": "bel"
  },
  "M73": {
    "nombre": "kilogram per cubic metre pascal"
  },
  "M74": {
    "nombre": "kilogram per pascal"
  },
  "M75": {
    "nombre": "kilopound-force"
  },
  "M76": {
    "nombre": "poundal"
  },
  "M77": {
    "nombre": "kilogram metre per second squared"
  },
  "M78": {
    "nombre": "pond"
  },
  "M79": {
    "nombre": "square foot per hour"
  },
  "M7": {
    "nombre": "micro-inch"
  },
  "M80": {
    "nombre": "stokes per pascal"
  },
  "M81": {
    "nombre": "square centimetre per second"
  },
  "M82": {
    "nombre": "square metre per second pascal"
  },
  "M83": {
    "nombre": "denier"
  },
  "M84": {
    "nombre": "pound per yard"
  },
  "M85": {
    "nombre": "ton, assay"
  },
  "M86": {
    "nombre": "pfund"
  },
  "M87": {
    "nombre": "kilogram per second pascal"
  },
  "M88": {
    "nombre": "tonne per month"
  },
  "M89": {
    "nombre": "tonne per year"
  },
  "M90": {
    "nombre": "kilopound per hour"
  },
  "M91": {
    "nombre": "pound per pound"
  },
  "M92": {
    "nombre": "pound-force foot"
  },
  "M93": {
    "nombre": "newton metre per radian"
  },
  "M94": {
    "nombre": "kilogram metre"
  },
  "M95": {
    "nombre": "poundal foot"
  },
  "M96": {
    "nombre": "poundal inch"
  },
  "M97": {
    "nombre": "dyne metre"
  },
  "M98": {
    "nombre": "kilogram centimetre per second"
  },
  "M99": {
    "nombre": "gram centimetre per second"
  },
  "M9": {
    "nombre": "million Btu per 1000 cubic foot"
  },
  "MAH": {
    "nombre": "megavolt ampere reactive hour"
  },
  "MAL": {
    "nombre": "megalitre"
  },
  "MAM": {
    "nombre": "megametre"
  },
  "MAR": {
    "nombre": "megavar"
  },
  "MAW": {
    "nombre": "megawatt"
  },
  "MA": {
    "nombre": "machine per unit"
  },
  "MBE": {
    "nombre": "thousand standard brick equivalent"
  },
  "MBF": {
    "nombre": "thousand board foot"
  },
  "MBR": {
    "nombre": "millibar"
  },
  "MCU": {
    "nombre": "millicurie"
  },
  "MC": {
    "nombre": "microgram"
  },
  "MD": {
    "nombre": "air dry metric ton"
  },
  "MF": {
    "nombre": "milligram per square foot per side"
  },
  "MGM": {
    "nombre": "milligram"
  },
  "MHZ": {
    "nombre": "megahertz"
  },
  "MIK": {
    "nombre": "square mile (statute mile)"
  },
  "MIL": {
    "nombre": "thousand"
  },
  "MIN": {
    "nombre": "minute [unit of time]"
  },
  "MIO": {
    "nombre": "million"
  },
  "MIU": {
    "nombre": "million international unit"
  },
  "MK": {
    "nombre": "milligram per square inch"
  },
  "MLD": {
    "nombre": "milliard"
  },
  "MLT": {
    "nombre": "millilitre"
  },
  "MMK": {
    "nombre": "square millimetre"
  },
  "MMQ": {
    "nombre": "cubic millimetre"
  },
  "MMT": {
    "nombre": "millimetre"
  },
  "MND": {
    "nombre": "kilogram, dry weight"
  },
  "MON": {
    "nombre": "month"
  },
  "MPA": {
    "nombre": "megapascal"
  },
  "MQH": {
    "nombre": "cubic metre per hour"
  },
  "MQS": {
    "nombre": "cubic metre per second"
  },
  "MQ": {
    "nombre": "thousand metre"
  },
  "MSK": {
    "nombre": "metre per second squared"
  },
  "MTK": {
    "nombre": "square metre"
  },
  "MTQ": {
    "nombre": "cubic metre"
  },
  "MTR": {
    "nombre": "metre"
  },
  "MTS": {
    "nombre": "metre per second"
  },
  "MT": {
    "nombre": "mat"
  },
  "MVA": {
    "nombre": "megavolt - ampere"
  },
  "MV": {
    "nombre": "number of mults"
  },
  "MWH": {
    "nombre": "megawatt hour (1000 kW.h)"
  },
  "N10": {
    "nombre": "pound foot per second"
  },
  "N11": {
    "nombre": "pound inch per second"
  },
  "N12": {
    "nombre": "Pferdestaerke"
  },
  "N13": {
    "nombre": "centimetre of mercury (0 oC)"
  },
  "N14": {
    "nombre": "centimetre of water (4 oC)"
  },
  "N15": {
    "nombre": "foot of water (39.2 oF)"
  },
  "N16": {
    "nombre": "inch of mercury (32 oF)"
  },
  "N17": {
    "nombre": "inch of mercury (60 oF)"
  },
  "N18": {
    "nombre": "inch of water (39.2 oF)"
  },
  "N19": {
    "nombre": "inch of water (60 oF)"
  },
  "N1": {
    "nombre": "pen calorie"
  },
  "N20": {
    "nombre": "kip per square inch"
  },
  "N21": {
    "nombre": "poundal per square foot"
  },
  "N22": {
    "nombre": "ounce (avoirdupois) per square inch"
  },
  "N23": {
    "nombre": "conventional metre of water"
  },
  "N24": {
    "nombre": "gram per square millimetre"
  },
  "N25": {
    "nombre": "pound per square yard"
  },
  "N26": {
    "nombre": "poundal per square inch"
  },
  "N27": {
    "nombre": "foot to the fourth power"
  },
  "N28": {
    "nombre": "cubic decimetre per kilogram"
  },
  "N29": {
    "nombre": "cubic foot per pound"
  },
  "N2": {
    "nombre": "number of lines"
  },
  "N30": {
    "nombre": "cubic inch per pound"
  },
  "N31": {
    "nombre": "kilonewton per metre"
  },
  "N32": {
    "nombre": "poundal per inch"
  },
  "N33": {
    "nombre": "pound-force per yard"
  },
  "N34": {
    "nombre": "poundal second per square foot"
  },
  "N35": {
    "nombre": "poise per pascal"
  },
  "N36": {
    "nombre": "newton second per square metre"
  },
  "N37": {
    "nombre": "kilogram per metre second"
  },
  "N38": {
    "nombre": "kilogram per metre minute"
  },
  "N39": {
    "nombre": "kilogram per metre day"
  },
  "N3": {
    "nombre": "print point"
  },
  "N40": {
    "nombre": "kilogram per metre hour"
  },
  "N41": {
    "nombre": "gram per centimetre second"
  },
  "N42": {
    "nombre": "poundal second per square inch"
  },
  "N43": {
    "nombre": "pound per foot minute"
  },
  "N44": {
    "nombre": "pound per foot day"
  },
  "N45": {
    "nombre": "cubic metre per second pascal"
  },
  "N46": {
    "nombre": "foot poundal"
  },
  "N47": {
    "nombre": "inch poundal"
  },
  "N48": {
    "nombre": "watt per square centimetre"
  },
  "N49": {
    "nombre": "watt per square inch"
  },
  "N50": {
    "nombre": "British thermal unit (international table) per square foot hour"
  },
  "N51": {
    "nombre": "British thermal unit (thermochemical) per square foot hour"
  },
  "N52": {
    "nombre": "British thermal unit (thermochemical) per square foot minute"
  },
  "N53": {
    "nombre": "British thermal unit (international table) per square foot second"
  },
  "N54": {
    "nombre": "British thermal unit (thermochemical) per square foot second"
  },
  "N55": {
    "nombre": "British thermal unit (international table) per square inch second"
  },
  "N56": {
    "nombre": "calorie (thermochemical) per square centimetre minute"
  },
  "N57": {
    "nombre": "calorie (thermochemical) per square centimetre second"
  },
  "N58": {
    "nombre": "British thermal unit (international table) per cubic foot"
  },
  "N59": {
    "nombre": "British thermal unit (thermochemical) per cubic foot"
  },
  "N60": {
    "nombre": "British thermal unit (international table) per degree Fahrenheit"
  },
  "N61": {
    "nombre": "British thermal unit (thermochemical) per degree Fahrenheit"
  },
  "N62": {
    "nombre": "British thermal unit (international table) per degree Rankine"
  },
  "N63": {
    "nombre": "British thermal unit (thermochemical) per degree Rankine"
  },
  "N64": {
    "nombre": "British thermal unit (thermochemical) per pound degree Rankine"
  },
  "N65": {
    "nombre": "kilocalorie (international table) per gram kelvin"
  },
  "N66": {
    "nombre": "British thermal unit (39 oF)"
  },
  "N67": {
    "nombre": "British thermal unit (59 oF)"
  },
  "N68": {
    "nombre": "British thermal unit (60 oF)"
  },
  "N69": {
    "nombre": "calorie (20 oC)"
  },
  "N70": {
    "nombre": "quad (1015 BtuIT)"
  },
  "N71": {
    "nombre": "therm (EC)"
  },
  "N72": {
    "nombre": "therm (U.S.)"
  },
  "N73": {
    "nombre": "British thermal unit (thermochemical) per pound"
  },
  "N74": {
    "nombre": "British thermal unit (international table) per hour square foot degree Fahrenheit"
  },
  "N75": {
    "nombre": "British thermal unit (thermochemical) per hour square foot degree Fahrenheit"
  },
  "N76": {
    "nombre": "British thermal unit (international table) per second square foot degree Fahrenheit"
  },
  "N77": {
    "nombre": "British thermal unit (thermochemical) per second square foot degree Fahrenheit"
  },
  "N78": {
    "nombre": "kilowatt per square metre kelvin"
  },
  "N79": {
    "nombre": "kelvin per pascal"
  },
  "N80": {
    "nombre": "watt per metre degree Celsius"
  },
  "N81": {
    "nombre": "kilowatt per metre kelvin"
  },
  "N82": {
    "nombre": "kilowatt per metre degree Celsius"
  },
  "N83": {
    "nombre": "metre per degree Celcius metre"
  },
  "N84": {
    "nombre": "degree Fahrenheit hour per British thermal unit (international table)"
  },
  "N85": {
    "nombre": "degree Fahrenheit hour per British thermal unit (thermochemical)"
  },
  "N86": {
    "nombre": "degree Fahrenheit second per British thermal unit (international table)"
  },
  "N87": {
    "nombre": "degree Fahrenheit second per British thermal unit (thermochemical)"
  },
  "N88": {
    "nombre": "degree Fahrenheit hour square foot per British thermal unit (international table) inch"
  },
  "N89": {
    "nombre": "degree Fahrenheit hour square foot per British thermal unit (thermochemical) inch"
  },
  "N90": {
    "nombre": "kilofarad"
  },
  "N91": {
    "nombre": "reciprocal joule"
  },
  "N92": {
    "nombre": "picosiemens"
  },
  "N93": {
    "nombre": "ampere per pascal"
  },
  "N94": {
    "nombre": "franklin"
  },
  "N95": {
    "nombre": "ampere minute"
  },
  "N96": {
    "nombre": "biot"
  },
  "N97": {
    "nombre": "gilbert"
  },
  "N98": {
    "nombre": "volt per pascal"
  },
  "N99": {
    "nombre": "picovolt"
  },
  "NAR": {
    "nombre": "number of articles"
  },
  "NA": {
    "nombre": "milligram per kilogram"
  },
  "NBB": {
    "nombre": "number of bobbins"
  },
  "NB": {
    "nombre": "barge"
  },
  "NCL": {
    "nombre": "number of cells"
  },
  "NC": {
    "nombre": "car"
  },
  "ND": {
    "nombre": "net barrel"
  },
  "NEW": {
    "nombre": "newton"
  },
  "NE": {
    "nombre": "net litre"
  },
  "NF": {
    "nombre": "message"
  },
  "NG": {
    "nombre": "net gallon (us)"
  },
  "NH": {
    "nombre": "message hour"
  },
  "NIL": {
    "nombre": "nil"
  },
  "NIU": {
    "nombre": "number of international units"
  },
  "NI": {
    "nombre": "net imperial gallon"
  },
  "NJ": {
    "nombre": "number of screens"
  },
  "NL": {
    "nombre": "load"
  },
  "NM3": {
    "nombre": "Normalised cubic metre"
  },
  "NMI": {
    "nombre": "nautical mile"
  },
  "NMP": {
    "nombre": "number of packs"
  },
  "NN": {
    "nombre": "train"
  },
  "NPL": {
    "nombre": "number of parcels"
  },
  "NPR": {
    "nombre": "number of pairs"
  },
  "NPT": {
    "nombre": "number of parts"
  },
  "NQ": {
    "nombre": "mho"
  },
  "NRL": {
    "nombre": "number of rolls"
  },
  "NR": {
    "nombre": "micromho"
  },
  "NTT": {
    "nombre": "net register ton"
  },
  "NT": {
    "nombre": "net ton"
  },
  "NU": {
    "nombre": "newton metre"
  },
  "NV": {
    "nombre": "vehicle"
  },
  "NX": {
    "nombre": "part per thousand"
  },
  "NY": {
    "nombre": "pound per air dry metric ton"
  },
  "OA": {
    "nombre": "panel"
  },
  "ODE": {
    "nombre": "ozone depletion equivalent"
  },
  "ODG": {
    "nombre": "ODS Grams"
  },
  "ODK": {
    "nombre": "ODS Kilograms"
  },
  "ODM": {
    "nombre": "ODS Milligrams"
  },
  "OHM": {
    "nombre": "ohm"
  },
  "ONZ": {
    "nombre": "ounce (avoirdupois)"
  },
  "ON": {
    "nombre": "ounce per square yard"
  },
  "OPM": {
    "nombre": "oscillations per minute"
  },
  "OP": {
    "nombre": "two pack"
  },
  "OT": {
    "nombre": "overtime hour"
  },
  "OZA": {
    "nombre": "fluid ounce (US)"
  },
  "OZI": {
    "nombre": "fluid ounce (UK)"
  },
  "OZ": {
    "nombre": "ounce av"
  },
  "P0": {
    "nombre": "page - electronic"
  },
  "P10": {
    "nombre": "coulomb per metre"
  },
  "P11": {
    "nombre": "kiloweber"
  },
  "P12": {
    "nombre": "gamma"
  },
  "P13": {
    "nombre": "kilotesla"
  },
  "P14": {
    "nombre": "joule per second"
  },
  "P15": {
    "nombre": "joule per minute"
  },
  "P16": {
    "nombre": "joule per hour"
  },
  "P17": {
    "nombre": "joule per day"
  },
  "P18": {
    "nombre": "kilojoule per second"
  },
  "P19": {
    "nombre": "kilojoule per minute"
  },
  "P1": {
    "nombre": "percent"
  },
  "P20": {
    "nombre": "kilojoule per hour"
  },
  "P21": {
    "nombre": "kilojoule per day"
  },
  "P22": {
    "nombre": "nanoohm"
  },
  "P23": {
    "nombre": "ohm circular-mil per foot"
  },
  "P24": {
    "nombre": "kilohenry"
  },
  "P25": {
    "nombre": "lumen per square foot"
  },
  "P26": {
    "nombre": "phot"
  },
  "P27": {
    "nombre": "footcandle"
  },
  "P28": {
    "nombre": "candela per square inch"
  },
  "P29": {
    "nombre": "footlambert"
  },
  "P2": {
    "nombre": "pound per foot"
  },
  "P30": {
    "nombre": "lambert"
  },
  "P31": {
    "nombre": "stilb"
  },
  "P32": {
    "nombre": "candela per square foot"
  },
  "P33": {
    "nombre": "kilocandela"
  },
  "P34": {
    "nombre": "millicandela"
  },
  "P35": {
    "nombre": "Hefner-Kerze"
  },
  "P36": {
    "nombre": "international candle"
  },
  "P37": {
    "nombre": "British thermal unit (international table) per square foot"
  },
  "P38": {
    "nombre": "British thermal unit (thermochemical) per square foot"
  },
  "P39": {
    "nombre": "calorie (thermochemical) per square centimetre"
  },
  "P3": {
    "nombre": "three pack"
  },
  "P40": {
    "nombre": "langley"
  },
  "P41": {
    "nombre": "decade (logarithmic)"
  },
  "P42": {
    "nombre": "pascal squared second"
  },
  "P43": {
    "nombre": "bel per metre"
  },
  "P44": {
    "nombre": "pound mole"
  },
  "P45": {
    "nombre": "pound mole per second"
  },
  "P46": {
    "nombre": "pound mole per minute"
  },
  "P47": {
    "nombre": "kilomole per kilogram"
  },
  "P48": {
    "nombre": "pound mole per pound"
  },
  "P49": {
    "nombre": "newton square metre per ampere"
  },
  "P4": {
    "nombre": "four pack"
  },
  "P50": {
    "nombre": "weber metre"
  },
  "P51": {
    "nombre": "mol per kilogram pascal"
  },
  "P52": {
    "nombre": "mol per cubic metre pascal"
  },
  "P53": {
    "nombre": "unit pole"
  },
  "P54": {
    "nombre": "milligray per second"
  },
  "P55": {
    "nombre": "microgray per second"
  },
  "P56": {
    "nombre": "nanogray per second"
  },
  "P57": {
    "nombre": "gray per minute"
  },
  "P58": {
    "nombre": "milligray per minute"
  },
  "P59": {
    "nombre": "microgray per minute"
  },
  "P5": {
    "nombre": "five pack"
  },
  "P60": {
    "nombre": "nanogray per minute"
  },
  "P61": {
    "nombre": "gray per hour"
  },
  "P62": {
    "nombre": "milligray per hour"
  },
  "P63": {
    "nombre": "microgray per hour"
  },
  "P64": {
    "nombre": "nanogray per hour"
  },
  "P65": {
    "nombre": "sievert per second"
  },
  "P66": {
    "nombre": "millisievert per second"
  },
  "P67": {
    "nombre": "microsievert per second"
  },
  "P68": {
    "nombre": "nanosievert per second"
  },
  "P69": {
    "nombre": "rem per second"
  },
  "P6": {
    "nombre": "six pack"
  },
  "P70": {
    "nombre": "sievert per hour"
  },
  "P71": {
    "nombre": "millisievert per hour"
  },
  "P72": {
    "nombre": "microsievert per hour"
  },
  "P73": {
    "nombre": "nanosievert per hour"
  },
  "P74": {
    "nombre": "sievert per minute"
  },
  "P75": {
    "nombre": "millisievert per minute"
  },
  "P76": {
    "nombre": "microsievert per minute"
  },
  "P77": {
    "nombre": "nanosievert per minute"
  },
  "P78": {
    "nombre": "reciprocal square inch"
  },
  "P79": {
    "nombre": "pascal square metre per kilogram"
  },
  "P7": {
    "nombre": "seven pack"
  },
  "P80": {
    "nombre": "millipascal per metre"
  },
  "P81": {
    "nombre": "kilopascal per metre"
  },
  "P82": {
    "nombre": "hectopascal per metre"
  },
  "P83": {
    "nombre": "standard atmosphere per metre"
  },
  "P84": {
    "nombre": "technical atmosphere per metre"
  },
  "P85": {
    "nombre": "torr per metre"
  },
  "P86": {
    "nombre": "psi per inch"
  },
  "P87": {
    "nombre": "cubic metre per second square metre"
  },
  "P88": {
    "nombre": "rhe"
  },
  "P89": {
    "nombre": "pound-force foot per inch"
  },
  "P8": {
    "nombre": "eight pack"
  },
  "P90": {
    "nombre": "pound-force inch per inch"
  },
  "P91": {
    "nombre": "perm (0 oC)"
  },
  "P92": {
    "nombre": "perm (23 oC)"
  },
  "P93": {
    "nombre": "byte per second"
  },
  "P94": {
    "nombre": "kilobyte per second"
  },
  "P95": {
    "nombre": "megabyte per second"
  },
  "P96": {
    "nombre": "reciprocal volt"
  },
  "P97": {
    "nombre": "reciprocal radian"
  },
  "P98": {
    "nombre": "pascal to the power sum of stoichiometric numbers"
  },
  "P99": {
    "nombre": "mole per cubiv metre to the power sum of stoichiometric numbers"
  },
  "P9": {
    "nombre": "nine pack"
  },
  "PAL": {
    "nombre": "pascal"
  },
  "PA": {
    "nombre": "packet"
  },
  "PB": {
    "nombre": "pair inch"
  },
  "PD": {
    "nombre": "pad"
  },
  "PE": {
    "nombre": "pound equivalent"
  },
  "PFL": {
    "nombre": "proof litre"
  },
  "PF": {
    "nombre": "pallet (lift)"
  },
  "PGL": {
    "nombre": "proof gallon"
  },
  "PG": {
    "nombre": "plate"
  },
  "PI": {
    "nombre": "pitch"
  },
  "PK": {
    "nombre": "pack"
  },
  "PLA": {
    "nombre": "degree Plato"
  },
  "PL": {
    "nombre": "pail"
  },
  "PM": {
    "nombre": "pound percentage"
  },
  "PN": {
    "nombre": "pound net"
  },
  "PO": {
    "nombre": "pound per inch of length"
  },
  "PQ": {
    "nombre": "page per inch"
  },
  "PR": {
    "nombre": "pair"
  },
  "PS": {
    "nombre": "pound-force per square inch"
  },
  "PTD": {
    "nombre": "dry pint (US)"
  },
  "PTI": {
    "nombre": "pint (UK)"
  },
  "PTL": {
    "nombre": "liquid pint (US)"
  },
  "PTN": {
    "nombre": "portion"
  },
  "PT": {
    "nombre": "pint (US)"
  },
  "PU": {
    "nombre": "tray / tray pack"
  },
  "PV": {
    "nombre": "half pint (US)"
  },
  "PW": {
    "nombre": "pound per inch of width"
  },
  "PY": {
    "nombre": "peck dry (US)"
  },
  "PZ": {
    "nombre": "peck dry (UK)"
  },
  "Q10": {
    "nombre": "joule per tesla"
  },
  "Q11": {
    "nombre": "erlang"
  },
  "Q12": {
    "nombre": "octet"
  },
  "Q13": {
    "nombre": "octet per second"
  },
  "Q14": {
    "nombre": "shannon"
  },
  "Q15": {
    "nombre": "hartley"
  },
  "Q16": {
    "nombre": "natural unit of information"
  },
  "Q17": {
    "nombre": "shannon per second"
  },
  "Q18": {
    "nombre": "hartley per second"
  },
  "Q19": {
    "nombre": "natural unit of information per second"
  },
  "Q20": {
    "nombre": "second per kilogramm"
  },
  "Q21": {
    "nombre": "watt square metre"
  },
  "Q22": {
    "nombre": "second per radian cubic metre"
  },
  "Q23": {
    "nombre": "weber to the power minus one"
  },
  "Q24": {
    "nombre": "reciprocal inch"
  },
  "Q25": {
    "nombre": "dioptre"
  },
  "Q26": {
    "nombre": "one per one"
  },
  "Q27": {
    "nombre": "newton metre per metre"
  },
  "Q28": {
    "nombre": "kilogram per square metre pascal second"
  },
  "Q29": {
    "nombre": "microgram per hectogram"
  },
  "Q30": {
    "nombre": "pH (potential of Hydrogen)"
  },
  "Q31": {
    "nombre": "kilojoule per gram"
  },
  "Q32": {
    "nombre": "femtolitre"
  },
  "Q33": {
    "nombre": "picolitre"
  },
  "Q34": {
    "nombre": "nanolitre"
  },
  "Q35": {
    "nombre": "megawatts per minute"
  },
  "Q36": {
    "nombre": "square metre per cubic metre"
  },
  "Q37": {
    "nombre": "Standard cubic metre per day"
  },
  "Q38": {
    "nombre": "Standard cubic metre per hour"
  },
  "Q39": {
    "nombre": "Normalized cubic metre per day"
  },
  "Q3": {
    "nombre": "meal"
  },
  "Q40": {
    "nombre": "Normalized cubic metre per hour"
  },
  "Q41": {
    "nombre": "Joule per normalised cubic metre"
  },
  "Q42": {
    "nombre": "Joule per standard cubic metre"
  },
  "QAN": {
    "nombre": "quarter (of a year)"
  },
  "QA": {
    "nombre": "page - facsimile"
  },
  "QB": {
    "nombre": "page - hardcopy"
  },
  "QD": {
    "nombre": "quarter dozen"
  },
  "QH": {
    "nombre": "quarter hour"
  },
  "QK": {
    "nombre": "quarter kilogram"
  },
  "QR": {
    "nombre": "quire"
  },
  "QTD": {
    "nombre": "dry quart (US)"
  },
  "QTI": {
    "nombre": "quart (UK)"
  },
  "QTL": {
    "nombre": "liquid quart (US)"
  },
  "QTR": {
    "nombre": "quarter (UK)"
  },
  "QT": {
    "nombre": "quart (US)"
  },
  "R1": {
    "nombre": "pica"
  },
  "R4": {
    "nombre": "calorie"
  },
  "R9": {
    "nombre": "thousand cubic metre"
  },
  "RA": {
    "nombre": "rack"
  },
  "RD": {
    "nombre": "rod"
  },
  "RG": {
    "nombre": "ring"
  },
  "RH": {
    "nombre": "running or operating hour"
  },
  "RK": {
    "nombre": "roll metric measure"
  },
  "RL": {
    "nombre": "reel"
  },
  "RM": {
    "nombre": "ream"
  },
  "RN": {
    "nombre": "ream metric measure"
  },
  "ROM": {
    "nombre": "room"
  },
  "RO": {
    "nombre": "roll"
  },
  "RPM": {
    "nombre": "revolutions per minute"
  },
  "RPS": {
    "nombre": "revolutions per second"
  },
  "RP": {
    "nombre": "pound per ream"
  },
  "RS": {
    "nombre": "reset"
  },
  "RT": {
    "nombre": "revenue ton mile"
  },
  "RU": {
    "nombre": "run"
  },
  "S3": {
    "nombre": "square foot per second"
  },
  "S4": {
    "nombre": "square metre per second"
  },
  "S5": {
    "nombre": "sixty fourths of an inch"
  },
  "S6": {
    "nombre": "session"
  },
  "S7": {
    "nombre": "storage unit"
  },
  "S8": {
    "nombre": "standard advertising unit"
  },
  "SAN": {
    "nombre": "half year (6 months)"
  },
  "SA": {
    "nombre": "sack"
  },
  "SCO": {
    "nombre": "score"
  },
  "SCR": {
    "nombre": "scruple"
  },
  "SD": {
    "nombre": "solid pound"
  },
  "SEC": {
    "nombre": "second [unit of time]"
  },
  "SET": {
    "nombre": "set"
  },
  "SE": {
    "nombre": "section"
  },
  "SG": {
    "nombre": "segment"
  },
  "SHT": {
    "nombre": "shipping ton"
  },
  "SIE": {
    "nombre": "siemens"
  },
  "SK": {
    "nombre": "split tank truck"
  },
  "SL": {
    "nombre": "slipsheet"
  },
  "SM3": {
    "nombre": "Standard cubic metre"
  },
  "SMI": {
    "nombre": "mile (statute mile)"
  },
  "SN": {
    "nombre": "square rod"
  },
  "SO": {
    "nombre": "spool"
  },
  "SP": {
    "nombre": "shelf package"
  },
  "SQR": {
    "nombre": "square, roofing"
  },
  "SQ": {
    "nombre": "square"
  },
  "SR": {
    "nombre": "strip"
  },
  "SST": {
    "nombre": "short standard (7200 matches)"
  },
  "SS": {
    "nombre": "sheet metric measure"
  },
  "STC": {
    "nombre": "stick"
  },
  "STI": {
    "nombre": "stone (UK)"
  },
  "STK": {
    "nombre": "stick, cigarette"
  },
  "STL": {
    "nombre": "standard litre"
  },
  "STN": {
    "nombre": "ton (US) or short ton (UK/US)"
  },
  "STW": {
    "nombre": "straw"
  },
  "ST": {
    "nombre": "sheet"
  },
  "SV": {
    "nombre": "skid"
  },
  "SW": {
    "nombre": "skein"
  },
  "SX": {
    "nombre": "shipment"
  },
  "SYR": {
    "nombre": "syringe"
  },
  "T0": {
    "nombre": "telecommunication line in service"
  },
  "T1": {
    "nombre": "thousand pound gross"
  },
  "T3": {
    "nombre": "thousand piece"
  },
  "T4": {
    "nombre": "thousand bag"
  },
  "T5": {
    "nombre": "thousand casing"
  },
  "T6": {
    "nombre": "thousand gallon (US)"
  },
  "T7": {
    "nombre": "thousand impression"
  },
  "T8": {
    "nombre": "thousand linear inch"
  },
  "TAH": {
    "nombre": "kiloampere hour (thousand ampere hour)"
  },
  "TAN": {
    "nombre": "total acid number"
  },
  "TA": {
    "nombre": "tenth cubic foot"
  },
  "TC": {
    "nombre": "truckload"
  },
  "TD": {
    "nombre": "therm"
  },
  "TE": {
    "nombre": "tote"
  },
  "TF": {
    "nombre": "ten square yard"
  },
  "TIC": {
    "nombre": "metric ton, including container"
  },
  "TIP": {
    "nombre": "metric ton, including inner packaging"
  },
  "TI": {
    "nombre": "thousand square inch"
  },
  "TJ": {
    "nombre": "thousand square centimetre"
  },
  "TKM": {
    "nombre": "tonne kilometre"
  },
  "TK": {
    "nombre": "tank, rectangular"
  },
  "TL": {
    "nombre": "thousand foot (linear)"
  },
  "TMS": {
    "nombre": "kilogram of imported meat, less offal"
  },
  "TNE": {
    "nombre": "tonne (metric ton)"
  },
  "TN": {
    "nombre": "tin"
  },
  "TPI": {
    "nombre": "teeth per inch"
  },
  "TPR": {
    "nombre": "ten pair"
  },
  "TP": {
    "nombre": "ten pack"
  },
  "TQD": {
    "nombre": "thousand cubic metre per day"
  },
  "TQ": {
    "nombre": "thousand foot"
  },
  "TRL": {
    "nombre": "trillion (EUR)"
  },
  "TR": {
    "nombre": "ten square foot"
  },
  "TSD": {
    "nombre": "tonne of substance 90 % dry"
  },
  "TSH": {
    "nombre": "ton of steam per hour"
  },
  "TST": {
    "nombre": "ten set"
  },
  "TS": {
    "nombre": "thousand square foot"
  },
  "TTS": {
    "nombre": "ten thousand sticks"
  },
  "TT": {
    "nombre": "thousand linear metre"
  },
  "TU": {
    "nombre": "tube"
  },
  "TV": {
    "nombre": "thousand kilogram"
  },
  "TW": {
    "nombre": "thousand sheet"
  },
  "TY": {
    "nombre": "tank, cylindrical"
  },
  "U1": {
    "nombre": "treatment"
  },
  "U2": {
    "nombre": "tablet"
  },
  "UA": {
    "nombre": "torr"
  },
  "UB": {
    "nombre": "telecommunication line in service average"
  },
  "UC": {
    "nombre": "telecommunication port"
  },
  "UD": {
    "nombre": "tenth minute"
  },
  "UE": {
    "nombre": "tenth hour"
  },
  "UF": {
    "nombre": "usage per telecommunication line average"
  },
  "UH": {
    "nombre": "ten thousand yard"
  },
  "UM": {
    "nombre": "million unit"
  },
  "VA": {
    "nombre": "volt - ampere per kilogram"
  },
  "VI": {
    "nombre": "vial"
  },
  "VLT": {
    "nombre": "volt"
  },
  "VP": {
    "nombre": "percent volume"
  },
  "VQ": {
    "nombre": "bulk"
  },
  "VS": {
    "nombre": "visit"
  },
  "W2": {
    "nombre": "wet kilo"
  },
  "W4": {
    "nombre": "two week"
  },
  "WA": {
    "nombre": "watt per kilogram"
  },
  "WB": {
    "nombre": "wet pound"
  },
  "WCD": {
    "nombre": "cord"
  },
  "WEB": {
    "nombre": "weber"
  },
  "WEE": {
    "nombre": "week"
  },
  "WE": {
    "nombre": "wet ton"
  },
  "WG": {
    "nombre": "wine gallon"
  },
  "WHR": {
    "nombre": "watt hour"
  },
  "WH": {
    "nombre": "wheel"
  },
  "WI": {
    "nombre": "weight per square inch"
  },
  "WM": {
    "nombre": "working month"
  },
  "WR": {
    "nombre": "wrap"
  },
  "WSD": {
    "nombre": "standard"
  },
  "WTT": {
    "nombre": "watt"
  },
  "WW": {
    "nombre": "millilitre of water"
  },
  "X1": {
    "nombre": "Gunter's chain"
  },
  "YDK": {
    "nombre": "square yard"
  },
  "YDQ": {
    "nombre": "cubic yard"
  },
  "YL": {
    "nombre": "hundred linear yard"
  },
  "YRD": {
    "nombre": "yard"
  },
  "YT": {
    "nombre": "ten yard"
  },
  "Z11": {
    "nombre": "hanging container"
  },
  "Z1": {
    "nombre": "lift van"
  },
  "Z2": {
    "nombre": "chest"
  },
  "Z3": {
    "nombre": "cask"
  },
  "Z4": {
    "nombre": "hogshead"
  },
  "Z5": {
    "nombre": "lug"
  },
  "Z6": {
    "nombre": "conference point"
  },
  "Z8": {
    "nombre": "newspage agate line"
  },
  "ZP": {
    "nombre": "page"
  },
  "ZZ": {
    "nombre": "mutually defined"
  }
} as const;

/** Catálogo N.° 05: Tipos de tributos. Fuente: cat_05.xml (sha256 a7c97940e874ef75c4b3229ddee7c832356d35f71e4a277c8bb93bf1f27a87dc). */
export const catalogo05 = {
  "1000": {
    "nombre": "IGV IMPUESTO GENERAL A LAS VENTAS",
    "UN_ECE_5153": "VAT",
    "categoria": "S",
    "name": "IGV"
  },
  "1016": {
    "nombre": "IMPUESTO A LA VENTA ARROZ PILADO",
    "UN_ECE_5153": "VAT",
    "categoria": "S",
    "name": "IVAP"
  },
  "2000": {
    "nombre": "ISC IMPUESTO SELECTIVO AL CONSUMO",
    "UN_ECE_5153": "EXC",
    "categoria": "S",
    "name": "ISC"
  },
  "3000": {
    "nombre": "Impuesto a la Renta",
    "UN_ECE_5153": "TOX",
    "categoria": "S",
    "name": "IR"
  },
  "7152": {
    "nombre": "IMPUESTO A LA BOLSA PLASTICA",
    "UN_ECE_5153": "OTH",
    "categoria": "S",
    "name": "ICBPER"
  },
  "9995": {
    "nombre": "Operaciones de Exportacion",
    "UN_ECE_5153": "FRE",
    "categoria": "G",
    "name": "EXP"
  },
  "9996": {
    "nombre": "Operaciones Gratuitas",
    "UN_ECE_5153": "FRE",
    "categoria": "Z",
    "name": "GRA"
  },
  "9997": {
    "nombre": "Operaciones Exoneradas",
    "UN_ECE_5153": "VAT",
    "categoria": "E",
    "name": "EXO"
  },
  "9998": {
    "nombre": "Operaciones Inafectas",
    "UN_ECE_5153": "FRE",
    "categoria": "O",
    "name": "INA"
  },
  "9999": {
    "nombre": "OTROS CONCEPTOS DE PAGO",
    "UN_ECE_5153": "OTH",
    "categoria": "S",
    "name": "OTROS"
  }
} as const;

/** Catálogo N.° 06: Tipos de documento de identidad. Fuente: cat_06.xml (sha256 20038c6b7f4ae6427b3810d84f72a75bf994a218e3ff975033252b24f5eb7527). */
export const catalogo06 = {
  "0": {
    "nombre": "DOC.TRIB.NO.DOM.SIN.RUC"
  },
  "1": {
    "nombre": "DOC. NACIONAL DE IDENTIDAD"
  },
  "4": {
    "nombre": "CARNET DE EXTRANJERIA"
  },
  "6": {
    "nombre": "REG. UNICO DE CONTRIBUYENTES"
  },
  "7": {
    "nombre": "PASAPORTE"
  },
  "A": {
    "nombre": "CED. DIPLOMATICA DE IDENTIDAD"
  },
  "B": {
    "nombre": "DOC.IDENT.PAIS.RESIDENCIA-NO.D"
  },
  "C": {
    "nombre": "Tax Identification Number - TIN – Doc Trib PP.NN"
  },
  "D": {
    "nombre": "Identification Number - IN – Doc Trib PP. JJ"
  },
  "E": {
    "nombre": "TAM- Tarjeta Andina de Migración"
  },
  "F": {
    "nombre": "Permiso Temporal de Permanencia - PTP"
  },
  "G": {
    "nombre": "Salvoconducto"
  }
} as const;

/** Catálogo N.° 07: Tipo de afectación del IGV. Fuente: cat_07.xml (sha256 e0f8509e81cb1e504b09a33cf881104512e8807192fac3fe06f0e03aeafde79e). */
export const catalogo07 = {
  "10": {
    "nombre": "Gravado - Operación Onerosa",
    "igv": "1"
  },
  "11": {
    "nombre": "Gravado – Retiro por premio",
    "gra": "1"
  },
  "12": {
    "nombre": "Gravado – Retiro por donación",
    "gra": "1"
  },
  "13": {
    "nombre": "Gravado – Retiro",
    "gra": "1"
  },
  "14": {
    "nombre": "Gravado – Retiro por publicidad",
    "gra": "1"
  },
  "15": {
    "nombre": "Gravado – Bonificaciones",
    "gra": "1"
  },
  "16": {
    "nombre": "Gravado – Retiro por entrega a trabajadores",
    "gra": "1"
  },
  "17": {
    "nombre": "Gravado - IVAP",
    "iva": "1",
    "gra": "1"
  },
  "20": {
    "nombre": "Exonerado - Operación Onerosa",
    "exo": "1"
  },
  "21": {
    "nombre": "Exonerado - Transferencia gratuita",
    "gra": "1"
  },
  "22": {
    "nombre": "Exonerado - Retiro por premio",
    "gra": "1"
  },
  "30": {
    "nombre": "Inafecto - Operación Onerosa",
    "ina": "1"
  },
  "31": {
    "nombre": "Inafecto – Retiro por Bonificación",
    "gra": "1"
  },
  "32": {
    "nombre": "Inafecto – Retiro",
    "gra": "1"
  },
  "33": {
    "nombre": "Inafecto – Retiro por Muestras Médicas",
    "gra": "1"
  },
  "34": {
    "nombre": "Inafecto - Retiro por Convenio Colectivo",
    "gra": "1"
  },
  "35": {
    "nombre": "Inafecto – Retiro por premio",
    "gra": "1"
  },
  "36": {
    "nombre": "Inafecto - Retiro por publicidad",
    "gra": "1"
  },
  "37": {
    "nombre": "Inafecto - Transferencia gratuita",
    "gra": "1"
  },
  "40": {
    "nombre": "Exportación",
    "exp": "1",
    "gra": "1"
  }
} as const;

/** Catálogo N.° 09: Tipo de nota de crédito. Fuente: cat_09.xml (sha256 cf9075971c01efc5ebbe22a9d630509c24113dbbea16a1f8584017505c028d6e). */
export const catalogo09 = {
  "10": {
    "nombre": "Otros Conceptos"
  },
  "11": {
    "nombre": "Ajustes de operaciones de exportación"
  },
  "12": {
    "nombre": "Ajustes afectos al IVAP"
  },
  "13": {
    "nombre": "Ajustes – montos y/o fechas de pago"
  },
  "01": {
    "nombre": "Anulación de la operación"
  },
  "02": {
    "nombre": "Anulación por error en el RUC"
  },
  "03": {
    "nombre": "Corrección por error en la descripción"
  },
  "04": {
    "nombre": "Descuento global"
  },
  "05": {
    "nombre": "Descuento por ítem"
  },
  "06": {
    "nombre": "Devolución total"
  },
  "07": {
    "nombre": "Devolución por ítem"
  },
  "08": {
    "nombre": "Bonificación"
  },
  "09": {
    "nombre": "Disminución en el valor"
  }
} as const;

/** Códigos de error y observación de SUNAT. Fuente: CatalogoErrores.xml (sha256 6920cf5e0aedf5f2e6d8b349202a0f59e13afa42bc3f3b100951a002ebd48878). */
export const codigosError: Readonly<Record<string, string>> = {
  "1001": "ID - El dato SERIE-CORRELATIVO no cumple con el formato de acuerdo al tipo de comprobante",
  "1002": "El XML no contiene informacion en el tag ID",
  "1003": "InvoiceTypeCode - El valor del tipo de documento es invalido o no coincide con el nombre del archivo",
  "1004": "El XML no contiene el tag o no existe informacion de InvoiceTypeCode",
  "1005": "CustomerAssignedAccountID -  El dato ingresado no cumple con el estandar",
  "1006": "El XML no contiene el tag o no existe informacion de CustomerAssignedAccountID del emisor del documento",
  "1007": "El dato ingresado no cumple con el estandar",
  "1008": "El XML no contiene el tag o no existe informacion en tipo de documento del emisor.",
  "1009": "IssueDate - El dato ingresado  no cumple con el patron YYYY-MM-DD",
  "1010": "El XML no contiene el tag IssueDate",
  "1011": "IssueDate- El dato ingresado no es valido",
  "1012": "ID - El dato ingresado no cumple con el patron SERIE-CORRELATIVO",
  "1013": "El XML no contiene informacion en el tag ID",
  "1014": "CustomerAssignedAccountID - El dato ingresado no cumple con el estandar",
  "1015": "El XML no contiene el tag o no existe informacion de CustomerAssignedAccountID del emisor del documento",
  "1016": "AdditionalAccountID - El dato ingresado no cumple con el estandar",
  "1017": "El XML no contiene el tag AdditionalAccountID del emisor del documento",
  "1018": "IssueDate - El dato ingresado no cumple con el patron YYYY-MM-DD",
  "1019": "El XML no contiene el tag IssueDate",
  "1020": "IssueDate- El dato ingresado no es valido",
  "1021": "Error en la validacion de la nota de credito",
  "1022": "La serie o numero del documento modificado por la Nota Electrónica no cumple con el formato establecido",
  "1023": "No se ha especificado el tipo de documento modificado por la Nota electronica",
  "1024": "CustomerAssignedAccountID - El dato ingresado no cumple con el estandar",
  "1025": "El XML no contiene el tag o no existe informacion de CustomerAssignedAccountID del emisor del documento",
  "1026": "AdditionalAccountID - El dato ingresado no cumple con el estandar",
  "1027": "El XML no contiene el tag AdditionalAccountID del emisor del documento",
  "1028": "IssueDate - El dato ingresado no cumple con el patron YYYY-MM-DD",
  "1029": "El XML no contiene el tag IssueDate",
  "1030": "IssueDate- El dato ingresado no es valido",
  "1031": "Error en la validacion de la nota de debito",
  "1032": "El comprobante ya esta informado y se encuentra con estado anulado o rechazado",
  "1033": "El comprobante fue registrado previamente con otros datos",
  "1034": "Número de RUC del nombre del archivo no coincide con el consignado en el contenido del archivo XML",
  "1035": "Numero de Serie del nombre del archivo no coincide con el consignado en el contenido del archivo XML",
  "1036": "Número de documento en el nombre del archivo no coincide con el consignado en el contenido del XML",
  "1037": "El XML no contiene el tag o no existe informacion de RegistrationName del emisor del documento",
  "1038": "RegistrationName - El nombre o razon social del emisor no cumple con el estandar",
  "1039": "Solo se pueden recibir notas electronicas que modifican facturas",
  "1040": "El tipo de documento modificado por la nota electronica no es valido",
  "1041": "cac:PrepaidPayment/cbc:ID - El tag no contiene el atributo @SchemaID. que indica el tipo de documento que realiza el anticipo",
  "1042": "cac:PrepaidPayment/cbc:InstructionID - El tag no contiene el atributo @SchemaID. Que indica el tipo de documento del emisor del documento del anticipo.",
  "1043": "cac:OriginatorDocumentReference/cbc:ID - El tag no contiene el atributo @SchemaID. Que indica el tipo de documento del originador del documento electrónico.",
  "1044": "cac:PrepaidPayment/cbc:InstructionID - El dato ingresado no cumple con el estándar.",
  "1045": "cac:OriginatorDocumentReference/cbc:ID - El dato ingresado no cumple con el estándar.",
  "1046": "cbc:Amount - El dato ingresado no cumple con el estándar.",
  "1047": "cbc:Quantity - El dato ingresado no cumple con el estándar.",
  "1048": "El XML no contiene el tag o no existe información de PrepaidAmount para un documento con anticipo.",
  "1049": "ID - Serie y Número del archivo no coincide con el consignado en el contenido del XML.",
  "1050": "El XML no contiene informacion en el tag DespatchAdviceTypeCode.",
  "1051": "DespatchAdviceTypeCode - El valor del tipo de guía es inválido.",
  "1052": "DespatchAdviceTypeCode - No coincide con el consignado en el contenido del XML.",
  "1053": "cac:OrderReference - El XML no contiene informacion en serie y numero dado de baja (cbc:ID).",
  "1054": "cac:OrderReference - El valor en numero de documento no cumple con un formato valido (SERIE-NUMERO).",
  "1055": "cac:OrderReference - Numero de serie del documento no cumple con un formato valido (EG01 ó TXXX).",
  "1056": "cac:OrderReference - El XML no contiene informacion en el código de tipo de documento (cbc:OrderTypeCode).",
  "1057": "cac:AdditionalDocumentReference - El XML no contiene el tag o no existe información en el numero de documento adicional (cbc:ID).",
  "1058": "cac:AdditionalDocumentReference - El XML no contiene el tag o no existe información en el tipo de documento adicional (cbc:DocumentTypeCode).",
  "1059": "El XML no contiene firma digital.",
  "1060": "cac:Shipment - El XML no contiene el tag o no existe informacion del numero de RUC del Remitente (cac:).",
  "1061": "El numero de RUC del Remitente no existe.",
  "1062": "El XML no contiene el atributo o no existe informacion del motivo de traslado.",
  "1063": "El valor ingresado como motivo de traslado no es valido.",
  "1064": "El XML no contiene el atributo o no existe informacion en el tag cac:DespatchLine de bienes a transportar.",
  "1065": "El XML no contiene el atributo o no existe informacion en modalidad de transporte.",
  "1066": "El XML no contiene el atributo o no existe informacion de datos del transportista.",
  "1067": "El XML no contiene el atributo o no existe información de vehiculos.",
  "1068": "El XML no contiene el atributo o no existe información de conductores.",
  "1069": "El XML no contiene el atributo o no existe información de la fecha de inicio de traslado o fecha de entrega del bien al transportista.",
  "1070": "El valor ingresado  como fecha de inicio o fecha de entrega al transportista no cumple con el estandar (YYYY-MM-DD).",
  "1071": "El valor ingresado  como fecha de inicio o fecha de entrega al transportista no es valido.",
  "1072": "Starttime - El dato ingresado  no cumple con el patron HH:mm:ss.SZ.",
  "1073": "StartTime - El dato ingresado no es valido.",
  "1074": "cac:Shipment - El XML no contiene o no existe información en punto de llegada (cac:DeliveryAddress).",
  "1075": "cac:Shipment - El XML no contiene o no existe información en punto de partida (cac:OriginAddress).",
  "1076": "El XML no contiene el atributo o no existe información de sustento de traslado de mercaderias para el tipo de operación.",
  "1077": "El XML contiene el tag de sustento de traslado de mercaderias que no corresponde al tipo de operación.",
  "1078": "El emisor no se encuentra autorizado a emitir en el SEE-Desde los sistemas del contribuyente",
  "1079": "Solo puede enviar el comprobante en un resumen diario",
  "1080": "Debe enviar su comprobante por el SEE-Empresas supervisadas",
  "1081": "Por el servicio REST de recepcion solo se reciben comprobantes asociados a servicios publicos",
  "1082": "Por el servicio SOAP de recepcion no se reciben comprobantes asociados a servicios publicos",
  "1083": "El numero de RUC del receptor no existe.",
  "1084": "Comprobante de contingencia ya fue informado por su resumen, si desea modificarse debe realizarse por su primer canal de presentación",
  "1085": "Debe enviar las guias de remisión por el nuevo sistema de recepción de guias electronicas",
  "2010": "El contribuyente no esta activo",
  "2011": "El contribuyente no esta habido",
  "2012": "El contribuyente no está autorizado a emitir comprobantes electrónicos",
  "2013": "El contribuyente no cumple con tipo de empresa o tributos requeridos",
  "2014": "El XML no contiene el tag o no existe informacion del número de documento de identidad del receptor del documento",
  "2015": "El XML no contiene el tag o no existe informacion del tipo de documento de identidad del receptor del documento",
  "2016": "El dato ingresado  en el tipo de documento de identidad del receptor no cumple con el estandar o no esta permitido.",
  "2017": "El numero de documento de identidad del receptor debe ser  RUC",
  "2018": "El dato ingresado no cumple con el estandar",
  "2019": "El XML no contiene el tag o no existe informacion de nombre o razon social del emisor del documento",
  "2020": "El nombre o razon social del emisor no cumple con el estandar",
  "2021": "El XML no contiene el tag o no existe informacion de RegistrationName del receptor del documento",
  "2022": "RegistrationName -  El dato ingresado no cumple con el estandar",
  "2023": "El Numero de orden del item no cumple con el formato establecido",
  "2024": "El XML no contiene el tag InvoicedQuantity en el detalle de los Items o es cero (0)",
  "2025": "InvoicedQuantity El dato ingresado no cumple con el estandar",
  "2026": "El XML no contiene el tag cac:Item/cbc:Description en el detalle de los Items",
  "2027": "El XML no contiene el tag o no existe informacion de cac:Item/cbc:Description del item",
  "2028": "Debe existir el tag cac:AlternativeConditionPrice",
  "2029": "PriceTypeCode El dato ingresado no cumple con el estandar",
  "2030": "El XML no contiene el tag cbc:PriceTypeCode",
  "2031": "El dato ingresado en total valor de venta no cumple con el estandar",
  "2032": "El XML no contiene el tag LineExtensionAmount en el detalle de los Items",
  "2033": "El dato ingresado en TaxAmount de la linea no cumple con el formato establecido",
  "2034": "TaxAmount es obligatorio",
  "2035": "cac:TaxCategory/cac:TaxScheme/cbc:ID El dato ingresado no cumple con el estandar",
  "2036": "El codigo del tributo es invalido",
  "2037": "El XML no contiene el tag cac:TaxCategory/cac:TaxScheme/cbc:ID del Item",
  "2038": "cac:TaxScheme/cbc:Name del item - No existe el tag o el dato ingresado no cumple con el estandar",
  "2039": "El XML no contiene el tag cac:TaxCategory/cac:TaxScheme/cbc:Name del Item",
  "2040": "El tipo de afectacion del IGV es incorrecto",
  "2041": "El sistema de calculo del ISC es incorrecto",
  "2042": "Debe indicar el IGV. Es un campo obligatorio",
  "2043": "El dato ingresado en PayableAmount no cumple con el formato establecido",
  "2044": "PayableAmount es obligatorio",
  "2045": "El valor ingresado en AdditionalMonetaryTotal/cbc:ID es incorrecto",
  "2046": "AdditionalMonetaryTotal/cbc:ID debe tener valor",
  "2047": "Es obligatorio al menos un AdditionalMonetaryTotal con codigo 1001, 1002, 1003 o 3001",
  "2048": "El dato ingresado en TaxAmount no cumple con el formato establecido",
  "2049": "TaxAmount es obligatorio",
  "2050": "TaxScheme ID - No existe el tag o el dato ingresado no cumple con el estandar",
  "2051": "El codigo del tributo es invalido",
  "2052": "El XML no contiene el tag código de tributo internacional de impuestos globales",
  "2053": "TaxScheme Name - No existe el tag o el dato ingresado no cumple con el estandar",
  "2054": "El XML no contiene el tag TaxScheme Name de impuestos globales",
  "2055": "TaxScheme TaxTypeCode - El dato ingresado no cumple con el estandar",
  "2056": "El XML no contiene el tag TaxScheme TaxTypeCode de impuestos globales",
  "2057": "El Name o TaxTypeCode debe corresponder con el Id para el IGV",
  "2058": "El Name o TaxTypeCode debe corresponder con el Id para el ISC",
  "2059": "El dato ingresado en TaxSubtotal/cbc:TaxAmount no cumple con el formato establecido",
  "2060": "TaxSubtotal/cbc:TaxAmount es obligatorio",
  "2061": "El tag global cac:TaxTotal/cbc:TaxAmount debe tener el mismo valor que cac:TaxTotal/cac:Subtotal/cbc:TaxAmount",
  "2062": "El dato ingresado en PayableAmount no cumple con el formato establecido",
  "2063": "El XML no contiene el tag PayableAmount",
  "2064": "El dato ingresado en ChargeTotalAmount no cumple con el formato establecido",
  "2065": "El dato ingresado en el campo Total Descuentos no cumple con el formato establecido",
  "2066": "Debe indicar una descripcion para el tag sac:AdditionalProperty/cbc:Value",
  "2067": "cac:Price/cbc:PriceAmount - El dato ingresado no cumple con el estandar",
  "2068": "El XML no contiene el tag cac:Price/cbc:PriceAmount en el detalle de los Items",
  "2069": "DocumentCurrencyCode - El dato ingresado no cumple con la estructura",
  "2070": "El XML no contiene el tag o no existe informacion de DocumentCurrencyCode",
  "2071": "La moneda debe ser la misma en todo el documento. Salvo las percepciones que sólo son en moneda nacional",
  "2072": "CustomizationID - La versión del documento no es la correcta",
  "2073": "El XML no existe informacion de CustomizationID",
  "2074": "UBLVersionID - La versión del UBL no es correcta",
  "2075": "El XML no contiene el tag o no existe informacion de UBLVersionID",
  "2076": "cac:Signature/cbc:ID - Falta el identificador de la firma",
  "2077": "El tag cac:Signature/cbc:ID debe contener informacion",
  "2078": "cac:Signature/cac:SignatoryParty/cac:PartyIdentification/cbc:ID - Debe ser igual al RUC del emisor",
  "2079": "El XML no contiene el tag cac:Signature/cac:SignatoryParty/cac:PartyIdentification/cbc:ID",
  "2080": "cac:Signature/cac:SignatoryParty/cac:PartyName/cbc:Name - No cumple con el estandar",
  "2081": "El XML no contiene el tag cac:Signature/cac:SignatoryParty/cac:PartyName/cbc:Name",
  "2082": "cac:Signature/cac:DigitalSignatureAttachment/cac:ExternalReference/cbc:URI - No cumple con el estandar",
  "2083": "El XML no contiene el tag cac:Signature/cac:DigitalSignatureAttachment/cac:ExternalReference/cbc:URI",
  "2084": "ext:UBLExtensions/ext:UBLExtension/ext:ExtensionContent/ds:Signature/@Id - No cumple con el estandar",
  "2085": "El XML no contiene el tag ext:UBLExtensions/ext:UBLExtension/ext:ExtensionContent/ds:Signature/@Id",
  "2086": "ext:UBLExtensions/.../ds:Signature/ds:SignedInfo/ds:CanonicalizationMethod/@Algorithm - No cumple con el estandar",
  "2087": "El XML no contiene el tag ext:UBLExtensions/.../ds:Signature/ds:SignedInfo/ds:CanonicalizationMethod/@Algorithm",
  "2088": "ext:UBLExtensions/.../ds:Signature/ds:SignedInfo/ds:SignatureMethod/@Algorithm - No cumple con el estandar",
  "2089": "El XML no contiene el tag ext:UBLExtensions/.../ds:Signature/ds:SignedInfo/ds:SignatureMethod/@Algorithm",
  "2090": "ext:UBLExtensions/.../ds:Signature/ds:SignedInfo/ds:Reference/@URI - Debe estar vacio para id",
  "2091": "El XML no contiene el tag ext:UBLExtensions/.../ds:Signature/ds:SignedInfo/ds:Reference/@URI",
  "2092": "ext:UBLExtensions/.../ds:Signature/ds:SignedInfo/.../ds:Transform@Algorithm - No cumple con el estandar",
  "2093": "El XML no contiene el tag ext:UBLExtensions/.../ds:Signature/ds:SignedInfo/ds:Reference/ds:Transform@Algorithm",
  "2094": "ext:UBLExtensions/.../ds:Signature/ds:SignedInfo/ds:Reference/ds:DigestMethod/@Algorithm - No cumple con el estandar",
  "2095": "El XML no contiene el tag ext:UBLExtensions/.../ds:Signature/ds:SignedInfo/ds:Reference/ds:DigestMethod/@Algorithm",
  "2096": "ext:UBLExtensions/.../ds:Signature/ds:SignedInfo/ds:Reference/ds:DigestValue - No  cumple con el estandar",
  "2097": "El XML no contiene el tag ext:UBLExtensions/.../ds:Signature/ds:SignedInfo/ds:Reference/ds:DigestValue",
  "2098": "ext:UBLExtensions/.../ds:Signature/ds:SignatureValue - No cumple con el estandar",
  "2099": "El XML no contiene el tag ext:UBLExtensions/.../ds:Signature/ds:SignatureValue",
  "2100": "ext:UBLExtensions/.../ds:Signature/ds:KeyInfo/ds:X509Data/ds:X509Certificate - No cumple con el estandar",
  "2101": "El XML no contiene el tag ext:UBLExtensions/.../ds:Signature/ds:KeyInfo/ds:X509Data/ds:X509Certificate",
  "2102": "Error al procesar la factura",
  "2103": "La serie ingresada no es válida",
  "2104": "Numero de RUC del emisor no existe",
  "2105": "Comprobante a dar de baja no se encuentra registrado en SUNAT",
  "2106": "Factura a dar de baja ya se encuentra en estado de baja",
  "2107": "Numero de RUC SOL no coincide con RUC emisor",
  "2108": "Presentacion fuera de fecha",
  "2109": "El comprobante fue registrado previamente con otros datos",
  "2110": "UBLVersionID - La versión del UBL no es correcta",
  "2111": "El XML no contiene el tag o no existe informacion de UBLVersionID",
  "2112": "CustomizationID - La version del documento no es correcta",
  "2113": "El XML no contiene el tag o no existe informacion de CustomizationID",
  "2114": "DocumentCurrencyCode -  El dato ingresado no cumple con la estructura",
  "2115": "El XML no contiene el tag o no existe informacion de DocumentCurrencyCode",
  "2116": "El tipo de documento modificado por la Nota de credito debe ser factura electronica o ticket",
  "2117": "La serie o numero del documento modificado por la Nota de Credito no cumple con el formato establecido",
  "2118": "Debe indicar las facturas relacionadas a la Nota de Credito",
  "2119": "El documento modificado en la Nota de credito no esta registrada.",
  "2120": "El documento modificado en la Nota de credito se encuentra de baja",
  "2121": "El documento modificado en la Nota de credito esta registrada como rechazada",
  "2122": "El tag cac:LegalMonetaryTotal/cbc:PayableAmount debe tener informacion valida",
  "2123": "RegistrationName -  El dato ingresado no cumple con el estandar",
  "2124": "El XML no contiene el tag RegistrationName del emisor del documento",
  "2125": "ReferenceID -  El dato ingresado debe indicar SERIE-CORRELATIVO del documento al que se relaciona la Nota",
  "2126": "El XML no contiene informacion en el tag ReferenceID del documento al que se relaciona la nota",
  "2127": "ResponseCode -  El dato ingresado no cumple  con  la  estructura",
  "2128": "El XML no contiene el tag o no existe informacion de ResponseCode",
  "2129": "AdditionalAccountID -  El dato ingresado  en el tipo de documento de identidad del receptor no cumple con el estandar",
  "2130": "El XML no contiene el tag o no existe informacion de AdditionalAccountID del receptor del documento",
  "2131": "CustomerAssignedAccountID - El numero de documento de identidad del receptor debe ser RUC",
  "2132": "El XML no contiene el tag o no existe informacion de CustomerAssignedAccountID del receptor del documento",
  "2133": "RegistrationName -  El dato ingresado no cumple con el estandar",
  "2134": "El XML no contiene el tag o no existe informacion de RegistrationName del receptor del documento",
  "2135": "cac:DiscrepancyResponse/cbc:Description - El dato ingresado no cumple con la estructura",
  "2136": "El XML no contiene el tag o no existe informacion de cac:DiscrepancyResponse/cbc:Description",
  "2137": "El Numero de orden del item no cumple con el formato establecido",
  "2138": "CreditedQuantity/@unitCode - El dato ingresado no cumple con el estandar",
  "2139": "CreditedQuantity - El dato ingresado no cumple con el estandar",
  "2140": "El PriceTypeCode debe tener el valor 01",
  "2141": "cac:TaxCategory/cac:TaxScheme/cbc:ID - El dato ingresado no cumple con el estandar",
  "2142": "El codigo del tributo es invalido",
  "2143": "cac:TaxScheme/cbc:Name del item - No existe el tag o el dato ingresado no cumple con el estandar",
  "2144": "cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode El dato ingresado no cumple con el estandar",
  "2145": "El tipo de afectacion del IGV es incorrecto",
  "2146": "El Nombre Internacional debe ser VAT",
  "2147": "El sistema de calculo del ISC es incorrecto",
  "2148": "El Nombre Internacional debe ser EXC",
  "2149": "El dato ingresado en PayableAmount no cumple con el formato establecido",
  "2150": "El valor ingresado en AdditionalMonetaryTotal/cbc:ID es incorrecto",
  "2151": "AdditionalMonetaryTotal/cbc:ID debe tener valor",
  "2152": "Es obligatorio al menos un AdditionalInformation",
  "2153": "Error al procesar la Nota de Credito",
  "2154": "TaxAmount - El dato ingresado en impuestos globales no cumple con el estandar",
  "2155": "El XML no contiene el tag TaxAmount de impuestos globales",
  "2156": "TaxScheme ID - El dato ingresado no cumple con el estandar",
  "2157": "El codigo del tributo es invalido",
  "2158": "El XML no contiene el tag o no existe informacion de TaxScheme ID de impuestos globales",
  "2159": "TaxScheme Name - El dato ingresado no cumple con el estandar",
  "2160": "El XML no contiene el tag o no existe informacion de TaxScheme Name de impuestos globales",
  "2161": "CustomizationID - La version del documento no es correcta",
  "2162": "El XML no contiene el tag o no existe informacion de CustomizationID",
  "2163": "UBLVersionID - La versión del UBL no es correcta",
  "2164": "El XML no contiene el tag o no existe informacion de UBLVersionID",
  "2165": "Error al procesar la Nota de Debito",
  "2166": "RegistrationName - El dato ingresado no cumple con el estandar",
  "2167": "El XML no contiene el tag RegistrationName del emisor del documento",
  "2168": "DocumentCurrencyCode -  El dato ingresado no cumple con el formato establecido",
  "2169": "El XML no contiene el tag o no existe informacion de DocumentCurrencyCode",
  "2170": "ReferenceID - El dato ingresado debe indicar SERIE-CORRELATIVO del documento al que se relaciona la Nota",
  "2171": "El XML no contiene informacion en el tag ReferenceID del documento al que se relaciona la nota",
  "2172": "ResponseCode - El dato ingresado no cumple con la estructura",
  "2173": "El XML no contiene el tag o no existe informacion de ResponseCode",
  "2174": "cac:DiscrepancyResponse/cbc:Description - El dato ingresado no cumple con la estructura",
  "2175": "El XML no contiene el tag o no existe informacion de cac:DiscrepancyResponse/cbc:Description",
  "2176": "AdditionalAccountID -  El dato ingresado  en el tipo de documento de identidad del receptor no cumple con el estandar",
  "2177": "El XML no contiene el tag o no existe informacion de AdditionalAccountID del receptor del documento",
  "2178": "CustomerAssignedAccountID - El numero de documento de identidad del receptor debe ser RUC.",
  "2179": "El XML no contiene el tag o no existe informacion de CustomerAssignedAccountID del receptor del documento",
  "2180": "RegistrationName - El dato ingresado no cumple con el estandar",
  "2181": "El XML no contiene el tag o no existe informacion de RegistrationName del receptor del documento",
  "2182": "TaxScheme ID - El dato ingresado no cumple con el estandar",
  "2183": "El codigo del tributo es invalido",
  "2184": "El XML no contiene el tag o no existe informacion de TaxScheme ID de impuestos globales",
  "2185": "TaxScheme Name - El dato ingresado no cumple con el estandar",
  "2186": "El XML no contiene el tag o no existe informacion de TaxScheme Name de impuestos globales",
  "2187": "El Numero de orden del item no cumple con el formato establecido",
  "2188": "DebitedQuantity/@unitCode El dato ingresado no cumple con el estandar",
  "2189": "DebitedQuantity El dato ingresado no cumple con el estandar",
  "2190": "El XML no contiene el tag Price/cbc:PriceAmount en el detalle de los Items",
  "2191": "El XML no contiene el tag Price/cbc:LineExtensionAmount en el detalle de los Items",
  "2192": "EL PriceTypeCode debe tener el valor 01",
  "2193": "cac:TaxCategory/cac:TaxScheme/cbc:ID El dato ingresado no cumple con el estandar",
  "2194": "El codigo del tributo es invalido",
  "2195": "cac:TaxScheme/cbc:Name del item - No existe el tag o el dato ingresado no cumple con el estandar",
  "2196": "cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode El dato ingresado no cumple con el estandar",
  "2197": "El tipo de afectacion del IGV es incorrecto",
  "2198": "El Nombre Internacional debe ser VAT",
  "2199": "El sistema de calculo del ISC es incorrecto",
  "2200": "El Nombre Internacional debe ser EXC",
  "2201": "El tag cac:RequestedMonetaryTotal/cbc:PayableAmount debe tener informacion valida",
  "2202": "TaxAmount - El dato ingresado en impuestos globales no cumple con el estandar",
  "2203": "El XML no contiene el tag TaxAmount de impuestos globales",
  "2204": "El tipo de documento modificado por la Nota de Debito debe ser factura electronica, ticket o documento autorizado",
  "2205": "La serie o numero del documento modificado por la Nota de Debito no cumple con el formato establecido",
  "2206": "Debe indicar los documentos afectados por la Nota de Debito",
  "2207": "El documento modificado en la Nota de debito se encuentra de baja",
  "2208": "El documento modificado en la Nota de debito esta registrada como rechazada",
  "2209": "El documento modificado en la Nota de debito no esta registrada",
  "2210": "El dato ingresado no cumple con el formato RC-fecha-correlativo",
  "2211": "El XML no contiene el tag ID",
  "2212": "UBLVersionID - La versión del UBL del resumen de boletas no es correcta",
  "2213": "El XML no contiene el tag UBLVersionID",
  "2214": "CustomizationID - La versión del resumen de boletas no es correcta",
  "2215": "El XML no contiene el tag CustomizationID",
  "2216": "CustomerAssignedAccountID -  El dato ingresado no cumple con el estandar",
  "2217": "El XML no contiene el tag CustomerAssignedAccountID del emisor del documento",
  "2218": "AdditionalAccountID - El dato ingresado no cumple con el estandar",
  "2219": "El XML no contiene el tag AdditionalAccountID del emisor del documento",
  "2220": "El ID debe coincidir con el nombre del archivo",
  "2221": "El RUC debe coincidir con el RUC del nombre del archivo",
  "2222": "El contribuyente no está autorizado a emitir comprobantes electronicos",
  "2223": "El archivo ya fue presentado anteriormente",
  "2224": "Numero de RUC SOL no coincide con RUC emisor",
  "2225": "Numero de RUC del emisor no existe",
  "2226": "El contribuyente no esta activo",
  "2227": "El contribuyente no cumple con tipo de empresa o tributos requeridos",
  "2228": "RegistrationName - El dato ingresado no cumple con el estandar",
  "2229": "El XML no contiene el tag RegistrationName del emisor del documento",
  "2230": "IssueDate - El dato ingresado no cumple con el patron YYYY-MM-DD",
  "2231": "El XML no contiene el tag IssueDate",
  "2232": "IssueDate- El dato ingresado no es valido",
  "2233": "ReferenceDate - El dato ingresado no cumple con el patron YYYY-MM-DD",
  "2234": "El XML no contiene el tag ReferenceDate",
  "2235": "ReferenceDate- El dato ingresado no es valido",
  "2236": "La fecha del IssueDate no debe ser mayor a la fecha de recepción",
  "2237": "La fecha del ReferenceDate no debe ser mayor al Today",
  "2238": "LineID - El dato ingresado no cumple con el estandar",
  "2239": "LineID - El dato ingresado debe ser correlativo mayor a cero",
  "2240": "El XML no contiene el tag LineID de SummaryDocumentsLine",
  "2241": "DocumentTypeCode - El valor del tipo de documento es invalido",
  "2242": "El XML no contiene el tag DocumentTypeCode",
  "2243": "El dato ingresado  no cumple con el patron SERIE",
  "2244": "El XML no contiene el tag DocumentSerialID",
  "2245": "El dato ingresado en StartDocumentNumberID debe ser numerico",
  "2246": "El XML no contiene el tag StartDocumentNumberID",
  "2247": "El dato ingresado en sac:EndDocumentNumberID debe ser numerico",
  "2248": "El XML no contiene el tag sac:EndDocumentNumberID",
  "2249": "Los rangos deben ser mayores a cero",
  "2250": "En el rango de comprobantes, el EndDocumentNumberID debe ser mayor o igual al StartInvoiceNumberID",
  "2251": "El dato ingresado en TotalAmount debe ser numerico mayor o igual a cero",
  "2252": "El XML no contiene el tag TotalAmount",
  "2253": "El dato ingresado en TotalAmount debe ser numerico mayor a cero",
  "2254": "PaidAmount - El dato ingresado no cumple con el estandar",
  "2255": "El XML no contiene el tag PaidAmount",
  "2256": "InstructionID - El dato ingresado no cumple con el estandar",
  "2257": "El XML no contiene el tag InstructionID",
  "2258": "Debe indicar Referencia de Importes asociados a las boletas de venta",
  "2259": "Debe indicar 3 Referencias de Importes asociados a las boletas de venta",
  "2260": "PaidAmount - El dato ingresado debe ser mayor o igual a 0.00",
  "2261": "cbc:Amount - El dato ingresado no cumple con el estandar",
  "2262": "El XML no contiene el tag cbc:Amount",
  "2263": "ChargeIndicator - El dato ingresado no cumple con el estandar",
  "2264": "El XML no contiene el tag ChargeIndicator",
  "2265": "Debe indicar Información acerca del Importe Total de Otros Cargos",
  "2266": "Debe indicar cargos mayores o iguales a cero",
  "2267": "TaxScheme ID - El dato ingresado no cumple con el estandar",
  "2268": "El codigo del tributo es invalido",
  "2269": "El XML no contiene el tag TaxScheme ID de Información acerca del importe total de un tipo particular de impuesto",
  "2270": "TaxScheme Name - El dato ingresado no cumple con el estandar",
  "2271": "El XML no contiene el tag TaxScheme Name de impuesto",
  "2272": "TaxScheme TaxTypeCode - El dato ingresado no cumple con el estandar",
  "2273": "TaxAmount - El dato ingresado no cumple con el estandar",
  "2274": "El XML no contiene el tag TaxAmount",
  "2275": "Si el codigo de tributo es 2000, el nombre del tributo debe ser ISC",
  "2276": "Si el codigo de tributo es 1000, el nombre del tributo debe ser IGV",
  "2277": "No se ha consignado ninguna informacion del importe total de tributos",
  "2278": "Debe indicar Información acerca del importe total de IGV/IVAP",
  "2279": "Debe indicar Items de consolidado de documentos",
  "2280": "Existen problemas con la informacion del resumen de comprobantes",
  "2281": "Error en la validacion de los rangos de los comprobantes",
  "2282": "Existe documento ya informado anteriormente",
  "2283": "El dato ingresado no cumple con el formato RA-fecha-correlativo",
  "2284": "El tag ID esta vacío",
  "2285": "El ID debe coincidir  con el nombre del archivo",
  "2286": "El RUC debe coincidir con el RUC del nombre del archivo",
  "2287": "AdditionalAccountID - El dato ingresado no cumple con el estandar",
  "2288": "El XML no contiene el tag AdditionalAccountID del emisor del documento",
  "2289": "CustomerAssignedAccountID - El dato ingresado no cumple con el estandar",
  "2290": "El XML no contiene el tag CustomerAssignedAccountID del emisor del documento",
  "2291": "El contribuyente no esta autorizado a emitir comprobantes electronicos",
  "2292": "Numero de RUC SOL no coincide con RUC emisor",
  "2293": "Numero de RUC del emisor no existe",
  "2294": "El contribuyente no esta activo",
  "2295": "El contribuyente no cumple con tipo de empresa o tributos requeridos",
  "2296": "RegistrationName - El dato ingresado no cumple con el estandar",
  "2297": "El XML no contiene el tag RegistrationName del emisor del documento",
  "2298": "IssueDate - El dato ingresado no cumple con el patron YYYY-MM-DD",
  "2299": "El XML no contiene el tag IssueDate",
  "2300": "IssueDate - El dato ingresado no es valido",
  "2301": "La fecha del IssueDate no debe ser mayor a la fecha de recepción",
  "2302": "ReferenceDate - El dato ingresado no cumple con el patron YYYY-MM-DD",
  "2303": "El XML no contiene el tag ReferenceDate",
  "2304": "ReferenceDate - El dato ingresado no es valido",
  "2305": "LineID - El dato ingresado no cumple con el estandar",
  "2306": "LineID - El dato ingresado debe ser correlativo mayor a cero",
  "2307": "El tag LineID de VoidedDocumentsLine esta vacío",
  "2308": "DocumentTypeCode - El valor del tipo de documento es invalido",
  "2309": "El tag DocumentTypeCode es vacío",
  "2310": "El dato ingresado  no cumple con el patron SERIE",
  "2311": "El tag DocumentSerialID es vacío",
  "2312": "El dato ingresado en DocumentNumberID debe ser numerico y como maximo de 8 digitos",
  "2313": "El tag DocumentNumberID esta vacío",
  "2314": "El dato ingresado en VoidReasonDescription debe contener información válida",
  "2315": "El tag VoidReasonDescription esta vacío",
  "2316": "Debe indicar Items en VoidedDocumentsLine",
  "2317": "Error al procesar el resumen de anulados",
  "2318": "CustomizationID - La version del documento no es correcta",
  "2319": "El XML no contiene el tag CustomizationID",
  "2320": "UBLVersionID - La version del UBL  no es la correcta",
  "2321": "El XML no contiene el tag UBLVersionID",
  "2322": "Error en la validacion de los rangos",
  "2323": "Existe documento ya informado anteriormente en una comunicacion de baja",
  "2324": "El archivo de comunicacion de baja ya fue presentado anteriormente",
  "2325": "El certificado usado no es el comunicado a SUNAT",
  "2326": "El certificado usado se encuentra de baja",
  "2327": "El certificado usado no se encuentra vigente",
  "2328": "El certificado usado se encuentra revocado",
  "2329": "La fecha de emision se encuentra fuera del limite permitido",
  "2330": "La fecha de generación de la comunicación debe ser igual a la fecha consignada en el nombre del archivo",
  "2331": "Número de RUC del nombre del archivo no coincide con el consignado en el contenido del archivo XML",
  "2332": "Número de Serie del nombre del archivo no coincide con el consignado en el contenido del archivo XML",
  "2333": "Número de documento en el nombre del archivo no coincide con el consignado en el contenido del XML",
  "2334": "El documento electrónico ingresado ha sido alterado",
  "2335": "El documento electrónico ingresado ha sido alterado",
  "2336": "Ocurrió un error en el proceso de validación de la firma digital",
  "2337": "La moneda debe ser la misma en todo el documento",
  "2338": "La moneda debe ser la misma en todo el documento",
  "2339": "El dato ingresado en PayableAmount no cumple con el formato establecido",
  "2340": "El valor ingresado en AdditionalMonetaryTotal/cbc:ID es incorrecto",
  "2341": "AdditionalMonetaryTotal/cbc:ID debe tener valor",
  "2342": "Fecha de emision de la factura no coincide con la informada en la comunicacion",
  "2343": "cac:TaxTotal/cac:TaxSubtotal/cbc:TaxAmount - El dato ingresado no cumple con el estandar",
  "2344": "El XML no contiene el tag cac:TaxTotal/cac:TaxSubtotal/cbc:TaxAmount",
  "2345": "La serie no corresponde al tipo de comprobante",
  "2346": "La fecha de generación del resumen debe ser igual a la fecha consignada en el nombre del archivo",
  "2347": "Los rangos informados en el archivo XML se encuentran duplicados o superpuestos",
  "2348": "Los documentos informados en el archivo XML se encuentran duplicados",
  "2349": "Debe consignar solo un elemento sac:AdditionalMonetaryTotal con cbc:ID igual a 1001",
  "2350": "Debe consignar solo un elemento sac:AdditionalMonetaryTotal con cbc:ID igual a 1002",
  "2351": "Debe consignar solo un elemento sac:AdditionalMonetaryTotal con cbc:ID igual a 1003",
  "2352": "Debe consignar solo un elemento cac:TaxTotal a nivel global para IGV (cbc:ID igual a 1000)",
  "2353": "Debe consignar solo un elemento cac:TaxTotal a nivel global para ISC (cbc:ID igual a 2000)",
  "2354": "Debe consignar solo un elemento cac:TaxTotal a nivel global para Otros (cbc:ID igual a 9999)",
  "2355": "Debe consignar solo un elemento cac:TaxTotal a nivel de item por codigo de tributo",
  "2356": "Debe consignar solo un elemento cac:TaxTotal a nivel de item para ISC (cbc:ID igual a 2000)",
  "2357": "No debe existir un elemento sac:BillingPayment a nivel de item con el mismo valor de cbc:InstructionID",
  "2358": "Debe consignar solo un elemento sac:BillingPayment a nivel de item con cbc:InstructionID igual a 02",
  "2359": "Debe consignar solo un elemento sac:BillingPayment a nivel de item con cbc:InstructionID igual a 03",
  "2360": "Debe consignar solo un elemento sac:BillingPayment a nivel de item con cbc:InstructionID igual a 04",
  "2361": "Debe consignar solo un elemento cac:TaxTotal a nivel de item para Otros (cbc:ID igual a 9999)",
  "2362": "Debe consignar solo un tag cac:AccountingSupplierParty/cbc:AdditionalAccountID",
  "2363": "Debe consignar solo un tag cac:AccountingCustomerParty/cbc:AdditionalAccountID",
  "2364": "El comprobante contiene un tipo y número de Guía de Remisión repetido",
  "2365": "El comprobante contiene un tipo y número de Documento Relacionado repetido",
  "2366": "El codigo en el tag sac:AdditionalProperty/cbc:ID debe tener 4 posiciones",
  "2367": "El dato ingresado en PriceAmount del Precio de venta unitario por item no cumple con el formato establecido",
  "2368": "El dato ingresado en TaxSubtotal/cbc:TaxAmount del item no cumple con el formato establecido",
  "2369": "El dato ingresado en PriceAmount del Valor de venta unitario por item no cumple con el formato establecido",
  "2370": "El dato ingresado en LineExtensionAmount del item no cumple con el formato establecido",
  "2371": "El XML no contiene el tag cbc:TaxExemptionReasonCode de Afectacion al IGV",
  "2372": "El tag en el item cac:TaxTotal/cbc:TaxAmount debe tener el mismo valor que cac:TaxTotal/cac:TaxSubtotal/cbc:TaxAmount",
  "2373": "Si existe monto de ISC en el ITEM debe especificar el sistema de calculo",
  "2374": "La factura a dar de baja tiene una fecha de recepcion fuera del plazo permitido",
  "2375": "Fecha de emision del comprobante no coincide con la fecha de emision consignada en la comunicación",
  "2376": "La boleta de venta a dar de baja fue informada en un resumen con fecha de recepcion fuera del plazo permitido",
  "2377": "El Name o TaxTypeCode debe corresponder al codigo de tributo del item",
  "2378": "El Name o TaxTypeCode debe corresponder con el Id para el ISC",
  "2379": "La numeracion de boleta de venta a dar de baja fue generada en una fecha fuera del plazo permitido",
  "2380": "El documento tiene observaciones",
  "2381": "Comprobante no cumple con el Grupo 1: No todos los items corresponden a operaciones gravadas a IGV",
  "2382": "Comprobante no cumple con el Grupo 2: No todos los items corresponden a operaciones inafectas o exoneradas al IGV",
  "2383": "Comprobante no cumple con el Grupo 3: Falta leyenda con codigo 1002",
  "2384": "Comprobante no cumple con el Grupo 3: Existe item con operación onerosa",
  "2385": "Comprobante no cumple con el Grupo 4: Debe exitir Total descuentos mayor a cero",
  "2386": "Comprobante no cumple con el Grupo 5: Todos los items deben tener operaciones afectas a ISC",
  "2387": "Comprobante no cumple con el Grupo 6: El monto de percepcion no existe o es cero",
  "2388": "Comprobante no cumple con el Grupo 6: Todos los items deben tener código de Afectación al IGV igual a 10",
  "2389": "Comprobante no cumple con el Grupo 7: El codigo de moneda no es diferente a PEN",
  "2390": "Comprobante no cumple con el Grupo 8: No todos los items corresponden a operaciones gravadas a IGV",
  "2391": "Comprobante no cumple con el Grupo 9: No todos los items corresponden a operaciones inafectas o exoneradas al IGV",
  "2392": "Comprobante no cumple con el Grupo 10: Falta leyenda con codigo 1002",
  "2393": "Comprobante no cumple con el Grupo 10: Existe item con operación onerosa",
  "2394": "Comprobante no cumple con el Grupo 11: Debe existir Total descuentos mayor a cero",
  "2395": "Comprobante no cumple con el Grupo 12: El codigo de moneda no es diferente a PEN",
  "2396": "Si el monto total es mayor a S/. 700.00 debe consignar tipo y numero de documento del adquiriente",
  "2397": "El tipo de documento del adquiriente no puede ser Numero de RUC",
  "2398": "El documento a dar de baja se encuentra rechazado",
  "2399": "El tipo de documento modificado por la Nota de credito debe ser boleta electronica",
  "2400": "El tipo de documento modificado por la Nota de debito debe ser boleta electronica",
  "2401": "No se puede leer (parsear) el archivo XML",
  "2402": "El caso de prueba no existe",
  "2403": "La numeracion o nombre del documento ya ha sido enviado anteriormente",
  "2404": "Documento afectado por la nota electronica no se encuentra autorizado",
  "2405": "Contribuyente no se encuentra autorizado como emisor de boletas electronicas",
  "2406": "Existe mas de un tag sac:AdditionalMonetaryTotal con el mismo ID",
  "2407": "Existe mas de un tag sac:AdditionalProperty con el mismo ID",
  "2408": "El dato ingresado en PriceAmount del Valor referencial unitario por item no cumple con el formato establecido",
  "2409": "Existe mas de un tag cac:AlternativeConditionPrice con el mismo cbc:PriceTypeCode",
  "2410": "Se ha consignado un valor invalido en el campo cbc:PriceTypeCode",
  "2411": "Ha consignado mas de un elemento cac:AllowanceCharge con el mismo campo cbc:ChargeIndicator",
  "2412": "Se ha consignado mas de un documento afectado por la nota (tag cac:BillingReference)",
  "2413": "Se ha consignado mas de un motivo o sustento de la nota (tag cac:DiscrepancyResponse/cbc:Description)",
  "2414": "No se ha consignado en la nota el tag cac:DiscrepancyResponse",
  "2415": "Se ha consignado en la nota mas de un tag cac:DiscrepancyResponse",
  "2416": "Si existe leyenda Transferencia Gratuita debe consignar Total Valor de Venta de Operaciones Gratuitas",
  "2417": "Debe consignar Valor Referencial unitario por item en operaciones no onerosas",
  "2418": "Si consigna Valor Referencial unitario por item en operaciones no onerosas,la operacion debe ser no onerosa.",
  "2419": "El dato ingresado en AllowanceTotalAmount no cumple con el formato establecido",
  "2420": "Ya transcurrieron mas de 25 dias calendarios para concluir con su proceso de homologacion",
  "2421": "Debe indicar  toda la informacion de  sustento de translado de bienes.",
  "2422": "El valor unitario debe ser menor al precio unitario.",
  "2423": "Si ha consignado monto ISC a nivel de item, debe consignar un monto a nivel de total.",
  "2424": "RC Debe consignar solo un elemento sac:BillingPayment a nivel de item con cbc:InstructionID igual a 05.",
  "2425": "Si la  operacion es gratuita PriceTypeCode =02 y cbc:PriceAmount> 0 el codigo de afectacion de igv debe ser  no onerosa es  decir diferente de 10,20,30.",
  "2426": "Documentos relacionados duplicados en el comprobante.",
  "2427": "Solo debe de existir un tag AdditionalInformation.",
  "2428": "Comprobante no cumple con grupo de facturas con detracciones.",
  "2429": "Comprobante no cumple con grupo de facturas con comercio exterior.",
  "2430": "Comprobante no cumple con grupo de facturas con tag de factura guia.",
  "2431": "Comprobante no cumple con grupo de facturas con tags no tributarios.",
  "2432": "Comprobante no cumple con grupo de boletas con tags no tributarios.",
  "2433": "Comprobante no cumple con grupo de facturas con tag venta itinerante.",
  "2434": "Comprobante no cumple con grupo de boletas con tag venta itinerante.",
  "2435": "Comprobante no cumple con grupo de boletas con ISC.",
  "2436": "Comprobante no cumple con el grupo de boletas de venta con percepcion: El monto de percepcion no existe o es cero.",
  "2437": "Comprobante no cumple con el grupo de boletas de venta con percepcion: Todos los items deben tener código de Afectación al IGV igual a 10.",
  "2438": "Comprobante no cumple con grupo de facturas con tag venta anticipada I.",
  "2439": "Comprobante no cumple con grupo de facturas con tag venta anticipada II.",
  "2450": "Número de DNI no existe",
  "2451": "Vendedor supera el monto permitido para la emision de una liquidacion de compra",
  "2452": "El XML no contiene el tag o no existe informacion de la dirección completa y detallada en domicilio del vendedor",
  "2453": "El XML no contiene el tag o no existe información del ubigeo del domicilio del vendedor",
  "2454": "El XML no contiene el tag o no existe informacion de la dirección completa y detallada del lugar donde se realiza la operación",
  "2455": "El XML no contiene el tag o no existe información del ubigeo del lugar donde se realiza la operación",
  "2456": "Debe consignar el tipo de domicilio del vendedor",
  "2457": "El dato ingresado en el tipo de domicilio del vendedor no corresponde al valor esperado",
  "2458": "Debe consignar el tipo de ubicación del lugar donde se realiza la operación",
  "2459": "El dato ingresado en el tipo de ubicación del lugar donde se realiza la operación no corresponde al valor esperado",
  "2460": "Número de DNI corresponde a una persona fallecida a la fecha de emision",
  "2461": "Número de DNI corresponde a una persona menor de edad",
  "2462": "Número de DNI tiene un Numero de RUC asignado activo",
  "2463": "Emisor no se encuentra afecto a Renta de tercera categoría",
  "2464": "El producto de la tasa por el monto base de la afectación de la retención de renta no corresponde al monto de afectacion de linea",
  "2465": "Tipo de comprobante que realizo el anticipo debe ser 10-Liquidacion de compra",
  "2466": "El XML no contiene el tag de Comercializacion del oro: Codigo unico de concesion minera",
  "2467": "El XML no contiene el tag de Comercializacion del oro: Ley mineral",
  "2468": "El XML no contiene el tag de Comercializacion del oro: Naturaleza del mineral",
  "2469": "El XML no contiene el tag de Comercializacion del oro: Nombre del derecho minero",
  "2470": "El monto base de la retencion de renta global no cumple con el formato establecido",
  "2471": "La liquidacion de compra a dar de baja no debe tener pagos registrados",
  "2472": "El documento no contiene la fecha de inicio del periodo de abono",
  "2473": "El documento no contiene la fecha de fin del periodo de abono",
  "2474": "El documento no contiene el 'Tipo de canal facturado'",
  "2475": "El dato ingresado como 'Tipo de canal facturado' es incorrecto",
  "2476": "Debe registrarse el 'Indicador de tipo de comisión'",
  "2477": "El dato ingresado en el 'Indicador de tipo de comisión' no corresponde al valor esperado",
  "2478": "Para Bancos emisores debe ingresar el 'Indicador de institución financiera'",
  "2479": "El dato ingresado en el 'Indicador de institución financiera' no corresponde al valor esperado",
  "2480": "Debe consignar el tag /cac:InvoiceLine/cac:ItemPriceExtension",
  "2481": "El dato ingresado en el tag /cac:InvoiceLine/cac:ItemPriceExtension/cbc:Amount no cumple con el formato establecido",
  "2482": "Debe consignar el tag /cac:SubInvoiceLine/cac:ItemPriceExtension",
  "2483": "El dato ingresado en el tag cac:InvoiceLine/cac:SubInvoiceLine/cac:ItemPriceExtension/cbc:Amount no cumple con el formato establecido",
  "2484": "Para Bancos emisores locales debe ingresar el Numero de RUC",
  "2485": "Tipo de documento de identidad debe ser RUC",
  "2486": "El dato ingresado en el tag /cac:SubInvoiceLine/cbc:LineExtensionAmount no cumple con el formato establecido",
  "2487": "El XML no contiene el tag cac:LegalMonetaryTotal/cbc:LineExtensionAmount",
  "2488": "El dato ingresado en el tag cac:LegalMonetaryTotal/cbc:LineExtensionAmount no cumple con el formato establecido",
  "2489": "El dato ingresado en el 'Tipo de documento de identidad' no cumple el formato establecido",
  "2490": "Existe más de un Tag UBL cac:OriginatorParty/cac:PartyIdentification",
  "2491": "Debe consignar el Tag UBL cac:OriginatorParty/cac:PartyIdentification/cbc:ID",
  "2492": "El dato ingresado en el tag cac:SubInvoiceLine/cbc:ID no cumple con el formato establecido",
  "2493": "El dato ingresado en el tag /cac:SubInvoiceLine/cbc:ID no debe repetirse en el mismo cac:InvoiceLine",
  "2494": "No existe el tag cac:TaxTotal en el /Invoice/cac:InvoiceLine/cac:SubInvoiceLine",
  "2495": "El tag cac:TaxTotal no debe repetirse en el /Invoice/cac:InvoiceLine/cac:SubInvoiceLine",
  "2496": "El dato ingresado en el tag /cac:SubInvoiceLine/cac:TaxTotal/cbc:TaxAmount no cumple el formato establecido",
  "2497": "El dato ingresado en el tag /cac:SubInvoiceLine/cac:TaxTotal/cac:TaxSubtotal/cbc:TaxAmount no cumple el formato establecido",
  "2498": "El XML no contiene el tag cac:TaxCategory/cac:TaxScheme/cbc:ID del /cac:SubInvoiceLine",
  "2499": "El código de tributo no debe repetirse a nivel del /cac:SubInvoiceLine",
  "2500": "Ingresar descripción y valor venta por ítem para documento de anticipos.",
  "2501": "Valor venta debe ser mayor a cero.",
  "2502": "El importe total para tipo de operación Venta interna-Anticipos debe ser mayor a cero.",
  "2503": "PaidAmount: monto anticipado por documento debe ser mayor a cero.",
  "2504": "Falta referencia de la factura relacionada con anticipo.",
  "2505": "Código de documento de referencia debe ser 02 o 03.",
  "2506": "cac:PrepaidPayment/cbc:ID: Factura o boleta no existe o comunicada de Baja.",
  "2507": "Factura relacionada con anticipo no corresponde como factura de anticipo.",
  "2508": "Ingresar documentos por anticipos.",
  "2509": "Total de anticipos diferente a los montos anticipados por documento.",
  "2510": "Nro nombre del documento no tiene el formato correcto.",
  "2511": "El tipo de documento no es aceptado.",
  "2512": "No existe información de serie o número.",
  "2513": "Dato no cumple con formato de acuerdo al tipo de documento",
  "2514": "No existe información de receptor de documento.",
  "2515": "Dato ingresado no cumple con catalogo 6.",
  "2516": "Debe indicar tipo de documento.",
  "2517": "Dato no cumple con formato establecido.",
  "2518": "Calculo IGV no es correcto.",
  "2519": "El importe total no coincide con la sumatoria de los valores de venta mas los tributos mas los cargos menos los descuentos que no afectan la base imponible",
  "2520": "El tipo documento del emisor que realiza el anticipo debe ser 6 del catalogo de tipo de documento.",
  "2521": "El dato ingresado debe indicar SERIE-CORRELATIVO del documento que se realizo el anticipo.",
  "2522": "No existe información del documento del anticipo.",
  "2523": "GrossWeightMeasure - El dato ingresado no cumple con el formato establecido.",
  "2524": "Debe indicar el documento afectado por la nota",
  "2525": "El dato ingresado en Quantity no cumple con el formato establecido.",
  "2526": "El dato ingresado en Percent no cumple con el formato establecido.",
  "2527": "PrepaidAmount: Monto total anticipado debe ser mayor a cero.",
  "2528": "cac:OriginatorDocumentReference/cbc:ID/@SchemaID - El tipo documento debe ser 6 del catalogo de tipo de documento.",
  "2529": "RUC que emitio documento de anticipo, no existe.",
  "2530": "RUC que solicita la emision de la factura, no existe.",
  "2531": "Codigo del Local Anexo del emisor no existe.",
  "2532": "No existe información de modalidad de transporte.",
  "2533": "Si ha consignado Transporte Privado, debe consignar Licencia de conducir, Placa, N constancia de inscripcion y marca del vehiculo.",
  "2534": "Si ha consignado Transporte Público, debe consignar Datos del transportista.",
  "2535": "La nota de crédito por otros conceptos tributarios debe tener Otros Documentos Relacionados.",
  "2536": "La serie y numero de la GRE consignada como documento relacionado no se encuentra registrado con baja por cambio de destinatario",
  "2537": "cac:OrderReference/cac:DocumentReference/cbc:DocumentTypeCode - El tipo de documento de serie y número dado de baja es incorrecta.",
  "2538": "El contribuyente no se encuentra autorizado como emisor electronico de Guía o de factura o de boletaFactura GEM.",
  "2539": "El contribuyente no esta activo.",
  "2540": "El contribuyente no esta habido.",
  "2541": "El XML no contiene el tag o no existe informacion del tipo de documento identidad del remitente.",
  "2542": "cac:DespatchSupplierParty/cbc:CustomerAssignedAccountID@schemeID - El valor ingresado como tipo de documento identidad del remitente es incorrecta.",
  "2543": "El XML no contiene el tag o no existe informacion de la dirección completa y detallada en domicilio fiscal.",
  "2544": "El XML no contiene el tag o no existe información de la provincia en domicilio fiscal.",
  "2545": "El XML no contiene el tag o no existe información del departamento en domicilio fiscal.",
  "2546": "El XML no contiene el tag o no existe información del distrito en domicilio fiscal.",
  "2547": "El XML no contiene el tag o no existe información del país en domicilio fiscal.",
  "2548": "El valor del país inválido.",
  "2549": "El XML no contiene el tag o no existe informacion del tipo de documento identidad del destinatario.",
  "2550": "cac:DeliveryCustomerParty/cbc:CustomerAssignedAccountID@schemeID - El dato ingresado de tipo de documento identidad del destinatario no cumple con el estandar.",
  "2551": "El XML no contiene el tag o no existe informacion de CustomerAssignedAccountID del proveedor de servicios.",
  "2552": "El XML no contiene el tag o no existe informacion del tipo de documento identidad del proveedor.",
  "2553": "cac:SellerSupplierParty/cbc:CustomerAssignedAccountID@schemeID - El dato ingresado no es valido.",
  "2554": "Para el motivo de traslado ingresado el Destinatario debe ser igual al remitente.",
  "2555": "Destinatario no debe ser igual al remitente.",
  "2556": "cbc:TransportModeCode -  dato ingresado no es valido.",
  "2557": "La fecha del StartDate no debe ser menor al Today.",
  "2558": "El XML no contiene el tag o no existe informacion en Numero de Ruc del transportista.",
  "2559": "/DespatchAdvice/cac:Shipment/cac:ShipmentStage/cac:CarrierParty/cac:PartyIdentification/cbc:ID  - El dato ingresado no cumple con el formato establecido.",
  "2560": "Transportista no debe ser igual al remitente",
  "2561": "El XML no contiene el tag o no existe informacion del tipo de documento identidad del transportista.",
  "2562": "/DespatchAdvice/cac:Shipment/cac:ShipmentStage/cac:CarrierParty/cac:PartyIdentification/cbc:ID@schemeID  - El dato ingresado no es valido.",
  "2563": "El XML no contiene el tag o no existe informacion de Apellido, Nombre o razon social del transportista.",
  "2564": "Razon social transportista - El dato ingresado no cumple con el formato establecido.",
  "2565": "El XML no contiene el tag o no existe informacion del tipo de unidad de transporte.",
  "2566": "El XML no contiene el tag o no existe informacion del Numero de placa del vehículo.",
  "2567": "Numero de placa del vehículo - El dato ingresado no cumple con el formato establecido.",
  "2568": "El XML no contiene el tag o no existe informacion en el Numero de documento de identidad del conductor.",
  "2569": "Documento identidad del conductor - El dato ingresado no cumple con el formato establecido.",
  "2570": "El XML no contiene el tag o no existe informacion del tipo de documento identidad del conductor.",
  "2571": "cac:DriverPerson/ID@schemeID - El valor ingresado de tipo de documento identidad de conductor es incorrecto.",
  "2572": "El XML no contiene el tag o no existe informacion del Numero de licencia del conductor.",
  "2573": "Numero de licencia del conductor - El dato ingresado no cumple con el formato establecido.",
  "2574": "El XML no contiene el tag o no existe informacion de direccion detallada de punto de llegada.",
  "2575": "El XML no contiene el tag o no existe informacion de CityName.",
  "2576": "El XML no contiene el tag o no existe informacion de District.",
  "2577": "El XML no contiene el tag o no existe informacion de direccion detallada de punto de partida.",
  "2578": "El XML no contiene el tag o no existe informacion de CityName.",
  "2579": "El XML no contiene el tag o no existe informacion de District.",
  "2580": "El XML No contiene el tag o no existe información de la cantidad del item.",
  "2581": "No puede dar de baja 'Recibos de servicios publicos' por SEE-Desde los sistemas del contribuyente",
  "2582": "Solo se debe incluir el tag de Comprobante de referencia cuando se trata de una nota de credito o debito",
  "2583": "Debe consignar tipo de documento que modifica",
  "2584": "El XML debe contener al menos un tributo de IGV en el /cac:SubInvoiceLine",
  "2585": "El dato ingresado como indicador de cargo/descuento a nivel de /cac:SubInvoiceLine no corresponde al valor esperado",
  "2586": "El XML no contiene el tag o no existe informacion de codigo de motivo de cargo/descuento a nivel de /cac:SubInvoiceLine",
  "2587": "El factor de cargo/descuento a nivel de /cac:SubInvoiceLine no cumple con el formato establecido",
  "2588": "El dato ingresado en el tag cac:SubInvoiceLine/cac:Allowancecharge/cbc:Amount no cumple con el formato establecido",
  "2589": "El Monto base de cargo/descuento a nivel de /cac:SubInvoiceLine no cumple con el formato establecido",
  "2590": "El dato ingresado en el tag /cac:SubInvoiceLine/cac:TaxTotal/cac:TaxSubtotal/cbc:TaxableAmount no cumple el formato establecido",
  "2591": "No existe el tag cac:LegalMonetaryTotal/cbc:LineExtensionAmount",
  "2592": "No existe el tag cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount",
  "2593": "La dirección completa y detallada del domicilio del vendedor no cumple con el formato establecido",
  "2594": "El tipo de documento modificado por la nota electronica no es valido",
  "2595": "Falta consignar informacion del CUSPP",
  "2596": "Falta consignar informacion del Periodo",
  "2597": "Falta consignar información del monto de interes moratorio",
  "2600": "El comprobante fue enviado fuera del plazo permitido.",
  "2601": "Senor contribuyente a la fecha no se encuentra registrado ó habilitado con la condición de Agente de percepción.",
  "2602": "El régimen percepción enviado no corresponde con su condición de Agente de percepción.",
  "2603": "La tasa de percepción enviada no corresponde con el régimen de percepción.",
  "2604": "El Cliente no puede ser el mismo que el Emisor del comprobante de percepción.",
  "2605": "Número de RUC no existe.",
  "2606": "Documento de identidad del Cliente no existe.",
  "2607": "La moneda del importe de cobro debe ser la misma que la del documento relacionado.",
  "2608": "Los montos de pago, percibidos y montos cobrados consignados para el documento relacionado no son correctos.",
  "2609": "El comprobante electrónico enviado no se encuentra registrado en la SUNAT.",
  "2610": "La fecha de emisión, Importe total del comprobante y la moneda del comprobante electrónico enviado no son los registrados en los Sistemas de SUNAT.",
  "2611": "El comprobante electrónico no ha sido emitido al cliente.",
  "2612": "La fecha de cobro debe estar entre el primer día calendario del mes al cual corresponde la fecha de emisión del comprobante de percepción o desde la fecha de emisión del comprobante relacionado.",
  "2613": "El Nro. de documento con número de cobro ya se encuentra en la Relación de Documentos Relacionados agregados.",
  "2614": "El Nro. de documento con el número de cobro ya se encuentra registrado como pago realizado.",
  "2615": "Importe total percibido debe ser igual a la suma de los importes percibidos por cada documento relacionado.",
  "2616": "Importe total cobrado debe ser igual a la suma de los importe totales cobrados por cada documento relacionado.",
  "2617": "Senor contribuyente a la fecha no se encuentra registrado ó habilitado con la condición de Agente de retención.",
  "2618": "El régimen retención enviado no corresponde con su condición de Agente de retención.",
  "2619": "La tasa de retención enviada no corresponde con el régimen de retención.",
  "2620": "El Proveedor no puede ser el mismo que el Emisor del comprobante de retención.",
  "2621": "Número de RUC del Proveedor no existe.",
  "2622": "La moneda del importe de pago debe ser la misma que la del documento relacionado.",
  "2623": "Los montos de pago, retenidos y montos pagados consignados para el documento relacionado no son correctos.",
  "2624": "El comprobante electrónico no ha sido emitido por el proveedor.",
  "2625": "La fecha de pago debe estar entre el primer día calendario del mes al cual corresponde la fecha de emisión del comprobante de retención o desde la fecha de emisión del comprobante relacionado.",
  "2626": "El Nro. de documento con el número de pago ya se encuentra en la Relación de Documentos Relacionados agregados.",
  "2627": "El Nro. de documento con el número de pago ya se encuentra registrado como pago realizado.",
  "2628": "Importe total retenido debe ser igual a la suma de los importes retenidos por cada documento relacionado.",
  "2629": "Importe total pagado debe ser igual a la suma de los importes pagados por cada documento relacionado.",
  "2630": "La serie o numero del documento(01) modificado por la Nota de Credito no cumple con el formato establecido para tipo codigo Nota Credito 10.",
  "2631": "La serie o numero del documento(12) modificado por la Nota de Credito no cumple con el formato establecido para tipo codigo Nota Credito 10.",
  "2632": "La serie o numero del documento(56) modificado por la Nota de Credito no cumple con el formato establecido para tipo codigo Nota Credito 10.",
  "2633": "La serie o numero del documento(03) modificado por la Nota de Credito no cumple con el formato establecido para tipo codigo Nota Credito 10.",
  "2634": "ReferenceID - El dato ingresado debe indicar serie correcta del documento al que se relaciona la Nota tipo 10.",
  "2635": "Debe existir DocumentTypeCode de Otros documentos relacionados con valor 99 para un tipo codigo Nota Credito 10.",
  "2636": "No existe datos del ID de los documentos relacionados con valor 99 para un tipo codigo Nota Credito 10.",
  "2637": "No existe datos del DocumentType de los documentos relacionados con valor 99 para un tipo codigo Nota Credito 10.",
  "2638": "Si tiene operaciones de un tributo en alguna línea, debe consignar el tag del total del tributo",
  "2640": "Operacion gratuita, solo debe consignar un monto referencial",
  "2641": "Operacion gratuita,  debe consignar Total valor venta - operaciones gratuitas  mayor a cero",
  "2642": "Operaciones de exportacion, deben consignar Tipo Afectacion igual a 40",
  "2643": "Factura de operacion sujeta IVAP debe consignar Monto de impuestos por item",
  "2644": "Comprobante operacion sujeta IVAP solo debe tener ítems con código de afectación del IGV igual a 17",
  "2645": "Factura de operacion sujeta a IVAP debe consignar items con codigo de tributo 1000",
  "2646": "Factura de operacion sujeta a IVAP debe consignar  items con nombre  de tributo IVAP",
  "2647": "Código tributo  UN/ECE debe ser VAT",
  "2648": "Factura de operacion sujeta al IVAP, solo puede consignar informacion para operacion gravadas",
  "2649": "Operación sujeta al IVAP, debe consignar monto en total operaciones gravadas",
  "2650": "Factura de operacion sujeta al IVAP , no debe consignar valor para ISC o debe ser 0",
  "2651": "Factura de operacion sujeta al IVAP , no debe consignar valor para IGV o debe ser 0",
  "2652": "Factura de operacion sujeta al IVAP , debe registrar mensaje 2007",
  "2653": "Servicios prestados No domiciliados. Total IGV debe se mayor a cero",
  "2654": "Servicios prestados No domiciliados. Código tributo a consignar debe ser 1000",
  "2655": "Servicios prestados No domiciliados. El código de afectación debe ser 40",
  "2656": "Servicios prestados No domiciliados. Código tributo  UN/ECE debe ser VAT",
  "2657": "El Nro. de documento ya fué utilizado en la emision de CPE.",
  "2658": "El Nro. de documento no se ha informado o no se encuentra en estado Revertido",
  "2659": "La fecha de cobro de cada documento relacionado deben ser del mismo Periodo (mm/aaaa), asimismo estas fechas podrán ser menores o iguales a la fecha de emisión del comprobante de percepción",
  "2660": "Los datos del CPE revertido no corresponden a los registrados en la SUNAT",
  "2661": "La fecha de cobro de cada documento relacionado deben ser del mismo Periodo (mm/aaaa), asimismo estas fechas podrán ser menores o iguales a la fecha de emisión del comprobante de retencion",
  "2662": "El Nro. de documento ya fué utilizado en la emision de CRE.",
  "2663": "El documento indicado no existe no puede ser modificado",
  "2664": "El calculo de la base imponible de percepción y el monto de la percepción no coincide con el monto total informado.",
  "2665": "El contribuyente no se encuentra autorizado a emitir Tickets",
  "2666": "Las percepciones son solo válidas para boletas de venta al contado.",
  "2667": "Importe total percibido debe ser igual a la suma de los importes percibidos por cada documento relacionado.",
  "2668": "Importe total cobrado debe ser igual a la suma de los importes cobrados por cada documento relacionado.",
  "2669": "El dato ingresado en TotalInvoiceAmount debe ser numérico mayor a cero",
  "2670": "La razón social no corresponde al ruc informado.",
  "2671": "La fecha de generación de la comunicación/resumen debe ser mayor o igual a la fecha de generación/emisión de los documentos",
  "2672": "La fecha de generación del documento revertido debe ser menor o igual a la fecha actual.",
  "2673": "El dato ingresado no cumple con el formato RR-fecha-correlativo.",
  "2674": "El dato ingresado  no cumple con el formato de DocumentSerialID, para DocumentTypeCode con valor 20.",
  "2675": "El dato ingresado  no cumple con el formato de DocumentSerialID, para DocumentTypeCode con valor 40.",
  "2676": "El XML no contiene el tag o no existe información del número de RUC del emisor",
  "2677": "El valor ingresado como número de RUC del emisor es incorrecto",
  "2678": "El XML no contiene el atributo o no existe información del tipo de documento del emisor",
  "2679": "El XML no contiene el tag o no existe información del número de documento de identidad del cliente",
  "2680": "El valor ingresado como documento de identidad del cliente es incorrecto",
  "2681": "El XML no contiene el atributo o no existe información del tipo de documento del cliente",
  "2682": "El valor ingresado como tipo de documento del cliente es incorrecto",
  "2683": "El XML no contiene el tag o no existe información del Importe total Percibido",
  "2684": "El XML no contiene el tag o no existe información de la moneda del Importe total Percibido",
  "2685": "El valor de la moneda del Importe total Percibido debe ser PEN",
  "2686": "El XML no contiene el tag o no existe información del Importe total Cobrado",
  "2687": "El dato ingresado en SUNATTotalCashed debe ser numérico mayor a cero",
  "2689": "El XML no contiene el tag o no existe información de la moneda del Importe total Cobrado",
  "2690": "El valor de la moneda del Importe total Cobrado debe ser PEN",
  "2691": "El XML no contiene el tag o no existe información del tipo de documento relacionado",
  "2692": "El tipo de documento relacionado no es válido",
  "2693": "El XML no contiene el tag o no existe información del número de documento relacionado",
  "2694": "El número de documento relacionado no está permitido o no es valido",
  "2695": "El XML no contiene el tag o no existe información del Importe total documento Relacionado",
  "2696": "El dato ingresado en el importe total documento relacionado debe ser numérico mayor a cero",
  "2697": "El XML no contiene el tag o no existe información del número de cobro",
  "2698": "El dato ingresado en el número de cobro no es válido",
  "2699": "El XML no contiene el tag o no existe información del Importe del cobro",
  "2700": "El dato ingresado en el Importe del cobro debe ser numérico mayor a cero",
  "2701": "El XML no contiene el tag o no existe información de la moneda del documento Relacionado",
  "2702": "El XML no contiene el tag o no existe información de la fecha de cobro del documento Relacionado",
  "2703": "La fecha de cobro del documento relacionado no es válido",
  "2704": "El XML no contiene el tag o no existe información del Importe percibido",
  "2705": "El dato ingresado en el Importe percibido debe ser numérico mayor a cero",
  "2706": "El XML no contiene el tag o no existe información de la moneda de importe percibido",
  "2707": "El valor de la moneda de importe percibido debe ser PEN",
  "2708": "El XML no contiene el tag o no existe información de la Fecha de Percepción",
  "2709": "La fecha de percepción no es válido",
  "2710": "El XML no contiene el tag o no existe información del Monto total a cobrar",
  "2711": "El dato ingresado en el Monto total a cobrar debe ser numérico mayor a cero",
  "2712": "El XML no contiene el tag o no existe información de la moneda del Monto total a cobrar",
  "2713": "El valor de la moneda del Monto total a cobrar debe ser PEN",
  "2714": "El valor de la moneda de referencia para el tipo de cambio no es válido",
  "2715": "El valor de la moneda objetivo para la Tasa de Cambio debe ser PEN",
  "2716": "El dato ingresado en el tipo de cambio debe ser numérico mayor a cero",
  "2717": "La fecha de cambio no es válido",
  "2718": "El valor de la moneda del documento Relacionado no es válido",
  "2719": "El XML no contiene el tag o no existe información de la moneda de referencia para el tipo de cambio",
  "2720": "El XML no contiene el tag o no existe información de la moneda objetivo para la Tasa de Cambio",
  "2721": "El XML no contiene el tag o no existe información del tipo de cambio",
  "2722": "El XML no contiene el tag o no existe información de la fecha de cambio",
  "2723": "El XML no contiene el tag o no existe información del número de documento de identidad del proveedor",
  "2724": "El valor ingresado como documento de identidad del proveedor es incorrecto",
  "2725": "El XML no contiene el tag o no existe información del Importe total Retenido",
  "2726": "El XML no contiene el tag o no existe información de la moneda del Importe total Retenido",
  "2727": "El XML no contiene el tag o no existe información de la moneda del Importe total Retenido",
  "2728": "El valor de la moneda del Importe total Retenido debe ser PEN",
  "2729": "El XML no contiene el tag o no existe información del Importe total Pagado",
  "2730": "El dato ingresado en SUNATTotalPaid debe ser numérico mayor a cero",
  "2731": "El XML no contiene el tag o no existe información de la moneda del Importe total Pagado",
  "2732": "El valor de la moneda del Importe total Pagado debe ser PEN",
  "2733": "El XML no contiene el tag o no existe información del número de pago",
  "2734": "El dato ingresado en el número de pago no es válido",
  "2735": "El XML no contiene el tag o no existe información del Importe del pago",
  "2736": "El dato ingresado en el Importe del pago debe ser numérico mayor a cero",
  "2737": "El XML no contiene el tag o no existe información de la fecha de pago del documento Relacionado",
  "2738": "La fecha de pago del documento relacionado no es válido",
  "2739": "El XML no contiene el tag o no existe información del Importe retenido",
  "2740": "El dato ingresado en el Importe retenido debe ser numérico mayor a cero",
  "2741": "El XML no contiene el tag o no existe información de la moneda de importe retenido",
  "2742": "El valor de la moneda de importe retenido debe ser PEN",
  "2743": "El XML no contiene el tag o no existe información de la Fecha de Retención",
  "2744": "La fecha de retención no es válido",
  "2745": "El XML no contiene el tag o no existe información del Importe total a pagar (neto)",
  "2746": "El dato ingresado en el Importe total a pagar (neto) debe ser numérico mayor a cero",
  "2747": "El XML no contiene el tag o no existe información de la Moneda del monto neto pagado",
  "2748": "El valor de la Moneda del monto neto pagado debe ser PEN",
  "2749": "La moneda de referencia para el tipo de cambio debe ser la misma que la del documento relacionado",
  "2750": "El comprobante que desea revertir no existe.",
  "2751": "El comprobante fue informado previamente en una reversión.",
  "2752": "El número de ítem no puede estar duplicado.",
  "2753": "No debe existir mas de una referencia en guía dada de baja.",
  "2754": "El tipo de documento de la guia dada de baja es incorrecto (tipo documento = 09).",
  "2755": "El tipo de documento relacionado es incorrecto (ver catalogo nro 21).",
  "2756": "El numero de documento relacionado no cumple con el estandar.",
  "2757": "El XML no contiene el tag o no existe información del número de documento de identidad del destinatario.",
  "2758": "El valor ingresado como numero de documento de identidad del destinatario no cumple con el estandar.",
  "2759": "El XML no contiene el atributo o no existe información del tipo de documento del destinatario.",
  "2760": "El valor ingresado como tipo de documento del destinatario es incorrecto.",
  "2761": "El XML no contiene el atributo o no existe información del nombre o razon social del destinatario.",
  "2762": "El valor ingresado como tipo de documento del nombre o razon social del destinatario es incorrecto.",
  "2763": "El XML no contiene el tag o no existe información del número de documento de identidad del tercero relacionado.",
  "2764": "El valor ingresado como numero de documento de identidad del tercero relacionado no cumple con el estandar.",
  "2765": "El XML no contiene el atributo o no existe información del tipo de documento del tercero relacionado.",
  "2766": "El valor ingresado como tipo de documento del tercero relacionado es incorrecto.",
  "2767": "Para exportación, el XML no contiene el tag o no existe informacion del numero de DAM.",
  "2768": "Para importación, el XML no contiene el tag o no existe informacion del numero de manifiesto de carga o numero de DAM.",
  "2769": "El valor ingresado como numero de DAM no cumple con el estandar.",
  "2770": "El valor ingresado como numero de manifiesto de carga no cumple con el estandar.",
  "2771": "El XML no contiene el atributo o no existe informacion en numero de bultos o pallets obligatorio para importación.",
  "2772": "El valor ingresado como numero de bultos o pallets no cumple con el estandar.",
  "2773": "El valor ingresado como modalidad de transporte no es correcto.",
  "2774": "El XML contiene datos de vehiculo o datos de conductores para una operación de transporte publico completo.",
  "2775": "El XML no contiene el atributo o no existe informacion del codigo de ubigeo.",
  "2776": "El valor ingresado como codigo de ubigeo no cumple con el estandar.",
  "2777": "El XML no contiene el atributo o no existe informacion de direccion completa y detallada.",
  "2778": "El valor ingresado como direccion completa y detallada no cumple con el estandar.",
  "2779": "El XML no contiene el atributo o no existe informacion de cantida de items",
  "2780": "El valor ingresado en cantidad de items no cumple con el estandar",
  "2781": "El XML no contiene el atributo o no existe informacion de descripcion del items",
  "2782": "El valor ingresado en descripcion del items no cumple con el estandar",
  "2783": "El valor ingresado en codigo del item no cumple con el estandar.",
  "2784": "Debe consignar codigo de regimen de percepcion (sac:AdditionalMonetaryTotal/cbc:ID@schemeID).",
  "2785": "sac:ReferenceAmount es obligatorio y mayor a cero cuando sac:AdditionalMonetaryTotal/cbc:ID es 2001",
  "2786": "El dato ingresado en sac:ReferenceAmount no cumple con el formato establecido",
  "2787": "Debe consignar la moneda para la Base imponible percepcion.",
  "2788": "El dato ingresado en moneda debe ser PEN",
  "2789": "cbc:PayableAmount es obligatorio y mayor a cero cuando sac:AdditionalMonetaryTotal/cbc:ID es 2001",
  "2790": "El dato ingresado en cbc:PayableAmount no cumple con el formato establecido",
  "2791": "Debe consignar la moneda para el Monto de la percepcion (cbc:PayableAmount/@currencyID)",
  "2792": "El dato ingresado en moneda del monto de cargo/descuento para percepcion debe ser PEN",
  "2793": "sac:TotalAmount es obligatorio y mayor a cero cuando sac:AdditionalMonetaryTotal/cbc:ID es 2001",
  "2794": "El dato ingresado en sac:TotalAmount no cumple con el formato establecido",
  "2795": "Debe consignar la moneda para el Monto Total incluido la percepcion (sac:TotalAmount/@currencyID)",
  "2796": "El dato ingresado en sac:TotalAmount/@currencyID debe ser PEN",
  "2797": "El Monto de percepcion no puede ser mayor al importe total del comprobante.",
  "2798": "El Monto de percepcion no tiene el valor correcto según el tipo de percepcion.",
  "2799": "sac:TotalAmount no tiene el valor correcto cuando sac:AdditionalMonetaryTotal/cbc:ID es 2001",
  "2800": "El dato ingresado en el tipo de documento de identidad del receptor no esta permitido.",
  "2801": "El DNI ingresado no cumple con el estandar.",
  "2802": "El dato ingresado como numero de documento de identidad del receptor no cumple con el formato establecido",
  "2803": "ID - No cumple con el formato UUID",
  "2804": "La fecha de recepcion del comprobante por OSE, no debe de ser mayor a la fecha de recepcion de SUNAT",
  "2805": "El XML no contiene el tag IssueTime",
  "2806": "IssueTime - El dato ingresado  no cumple con el patrón hh:mm:ss.sssss",
  "2807": "El XML no contiene el tag ResponseDate",
  "2808": "ResponseDate - El dato ingresado  no cumple con el patrón YYYY-MM-DD",
  "2809": "La fecha de recepcion del comprobante por OSE, no debe de ser mayor a la fecha de comprobacion del OSE",
  "2810": "La fecha de comprobacion del comprobante en OSE no puede ser mayor a la fecha de recepcion en SUNAT",
  "2811": "El XML no contiene el tag ResponseTime",
  "2812": "ResponseTime - El dato ingresado  no cumple con el patrón hh:mm:ss.sssss",
  "2813": "El XML no contiene el tag o no existe información del Número de documento de identificación del que envía el CPE (emisor o PSE)",
  "2814": "El valor ingresado como Número de documento de identificación del que envía el CPE (emisor o PSE) es incorrecto",
  "2816": "El XML no contiene el atributo schemeID o no existe información del Tipo de documento de identidad del que envía el CPE (emisor o PSE)",
  "2817": "El valor ingresado como Tipo de documento de identidad del que envía el CPE (emisor o PSE) es incorrecto",
  "2818": "El XML no contiene el atributo schemeAgencyName o no existe información del Tipo de documento de identidad del que envía el CPE (emisor o PSE)",
  "2819": "El valor ingresado en el atributo schemeAgencyName del Tipo de documento de identidad del que envía el CPE (emisor o PSE) es incorrecto",
  "2820": "El XML no contiene el atributo schemeURI o no existe información del Tipo de documento de identidad del que envía el CPE (emisor o PSE)",
  "2821": "El valor ingresado en el atributo schemeURI del Tipo de documento de identidad del que envía el CPE (emisor o PSE) es incorrecto",
  "2822": "El XML no contiene el tag o no existe información del Número de documento de identificación del OSE",
  "2823": "El valor ingresado como Número de documento de identificación del OSE es incorrecto",
  "2824": "El certificado digital con el que se firma el CDR OSE no corresponde con el RUC del OSE informado",
  "2825": "El Número de documento de identificación del OSE informado no esta registrado en el padron.",
  "2826": "El XML no contiene el atributo schemeID o no existe información del Tipo de documento de identidad del OSE",
  "2827": "El valor ingresado como Tipo de documento de identidad del OSE es incorrecto",
  "2828": "El XML no contiene el atributo schemeAgencyName o no existe información del Tipo de documento de identidad del OSE",
  "2829": "El valor ingresado en el atributo schemeAgencyName del Tipo de documento de identidad del OSE es incorrecto",
  "2830": "El XML no contiene el atributo schemeURI o no existe información del Tipo de documento de identidad del OSE",
  "2831": "El valor ingresado en el atributo schemeURI del Tipo de documento de identidad del OSE es incorrecto",
  "2832": "El XML no contiene el tag o no existe información del Código de Respuesta",
  "2833": "El valor ingresado como Código de Respuesta es incorrecto",
  "2834": "El XML no contiene el atributo listAgencyName o no existe información del Código de Respuesta",
  "2835": "El valor ingresado en el atributo listAgencyName del Código de Respuesta es incorrecto",
  "2836": "El XML no contiene el tag o no existe información de la Descripción de la Respuesta",
  "2837": "El valor ingresado como Descripción de la Respuesta es incorrecto",
  "2838": "El valor ingresado como Código de observación es incorrecto",
  "2839": "El XML no contiene el atributo listURI o no existe información del Código de observación",
  "2840": "El valor ingresado en el atributo listURI del Código de observación es incorrecto",
  "2841": "El XML no contiene el tag o no existe información de la Descripción de la observación",
  "2842": "El valor ingresado como Descripción de la observación es incorrecto",
  "2843": "Se ha encontrado mas de una Descripción de la observación, tag cac:Response/cac:Status/cbc:StatusReason",
  "2844": "No se encontro el tag cbc:StatusReasonCode cuando ingresó la Descripción de la observación",
  "2845": "El XML contiene mas de un elemento cac:DocumentReference",
  "2846": "El XML no contiene informacion en el tag cac:DocumentReference/cbc:ID",
  "2848": "El valor ingresado como Serie y número del comprobante no corresponde con el del comprobante",
  "2849": "El XML no contiene el tag o no existe información de la Fecha de emisión del comprobante",
  "2851": "El valor ingresado como Fecha de emisión del comprobante no corresponde con el del comprobante",
  "2852": "El XML no contiene el tag o no existe información de la Hora de emisión del comprobante",
  "2853": "El valor ingresado como Hora de emisión del comprobante no cumple con el patrón hh:mm:ss.sssss",
  "2854": "El valor ingresado como Hora de emisión del comprobante no corresponde con el del comprobante",
  "2855": "El XML no contiene el tag o no existe información del Tipo de comprobante",
  "2856": "El valor ingresado como Tipo de comprobante es incorrecto",
  "2857": "El valor ingresado como Tipo de comprobante no corresponde con el del comprobante",
  "2858": "El XML no contiene el tag o no existe información del Hash del comprobante",
  "2859": "El valor ingresado como Hash del comprobante es incorrecto",
  "2860": "El valor ingresado como Hash del comprobante no corresponde con el del comprobante",
  "2861": "El XML no contiene el tag o no existe información del Número de documento de identificación del emisor",
  "2862": "El valor ingresado como Número de documento de identificación del emisor es incorrecto",
  "2863": "El valor ingresado como Número de documento de identificación del emisor no corresponde con el del comprobante",
  "2864": "El XML no contiene el atributo o no existe información del Tipo de documento de identidad del emisor",
  "2865": "El valor ingresado como Tipo de documento de identidad del emisor es incorrecto",
  "2866": "El valor ingresado como Tipo de documento de identidad del emisor no corresponde con el del comprobante",
  "2867": "El XML no contiene el tag o no existe información del Número de documento de identificación del receptor",
  "2868": "El valor ingresado como Número de documento de identificación del receptor es incorrecto",
  "2869": "El valor ingresado como Número de documento de identificación del receptor no corresponde con el del comprobante",
  "2870": "El XML no contiene el atributo o no existe información del Tipo de documento de identidad del receptor",
  "2871": "El valor ingresado como Tipo de documento de identidad del receptor es incorrecto",
  "2872": "El valor ingresado como Tipo de documento de identidad del receptor no corresponde con el del comprobante",
  "2873": "El PSE informado no se encuentra vinculado con el  emisor del comprobante en la fecha de comprobación",
  "2874": "El Número de documento de identificación del OSE informado no se encuentra vinculado al emisor del comprobante en la fecha de recepcion en SUNAT",
  "2875": "ID - El dato ingresado no cumple con el formato R#-fecha-correlativo",
  "2876": "La fecha de recepción del comprobante por OSE debe ser mayor a la fecha de emisión del comprobante enviado",
  "2880": "Es obligatorio ingresar el peso bruto total de la guía",
  "2881": "Es obligatorio indicar la unidad de medida del Peso Total de la guía",
  "2883": "Es obligatorio indicar la unidad de medida del ítem",
  "2884": "Los comprobantes modificados por la nota deben ser del mismo tipo",
  "2885": "La fecha de emisión de la nota debe ser mayor o igual a la fecha de emisión de los documentos que modifica",
  "2891": "La tasa de percepción no existe en el catálogo",
  "2892": "El valor del tag no cumple con el formato establecido",
  "2893": "El valor no cumple con el formato establecido o es menor o igual a cero (0)",
  "2894": "El valor del tag no cumple con el formato establecido",
  "2895": "El valor no cumple con el formato establecido o es menor o igual a cero (0)",
  "2896": "El código ingresado como estado del ítem no existe en el catálogo",
  "2897": "El valor no cumple con el formato establecido o es menor o igual a cero (0)",
  "2898": "Para los tipos de seguro 1 y 2, debe consignar el numero de poliza, la fecha de cobertura y el monto asegurado",
  "2899": "Para el tipo de seguro 3 - Otros debe consignar el numero de poliza",
  "2900": "El Número de comprobante de fin de rango debe ser igual o mayor al de inicio",
  "2901": "El nombre comercial del emisor no cumple con el formato establecido",
  "2902": "La urbanización del domicilio fiscal del emisor no cumple con el formato establecido",
  "2903": "La provincia del domicilio fiscal del emisor no cumple con el formato establecido",
  "2904": "El departamento del domicilio fiscal del emisor no cumple con el formato establecido",
  "2905": "El distrito del domicilio fiscal del emisor no cumple con el formato establecido",
  "2906": "El nombre comercial del proveedor no cumple con el formato establecido",
  "2907": "La urbanización del domicilio fiscal del proveedor no cumple con el formato establecido",
  "2908": "La provincia del domicilio fiscal del proveedor no cumple con el formato establecido",
  "2909": "El departamento del domicilio fiscal del proveedor no cumple con el formato establecido",
  "2910": "El distrito del domicilio fiscal del proveedor no cumple con el formato establecido",
  "2911": "El nombre comercial del cliente no cumple con el formato establecido",
  "2912": "La urbanización del domicilio fiscal del cliente no cumple con el formato establecido",
  "2913": "La provincia del domicilio fiscal del cliente no cumple con el formato establecido",
  "2914": "El departamento del domicilio fiscal del cliente no cumple con el formato establecido",
  "2915": "El distrito del domicilio fiscal del cliente no cumple con el formato establecido",
  "2916": "La dirección completa y detallada del domicilio fiscal del emisor no cumple con el formato establecido",
  "2917": "Debe corresponder a algún valor válido establecido en el catálogo 13",
  "2918": "La dirección completa y detallada del domicilio fiscal del proveedor no cumple con el formato establecido",
  "2919": "La dirección completa y detallada del domicilio fiscal del cliente no cumple con el formato establecido",
  "2920": "Dato no cumple con formato de acuerdo al tipo de documento",
  "2921": "Es obligatorio informar el detalle el tipo de servicio público",
  "2922": "El valor del Tag no se encuentra en el catálogo",
  "2923": "Es obligatorio informar el código de servicios de telecomunicaciones para el tipo servicio público informado",
  "2924": "Sólo enviar información para el tipos de servicios públicos 5",
  "2925": "El valor del Tag no se encuentra en el catálogo",
  "2926": "Es obligatorio informar el número del suministro para el tipo servicio público informado",
  "2927": "Comprobante de Servicio Publico no se encuenta registrado en sunat",
  "2928": "El valor del Tag no cumple con el tipo y longitud esperada",
  "2929": "Debe remitir información del número de teléfono para el código de servicios de telecomunicaciones informado",
  "2930": "El tipo de documento modificado por la Nota de debito debe ser Servicio Publico electronico",
  "2931": "El valor del Tag no cumple con el tipo y longitud esperada",
  "2932": "Es obligatorio informar el código de tarifa contratada para el tipo servicio público informado",
  "2933": "Sólo enviar información para el tipos de servicios públicos 1 o 2",
  "2934": "El valor del Tag no se encuentra en el catálogo",
  "2935": "Es obligatorio informar la unidad de medida",
  "2936": "El dato ingresado como unidad de medida no corresponde al valor esperado",
  "2937": "Es obligatorio informar el detalle de la potencia contratada",
  "2938": "Sólo enviar información para el tipo de servicios público 1",
  "2939": "El valor del Tag no cumple con el tipo y longitud esperada",
  "2940": "Es obligatorio informar el tipo de medidor",
  "2941": "Sólo enviar información para el tipo de servicios público 1",
  "2942": "El valor del Tag no se encuentra en el catálogo",
  "2943": "Es obligatorio informar el número del medidor",
  "2944": "Sólo enviar información para el tipos de servicios públicos 1 o 2",
  "2945": "El valor del Tag no cumple con el tipo y longitud esperada",
  "2946": "Debe informar el consumo del periodo",
  "2947": "No existe el detalle del número del medidor",
  "2948": "Sólo enviar información para el tipos de servicios públicos 1 o 2",
  "2949": "El impuesto ICBPER no se encuentra vigente",
  "2950": "El comprobante ha sido presentado fuera de plazo",
  "2951": "Sólo enviar información para el tipos de servicios públicos 1 o 2",
  "2952": "El valor del Tag no cumple con el tipo y longitud esperada",
  "2953": "Es obligatorio indicar la unidad de medida del ítem",
  "2954": "El valor ingresado como codigo de motivo de cargo/descuento por linea no es valido (catalogo 53)",
  "2955": "El formato ingresado en el tag cac:InvoiceLine/cac:Allowancecharge/cbc:Amount no cumple con el formato establecido",
  "2956": "El Monto total de impuestos es obligatorio",
  "2957": "El comprobante no puede ser dado de baja por exceder el plazo desde su fecha de emision",
  "2958": "El comprobante no puede ser dado de baja por exceder el plazo desde su fecha de recepcion",
  "2959": "El valor del atributo del tag cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cbc:ID/ no corresponde al esperado.",
  "2960": "El valor del tag no corresponde al esperado.",
  "2961": "El valor del tag codigo de tributo internacional no corresponde al esperado.",
  "2962": "El valor del atributo del tag cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme/cbc:ID no corresponde al esperado.",
  "2963": "El valor del atributo del tag cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cbc:ID/ no corresponde al esperado.",
  "2964": "El valor del tag nombre del tributo no corresponde al esperado.",
  "2965": "La sumatoria de otros tributos no corresponde al total",
  "2966": "Sólo se puede indicar el códigos 55 del catálogo 53",
  "2967": "Los importes de otros cargos a nivel de línea no corresponden a la suma total.",
  "2968": "El dato ingresado en cac:AllowanceCharge/cbc:Amount no cumple con el formato establecido.",
  "2969": "Los importes de otros cargos a nivel de línea no corresponden a la suma total.",
  "2970": "El dato ingresado en sac:SUNATTotalPaidBeforeRounding debe ser numérico mayor a cero",
  "2971": "Si existe tag sac:SUNATTotalPaidBeforeRounding debe existir tag cbc:PayableRoundingAmount",
  "2972": "Importe total pagado antes de redondeo debe ser igual a la suma de los importes pagados por cada documento relacionado",
  "2973": "El valor de la moneda del Importe total pagado antes de redondeo debe ser PEN",
  "2974": "El dato ingresado en cbc:PayableRoundingAmount debe ser numérico valido",
  "2975": "Si existe tag cbc:PayableRoundingAmount debe existir tag sac:SUNATTotalPaidBeforeRounding",
  "2976": "El valor para el ajuste por redondeo no es válido",
  "2977": "El valor de la moneda del Ajuste por redondeo debe ser PEN",
  "2978": "Importe total pagado debe ser igual a la suma del Importe total pagado antes de redondeo mas el Ajuste por redondeo",
  "2979": "El dato ingresado en sac:SUNATTotalCashedBeforeRounding debe ser numérico mayor a cero",
  "2980": "Si existe tag sac:SUNATTotalCashedBeforeRounding debe existir tag cbc:PayableRoundingAmount",
  "2981": "Importe total cobrado antes de redondeo debe ser igual a la suma de los importes cobrados por cada documento relacionado",
  "2982": "El valor de la moneda del Importe total cobrado antes de redondeo debe ser PEN",
  "2983": "Si existe tag cbc:PayableRoundingAmount debe existir tag sac:SUNATTotalCashedBeforeRounding",
  "2984": "Importe total cobrado debe ser igual a la suma del Importe total cobrado antes de redondeo mas el Ajuste por redondeo",
  "2985": "Solo se acepta comprobantes con fecha de emisión hasta el 28/02/2014 si la tasa del comprobante de retencion 6%",
  "2986": "Solo se acepta informacion de percepcion para nuevas boletas.",
  "2987": "El comprobante ya fue informado y se encuentra anulado o rechazado.",
  "2988": "El comprobante (fisico) a la que hace referencia la nota, no se encuentra autorizado.",
  "2989": "El comprobante (electronico) a la que hace referencia la nota, no se encuentra informado.",
  "2990": "El comprobante (electronico) a la que hace referencia la nota, se encuentra anulado o rechazada.",
  "2991": "El tipo de documento modificado por la Nota de credito debe ser comprobante de servicio publico",
  "2992": "El XML no contiene el tag de la tasa del tributo de la línea",
  "2993": "El factor de afectación de IGV por linea debe ser diferente a 0.00.",
  "2994": "La categoría de impuesto de la línea no corresponde al valor esperado (catalogo 5)",
  "2995": "El XML no contiene el tag o no existe información del código internacional de tributo de la línea",
  "2996": "El XML no contiene el tag o no existe información del nombre de tributo de la línea",
  "2997": "El XML no contiene el tag o no existe información del código de tributo de la línea",
  "2998": "El código de tributo de la línea no corresponde al valor esperado",
  "2999": "El dato ingresado en el total valor de venta globales no cumple con el formato establecido",
  "3000": "El monto total del impuestos sobre el valor de venta de operaciones gratuitas/inafectas/exoneradas debe ser igual a 0.00",
  "3001": "El Código producto de SUNAT no puede ser vacio si es de Exportacion",
  "3002": "El Código producto de SUNAT  no es válido",
  "3003": "El XML no contiene el tag o no existe información de total valor de venta globales",
  "3004": "El XML no contiene el tag o no existe información de la categoría de impuesto globales",
  "3005": "El XML no contiene el tag o no existe información del código de tributo en operaciones inafectas/exoneradas",
  "3006": "El dato ingresado en descripcion de leyenda no cumple con el formato establecido.",
  "3007": "El dato ingresado como codigo de tributo global no corresponde al valor esperado.",
  "3008": "La sumatoria del total valor de venta - Otros tributos de pago de línea no corresponden al total",
  "3009": "La sumatoria del total del importe del tributo Otros tributos de línea no corresponden al total",
  "3010": "El XML no contiene el tag o no existe información de total valor de venta en operaciones gravadas",
  "3011": "El dato ingresado en el total valor de venta en operaciones gravadas  no cumple con el formato establecido",
  "3012": "El dato ingresado en el importe del tributo en operaciones gravadas  no cumple con el formato establecido",
  "3013": "El XML no contiene el tag o no existe información de la categoría de impuesto en operaciones gravadas",
  "3014": "El codigo de leyenda no debe repetirse en el comprobante.",
  "3015": "El XML no contiene el tag o no existe información del código de tributo en operaciones gravadas",
  "3016": "El dato ingresado en base monto por cargo/descuento globales no cumple con el formato establecido",
  "3017": "El XML no contiene el tag o no existe información del nombre de tributo en operaciones gravadas",
  "3018": "El XML no contiene el tag o no existe información del código internacional del tributo en operaciones gravadas",
  "3019": "El dato ingresado en total precio de venta no cumple con el formato establecido",
  "3020": "El dato ingresado en el monto total de impuestos no cumple con el formato establecido",
  "3021": "El dato ingresado en el monto total de impuestos por línea no cumple con el formato establecido",
  "3022": "El importe total de impuestos por línea no coincide con la sumatoria de los impuestos por línea.",
  "3023": "El tipo de documento no se encuentra en el catálogo",
  "3024": "El tag cac:TaxTotal no debe repetirse a nivel de totales",
  "3025": "El dato ingresado en factor de cargo o descuento global no cumple con el formato establecido.",
  "3026": "El tag cac:TaxTotal no debe repetirse a nivel de Item",
  "3027": "El valor del atributo no se encuentra en el catálogo",
  "3028": "El dato ingresado en código de SW de facturación no cumple con el formato establecido.",
  "3029": "El XML no contiene el tag o no existe información del tipo de documento de identidad del emisor",
  "3030": "El XML no contiene el tag o no existe información del código de local anexo del emisor",
  "3031": "El dato ingresado en TaxableAmount de la linea no cumple con el formato establecido",
  "3032": "El XML no contiene el tag o no existe información de la categoría de impuesto de la línea",
  "3033": "El codigo de bien o servicio sujeto a detracción no existe en el listado.",
  "3034": "El xml no contiene el tag o no existe información en el nro de cuenta de detracción",
  "3035": "El xml no contiene el tag o no existe información en el monto de detraccion",
  "3036": "El XML no contiene el tag o no existe información del nombre del tributo",
  "3037": "El dato ingresado en monto de detraccion no cumple con el formato establecido",
  "3038": "La sumatoria de los IGV (operaciones gravadas) de línea no corresponden al total",
  "3039": "La sumatoria del total valor de venta - operaciones gravadas de línea no corresponden al total",
  "3040": "La sumatoria del total valor de venta - Exportaciones de línea no corresponden al total",
  "3041": "La sumatoria del total valor de venta - operaciones inafectas de línea no corresponden al total",
  "3042": "La sumatoria del total valor de venta - operaciones exoneradas de línea no corresponden al total",
  "3043": "El XML no contiene el tag o no existe información de total valor de venta ISC e IVAP",
  "3044": "El dato ingresado en el total valor de venta ISC e IVAP no cumple con el formato establecido",
  "3045": "La sumatoria del total valor de venta - ISC de línea no corresponden al total",
  "3046": "La sumatoria del total valor de venta - IVAP de línea no corresponden al total",
  "3047": "El dato ingresado en el importe del tributo para ISC e IVAP no cumple con el formato establecido",
  "3048": "La sumatoria del total del importe del tributo ISC de línea no corresponden al total",
  "3049": "El importe del IVAP no corresponden al determinado por la información consignada.",
  "3050": "Afectación de IGV no corresponde al código de tributo de la linea.",
  "3051": "Nombre de tributo no corresponde al código de tributo de la linea.",
  "3052": "El factor de cargo/descuento por linea no cumple con el formato establecido.",
  "3053": "El Monto base de cargo/descuento por linea no cumple con el formato establecido.",
  "3054": "El XML no contiene el tag o no existe información de la categoría de impuesto en ISC o IVAP",
  "3055": "Si el código de tributo es 2000, la categoría del tributo debe ser S",
  "3056": "Si el código de tributo es 1016, la categoría del tributo debe ser S",
  "3057": "La sumatoria del total valor de venta - operaciones gratuitas de línea no corresponden al total",
  "3058": "El XML no contiene el tag o no existe información del código de tributo para ISC o IVAP",
  "3059": "El XML no contiene el tag o no existe información de código de tributo.",
  "3060": "El valor del tag código de tributo no corresponde al esperado.",
  "3061": "No se permite importe mayor a cero cuando el codigo de tributo es IVAP y el comprobante esta sujeta a IVAP",
  "3062": "La tasa o porcentaje de detracción no corresponde al valor esperado.",
  "3063": "El XML no contiene el tag de matricula de embarcación en Detracciones para recursos hidrobiologicos.",
  "3064": "El XML no contiene tag o no existe información del valor del concepto por linea.",
  "3065": "El XML no contiene tag de la fecha del concepto por linea.",
  "3066": "El XML contiene un codigo de tributo no valido para Servicios Publicos.",
  "3067": "El código de tributo no debe repetirse a nivel de item",
  "3068": "El código de tributo no debe repetirse a nivel de totales",
  "3069": "El xml contiene una linea con mas de un codigo de tributo repetitivo.",
  "3070": "EL codigo internacional del tributo por linea no corresponde al valor esperado por su Id.",
  "3071": "El dato ingresado como codigo de motivo de cargo/descuento global no es valido (catalogo nro 53)",
  "3072": "El XML no contiene el tag o no existe informacion de codigo de motivo de cargo/descuento global.",
  "3073": "El XML no contiene el tag o no existe informacion de codigo de motivo de cargo/descuento por item.",
  "3074": "El monto del cargo para el para FISE debe ser igual mayor a 0.00",
  "3075": "La sumatoria de descuentos que afectan a BI por linea no corresponden al total",
  "3076": "La sumatoria de descuentos que no afectan a BI por linea no corresponden al total",
  "3077": "La sumatoria de cargos que afectan a BI por linea no corresponden al total",
  "3078": "La sumatoria de cargos que no afectan a BI por linea no corresponden al total",
  "3079": "La sumatoria de montos bases de los descuentos que afectan a BI por linea no corresponden al total",
  "3080": "La sumatoria de montos bases de los descuentos que no afectan a BI por linea no corresponden al total",
  "3081": "La sumatoria de montos bases de los cargos que afectan a BI por linea no corresponden al total",
  "3082": "La sumatoria de montos bases de los cargos que no afectan a BI por linea no corresponden al total",
  "3083": "El XML no contiene el tag o no existe información del total valor de venta.",
  "3084": "La sumatoria de valor de venta no corresponde a los importes consignados",
  "3085": "El XML no contiene el tag o no existe información del total precio de venta.",
  "3086": "La sumatoria consignados en descuentos globales no corresponden al total.",
  "3087": "La sumatoria consignados en cargos globales no corresponden al total",
  "3088": "El valor ingresado como moneda del comprobante no es valido (catalogo nro 02).",
  "3089": "El XML contiene mas de un tag como elemento de numero de documento del emisor",
  "3090": "El XML contiene mas de un tag como elemento de numero de documento del receptor.",
  "3091": "Si se tipo de operación es Venta Interna - Sujeta al FISE, debe ingresar cargo para FISE",
  "3092": "Para cargo/descuento FISE, debe ingresar monto base y debe ser mayor a 0.00",
  "3093": "Si operación es sujeta a percepción y la forma de pago es Contado, debe ingresar cargo para Percepción",
  "3094": "El comprobante más \"código de operación del ítem\" no debe repetirse",
  "3095": "El comprobante no debe ser emitido y editado en el mismo envío",
  "3096": "El comprobante no debe ser editado y anulado en el mismo envío",
  "3097": "El emisor a la fecha no se encuentra registrado ó habilitado en el Registro de exportadores de servicios SUNAT",
  "3098": "El XML no contiene el tag o no existe información del pais de uso, exploración o aprovechamiento",
  "3099": "El dato ingresado como pais de uso, exploracion o aprovechamiento es incorrecto.",
  "3100": "El dato ingresado como codigo de tributo por linea es invalido para tipo de operación.",
  "3101": "El factor de afectación de IGV por linea debe ser igual a 0.00 para Exoneradas, Inafectas, Exportación, Gratuitas de exoneradas o Gratuitas de inafectas.",
  "3102": "El dato ingresado como factor de afectacion por linea no cumple con el formato establecido.",
  "3103": "El producto del factor y monto base de la afectación del IGV/IVAP no corresponde al monto de afectacion de linea.",
  "3104": "El factor de afectación de ISC por linea debe ser diferente a 0.00.",
  "3105": "El XML debe contener al menos un tributo por linea de afectacion por IGV",
  "3106": "El XML contiene mas de un tributo por linea (Gravado, Exonerado, Inafecto, Exportación)",
  "3107": "El dato ingresado como codigo de tributo global es invalido para tipo de operación.",
  "3108": "El producto del factor y monto base de la afectación del ISC no corresponde al monto de afectacion de linea.",
  "3109": "El producto del factor y monto base de la afectación de otros tributos no corresponde al monto de afectacion de linea.",
  "3110": "El monto de afectacion de IGV por linea debe ser igual a 0.00 para Exoneradas, Inafectas, Exportación, Gratuitas de exoneradas o Gratuitas de inafectas.",
  "3111": "El monto de afectación de IGV por linea debe ser diferente a 0.00.",
  "3112": "La sumatoria de los IGV de operaciones gratuitas de la línea (codigo tributo 9996) no corresponden al total",
  "3113": "El xml contiene información FISE que no corresponde al tipo de operación.",
  "3114": "El dato ingresado como indicador de cargo/descuento no corresponde al valor esperado.",
  "3115": "El dato ingresado como unidad de medida de cantidad de especie vendidas no corresponde al valor esperado.",
  "3116": "El XML no contiene el tag o no existe información del ubigeo de punto de origen en Detracciones - Servicio de transporte de carga.",
  "3117": "El XML no contiene el tag o no existe información de la dirección del punto de origen en Detracciones - Servicio de transporte de carga.",
  "3118": "El XML no contiene el tag o no existe información del ubigeo de punto de destino en Detracciones - Servicio de transporte de carga.",
  "3119": "El XML no contiene el tag o no existe información de la dirección del punto de destino en Detracciones - Servicio de transporte de carga.",
  "3120": "El XML no contiene el tag o no existe información del Detalle del viaje en Detracciones - Servicio de transporte de carga.",
  "3121": "El XML no contiene el tag o no existe información del tipo de valor referencial en Detracciones - Servicios de transporte de carga.",
  "3122": "El XML no contiene el tag o no existe información del monto del valor referencial en Detracciones - Servicios de transporte de carga.",
  "3123": "El dato ingresado como monto valor referencial en Detracciones - Servicios de transporte de carga no cumple con el formato establecido.",
  "3124": "Detracciones - Servicio de transporte de carga, debe tener un (y solo uno) Valor Referencial del Servicio de Transporte.",
  "3125": "Detracciones - Servicio de transporte de carga, debe tener un (y solo uno) Valor Referencial sobre la carga efectiva.",
  "3126": "Detracciones - Servicio de transporte de carga, debe tener un (y solo uno) Valor Referencial sobre la carga util nominal.",
  "3127": "El XML no contiene el tag o no existe información del Codigo de BBSS de detracción para el tipo de operación.",
  "3128": "El XML contiene información de codigo de bien y servicio de detracción que no corresponde al tipo de operación.",
  "3129": "El dato ingresado como codigo de BBSS de detracción no corresponde al valor esperado.",
  "3130": "El XML no contiene el tag de nombre de embarcación en Detracciones para recursos hidrobiologicos.",
  "3131": "El XML no contiene el tag de tipo de especie vendidas en Detracciones para recursos hidrobiologicos.",
  "3132": "El XML no contiene el tag de lugar de descarga en Detracciones para recursos hidrobiologicos.",
  "3133": "El XML no contiene el tag de cantidad de especies vendidas en Detracciones para recursos hidrobiologicos.",
  "3134": "El XML no contiene el tag de fecha de descarga en Detracciones para recursos hidrobiologicos.",
  "3135": "El XML no contiene tag de la cantidad del concepto por linea.",
  "3136": "El XML no contiene el tag de numero de documentos del huesped.",
  "3137": "El XML no contiene el tag de tipo de documentos del huesped.",
  "3138": "El XML no contiene el tag de codigo de pais de emision del documento de identidad",
  "3139": "El XML no contiene el tag de apellidos y nombres del huesped.",
  "3140": "El XML no contiene el tag de codigo del pais de residencia.",
  "3141": "El XML no contiene el tag de fecha de ingreso del pais.",
  "3142": "El XML no contiene el tag de fecha de ingreso al establecimiento.",
  "3143": "El XML no contiene el tag de fecha de salida del establecimiento.",
  "3144": "El XML no contiene el tag de fecha de consumo.",
  "3145": "El XML no contiene el tag de numero de dias de permanencia.",
  "3146": "El XML no contiene el tag de Proveedores Estado: Número de Expediente",
  "3147": "El XML no contiene el tag de Proveedores Estado: Código de Unidad Ejecutora",
  "3148": "El XML no contiene el tag de Proveedores Estado: N° de Proceso de Selección",
  "3149": "El XML no contiene el tag de Proveedores Estado: N° de Contrato",
  "3150": "El XML no contiene el tag de Créditos Hipotecarios: Tipo de préstamo",
  "3151": "El XML no contiene el tag de Créditos Hipotecarios: Partida Registral",
  "3152": "El XML no contiene el tag de Créditos Hipotecarios: Número de contrato",
  "3153": "El XML no contiene el tag de Créditos Hipotecarios: Fecha de otorgamiento del crédito",
  "3154": "El XML no contiene el tag de Créditos Hipotecarios: Dirección del predio - Código de ubigeo",
  "3155": "El XML no contiene el tag de Créditos Hipotecarios: Dirección del predio - Dirección completa",
  "3156": "El XML no contiene el tag de BVME transporte ferroviario: Agente de Viajes: Numero de Ruc",
  "3157": "El XML no contiene el tag de BVME transporte ferroviario: Agente de Viajes: Tipo de documento",
  "3158": "El dato ingresado como Agente de Viajes-Tipo de documento no corresponde al valor esperado.",
  "3159": "El XML no contiene el tag de BVME transporte ferroviario: Pasajero - Apellidos y Nombres",
  "3160": "El XML no contiene el tag de BVME transporte ferroviario: Pasajero - Tipo de documento de identidad",
  "3161": "El XML no contiene el tag de BVME transporte ferroviario: Servicio transporte: Ciudad o lugar de origen - Código de ubigeo",
  "3162": "El XML no contiene el tag de BVME transporte ferroviario: Servicio transporte: Ciudad o lugar de origen - Dirección detallada",
  "3163": "El XML no contiene el tag de BVME transporte ferroviario: Servicio transporte: Ciudad o lugar de destino - Código de ubigeo",
  "3164": "El XML no contiene el tag de BVME transporte ferroviario: Servicio transporte: Ciudad o lugar de destino - Dirección detallada",
  "3165": "El XML no contiene el tag de BVME transporte ferroviario: Servicio transporte:Número de asiento",
  "3166": "El XML no contiene el tag de BVME transporte ferroviario: Servicio transporte: Hora programada de inicio de viaje",
  "3167": "El XML no contiene el tag de BVME transporte ferroviario: Servicio transporte: Fecha programada de inicio de viaje",
  "3168": "El XML no contiene el tag de Carta Porte Aéreo:  Lugar de origen - Código de ubigeo",
  "3169": "El XML no contiene el tag de Carta Porte Aéreo:  Lugar de origen - Dirección detallada",
  "3170": "El XML no contiene el tag de Carta Porte Aéreo:  Lugar de destino - Código de ubigeo",
  "3171": "El XML no contiene el tag de Carta Porte Aéreo:  Lugar de destino - Dirección detallada",
  "3172": "El XML no contiene tag de la Hora del concepto por linea.",
  "3173": "El XML no contiene el tag de BVME transporte ferroviario: Servicio transporte: Forma de Pago",
  "3174": "El dato ingreso como Forma de Pago o Medio de Pago no corresponde al valor esperado (catalogo nro 59)",
  "3175": "El XML no contiene el tag de BVME transporte ferroviario: Servicio de transporte: Número de autorización de la transacción",
  "3176": "El XML no contiene el tag de Regalía Petrolera: Decreto Supremo de aprobación del contrato",
  "3177": "El XML no contiene el tag de Regalía Petrolera: Area de contrato (Lote)",
  "3178": "El XML no contiene el tag de Regalía Petrolera: Periodo de pago - Fecha de inicio",
  "3179": "El XML no contiene el tag de Regalía Petrolera: Periodo de pago - Fecha de fin",
  "3180": "El XML no contiene el tag de Regalía Petrolera: Fecha de Pago",
  "3181": "El dato ingresado como Codigo de producto SUNAT no corresponde al valor esperado para tipo de operación.",
  "3182": "El XML no contiene el tag de Transportre Terreste - Número de asiento",
  "3183": "El XML no contiene el tag de Transporte Terrestre - Información de manifiesto de pasajeros",
  "3184": "El XML no contiene el tag de Transporte Terrestre - Número de documento de identidad del pasajero",
  "3185": "El XML no contiene el tag de Transporte Terrestre - Tipo de documento de identidad del pasajero",
  "3186": "El XML no contiene el tag de Transporte Terrestre - Nombres y apellidos del pasajero",
  "3187": "El XML no contiene el tag de Transporte Terrestre - Ciudad o lugar de destino - Dirección detallada",
  "3188": "El XML no contiene el tag de Transporte Terrestre - Ciudad o lugar de origen - Ubigeo",
  "3189": "El XML no contiene el tag de Transporte Terrestre - Ciudad o lugar de origen - Dirección detallada",
  "3190": "El XML no contiene el tag de Transporte Terrestre - Fecha de inicio programado",
  "3191": "El XML no contiene el tag de Transporte Terrestre - Hora de inicio programado",
  "3192": "El XML no contiene el tag de Total de anticipos",
  "3193": "El dato ingresado Total anticipos no corresponde para el tipo de operación",
  "3194": "Para los ajustes de operaciones de exportación solo es permitido registrar un documento que modifica.",
  "3195": "El xml no contiene el tag de impuesto por linea (TaxtTotal).",
  "3196": "La sumatoria de impuestos globales no corresponde al monto total de impuestos.",
  "3197": "El XML no contiene el tag de Transporte Terrestre - Ciudad o lugar de destino - Ubigeo",
  "3198": "La fecha de cierre no puede ser inferior a la fecha de inicio del cómputo del ciclo de facturación",
  "3199": "Si utiliza el estandar GS1 debe especificar el tipo de estructura GTIN",
  "3200": "El tipo de estructura GS1 no tiene un valor permitido",
  "3201": "El código de producto GS1 no cumple el estandar",
  "3202": "El numero de RUC del receptor no existe.",
  "3203": "El tipo de nota es un dato único",
  "3204": "El XML no contiene el tag de BVME transporte ferroviario: Pasajero - Número de documento de identidad",
  "3205": "Debe consignar el tipo de operación",
  "3206": "El dato ingresado como tipo de operación no corresponde a un valor esperado (catálogo nro. 51)",
  "3207": "Comprobante físico no se encuentra autorizado",
  "3208": "La moneda del monto de la detracción debe ser PEN",
  "3209": "El tipo de moneda de la nota debe ser el mismo que el declarado en el documento que modifica",
  "3210": "Solo debe consignar sistema de calculo si el tributo es ISC",
  "3211": "Falta identificador del pago del Monto de anticipo para relacionarlo con el comprobante que se realizo el  anticipo",
  "3212": "El comprobante contiene un identificador de pago repetido en los montos anticipados",
  "3213": "El comprobante contiene un pago anticipado pero no se ha consignado el documento que se realizo el anticipo",
  "3214": "No existe información del Monto Anticipado para el comprobante que se realizo el anticipo",
  "3215": "El comprobante contiene un identificador de pago repetido en los comprobantes que se realizo el anticipo",
  "3216": "Falta identificador del pago del comprobante para relacionarlo con el monto de  anticipo",
  "3217": "Debe consignar Numero de RUC del emisor del comprobante de anticipo",
  "3218": "El comprobante que se realizo el anticipo no existe",
  "3219": "El comprobante que se realizo el anticipo no se encuentra autorizado",
  "3220": "Si consigna montos de anticipo debe informar el Total de Anticipos",
  "3221": "El dato ingresado como codigo de tributo global es invalido para tipo de nota",
  "3222": "No existe información a nivel global de un tributo informado en la línea",
  "3223": "La combinación de tributos no es permitida",
  "3224": "Si existe 'Valor referencial unitario en operac. no onerosas' con monto mayor a cero, la operacion debe ser gratuita (codigo de tributo 9996)",
  "3225": "La base imponible a nivel de línea difiere de la información consignada en el comprobante",
  "3226": "El resultado del monto del cargo o descuento global es incorrecto en base a la información consignada",
  "3227": "La sumatoria del Total del valor de venta más los impuestos no concuerda con la base imponible",
  "3228": "El Comprobante de Pago no está autorizado en los Sistemas de la SUNAT.",
  "3229": "El monto para el redondeo del Importe Total excede el valor permitido",
  "3230": "Tipo de nota debe ser 'Ajustes afectos al IVAP'",
  "3231": "Debe consignar solo un elemento a nivel global para Percepciones (cbc:ID igual a 2001)",
  "3232": "Sólo los contribuyentes que hayan emitido los siguientes documentos: Guías, factura, boleta y sus respectivas notas, hasta el 30/09/2018 están autorizados a utilizar esta versión UBL",
  "3233": "Para cargo Percepción, debe ingresar monto base y debe ser mayor a 0.00",
  "3234": "El código de precio '02' es sólo para operaciones gratuitas",
  "3235": "No está autorizado a enviar comprobantes bajo el formato UBL 2.0",
  "3236": "El valor ingresado en el campo cac:TaxSubtotal/cbc:BaseUnitMeasure no corresponde al valor esperado",
  "3237": "Debe consignar el campo cac:TaxSubtotal/cbc:BaseUnitMeasure a nivel de ítem",
  "3238": "El valor ingresado en el campo cac:TaxSubtotal/cbc:PerUnitAmount del ítem no corresponde al valor esperado",
  "3239": "El código de local anexo consignado no se encuentra declarado en el RUC",
  "3240": "El impuesto ICBPER no aplica para el NRUS",
  "3241": "Para el tipo de operación 2100, 2101 y 2102 (Creditos) debe consignar Numero de contrato, Fecha de otorgamiento y Monto del crédito otorgado (capital)",
  "3242": "Para el tipo de operación 2104 - Empresas del sistema de seguros, debe consignar Información adicional  a nivel de ítem",
  "3243": "El XML no contiene tag o no existe información de la fecha del concepto por linea",
  "3244": "Debe consignar la informacion del tipo de transaccion del comprobante",
  "3245": "Debe informar si el tipo de transaccion es al Contado o al Credito",
  "3246": "El tipo de transaccion o el identificador de la cuota no cumple con el formato esperado",
  "3247": "El tipo de transaccion no puede ser a la vez al Contado y al Credito",
  "3248": "El tipo de transaccion o el identificador de la cuota no debe repetirse en el comprobante",
  "3249": "Si el tipo de transaccion es al Credito debe existir al menos información de una cuota de pago",
  "3250": "El Monto neto pendiente de pago no cumple el formato definido",
  "3251": "Si el tipo de transaccion es al Credito debe consignarse el Monto neto pendiente de pago",
  "3252": "Si existe información de cuota de pago, el tipo de transaccion debe ser al credito",
  "3253": "El Monto del pago único o de las cuotas no cumple el formato definido",
  "3254": "Si se consigna información de la cuota de pago, debe indicarse el monto de la cuota",
  "3255": "Fecha del pago único o de las cuotas no cumple el formato definido",
  "3256": "Si se consigna información de la cuota de pago, debe indicarse la fecha del pago único o de las cuotas",
  "3257": "Para el tipo de nota de credito 13 debe consignar información de la operación al credito",
  "3259": "Para el tipo de nota de credito 13 el documento afectado debe ser Factura",
  "3260": "Para el tipo de nota de credito 13 el documento afectado debe ser Factura al credito",
  "3261": "Para el tipo de nota de credito 13 no se puede modificar mas de una factura en la nota",
  "3262": "Si existe retencion de IGV en el comprobante, el receptor debe ser un Agente de Retencion",
  "3263": "El Importe de la retencion no tiene el valor correcto",
  "3264": "El importe total de la operación (base imponible de retencion) no puede ser mayor al importe total del comprobante.",
  "3265": "El Monto neto pendiente de pago debe ser menor o igual al Importe total del comprobante",
  "3266": "El Monto del pago único o de las cuotas debe ser menor o igual al Importe total del comprobante",
  "3267": "Fecha del pago único o de las cuotas no puede ser anterior o igual a la fecha de emisión del comprobante",
  "3268": "El código de local anexo consignado no se encuentra declarado en el RUC",
  "3269": "Si existe retencion de IGV en el comprobante, el emisor no debe ser un Agente de Retencion",
  "3270": "El precio unitario de la operación que está informando difiere de los cálculos realizados en base a la información remitida",
  "3271": "El valor de venta por ítem difiere de los importes consignados.",
  "3272": "La base imponible a nivel de línea difiere de la información consignada en el comprobante",
  "3273": "La sumatoria del total valor de venta - Exportaciones de línea no corresponden al total",
  "3274": "La sumatoria del total valor de venta - operaciones inafectas de línea no corresponden al total",
  "3275": "La sumatoria del total valor de venta - operaciones exoneradas de línea no corresponden al total",
  "3276": "La sumatoria del total valor de venta - operaciones gratuitas de línea no corresponden al total",
  "3277": "La sumatoria del total valor de venta - operaciones gravadas de línea no corresponden al total",
  "3278": "La sumatoria de valor de venta no corresponde a los importes consignados",
  "3279": "La sumatoria del Total del valor de venta más los impuestos no concuerda con la base imponible",
  "3280": "El importe total del comprobante no coincide con el valor calculado",
  "3281": "El emisor electrónico no se encuentra inscrito en el Registro de Establecimientos Autorizados (REA)",
  "3282": "Si se informa descuentos globales por anticipo debe existir 'Total de anticipos' con monto mayor a cero",
  "3283": "Si se utiliza la leyenda con código 2001, el total de operaciones exoneradas debe ser mayor a 0.00",
  "3284": "Si se utiliza la leyenda con código 2002, el total de operaciones exoneradas debe ser mayor a 0.00",
  "3285": "Si se utiliza la leyenda con código 2003, el total de operaciones exoneradas debe ser mayor a 0.00",
  "3286": "El monto total de la nota de credito debe ser menor o igual al monto de la factura",
  "3287": "Si se informa 'Total de anticipos' debe consignar los descuentos globales por anticipo con monto mayor a cero",
  "3288": "Debe consignar el Total Valor de Venta",
  "3289": "Si se utiliza la leyenda con código 2008, el total de operaciones exoneradas debe ser mayor a 0.00",
  "3290": "El valor de cargo/descuento por ítem difiere de los importes consignados.",
  "3291": "El cálculo del IGV es Incorrecto",
  "3292": "El importe total de impuestos por línea no coincide con la sumatoria de los impuestos por línea.",
  "3293": "La sumatoria del total valor de venta - IVAP de línea no corresponden al total",
  "3294": "La sumatoria de impuestos globales no corresponde al monto total de impuestos.",
  "3295": "El importe del IVAP no corresponden al determinado por la informacion consignada.",
  "3296": "La sumatoria del monto base - ISC de línea no corresponden al total",
  "3297": "La sumatoria del monto base - Otros tributos de línea no corresponden al total",
  "3298": "La sumatoria del total del importe del tributo ISC de línea no corresponden al total",
  "3299": "La sumatoria del total del importe del tributo Otros tributos de línea no corresponden al total",
  "3300": "La sumatoria consignados en descuentos globales no corresponden al total.",
  "3301": "La sumatoria consignados en cargos globales no corresponden al total",
  "3302": "La sumatoria de los IGV de operaciones gratuitas de la línea (codigo tributo 9996) no corresponden al total",
  "3303": "El monto para el redondeo del Importe Total excede el valor permitido",
  "3304": "La moneda del monto para el redondeo debe ser PEN",
  "3305": "Debe consignar el Total Precio de Venta",
  "3306": "La sumatoria del total del importe del tributo ICBPER de línea no corresponden al total",
  "3307": "El valor de cargo/descuento global difiere de los importes consignados",
  "3308": "Solo debe consignar informacion de percepciones si el tipo de operación es 2001-Operación sujeta a Percepcion",
  "3309": "Si forma de pago es Contado debe consignar un Payment Terms con indicador Percepcion",
  "3310": "Debe consignar el Monto total incluido la percepcion",
  "3311": "El Monto total incluido la percepción no cumple con el formato establecido",
  "3312": "El documento relacionado tiene monto informado de percepción",
  "3313": "Si consigna información del codigo bien sujeto a detraccion, debe informar la cuenta de BN y montos de la detraccion",
  "3314": "Si consigna cuenta de BN y montos de la detraccion, debe informar el codigo bien sujeto a detraccion",
  "3315": "Si el tipo de nota de credito es 13, el Importe total debe ser cero",
  "3316": "Si el tipo de operación es 2002, debe informar los datos de la retención de segunda categoria",
  "3317": "Si consigna infomacion de la retencion de segunda categoria, el tipo de operacion debe ser 2002",
  "3318": "Debe consignar la base de la retencion de segunda categoria",
  "3319": "La suma de las cuotas debe ser igual al Monto neto pendiente de pago.",
  "3320": "El monto neto pendiente de pago debe ser menor o igual al monto de la factura",
  "3321": "La fecha de la cuota debe ser mayor a la fecha de emisión de la factura",
  "3322": "El valor debe ser 01 que corresponde a Emisión de Percepción Excepcional",
  "3323": "Solo se permite 1 documento relacionado cuando el Indicador de emisión excepcional es '01'",
  "3324": "Solo se permite '01' para el Tipo de documento relacionado cuando el valor del Indicador de emisión excepcional es '01'",
  "3325": "Se permite emitir comprobante de percepción excepcional cuando el documento de referencia es al contado.",
  "3326": "Solo se permite referenciar siempre y cuando el comprobante de percepción excepcional en el que se referencia al documento relacionado haya sido revertido.",
  "3327": "No esta permitido referenciar el Código del régimen de percepción con el regimen del documento relacionado.",
  "3328": "La boleta de venta relacionada tiene monto informado de percepción.",
  "3329": "Se permite emitir comprobante de percepción (no excepcional) cuando documento de referencia es al crédito o no tiene indicador de forma de pago.",
  "3330": "Solo debe consignar informacion de percepciones si la forma de pago es \"Contado\"",
  "3331": "El XML no contiene el tag o no existe informacion del tipo de documento identidad del Comprador",
  "3332": "El tipo de documento de identidad del Comprador es invalido",
  "3333": "El XML no contiene el tag o no existe informacion del numero de documento de identidad del Comprador",
  "3334": "El tipo y numero de documento de identidad del Remitente no puede ser es el mismo que el Comprador",
  "3335": "El tipo y numero de documento de identidad del Destinatario no debe ser es el mismo que el Comprador",
  "3336": "Numero de RUC del Comprador no existe",
  "3337": "El valor ingresado como documento de identidad del Comprador es incorrecto",
  "3338": "Numero de DNI del Comprador no existe",
  "3339": "El XML no contiene el tag o no existe informacion del nombre o razon social del Comprador",
  "3340": "El documento relacionado al traslado de mercancias se encuentra duplicado",
  "3341": "No existe el numero de Declaracion Aduanera de Mercancias (DAM) o el Declaracion Simplificada (DS)",
  "3342": "La Constancia de Deposito ingresada ya ha sido referenciada en otra GRE emitida",
  "3343": "La Fecha de inicio del traslado debe ser mayor o igual a la Fecha de emision del documento",
  "3344": "El indicador no debe repetirse",
  "3345": "Solo corresponde ingresar hasta dos 2 documentos relacionados si uno de los tipos de documentos relacionados es \"31\", \"65\", \"66\", \"67\", \"68\" o \"69\"",
  "3346": "Solo corresponde ingresar mas de 1 documento relacionado si uno de los tipos de documentos relacionados es \"31\", \"65\", \"66\", \"67\", \"68\" o \"69\", o \"09\" (solo guia electronica)",
  "3347": "No debe consignar los datos del transportista para una operacion de Transporte Privado",
  "3348": "El Numero de RUC del Transportista no existe",
  "3349": "El RUC del Transportista no esta activo",
  "3350": "El RUC del Transportista no esta habido",
  "3351": "El RUC del Transportista no esta afecto a los tributos autorizados",
  "3352": "Si ingreso un documento relacionado tipo \"49\" (solo en caso de GRE-Remitente) o \"80\", debe existir al menos un item con Subpartida nacional",
  "3353": "Solo debe consignar un Numero de autorizacion",
  "3354": "No debe ingresar informacion de vehiculo principal",
  "3355": "El Numero de Constancia de Inscripcion Vehicular o Certificado de Habilitacion Vehicular o la TUC (fisica o electronica) no cumple con el formato establecido",
  "3356": "Solo debe consignar un Numero de autorizacion del vehiculo",
  "3357": "Debe consignar informacion del conductor principal",
  "3358": "Solo debe existir informacion de un conductor principal",
  "3359": "El numero de DNI del conductor no existe",
  "3360": "Debe consignar informacion de los nombres del conductor",
  "3361": "Debe consignar informacion de los apellidos del conductor",
  "3362": "No debe repetirse la informacion de conductores",
  "3363": "El codigo de ubigeo del punto de partida no existe",
  "3364": "El codigo de ubigeo no corresponde a la direccion del puerto/aeropuerto consignado",
  "3365": "El codigo de establecimiento anexo del punto de partida no existe o no contiene informacion",
  "3366": "El codigo de establecimiento anexo del punto de partida no esta declarado en SUNAT",
  "3367": "El codigo de establecimiento anexo del punto de partida no coincide con el ubigeo de partida consignado",
  "3368": "El codigo de ubigeo del punto de llegada no existe",
  "3369": "El codigo de establecimiento anexo del punto de llegada no existe o no contiene informacion",
  "3370": "El codigo de establecimiento anexo del punto de llegada no esta declarado en SUNAT",
  "3371": "El codigo de establecimiento anexo del punto de llegada no coincide con el ubigeo de llegada consignado",
  "3372": "Si el bien es regulado por SUNAT (existe Indicador de bien normalizado), debe indicar el Codigo de producto SUNAT",
  "3373": "El Codigo de Producto SUNAT no se encuentra en el listado",
  "3374": "No debe consignar el el Tipo de evento",
  "3375": "El Codigo de Producto GTIN no cumple con el formato establecido",
  "3376": "El XML no contiene el tag o no existe informacion del Codigo de tipo de documento relacionado",
  "3377": "La Subpartida nacional no cumple con el formato establecido",
  "3378": "La Subpartida nacional no se encuentra en el listado",
  "3379": "Debe consignar un documento relacionado igual a '49' (solo en caso de GRE-Remitente) u '80' para un traslado que comprende un bien normalizado",
  "3380": "Debe consignar el RUC del emisor del documento relacionado",
  "3381": "El RUC del emisor del documento relacionado no corresponde",
  "3382": "El Tipo de documento del emisor del documento relacionado debe ser Numero de RUC",
  "3383": "Debe consignar el Numero de documento de identidad del Remitente",
  "3384": "El Numero de documento de identidad del Remitente no cumple con el formato establecido",
  "3385": "El Numero de RUC del Remitente no existe",
  "3386": "El Numero de DNI del Remitente no existe",
  "3387": "Debe consignar el Nombre o razon social del Remitente",
  "3388": "El indicador no cumple con el formato establecido",
  "3389": "El Numero de RUC del subcontratador no existe",
  "3390": "El tipo y numero de documento de identidad del subcontratador es el mismo que del Transportista",
  "3391": "El Tipo de documento de identidad del subcontratador debe ser 6-Numero de RUC",
  "3392": "El Indicador de traslado total de la DAM o la DS solo se consigna cuando el motivo de traslado es 08-Importacion o 09 - Exportacion",
  "3393": "El tipo y numero de documento de identidad del Proveedor no debe ser el mismo que del Destinatario",
  "3394": "Si existe mas de una DAM o DS, deben coincidir los tipos y numeros de documento de identidad del importador o exportador consignados en dichos documentos",
  "3395": "Si el motivo de traslado no es 08-Importacion ni 09-Exportacion, no debe consignar el campo 'Peso bruto total de los items seleccionados'",
  "3396": "El Indicador de bien normalizado es invalido",
  "3397": "El dato ingresado como 'Peso bruto total de los items seleccionados' no cumple con el formato establecido",
  "3398": "La unidad de medida del 'Peso bruto total de los items seleccionados' debe ser kilogramos (KGM)",
  "3399": "El Tipo de documento de identidad de quien paga el servicio es invalido",
  "3400": "El Numero de documento de identidad de quien paga el servicio no cumple con el formato establecido",
  "3401": "El Numero de DNI de quien paga el servicio no existe",
  "3402": "El Numero de RUC de quien paga el servicio no existe",
  "3403": "El XML no contiene el tag o no existe informacion del numero de documento relacionado",
  "3404": "El XML no contiene el tag o no existe informacion del motivo de traslado",
  "3405": "El valor ingresado como motivo de traslado no es valido",
  "3406": "El XML no contiene el tag o no existe informacion de la fecha de inicio de traslado o fecha de entrega del bien al Transportista",
  "3407": "El valor ingresado  como fecha de inicio o fecha de entrega al Transportista no cumple con el estandar (YYYY-MM-DD)",
  "3408": "El Numero de RUC del emisor del documento relacionado no existe",
  "3409": "El Numero de RUC no cumple con el formato establecido",
  "3410": "Debe indicar el Numero de RUC al cual pertenece el Codigo de establecimiento anexo del punto de partida/llegada",
  "3411": "El Numero de RUC  asociado al punto de partida/llegada no debe ser el igual al Numero de RUC del remitente",
  "3412": "El Numero de RUC aociado al establecimiento del punto de partida/llegada no existe",
  "3413": "El valor ingresado como Punto de georreferencia no cumple con el formato establecido",
  "3414": "El Numero de RUC  asociado al punto de partida/llegada debe ser el igual al Numero de RUC del remitente",
  "3415": "Si el Motivo de traslado es 09-Exportacion, y el punto de llegada no es un puerto, el Numero de Ruc del establecimiento debe corresponder al numero de RUC del deposito temporal consignado en la DAM o DS",
  "3416": "No corresponde informar codigo de establecimiento del punto de llegada",
  "3417": "Para el motivo de traslado 05, 06 y 17 el tipo de documento de identidad del destinatario debe ser 6-RUC",
  "3418": "Si el motivo de traslado no es 08-Importacion ni 09-Exportacion, no debe consignar el campo 'Sustento de la diferencia del Peso bruto total de la carga'",
  "3419": "Si el Motivo de traslado es 08-Importacion o 09-Exportacion, debe consignar algun 'Numero de contenedor' o el 'Numero de Bultos o Pallets'",
  "3420": "Solo se pueden consignar como maximo dos contenedores",
  "3421": "El Numero de contenedor no debe repetirse",
  "3422": "Si existe Numero de contenedor debe indicarse el Numero de precinto",
  "3423": "El Numero de precinto no debe repetirse",
  "3424": "Si el Motivo de traslado es 08-Importacion, y el punto de partida no es un puerto ni aeropuerto, el Numero de Ruc del establecimiento debe corresponder al numero de RUC del deposito temporal consignado en la DAM o DS",
  "3425": "El Codigo de producto SUNAT no esta en el listado de bienes normalizados",
  "3426": "Si se trata de un bien normalizado por SUNAT, debe indicarse la Subpartida nacional",
  "3427": "Si el Motivo de traslado es 08-Importacion o 09-Exportacion y no es un Traslado Total de la DAM o DS, debe consignar la Numeracion de la DAM o DS",
  "3428": "Si el Motivo de traslado es 08-Importacion o 09-Exportacion y no es un Traslado Total de la DAM o DS, debe consignar la Numero de serie en la DAM o DS",
  "3429": "La Subpartida nacional no esta en el listado de bienes normalizados",
  "3430": "La Numeracion de la DAM o DS no se encuentra consignado como documento relacionado",
  "3431": "El Numero de la serie en la DAM o DS no cumple con el formato establecido",
  "3432": "El Numero de la serie en la DAM o DS no coincide con algun numero de serie de la DAM o DS consignada",
  "3433": "La GRE remitente no existe",
  "3434": "Si existe una GRE Remitente como documento relacionado, el tipo y numero de documento de identidad del Destinatario deben ser los mismos que del destinatario consignado en la GRE Remitente",
  "3435": "Debe consignar el detalle de los bienes a transportar",
  "3436": "El campo de fecha de emision no cumple con el formato establecido",
  "3437": "No existe informacion en el campo de hora de emision",
  "3438": "El campo de hora de emision no cumple con el formato establecido",
  "3439": "El RUC no esta afecto a los tributos autorizados",
  "3440": "No se ha ingresado el tipo Declaracion Aduanera de Mercancias (DAM) o el Declaracion Simplificada (DS)  para el motivo de traslado selecionado",
  "3441": "El numero de documento relacionado al traslado de mercancias no cumple con el formato establecido",
  "3442": "El Numero de RUC del Proveedor debe coincidir con alguno de los Numero de RUC emisor de los documentos relacionados",
  "3443": "El Numero de RUC del Destinatario no existe",
  "3444": "El Numero de DNI del Destinatario no existe",
  "3445": "El tipo de documento relacionado no corresponde para motivo de traslado seleccionado",
  "3446": "El dato ingresado como unidad de medida no corresponde al valor esperado",
  "3447": "El tipo de documento de identidad del Proveedor es invalido",
  "3448": "El tipo y numero de documento de identidad del Remitente no puede ser es el mismo que el Proveedor",
  "3449": "El XML no contiene el tag o no existe informacion del nombre o razon social del Proveedor",
  "3450": "Para la modalidad de traslado Privado no debe consignarse el 'Indicador de registro de vehiculos y conductores del transportista'",
  "3451": "Para la modalidad de traslado Publico no debe consignarse simultaneamente los indicadores 'Indicador de registro de vehiculos y conductores del transportista' e 'Indicador de traslado en vehiculos de categoria M1 o L'",
  "3452": "No debe ingresar informacion adicional de vehiculos (registros y/o autorizaciones)",
  "3453": "No debe ingresar informacion de vehiculos secundarios",
  "3454": "No debe ingresar informacion adicional de vehiculos secundarios",
  "3455": "No debe ingresar informacion del conductor principal",
  "3456": "No debe ingresar informacion del conductores secundarios",
  "3457": "El XML no contiene el atributo o no existe informacion en descripcion del motivo de traslado.",
  "3458": "El numero de item debe ser mayor a cero. Solo se permite colocar cero para consignar una anotacion opcional sobre los bienes a transportar.",
  "3459": "El dato ingresado como codigo del puerto no corresponde a un valor esperado",
  "3460": "El dato ingresado como codigo del aeropuerto no corresponde a un valor esperado",
  "3462": "La tasa del IGV debe ser la misma en todas las líneas o ítems del documento y debe corresponder con una tasa vigente.",
  "4000": "El documento ya fue presentado anteriormente.",
  "4001": "El numero de RUC del receptor no existe.",
  "4002": "Para el TaxTypeCode, esta usando un valor que no existe en el catalogo.",
  "4003": "El comprobante fue registrado previamente como rechazado.",
  "4004": "El DocumentTypeCode de las guias debe existir y tener 2 posiciones",
  "4005": "El DocumentTypeCode de las guias debe ser 09 o 31",
  "4006": "El ID de las guias debe tener informacion de la SERIE-NUMERO de guia.",
  "4007": "El XML no contiene el ID de las guias.",
  "4008": "El DocumentTypeCode de Otros documentos relacionados no cumple con el estandar.",
  "4009": "El DocumentTypeCode de Otros documentos relacionados tiene valores incorrectos.",
  "4010": "El ID de los documentos relacionados no cumplen con el estandar.",
  "4011": "El XML no contiene el tag ID de documentos relacionados.",
  "4012": "El ubigeo indicado en el comprobante no es el mismo que esta registrado para el contribuyente.",
  "4013": "El RUC  del receptor no esta activo",
  "4014": "El RUC del receptor no esta habido",
  "4015": "Si el tipo de documento del receptor no es RUC, debe tener operaciones de exportacion",
  "4016": "El total valor venta neta de oper. gravadas IGV debe ser mayor a 0.00 o debe existir oper. gravadas onerosas",
  "4017": "El total valor venta neta de oper. inafectas IGV debe ser mayor a 0.00 o debe existir oper. inafectas onerosas o de export.",
  "4018": "El total valor venta neta de oper. exoneradas IGV debe ser mayor a 0.00 o debe existir oper. exoneradas",
  "4019": "El calculo del IGV no es correcto",
  "4020": "El ISC no esta informado correctamente",
  "4021": "Si se utiliza la leyenda con codigo 2000, el importe de percepcion debe ser mayor a 0.00",
  "4022": "Si se utiliza la leyenda con código 2001, el total de operaciones exoneradas debe ser mayor a 0.00",
  "4023": "Si se utiliza la leyenda con código 2002, el total de operaciones exoneradas debe ser mayor a 0.00",
  "4024": "Si se utiliza la leyenda con código 2003, el total de operaciones exoneradas debe ser mayor a 0.00",
  "4025": "Si usa la leyenda de Transferencia o Servivicio gratuito, todos los items deben ser  no onerosos",
  "4026": "No se puede indicar Guia de remision de remitente y Guia de remision de transportista en el mismo documento",
  "4027": "El importe total no coincide con la sumatoria de los valores de venta mas los tributos mas los cargos",
  "4028": "El monto total de la nota de credito debe ser menor o igual al monto de la factura",
  "4029": "El ubigeo indicado en el comprobante no es el mismo que esta registrado para el contribuyente",
  "4030": "El ubigeo indicado en el comprobante no es el mismo que esta registrado para el contribuyente",
  "4031": "Debe indicar el nombre comercial",
  "4032": "Si el código del motivo de emisión de la Nota de Credito es 03, debe existir la descripción del item",
  "4033": "La fecha de generación de la numeración debe ser menor o igual a la fecha de generación de la comunicación",
  "4034": "El comprobante fue registrado previamente como baja",
  "4035": "El comprobante fue registrado previamente como rechazado",
  "4036": "La fecha de emisión de los rangos debe ser menor o igual a la fecha de generación del resumen",
  "4037": "El calculo del Total de IGV del Item no es correcto",
  "4038": "El resumen contiene menos series por tipo de documento que el envío anterior para la misma fecha de emisión",
  "4039": "No ha consignado información del ubigeo del domicilio fiscal",
  "4040": "Si el importe de percepcion es mayor a 0.00, debe utilizar una leyenda con codigo 2000",
  "4041": "El codigo de pais debe ser PE",
  "4042": "Para tipo de operación se está usando un valor que no existe en el catálogo. Nro. 17.",
  "4043": "Para el TransportModeCode, se está usando un valor que no existe en el catálogo Nro. 18.",
  "4044": "PrepaidAmount: Monto total anticipado no coincide con la sumatoria de los montos por documento de anticipo.",
  "4045": "No debe consignar los datos del transportista para la modalidad de transporte 02 - Transporte Privado.",
  "4046": "No debe consignar información adicional en la dirección para los locales anexos.",
  "4047": "sac:SUNATTransaction/cbc:ID debe ser igual a 10 o igual a 11 cuando ingrese información para sustentar el traslado.",
  "4048": "cac:AdditionalDocumentReference/cbc:DocumentTypeCode - Contiene un valor no valido para documentos relacionado.",
  "4049": "El numero de DNI del receptor no existe.",
  "4050": "El numero de RUC del proveedor no existe.",
  "4051": "El RUC del proveedor no esta activo.",
  "4052": "El RUC del proveedor no esta habido.",
  "4053": "Proveedor no debe ser igual al remitente o destinatario.",
  "4054": "La guía no debe contener datos del proveedor.",
  "4055": "El XML no contiene el atributo o no existe información en descripcion del motivo de traslado.",
  "4056": "El XML no contiene el tag o no existe información en el tag SplitConsignmentIndicator.",
  "4057": "GrossWeightMeasure - El dato ingresado no cumple con el formato establecido.",
  "4058": "cbc:TotalPackageQuantity - El dato ingresado no cumple con el formato establecido.",
  "4059": "Numero de bultos o pallets - información válida para importación.",
  "4060": "La guía no debe contener datos del transportista.",
  "4061": "El numero de RUC del transportista no existe.",
  "4062": "El RUC del transportista no esta activo.",
  "4063": "El RUC del transportista no esta habido.",
  "4064": "/DespatchAdvice/cac:Shipment/cac:ShipmentStage/cac:TransportMeans/cbc:RegistrationNationalityID - El dato ingresado no cumple con el formato establecido.",
  "4065": "cac:TransportMeans/cbc:TransportMeansTypeCode - El valor ingresado como tipo de unidad de transporte es incorrecta.",
  "4066": "El numero de DNI del conductor no existe.",
  "4067": "El XML no contiene el tag o no existe informacion del ubigeo del punto de llegada.",
  "4068": "Direccion de punto de llegada - El dato ingresado no cumple con el formato establecido.",
  "4069": "CityName - El dato ingresado no cumple con el formato establecido.",
  "4070": "District - El dato ingresado no cumple con el formato establecido.",
  "4071": "Numero de Contenedor - El dato ingresado no cumple con el formato establecido.",
  "4072": "Numero de contenedor - información válida para importación.",
  "4073": "TransEquipmentTypeCode - El valor ingresado como tipo de contenedor es incorrecta.",
  "4074": "Numero Precinto - El dato ingresado no cumple con el formato establecido.",
  "4075": "El XML no contiene el tag o no existe informacion del ubigeo del punto de partida.",
  "4076": "Direccion de punto de partida - El dato ingresado no cumple con el formato establecido.",
  "4077": "CityName - El dato ingresado no cumple con el formato establecido.",
  "4078": "District - El dato ingresado no cumple con el formato establecido.",
  "4079": "Código de Puerto o Aeropuerto - El dato ingresado no cumple con el formato establecido.",
  "4080": "Tipo de Puerto o Aeropuerto - El dato ingresado no cumple con el formato establecido.",
  "4081": "El XML No contiene El tag o No existe información del Numero de orden del item.",
  "4082": "Número de Orden del Ítem - El orden del ítem no cumple con el formato establecido.",
  "4083": "Cantidad - El dato ingresado no cumple con el formato establecido.",
  "4084": "Descripción del Ítem - El dato ingresado no cumple con el formato establecido.",
  "4085": "Código del Ítem - El dato ingresado no cumple con el formato establecido.",
  "4086": "El emisor y el cliente son Agentes de percepción de combustible en la fecha de emisión.",
  "4087": "El Comprobante de Pago Electrónico no está Registrado en los Sistemas de la SUNAT.",
  "4088": "El Comprobante de Pago no está autorizado en los Sistemas de la SUNAT.",
  "4089": "La operación con este cliente está excluida del sistema de percepción. Es agente de retención.",
  "4090": "La operación con este cliente está excluida del sistema de percepción. Es entidad exceptuada de la percepción.",
  "4091": "La operación con este proveedor está excluida del sistema de retención. Es agente de percepción, agente de retención o buen contribuyente.",
  "4092": "El nombre comercial del emisor no cumple con el formato establecido",
  "4093": "El codigo de ubigeo del domicilio fiscal del emisor no es válido",
  "4094": "La dirección completa y detallada del domicilio fiscal del emisor no cumple con el formato establecido",
  "4095": "La urbanización del domicilio fiscal del emisor no cumple con el formato establecido",
  "4096": "La provincia del domicilio fiscal del emisor no cumple con el formato establecido",
  "4097": "El departamento del domicilio fiscal del emisor no cumple con el formato establecido",
  "4098": "El distrito del domicilio fiscal del emisor no cumple con el formato establecido",
  "4099": "El nombre comercial del cliente no cumple con el formato establecido",
  "4100": "El ubigeo del cliente no cumple con el formato establecido o no es válido",
  "4101": "La dirección completa y detallada del domicilio fiscal del cliente no cumple con el formato establecido",
  "4102": "La urbanización del domicilio fiscal del cliente no cumple con el formato establecido",
  "4103": "La provincia del domicilio fiscal del cliente no cumple con el formato establecido",
  "4104": "El departamento del domicilio fiscal del cliente no cumple con el formato establecido",
  "4105": "El distrito del domicilio fiscal del cliente no cumple con el formato establecido",
  "4106": "El nombre comercial del proveedor no cumple con el formato establecido",
  "4107": "El ubigeo del proveedor no cumple con el formato establecido o no es válido",
  "4108": "La dirección completa y detallada del domicilio fiscal del proveedor no cumple con el formato establecido",
  "4109": "La urbanización del domicilio fiscal del proveedor no cumple con el formato establecido",
  "4110": "La provincia del domicilio fiscal del proveedor no cumple con el formato establecido",
  "4111": "El departamento del domicilio fiscal del proveedor no cumple con el formato establecido",
  "4112": "El distrito del domicilio fiscal del proveedor no cumple con el formato establecido",
  "4120": "El XML no contiene o no existe informacion en el tag de  Información que sustenta el traslado.",
  "4121": "Para el tipo de operación no se consigna el tag SUNATEmbededDespatchAdvice de Información de sustento de traslado.",
  "4122": "Factura con información que sustenta el traslado, debe registrar leyenda 2008.",
  "4123": "sac:SUNATEmbededDespatchAdvice - Para Factura Electrónica Remitente no se consigna datos en documento de referencia(cac:OrderReference).",
  "4124": "cac:Shipment - Para Factura Electrónica Remitente debe indicar sujeto que realiza el traslado de bienes (1: Vendendor o 2: Comprador).",
  "4125": "cac:Shipment - Para Factura Electrónica Remitente debe indicar modalidad de transporte para el sustento de traslado de bienes (cbc:TransportModeCode).",
  "4126": "cac:Shipment - Debe indicar fecha de inicio de traslado para el  sustento de traslado de bienes (cac:TransitPeriod/cbc:StartDate).",
  "4127": "cac:Shipment - Para Factura Electrónica Remitente debe indicar el punto de llegada para el sustento de traslado de bienes (cac:DeliveryAddrees).",
  "4128": "cac:Shipment - Para Factura Electrónica Remitente debe indicar el punto de partida para el sustento de traslado de bienes (cac:OriginAddress).",
  "4129": "Para Factura Electrónica Remitente no se consigna indicador de subcontratación (cbc:MarkAttentionIndicator)",
  "4130": "sac:SUNATEmbededDespatchAdvice - Para Factura Electrónica Remitente debe consignar datos en documento de referencia (cac:OrderReference).",
  "4131": "sac:SUNATEmbededDespatchAdvice - Para Factura Electrónica Transportista no se consigna destinatario para el sustento de traslado de bienes (cac:DeliveryCustomerParty).",
  "4132": "cac:Shipment - Para Factura Electrónica Transportista no se consigna sujeto que realiza el traslado (cbc:HandlingCode).",
  "4133": "Para Factura Electrónica Transportista no se consigna peso total de la factura para el sustento de traslado de bienes (cbc:GrossWeightMeasure).",
  "4134": "cac:Shipment - Para Factura Electrónica Transportista no se consigna modalidad de transporte para el sustento de traslado de bienes (cbc:TransportModeCode).",
  "4135": "cac:Shipment - Para Factura Electrónica Transportista no se consigna punto de llegada para el sustento de traslado de bienes (cac:DeliveryAddress).",
  "4136": "cac:Shipment - Para Factura Electrónica Transportista no se consigna punto de partida para el sustento de traslado de bienes (cac:OriginAddress).",
  "4137": "cac:OrderReference - Debe consignar número de  documento de referencia que sustenta el traslado (./cbc:ID).",
  "4138": "cac:OrderReference - Debe consignar tipo de documento de referencia que sustenta el traslado (./cbc:OrderTypeCode).",
  "4139": "cac:OrderReference - Tipo de documento de referencia que sustenta el traslado no válido (01 - Factura o 09 - Guía de Remisión).",
  "4140": "cac:OrderReference - Serie-Numero ingresado en documento de referencia que sustenta el traslado no cumple con el formato establecido.",
  "4141": "cac:OrderReference - Debe consignar RUC emisor del documento de referencia que sustenta el traslado (./cac:DocumentReference/cac:IssuerParty/cac:PartyIdentification/cbc:ID).",
  "4142": "cac:OrderReference -  RUC emisor del documento de referencia que sustenta el traslado no cumple con el formato establecido.",
  "4143": "cac:OrderReference - RUC Emisor de documento de referencia que sustenta el traslado no existe o se encuentra dado de baja.",
  "4144": "cac:OrderReference - Documento de Referencia ingresado no corresponde a un comprobante electrónico declarado y activo en SUNAT.",
  "4145": "cac:OrderReference - Documento de Referencia ingresado no corresponde comprobante autorizado por SUNAT.",
  "4146": "cac:OrderReference - Nombre o razon social del emisodr de referencia que sustenta el traslado de bienes no cumple con un formato válido.",
  "4147": "Debe consignar numero de documento de identidad del destinatario",
  "4148": "Debe consignar tipo de documento de identidad del destinatario",
  "4149": "Tipo de documento de identidad del destinatario no válido (Catálogo N° 06)",
  "4150": "Numero de documento de identidad del destinatario no cumple con un formato válido",
  "4151": "Debe consignar apellidos y nombres, denominación o razón social del destinatario",
  "4152": "Nombre o razon social del destinatario no cumple con un formato válido",
  "4153": "cbc:HandlingCode - Sujeto que realiza el traslado no es valido.",
  "4154": "cbc:GrossWeightMeasure@unitCode: El valor ingresado en la unidad de medida para el peso bruto total no es correcta (KGM).",
  "4155": "GrossWeightMeasure - El valor ingresado no cumple con el estandar.",
  "4156": "Debe ingresar la totalidad de la información requerida al transportista.",
  "4157": "No existe información en el tag datos de conductores.",
  "4158": "No existe información en el tag datos de vehículos.",
  "4159": "No es necesario consignar los datos del transportista para una operación de Transporte Privado.",
  "4160": "cac:CarrierParty: Debe consignar número de  documento de identidad del transportista.",
  "4161": "cac:CarrierParty: Debe consignar tipo de documento de identidad del transportista.",
  "4162": "cac:CarrierParty: Tipo de documento de identidad del transportista debe ser 6-RUC",
  "4163": "cac:CarrierParty: Numero de documento de identidad del transportista no cumple con un formato válido.",
  "4164": "cac:CarrierParty: Debe consignar apellidos y nombres, denominación o razón social del transportista.",
  "4165": "cac:CarrierParty: nombre o razon social del transportista no cumple con un formato válido.",
  "4166": "cac: TransportHandlingUnit: Numero de placa (cbc:ID) no coincide con el numero de placa del vehiculo prinicipal.",
  "4167": "cac:RoadTransport/cbc:LicensePlateID: Numero de placa del vehículo no cumple con el formato válido.",
  "4168": "cac: TransportHandlingUnit: Numero de placa del vehículo principal no existe o no cumple con el formato válido (cbc:ID).",
  "4169": "cac:TransportEquipment: debe consignar al menos un vehiculo secundario.",
  "4170": "cac:TransportEquipment: Numero de placa del vehículo secundario no cumple con el formato válido (cbc:ID).",
  "4171": "cac:DriverPerson: Debe consignar número de  documento de identidad del conductor (cbc:ID).",
  "4172": "cac:DriverPerson: Debe consignar tipo de documento de identidad del conductor (cbc:ID/@schemeID).",
  "4173": "cac:DriverPerson: Tipo de documento de identidad del conductor no válido (Catalogo Nro 06).",
  "4174": "cac:DriverPerson: Numero de documento de identidad del conductor no cumple con el formato válido.",
  "4175": "cac:DeliveryAddress: Debe consignar código de ubigeo de punto de llegada (cbc:ID).",
  "4176": "El dato ingresado como código de ubigeo de punto de llegada no corresponde a un valor esperado (catalogo nro 13).",
  "4177": "cac:DeliveryAddress: Debe consignar código de ubigeo válido (Catálogo N° 13).",
  "4178": "cac:DeliveryAddress: Debe consignar Dirección del punto de llegada (cbc:StreetName).",
  "4179": "cac:DeliveryAddress: Dirección completa y detallada del punto de llegada no cumple con el formato válido.",
  "4180": "cac:OriginAddress: Debe consignar código de ubigeo de punto de partida (cbc:ID).",
  "4181": "El dato ingresado como código de ubigeo de punto de partida no corresponde a un valor esperado (catalogo nro 13).",
  "4182": "cac:OriginAddress: Debe consignar código de ubigeo válido (Catálogo N° 13).",
  "4183": "cac:OriginAddress: Debe consignar Dirección detallada del punto de partida (cbc:StreetName).",
  "4184": "cac:OriginAddres: Dirección completa y detallada del punto de partida no cumple con el estandar.",
  "4185": "cac:OrderReference - Serie y numero no se encuentra registrado como baja por cambio de destinatario.",
  "4186": "cbc:Note - El campo observaciones supera la cantidad maxima especificada (250 carácteres).",
  "4187": "cac:OrderReference - El campo Tipo de documento (descripción) supera la cantidad maxima especificada (50 carácteres).",
  "4188": "El XML no contiene el atributo o no existe información del nombre o razon social del tercero relacionado.",
  "4189": "El valor ingresado como tipo de documento del nombre o razon social del tercero relacionado es incorrecto.",
  "4190": "El valor ingresado como descripcion de motivo de traslado no cumple con el estandar.",
  "4191": "Para el motivo de traslado, no se consigna información en el numero de DAM.",
  "4192": "Para el motivo de traslado, no se consigna información del manifiesto de carga.",
  "4193": "El valor ingresado como indicador de transbordo programado no cumple con el estandar.",
  "4194": "El XML no contiene el atributo o no existe información en peso bruto total de la guia.",
  "4195": "Numero de bultos o pallets es una información válida solo para importación.",
  "4196": "La fecha de recepción en SUNAT es mayor a 1 hora(s) respecto a la fecha de comprobación por OSE",
  "4197": "IssueTime - El dato ingresado  no cumple con el patrón hh:mm:ss.sssss",
  "4198": "El XML no contiene el tag o no existe información del código de local anexo del emisor",
  "4199": "El código de local anexo consignado no se encuentra declarado en el RUC",
  "4200": "Debe corresponder a algún valor válido establecido en el catálogo 13",
  "4201": "EL monto del ISC se debe detallar a nivel de línea",
  "4202": "El valor ingresado como numero de DAM no cumple con el estandar",
  "4203": "El dato ingresado en VoidReasonDescription debe contener información válida",
  "4204": "Comprobante físico no se encuentra autorizado como comprobante de contingencia",
  "4207": "El DNI debe tener 8 caracteres numéricos",
  "4208": "El dato ingresado como numero de documento de identidad del receptor no cumple con el formato establecido",
  "4209": "El dato ingresado no cumple con el formato establecido",
  "4210": "Vendedor supera el monto permitido para la emision de una liquidacion de compra",
  "4211": "El importe del campo /cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount no coincide con el valor calculado",
  "4212": "Debe consignar el Total Valor de Venta",
  "4230": "El comprobante tiene observaciones que no han sido detectados",
  "4231": "El código de Ubigeo no existe en el listado.",
  "4232": "La sumatoria de los IGV de línea no corresponden al total",
  "4233": "El dato ingresado en order de compra no cumple con el formato establecido.",
  "4234": "El código de producto no cumple con el formato establecido",
  "4235": "No existe información en el nombre del concepto.",
  "4236": "El dato ingresado como direccion completa y detallada no cumple con el formato establecido.",
  "4237": "La tasa del tributo de la línea no corresponde al valor esperado",
  "4238": "El dato ingresado como urbanización no cumple con el formato establecido",
  "4239": "El dato ingresado como provincia no cumple con el formato establecido",
  "4240": "El dato ingresado como departamento no cumple con el formato establecido",
  "4241": "El dato ingresado como distrito no cumple con el formato establecido",
  "4242": "El dato ingresado como local anexo no cumple con el formato establecido",
  "4243": "Si se utiliza la leyenda con código 2007, el total de operaciones exoneradas debe ser mayor a 0.00",
  "4244": "Si se utiliza la leyenda con código 2008, el total de operaciones exoneradas debe ser mayor a 0.00",
  "4245": "El dato ingresado como tipo de operación no corresponde a un valor esperado (catálogo nro. 51)",
  "4246": "El comprobante contiene un identificador de pago repetido en los anticipos",
  "4247": "El comprobante contiene un identificador de pago no relacionado a un documento de anticipo",
  "4248": "El comprobante contiene mas de un documento de anticipo relacionado al mismo identificador de pago.",
  "4249": "El código de motivo de traslado no existe en el listado (catalogo nro. 20)",
  "4250": "El dato ingresado como schemeAgencyName es incorrecto.",
  "4251": "El dato ingresado como atributo @listAgencyName es incorrecto.",
  "4252": "El dato ingresado como atributo @listName es incorrecto.",
  "4253": "El dato ingresado como atributo @listURI es incorrecto.",
  "4254": "El dato ingresado como atributo @listID es incorrecto.",
  "4255": "El dato ingresado como atributo @schemeName es incorrecto.",
  "4256": "El dato ingresado como atributo @schemeAgencyName es incorrecto.",
  "4257": "El dato ingresado como atributo @schemeURI es incorrecto.",
  "4258": "El dato ingresado como atributo @unitCodeListID es incorrecto.",
  "4259": "El dato ingresado como atributo @unitCodeListAgencyName es incorrecto.",
  "4260": "El dato ingresado como atributo @name es incorrecto.",
  "4261": "El dato ingresado como atributo @listSchemeURI es incorrecto.",
  "4262": "El XML no contiene el atributo o no existe lugar donde se entrega el bien para venta itinerante",
  "4263": "Si no es una venta itinerante, no corresponde consignar lugar donde se entrega el bien",
  "4264": "El XML no contiene el codigo de leyenda 2007 para el tipo de operación IVAP",
  "4265": "El XML no contiene el codigo de leyenda 2006 para tipo de operación de detracciones",
  "4266": "El XML no contiene el codigo de leyenda 2005 para el tipo de operación Venta itinerante",
  "4267": "El dato ingresado como codigo de producto GS1 no cumple con el formato establecido",
  "4268": "El dato ingresado como cargo/descuento no es valido a nivel de ítem.",
  "4269": "El dato ingresado como codigo de producto no cumple con el formato establecido.",
  "4270": "El dato ingresado como detalle del viaje no cumple con el formato establecido.",
  "4271": "El dato ingresado como descripcion del tramo no cumple con el formato establecido.",
  "4272": "El dato ingresado como valor refrencia del tramo virtual no cumple con el formato establecido.",
  "4273": "El dato ingresado como configuración vehicular no cumple con el formato establecido.",
  "4274": "El dato ingresado como tipo de carga util es incorrecto.",
  "4275": "El XML no contiene el tag o no existe información del valor de la carga en TM.",
  "4276": "El dato ingresado como valor de la carga en TM cumple con el formato establecido.",
  "4277": "El dato ingresado como unidad de medida de la carga  del vehiculo no corresponde al valor esperado.",
  "4278": "El dato ingresado como valor referencial de carga util nominal no cumple con el formato establecido.",
  "4279": "El dato ingresado como codigo de identificación de concepto tributario no es valido (catalogo nro 55)",
  "4280": "El dato ingresado como valor del concepto de la linea no cumple con el formato establecido.",
  "4281": "El dato ingresado como cantidad del concepto de la linea no cumple con el formato establecido.",
  "4282": "La fecha de ingreso al establecimiento es mayor a la fecha de salida al establecimiento.",
  "4283": "El dato ingresado como atributo @schemeID es incorrecto.",
  "4284": "El cargo/descuento consignado no es permitido para el tipo de comprobante",
  "4285": "El emisor a la fecha no se encuentra registrado ó habilitado con la condición de Agente de percepción",
  "4286": "Si ha consignado Transporte Publico, debe consignar Datos del transportista.",
  "4287": "El precio unitario de la operación que está informando difiere de los cálculos realizados en base a la información remitida",
  "4288": "El valor de venta por ítem difiere de los importes consignados.",
  "4289": "El valor de cargo/descuento por ítem difiere de los importes consignados.",
  "4290": "El cálculo del IGV es Incorrecto",
  "4291": "El dato ingresado como cargo/descuento no es valido a nivel global.",
  "4292": "Sólo hasta el 31.08.2019 se encuentra exceptuado de utilizar la versión 2.1 del estándar UBL",
  "4293": "El importe total de impuestos por línea no coincide con la sumatoria de los impuestos por línea.",
  "4294": "La base imponible a nivel de línea difiere de la información consignada en el comprobante",
  "4295": "La sumatoria del total valor de venta - Exportaciones de línea no corresponden al total",
  "4296": "La sumatoria del total valor de venta - operaciones inafectas de línea no corresponden al total",
  "4297": "La sumatoria del total valor de venta - operaciones exoneradas de línea no corresponden al total",
  "4298": "La sumatoria del total valor de venta - operaciones gratuitas de línea no corresponden al total",
  "4299": "La sumatoria del total valor de venta - operaciones gravadas de línea no corresponden al total",
  "4300": "La sumatoria del total valor de venta - IVAP de línea no corresponden al total",
  "4301": "La sumatoria de impuestos globales no corresponde al monto total de impuestos.",
  "4302": "El importe del IVAP no corresponden al determinado por la informacion consignada.",
  "4303": "La sumatoria del monto base - ISC de línea no corresponden al total",
  "4304": "La sumatoria del monto base - Otros tributos de línea no corresponden al total",
  "4305": "La sumatoria del total del importe del tributo ISC de línea no corresponden al total",
  "4306": "La sumatoria del total del importe del tributo Otros tributos de línea no corresponden al total",
  "4307": "La sumatoria consignados en descuentos globales no corresponden al total.",
  "4308": "La sumatoria consignados en cargos globales no corresponden al total",
  "4309": "La sumatoria de valor de venta no corresponde a los importes consignados",
  "4310": "La sumatoria del Total del valor de venta más los impuestos no concuerda con la base imponible",
  "4311": "La sumatoria de los IGV de operaciones gratuitas de la línea (codigo tributo 9996) no corresponden al total",
  "4312": "El importe total del comprobante no coincide con el valor calculado",
  "4313": "El dato ingresado como unidad de medida de los dias de permanencia no corresponde al valor esperado.",
  "4314": "El monto para el redondeo del Importe Total excede el valor permitido",
  "4315": "La moneda debe ser la misma en todo el documento. Salvo las percepciones que sólo son en moneda nacional.",
  "4316": "La moneda del monto para el redondeo debe ser PEN",
  "4317": "Debe consignar el Total Precio de Venta",
  "4318": "El dato ingresado en el campo cac:TaxSubtotal/cbc:TaxAmount del ítem no coincide con el valor calculado",
  "4320": "El dato ingresado como unidad de medida no corresponde al valor esperado",
  "4321": "La sumatoria del total del importe del tributo ICBPER de línea no corresponden al total",
  "4322": "El valor de cargo/descuento global difiere de los importes consignados",
  "4323": "El dato ingresado como tipo de usuario no corresponde al valor esperado",
  "4324": "El dato ingresado como tipo de tarifa contratada no corresponde al valor esperado",
  "4326": "Para Factura Electrónica Transportista debe indicar el número de constancia de inscripcion del vehiculo o certificado de habilitación vehicular",
  "4327": "Para Factura Electrónica Transportista debe consignar el indicador de subcontratacion",
  "4328": "El valor del indicador de subcontratacion no corresponde al valor esperado",
  "4329": "Para factura electrónica remitente debe consignar el motivo de traslado",
  "4330": "Para factura electrónica tranportista debe indicar la GRE remitente o FE remitente",
  "4331": "Debe consignar obligatoriamente Codigo de producto SUNAT o Codigo de producto GTIN",
  "4332": "El Código producto de SUNAT no es válido",
  "4333": "Si utiliza el estandar GS1 debe especificar el tipo de estructura GTIN",
  "4334": "El código de producto GS1 no cumple el estandar",
  "4335": "El tipo de estructura GS1 no tiene un valor permitido",
  "4336": "A partir del 1 de julio de 2019 se encuentra obligado a emitir a traves de SEE-OSE y/o SEE-SOL",
  "4337": "El Codigo de producto SUNAT debe especificarse como minimo al tercer nivel jerarquico (a nivel de clase del codigo UNSPSC)",
  "4338": "RegistrationName - El nombre o razon social del emisor no cumple con el estandar",
  "4339": "El codigo de ubigeo del domicilio del vendedor no es válido",
  "4340": "La dirección completa y detallada del domicilio del vendedor no cumple con el formato establecido",
  "4341": "La urbanización del domicilio del vendedor no cumple con el formato establecido",
  "4342": "La provincia del domicilio del vendedor no cumple con el formato establecido",
  "4343": "El departamento del domicilio del vendedor no cumple con el formato establecido",
  "4344": "El distrito del domicilio del vendedor no cumple con el formato establecido",
  "4345": "El monto base global de la retencion de renta no coincide con el valor calculado",
  "4346": "El importe de la retencion de renta no coincide con el valor calculado",
  "4347": "El comprobante fue enviado fuera del plazo permitido.",
  "4348": "El importe del campo /cac:InvoiceLine/cac:ItemPriceExtension/cbc:Amount no coincide con el valor calculado",
  "4349": "El importe del campo /cac:InvoiceLine/cac:SubInvoiceLine/cac:ItemPriceExtension/cbc:Amount no coincide con el valor calculado",
  "4350": "El nombre o razon social registrado no cumple con el estandar",
  "4351": "El Numero de RUC no esta activo",
  "4352": "El Numero de RUC es no habido",
  "4353": "Si 'Tipo de documento de identidad' es '6', el formato del Tag UBL es diferente a numérico de 11 dígitos",
  "4354": "El importe del campo /cac:InvoiceLine/cbc:LineExtensionAmount no coincide con el valor calculado",
  "4355": "El importe del campo /cac:InvoiceLine/cac:SubInvoiceLine/cbc:LineExtensionAmount no coincide con el valor calculado",
  "4356": "El importe del campo /cac:SubInvoiceLine/cac:TaxTotal/cbc:TaxAmount no coincide con el valor calculado",
  "4357": "El dato ingresado como cargo/descuento no es valido a nivel de /cac:SubInvoiceLine",
  "4358": "El valor de cargo/descuento a nivel de /cac:SubInvoiceLine difiere de los importes consignados.",
  "4359": "El monto de ISC de la línea no coincide con el valor calculado",
  "4360": "El monto de IGV de la línea no coincide con el valor calculado",
  "4361": "El codigo de leyenda no existe",
  "4362": "El codigo de leyenda no debe repetirse en el comprobante",
  "4363": "El importe del campo /cac:LegalMonetaryTotal/cbc:PayableAmount no coincide con el valor calculado",
  "4364": "Para entidades emisoras locales debe informar el detalle de las comisiones y cargos",
  "4365": "El monto de IGV a nivel de /cac:SubInvoiceLine no coincide con el valor calculado",
  "4366": "El XML no contiene tag o no existe información de la fecha del concepto por linea",
  "4367": "El tipo de nota de crédito 04, 05 y 08 no debería estar vinculado a una boleta",
  "4368": "El tipo de moneda de la nota debe ser el mismo que el declarado en el documento que modifica",
  "4369": "El dato ingresado como numero de autorizacion del Remitente no cumple con el formato establecido",
  "4370": "El XML no contiene el tag o no existe informacion del nombre o razon social de quien paga el servicio",
  "4371": "El XML no contiene el tag o no existe informacion de la descripcion del tipo de documento relacionado",
  "4372": "La descripcion del tipo de documento relacionado no cumple con el estandar",
  "4373": "El RUC del Destinatario no esta activo",
  "4374": "El RUC del destinatario no esta habido",
  "4375": "Corresponde ingresar informacion del Proveedor",
  "4376": "Solo debe consignar informacion de hasta dos conductores secundarios",
  "4377": "Para el motivo de traslado no corresponde consignar informacion del Comprador",
  "4378": "Para el motivo de traslado debe existir informacion del Comprador",
  "4379": "El RUC del Comprador no esta activo",
  "4380": "El RUC del Comprador no esta habido",
  "4381": "El nombre o razon social del Comprador no cumple con el formato establecido",
  "4382": "El numero de comprobante consignado como documento relacionado no existe",
  "4383": "Si el motivo de traslado es Importacion o Exportacion y no se trata de un traslado total de la DAM o DS, debe indicar el Peso bruto total de los items seleccionados",
  "4384": "El valor ingresado como numero de bultos o pallets no cumple con el estandar",
  "4385": "No ha ingresado el campo de “Fecha de entrega de bienes al transportista” o esta vacio",
  "4386": "La Fecha de entrega de bienes al transportista debe ser mayor o igual a la Fecha de emision del documento",
  "4387": "Si el motivo de traslado es Importacion o Exportacion y no se trata de un traslado total de la DAM o DS, debe indicar el Sustento de la diferencia del Peso bruto total de la carga",
  "4388": "Debe consignar el Indicador de pagador de flete",
  "4389": "Solo corresponde consignar hasta dos vehiculos secundarios",
  "4390": "Debe consignar la Constancia de Deposito el tratarse de un bien normalizado",
  "4391": "El Numero de Registro MTC del transportista no existe o no contiene informacion",
  "4392": "El Numero de Registro MTC del transportista no cumple con el formato establecido",
  "4393": "El Numero de Registro MTC del transportista no se encuentra en las bases consultadas",
  "4394": "Debe indicar la entidad autorizadora de la autorizacion especial",
  "4395": "El Codigo de entidad autorizadora es invalido",
  "4396": "El Numero de autorizacion del transportista no cumple con el formato establecido",
  "4397": "SI existe el Codigo de entidad autorizadora, debe consignar el Numero de autorizacion especial de la empresa",
  "4398": "El Numero de placa no se encuentra en las bases consultadas",
  "4399": "No ha consignado el Numero de Constancia de Inscripcion Vehicular o Certificado de Habilitacion Vehicular o la TUC (fisica o electronica)",
  "4400": "El Numero de Constancia de Inscripcion Vehicular o Certificado de Habilitacion Vehicular o la TUC (fisica o electronica) no se encuentra en las bases consultadas",
  "4401": "El XML no contiene el tag o no existe informacion del tipo de documento de identidad de quien paga el servicio",
  "4402": "El XML no contiene el atributo o no existe informacion del numero de documento de identidad de quien paga el servicio",
  "4403": "Debe indicar la entidad autorizadora del vehiculo",
  "4404": "La SUNAT no cuenta con la informacion en los ultimos 15 dias de la Constancia de Deposito en sus sistemas",
  "4405": "Si existe el Codigo de entidad autorizadora, debe consignar el Numero de autorizacion especial del vehiculo",
  "4406": "El Numero de autorizacion del vehiculo no cumple con el formato establecido",
  "4407": "El Codigo de entidad autorizadora del vehiculo no corresponde a un valor esperado",
  "4408": "Si consigna datos del vehiculo secundario, debe existir datos del vehiculo principal",
  "4409": "Los nombres y/o apellidos del conductor no cumplen con el formato establecido",
  "4410": "Si existe descripcion del documento relacionado debe existir informacion del codigo y numero del documento relacionado",
  "4411": "Si consigna datos del conductor secundario, debe existir datos del conductor principal",
  "4412": "El Numero de licencia de conducir no se encuentra en las bases consultadas",
  "4413": "SI ingresa el Tipo de locacion debe consignar el Codigo de puerto/aeropuerto",
  "4414": "El dato ingresado como Codigo del puerto no corresponde a un valor esperado",
  "4415": "SI ingresa el Codigo del puerto/aeropuerto debe consignar el Tipo de locacion",
  "4416": "El dato ingresado como Tipo de locacion no corresponde a un valor esperado",
  "4417": "El dato ingresado como Codigo del aeropuerto no corresponde a un valor esperado",
  "4418": "El Nombre del Puerto o Aeropuerto no existe o no contiene informacion",
  "4419": "La Subpartida nacional para bienes regulados por SUNAT (Indicador de bien normalizado) no contiene informacion o no existe",
  "4420": "El Numero de RUC del Remitente no esta activo",
  "4421": "El Numero de RUC del Remitente no esta habido",
  "4422": "El nombre o razon social del Remitente no cumple con el formato establecido",
  "4423": "El nombre o razon social de quien paga el servicio no cumple con el formato establecido",
  "4424": "El XML no contiene el tag o no existe informacion del numero de documento de identidad del subcontratador",
  "4425": "El XML no contiene el atributo o no existe informacion del tipo de documento de identidad del subcontratador",
  "4426": "El XML no contiene el atributo o no existe informacion del nombre o razon social del subcontratador",
  "4427": "El nombre/razon social del subcontratador no cumple con el formato establecido",
  "4428": "El Sustento de la diferencia del Peso bruto total de la carga no cumple con el formato establecido",
  "4429": "La anotacion opcional sobre los bienes a transportar no existe o no contiene informacion",
  "4430": "La anotacion opcional sobre los bienes a transportar no cumple con el formato establecido",
  "4431": "Si en caso el motivo de traslado de la guia remision remitente es Traslado emisor itinerante CP no corresponde informar codigo de ubigeo del punto de llegada",
  "4432": "La Constancia de Deposito ingresada ya ha sido referenciada en otra GRE emitida por el mismo remitente",
  "4433": "Si el motivo de traslado de la guia remitente es 18 - Traslado emisor itinerante CP no corresponde informar la direccion detalla del punto de llegada",
  "4434": "No corresponde consignar el detalle de los bienes a transportar",
  "4435": "El tipo y numero de documento de identidad del destinatario es diferente al del importador que figura en la(s) DAM / DS",
  "4436": "Ya se ha emitido una GRE por esta DAM o DS. La generacion de la GRE sera bajo su responsabilidad pues no se cuenta con saldo suficiente para este tipo de traslado",
  "4437": "El control de los saldos pendientes de traslado es responsabilidad del contribuyente",
  "4438": "La tasa del IGV debe ser la misma en todas las líneas o ítems del documento y debe corresponder con una tasa vigente.",
  "4439": "El emisor no se encuentra en el Padrón de IGV 10%.",
  "4440": "Si existe mas de un campo 'Descripcion de motivo de traslado' solo se considera valido el primer campo.",
  "4441": "El comprobante que se realizo el anticipo no se encuentra autorizado.",
  "0001": "RUC del comprobante no enviado o es vacío",
  "0002": "Solo se permite dato numérico de 11 dígitos para el RUC del comprobante",
  "0003": "El número de RUC no está inscrito en los registros de la SUNAT",
  "0004": "Tipo de comprobante no enviado o es vacío",
  "0005": "Código de comprobante no permitido o no valido",
  "0006": "Serie del comprobante no enviado o es vacío",
  "0007": "Solo se permite dato alfanumérico de 4 caracteres para la serie del comprobante",
  "0008": "Serie del comprobante no permitido o no valido",
  "0009": "Número de comprobante no enviado o es vacío",
  "0010": "Solo se permite dato numérico de 1 hasta 8 dígitos y mayor a cero para el Número de comprobante",
  "0011": "Comprobante no encontrado o no existe",
  "0012": "El proveedor RUC_OSE no esta autorizado a consultar comprobantes del contribuyente RUC_CONTRIBUYENTE",
  "0013": "El ticket no existe",
  "0014": "No se pudo obtener la constancia",
  "0015": "No se permiten solicitudes de la constancia para envios de comprobantes realizados antes del 01/05/2020",
  "0100": "El sistema no puede responder su solicitud. Intente nuevamente o comuníquese con su Administrador",
  "0101": "El encabezado de seguridad es incorrecto",
  "0102": "Usuario o contrasena incorrectos",
  "0103": "El Usuario ingresado no existe",
  "0104": "La Clave ingresada es incorrecta",
  "0105": "El Usuario no está activo",
  "0106": "El Usuario no es válido",
  "0109": "El sistema no puede responder su solicitud. (El servicio de autenticación no está disponible)",
  "0110": "No se pudo obtener la informacion del tipo de usuario",
  "0111": "No tiene el perfil para enviar comprobantes electronicos",
  "0112": "El usuario debe ser secundario",
  "0113": "El usuario no esta afiliado a Factura Electronica",
  "0125": "No se pudo obtener la constancia",
  "0126": "El ticket no le pertenece al usuario",
  "0127": "El ticket no existe",
  "0130": "El sistema no puede responder su solicitud. (No se pudo obtener el ticket de proceso)",
  "0131": "El sistema no puede responder su solicitud. (No se pudo grabar el archivo en el directorio)",
  "0132": "El sistema no puede responder su solicitud. (No se pudo grabar escribir en el archivo zip)",
  "0133": "El sistema no puede responder su solicitud. (No se pudo grabar la entrada del log)",
  "0134": "El sistema no puede responder su solicitud. (No se pudo grabar en el storage)",
  "0135": "El sistema no puede responder su solicitud. (No se pudo encolar el pedido)",
  "0136": "El sistema no puede responder su solicitud. (No se pudo recibir una respuesta del batch)",
  "0137": "El sistema no puede responder su solicitud. (Se obtuvo una respuesta nula)",
  "0138": "El sistema no puede responder su solicitud. (Error en Base de Datos)",
  "0140": "Existe un Documento igual en Proceso.",
  "0151": "El nombre del archivo ZIP es incorrecto",
  "0152": "No se puede enviar por este método un archivo de resumen",
  "0153": "No se puede enviar por este método un archivo por lotes",
  "0154": "El RUC del archivo no corresponde al RUC del usuario o el proveedor no esta autorizado a enviar comprobantes del contribuyente",
  "0155": "El archivo ZIP esta vacio",
  "0156": "El archivo ZIP esta corrupto",
  "0157": "El archivo ZIP no contiene comprobantes",
  "0158": "El archivo ZIP contiene demasiados comprobantes para este tipo de envío",
  "0159": "El nombre del archivo XML es incorrecto",
  "0160": "El archivo XML esta vacio",
  "0161": "El nombre del archivo XML no coincide con el nombre del archivo ZIP",
  "0200": "No se pudo procesar su solicitud. (Ocurrio un error en el batch)",
  "0201": "No se pudo procesar su solicitud. (Llego un requerimiento nulo al batch)",
  "0202": "No se pudo procesar su solicitud. (No llego información del archivo ZIP)",
  "0203": "No se pudo procesar su solicitud. (No se encontro archivos en la informacion del archivo ZIP)",
  "0204": "No se pudo procesar su solicitud. (Este tipo de requerimiento solo acepta 1 archivo)",
  "0250": "No se pudo procesar su solicitud. (Ocurrio un error desconocido al hacer unzip)",
  "0251": "No se pudo procesar su solicitud. (No se pudo crear un directorio para el unzip)",
  "0252": "No se pudo procesar su solicitud. (No se encontro archivos dentro del zip)",
  "0253": "No se pudo procesar su solicitud. (No se pudo comprimir la constancia)",
  "0254": "No se pudo procesar su solicitud. (No se pudo enviar el mensaje)",
  "0300": "No se encontró la raíz documento xml",
  "0301": "Elemento raiz del xml no esta definido",
  "0302": "Codigo del tipo de comprobante no registrado",
  "0303": "No existe el directorio de schemas",
  "0304": "No existe el archivo de schema",
  "0305": "El sistema no puede procesar el archivo xml",
  "0306": "No se puede leer (parsear) el archivo XML",
  "0307": "No se pudo recuperar la constancia",
  "0400": "No tiene permiso para enviar casos de pruebas",
  "0401": "El caso de prueba no existe",
  "0402": "La numeracion o nombre del documento ya ha sido enviado anteriormente",
  "0403": "El documento afectado por la nota no existe",
  "0404": "El documento afectado por la nota se encuentra rechazado"
};
