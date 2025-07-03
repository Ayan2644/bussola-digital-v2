// vite.config.js (Código completo e CORRIGIDO)

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    // Adicionamos esta linha para carregar nossas configurações de teste
    setupFiles: './src/tests/setup.js',
  },
})