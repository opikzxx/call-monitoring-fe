import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    server: {
      deps: {
        inline: ["zod"],
      },
    },
    env: {
      NEXTAUTH_SECRET: "test-secret",
      NEXTAUTH_URL: "http://localhost:3000",
      NEXT_PUBLIC_API_URL: "http://localhost:8080",
      NODE_ENV: "test",
    },
  },
});
