# WSDL de billService

Contrato SOAP del servicio de recepción de comprobantes (operaciones `sendBill`, `sendSummary`,
`sendPack` y `getStatus`), tomado de [Greenter](https://github.com/thegreenter/greenter) (MIT),
`packages/ws/src/Resources/wsdl/`. Se cambió la dirección del servicio por `{{BASE}}`, que
`sunat-sim` reemplaza por su propia URL al servir `GET /billService?wsdl`.
