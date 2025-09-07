import { defineConfig } from "vite";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    return {
        base: "./",
        build: {
            sourcemap: mode !== "prod",
            emptyOutDir: true,
            outDir: "build",
        },
        server: {
            host: true,
            port: 8010,
            open: "/example/index.html",
        },
        resolve: {
            alias: {
                "@": resolve(__dirname, "src"),
                "./runtimeConfig": "./runtimeConfig.browser",
            },
        },
        define: {},
    };
});
