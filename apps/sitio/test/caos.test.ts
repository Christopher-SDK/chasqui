import { describe, expect, test } from 'vitest';
import {
  PERFILES,
  azar as azarReal,
  decidir as decidirReal,
  milisegundos as msReal,
} from '@chasqui/chaos-engine';
import { azar, decidir, milisegundos } from '../src/caos-navegador.js';

// El huaico del sitio dice «la misma semilla, la misma secuencia que el motor real»: esto lo prueba.
describe('caos en el navegador = motor real', () => {
  test('azar coincide para 2 000 semillas y claves', async () => {
    for (let i = 0; i < 2000; i++) {
      const semilla = `s${String(i * 7919)}`,
        clave = `ped-${String(i)}#1`;
      expect(await azar(semilla, String(i % 4), clave)).toBe(
        azarReal(semilla, String(i % 4), clave),
      );
    }
  });

  test('decidir y la latencia coinciden en los 4 perfiles, 40 envíos y 25 semillas', async () => {
    for (const p of PERFILES)
      for (let s = 0; s < 25; s++) {
        const semilla = `semilla-${String(s)}`;
        for (let n = 1; n <= 40; n++) {
          const pet = {
            servicio: 'sunat-sim',
            ruta: '/api/v1/comprobantes',
            clave: `ped-${String(n)}#1`,
          };
          const real = decidirReal({ perfil: p.nombre, reglas: p.reglas, semilla }, pet);
          expect(await decidir(p.reglas, semilla, pet)).toEqual(real);
          for (const f of real)
            if (f.tipo === 'latencia')
              expect(await milisegundos(f.ms, semilla, pet.clave)).toBe(
                msReal(f.ms, semilla, pet.clave),
              );
        }
      }
  });
});
