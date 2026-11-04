#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { construirServidorMcp } from './servidor.js';

/**
 * Servidor MCP por stdio. URLs de los simuladores por entorno (por defecto, localhost:7100-7400):
 * CHASQUI_SUNAT_URL, CHASQUI_PAGOS_URL, CHASQUI_IDENTIDAD_URL, CHASQUI_CAOS_URL.
 * stdout es el canal MCP: nada de console.log aquí.
 */
const url = (k: string) => process.env[`CHASQUI_${k}_URL`];
const opciones = Object.fromEntries(
  Object.entries({
    sunat: url('SUNAT'),
    pagos: url('PAGOS'),
    identidad: url('IDENTIDAD'),
    caos: url('CAOS'),
  }).filter(([, v]) => v),
);
await construirServidorMcp(opciones).connect(new StdioServerTransport());
