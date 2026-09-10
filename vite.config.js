import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/', // served from custom domain root (jamesmcgonigal.com), not a github.io subpath
  plugins: [react()],
});