import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import ViteRestart from 'vite-plugin-restart'
import { vitePluginStaticSiteFramework } from './plugins'

export default defineConfig({
  // ...
  root: 'src',
  build: {
    outDir: resolve(__dirname, "dist"),
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src", "index.pug"),
      },
    },
  },
  plugins: [
    Inspect(),
    vitePluginStaticSiteFramework({
      buildOptions: {
        pretty: true
      }
    }),
  ]
  // ...
})