import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // shadcn instala los componentes contra "@/..."; sin este alias no
    // resuelven ni en el build ni en el editor.
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
