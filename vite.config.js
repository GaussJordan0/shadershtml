import glsl from 'vite-plugin-glsl';
import { defineConfig } from 'vite';

export default defineConfig({
    server: {
      host: true,
      open: true
    },
  plugins: [glsl()]
});

