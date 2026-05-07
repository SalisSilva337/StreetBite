import { readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pageDirectory = resolve(__dirname, "Pages");
const pageInputs = Object.fromEntries(
  readdirSync(pageDirectory)
    .filter((file) => file.endsWith(".html") && file !== "streetBite.html")
    .map((file) => [
      `Pages/${file.replace(/\.html$/, "")}`,
      resolve(pageDirectory, file),
    ]),
);

export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      input: {
        landingPage: resolve(__dirname, "Pages", "landingPage.html"),
        customerAuth: resolve(__dirname, "Pages", "customer-auth.html"),
        streetBite: resolve(__dirname, "Pages", "streetBite.html"),
        ...pageInputs,
      },
    },
  },
});
