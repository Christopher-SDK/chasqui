import { defineProject, mergeConfig } from 'vitest/config';
import base from '../../vitest.shared.js';

export default mergeConfig(base, defineProject({ test: { name: 'test-kit' } }));
