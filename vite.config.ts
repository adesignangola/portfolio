import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR está desativado no AI Studio através da variável de ambiente DISABLE_HMR.
      // Não modificar—monitoramento de arquivos está desativado para evitar cintilação durante edições do agente.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
