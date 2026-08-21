import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

/* the alias the components ship with. the source needs no rewrite. */
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@demo': fileURLToPath(new URL('../../packages/demo/src', import.meta.url)),
      '@': fileURLToPath(new URL('../../packages/registry/src', import.meta.url)),
    },
  },
})
