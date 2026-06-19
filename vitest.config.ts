import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    include: ["test/**/*.test.ts"],
    deps: { inline: ["@/src/**"] },
    alias: {
      "@/src/domain": "/src/domain",
      "@/src/infra": "/src/infra",
    },
  },
});
