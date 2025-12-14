import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/products": "http://localhost:5000",
      "/cart": "http://localhost:5000",
      "/checkout": "http://localhost:5000"
    }
  }
});
