// vite.config.js - SIMPLIFIED
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'

export default defineConfig({
  plugins: [react(), nodePolyfills()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@reown/appkit/adapters': path.resolve('./node_modules/@reown/appkit/dist/index.js')
    },
  },
  // REMOVE the optimizeDeps section entirely for now
  server: {
    allowedHosts: ['.herokuapp.com', 'localhost', "d0e7-197-211-59-77.ngrok-free.app"],
  }
})