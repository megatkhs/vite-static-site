import { readFileSync } from 'node:fs'
import { compileFile } from 'pug'
import { Plugin, createFilter, ViteDevServer, FilterPattern } from 'vite'
import { vitePluginPugBuild } from './build.js'
import { vitePluginPugServe } from './serve.js'
import type Pug from 'pug'

type PluginSettings = {
  buildOptions?: Pug.Options
  buildLocals?: Pug.LocalsObject
  serveOptions?: Pug.Options
  serveLocals?: Pug.LocalsObject
  reload?: boolean
}

const defaultSettings: PluginSettings = {}

export const vitePluginStaticSiteFramework = (
  userSettings?: PluginSettings
) => {
  const settings: PluginSettings = {
    ...defaultSettings,
    ...userSettings,
  }

  const { buildOptions, buildLocals, serveOptions, serveLocals, reload } =
    settings

  return [
    vitePluginPugBuild({
      options: buildOptions,
      locals: buildLocals,
    }),
    vitePluginPugServe({
      options: serveOptions,
      locals: serveLocals,
      reload,
    }),
  ]
}

export type Options = {
  isProduction?: boolean

  /** pugのオプション */
  pug?: {
    options?: Pug.Options
    locals?: Pug.LocalsObject
  }
  /** pagesとする範囲 */
  pages?:
    | {
        include: FilterPattern
        exclude: FilterPattern
      }
    | FilterPattern
}

export type ResolvedOptions = Options & {
  root: string
  devServer?: ViteDevServer
  isProduction: boolean
}

/** pugのオプション */
const pugDefaultOptions: Pug.Options = {
  pretty: true,
}

export const staticSitePlugin = (rawOptions: Options = {}): Plugin => {
  const { pug = {}, pages = 'src/pages/**.pug' } = rawOptions

  const filterArgs =
    pages &&
    typeof pages === 'object' &&
    !(pages instanceof Array) &&
    !(pages instanceof RegExp)
      ? [pages.include, pages.exclude]
      : [pages]

  const filter = createFilter(...filterArgs)
  /** 動作中のコマンド */
  let command: 'build' | 'serve'

  /** ビルド時のパス解決用 */
  const buildPathMap = new Map<string, string>()

  let options: ResolvedOptions = {
    isProduction: process.env.NODE_ENV === 'production',
    ...rawOptions,
    pug: {
      ...pug,
      options: Object.assign({}, pugDefaultOptions, pug.options),
    },
    pages,
    root: process.cwd(),
  }

  return {
    name: 'vite-plugin-static-site',
    enforce: 'pre',

    configResolved(config) {
      command = config.command
      options = {
        ...options,
        root: config.root,
        isProduction: config.isProduction,
      }
    },

    configureServer(server) {
      options.devServer = server
    },

    // モジュール解決をする（らしい）
    resolveId(source) {
      if (command === 'build') {
        console.log(source, filter(source))
        if (source.endsWith('.pug')) {
          const id = source.replace(/\.pug$/, '.html')
          buildPathMap.set(id, source)
          return id
        }
      }
    },

    load(id) {
      if (command === 'build') {
        if (id.endsWith('.html')) {
          if (buildPathMap.has(id)) {
            const compiledTemplate = compileFile(
              buildPathMap.get(id)!,
              options.pug?.options
            )
            return compiledTemplate(options.pug?.locals)
          }
          return readFileSync(id, 'utf-8')
        }
      }
    },
  }
}
