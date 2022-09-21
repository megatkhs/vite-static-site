import fs from 'node:fs'
import { compileFile } from 'pug'
import type Pug from 'pug'
import type { Plugin } from 'vite'

type BuildSettings = {
  options: Pug.Options | undefined
  locals: Pug.LocalsObject | undefined
}

export const vitePluginPugBuild = ({
  options,
  locals,
}: BuildSettings): Plugin => {
  const pathMap = new Map<string, string>()

  return {
    name: 'vite-plugin-pug-build',
    enforce: 'pre',
    apply: 'build',
    resolveId(source) {
      if (source.endsWith('.pug')) {
        const path = source.replace(/\.pug$/, '.html')
        pathMap.set(path, source)
        return path
      }

      return null
    },
    load(id) {
      if (id.endsWith('.html')) {
        if (pathMap.has(id)) {
          const compiledTemplate = compileFile(pathMap.get(id)!, options)
          const html = compiledTemplate(locals)
          return html
        }
        return fs.readFileSync(id, 'utf-8')
      }
      return null
    },
  }
}
