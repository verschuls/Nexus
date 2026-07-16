import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    host: true, // bind 0.0.0.0 so IPv4 127.0.0.1 + LAN reach it, not just IPv6 ::1
    port: 5173,
    strictPort: true, // fail loudly instead of silently jumping to 5174
  },
})
