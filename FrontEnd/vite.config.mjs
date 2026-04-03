import { readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));
const iframeDirectory = resolve(__dirname, "Pages", "Iframes");
const iframeInputs = Object.fromEntries(
  readdirSync(iframeDirectory)
    .filter((file) => file.endsWith(".html"))
    .map((file) => [
      `Pages/Iframes/${file.replace(/\.html$/, "")}`,
      resolve(iframeDirectory, file),
    ]),
);

export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      input: {
        landPage: resolve(__dirname, "landPage.html"),
        streetBite: resolve(__dirname, "Pages", "streetBite.html"),
        ...iframeInputs,
      },
    },
  },
});
