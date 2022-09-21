import { compileFile } from 'pug'
import type Pug from 'pug'
import type { ModuleGraph, ModuleNode, ViteDevServer } from 'vite'

type CompiledTemplateWithDeps = Pug.compileTemplate & {
  dependencies: string[]
}

const reflectAncestorsIntoModuleMap = (moduleGraph: ModuleGraph, compiledModule: ModuleNode, ancestors: string[]) => {
  // Add ancestors in module map
  const importedModules: Set<ModuleNode> = new Set() // Optional

  ancestors.forEach((ancestor) => {
    const ancestorModules = moduleGraph.getModulesByFile(ancestor)
    const ancestorModule = (ancestorModules && [...ancestorModules][0]) || moduleGraph.createFileOnlyEntry(ancestor)

    ancestorModule.importers.add(compiledModule)
    importedModules.add(ancestorModule)
  })

  compiledModule.importedModules = importedModules
}

export const compilePug = async (
  { moduleGraph, transformIndexHtml }: ViteDevServer,
  url: string,
  pugPath: string,
  options?: Pug.Options,
  locals?: Pug.LocalsObject
): Promise<boolean | Error> => {
  const compiledModule = await moduleGraph.getModuleByUrl(url) || await moduleGraph.ensureEntryFromUrl(url)

  if (compiledModule.file !== pugPath) {
    if (compiledModule.file)
      moduleGraph.fileToModulesMap.delete(compiledModule.file)
      compiledModule.file = pugPath
    moduleGraph.fileToModulesMap.set(pugPath, new Set([compiledModule]))
  }

  // If the module didn't be invalidated
  if (compiledModule.transformResult) return true

  // Start compiling
  const map = null

  try {
    // options と locals を compileFile にセットする
    const compiledTemplate = compileFile(pugPath, options) as CompiledTemplateWithDeps
    if (compiledTemplate.dependencies.length) {
      reflectAncestorsIntoModuleMap(moduleGraph, compiledModule, compiledTemplate.dependencies)
    }
    // Generate HTML
    const code = compiledTemplate(locals)

    compiledModule.transformResult = { code, map }
  } catch (error) {
    if (error instanceof Error) return error
    return false
  }
  return true
}
