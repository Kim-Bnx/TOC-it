import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `TOCit.js`,
        chunkFileNames: `TOCit.js`,
        assetFileNames: `TOCit.[ext]`,
      },
    },
  },
});
