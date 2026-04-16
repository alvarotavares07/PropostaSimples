import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

function normalizeBasePath(basePath?: string) {
  if (!basePath || basePath === "/") return "/";
  const trimmed = basePath.trim().replace(/^\/+|\/+$/g, "");
  return trimmed ? `/${trimmed}/` : "/";
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Default to root so local preview and CI E2E can exercise deep SPA routes.
  // Set VITE_BASE_PATH=/PropostaSimples/ during the GitHub Pages build.
  base: mode === "production" ? normalizeBasePath(process.env.VITE_BASE_PATH) : "/",

  server: {
    host: "localhost",
    port: 5173,
    strictPort: false,
  },

  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    outDir: "dist",
    sourcemap: false, // disable in prod — no leak of source structure
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          pdf: ["@react-pdf/renderer"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-select", "@radix-ui/react-tabs"],
        },
      },
    },
  },

  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/tests/setup.ts"],
    exclude: ["e2e/**", "node_modules/**", "dist/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "src/tests/", "**/*.d.ts", "**/*.config.*", "src/components/ui/"],
    },
  },
}));
