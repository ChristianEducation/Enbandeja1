import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@enbandeja/database": path.resolve(__dirname, "../../packages/database/src"),
      "@enbandeja/shared": path.resolve(__dirname, "../../packages/shared/src"),
    },
  },
})
