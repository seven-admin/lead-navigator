import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: true,
    port: 8080
  },
  preview: {
    host: "0.0.0.0",  // <- MUDANÇA AQUI
    port: 3000,
    allowedHosts: ["leads.sevengroup360sys.com.br"]
  },
  plugins: [
    react(),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
}));
