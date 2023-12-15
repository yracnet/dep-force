import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/main.ts"],
    format: ["esm"],
    outDir: "bin",
    external: ["path", "fs"],
    dts: {
      resolve: true,
    },
    clean: true,
    sourcemap: false,
    minify: true,
  },
]);
