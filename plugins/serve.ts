import fs from 'node:fs'
import { Connect, Plugin, send, ViteDevServer } from 'vite'
import { compilePug } from './pug.js'
import type Pug from 'pug'

type ServeSettings = {
  options: Pug.Options | undefined
  locals: Pug.LocalsObject | undefined
  reload: boolean | undefined
}

const middleware = (
  settings: ServeSettings,
  server: ViteDevServer
): Connect.NextHandleFunction => {
  const { options, locals } = settings

  return async (req, res, next) => {
    if (
      !req.url ||
      req.url?.startsWith('/@') ||
      req.url?.startsWith('/__inspect/')
    )
      return next()

    const root = server.config.root
    let fullReqPath = root + req.url

    if (fullReqPath.endsWith('/')) {
      fullReqPath += 'index.html'
    }

    if (fullReqPath.endsWith('.html')) {
      // htmlファイルが存在すれば優先して返却する
      if (fs.existsSync(fullReqPath)) {
        return next()
      }

      const pugPath = fullReqPath.replace(/\.html$/, '.pug')

      // pugファイルが存在しなければ404を表示
      if (!fs.existsSync(pugPath)) {
        return send(req, res, '404 Not Found', 'html', {})
      }

      const compileResult = await compilePug(server, req.url, pugPath, options, locals)

      if (compileResult instanceof Error) return next(compileResult)

      const transformResult = await server.transformRequest(req.url, {
        html: true,
      })

      if (transformResult) {
        const html = await server.transformIndexHtml(req.url, transformResult.code)
        return send(req, res, html, 'html', {})
      }
    } else {
      return next()
    }
  }
}

export const vitePluginPugServe = (settings: ServeSettings): Plugin => {
  return {
    name: 'vite-plugin-pug-serve',
    enforce: 'pre',
    apply: 'serve',
    handleHotUpdate(context) {
      context.server.ws.send({
        type: 'full-reload',
      })
      return []
    },
    configureServer(server) {
      server.middlewares.use(middleware(settings, server))
    },
  }
}
