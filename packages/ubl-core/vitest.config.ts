import { defineProject, mergeConfig } from 'vitest/config';
import base from '../../vitest.shared.js';

// Las pruebas contra el oráculo oficial lanzan Python con cientos de casos: en una CI sin caché
// tardan varios segundos.
export default mergeConfig(
  base,
  defineProject({ test: { name: 'ubl-core', testTimeout: 60_000 } }),
);
