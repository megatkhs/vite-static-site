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

export const staticSitePlugin = (rawOptions: Options = {}): Plugin => {
  const { pug = {}, pages = 'src/pages/**.pug', isProduction } = rawOptions

  const filterArgs =
    pages &&
    typeof pages === 'object' &&
    !(pages instanceof Array) &&
    !(pages instanceof RegExp)
      ? [pages.include, pages.exclude]
      : [pages]

  const filter = createFilter(...filterArgs)

  let options: ResolvedOptions = {
    isProduction: process.env.NODE_ENV === 'production',
    ...rawOptions,
    pug,
    pages,
    root: process.cwd(),
  }

  return {
    name: 'vite-plugin-static-site',

    configResolved(config) {
      options = {
        ...options,
        root: config.root,
        isProduction: config.isProduction,
      }
    },

    configureServer(server) {
      options.devServer = server
    },
  }
}
