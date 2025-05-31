import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/james-mcgonigal-resume/', // <-- ensure this matches your homepage path
  plugins: [react()],
});