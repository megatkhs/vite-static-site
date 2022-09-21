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

export const vitePluginStaticSiteFramework = (userSettings?: PluginSettings) => {
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
