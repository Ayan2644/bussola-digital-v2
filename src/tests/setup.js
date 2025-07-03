// Local de Instalação: src/tests/setup.js
// CÓDIGO COMPLETO E CORRIGIDO

import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Executa uma limpeza após cada teste (ex: desmonta componentes)
afterEach(() => {
  cleanup();
});