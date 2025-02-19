import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    outDir: "dist",
    sourcemap: true,
    clean: true,
    format: ["cjs", "esm"],
    dts: true,
    splitting: false,
    bundle: true,
    minify: false,
    external: [
        "axios",
        "google-auth-library",
        "open",
        "@okto_web3/core-js-sdk",
        "ethers",
        "viem"
    ],
    platform: "node",
    target: "node23",
    esbuildOptions(options) {
        options.bundle = true;
        options.platform = "node";
        options.target = "node23";
    },
});
