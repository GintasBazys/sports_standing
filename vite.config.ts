import react from "@vitejs/plugin-react"
import * as path from "node:path"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    open: true
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  }
})
