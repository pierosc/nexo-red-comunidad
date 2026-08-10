import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "nexo-red-comunidad";

export default defineConfig({
  root: "github-pages",
  base: `/${repositoryName}/`,
  envDir: "..",
  publicDir: "../public",
  plugins: [react()],
  build: {
    emptyOutDir: true,
    outDir: "../dist-pages",
  },
});
