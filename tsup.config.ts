import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/nuban.ts",
    "src/fallback.ts"
  ],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: false,
  target: "es2020",
  loader: {
    ".png": "file",
    ".svg": "file"
  }
});
