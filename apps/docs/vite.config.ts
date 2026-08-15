import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/* `@demo` comes first: a string alias matches by prefix, and `@` would swallow it */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@demo': fileURLToPath(new URL('../../packages/demo/src', import.meta.url)),
      '@': fileURLToPath(new URL('../../packages/registry/src', import.meta.url)),
    },
  },
})
