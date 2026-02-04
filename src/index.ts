import fs from 'node:fs/promises'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import { findUp } from 'find-up-simple'
import { dirname, join } from 'pathe'

export interface PackageExportsManifestOptions {
  /**
   * The current working directory to use when resolving the package.json file.
   *
   * @default process.cwd()
   */
  cwd?: string

  /**
   * How should entry points be imported.
   *
   * @default 'parallel'
   */
  sequence?: 'parallel' | 'sequential'

  /**
   * The type of import source to use.
   *
   * - `package` - import from package name directly, for example `import('vitest/config')`
   * - `dist` - import the module from the defined `exports` entry, for example `import('./dist/config.mjs')`
   * - `src` - import the module from the `src` directory (replace `dist` with `src`), for example `import('./src/config.ts')`
   *
   * @default 'dist'
   */
  importMode?: 'package' | 'dist' | 'src'

  /**
   * Resolve the export entries, filter or modify the entries.
   */
  resolveExportEntries?: (entries: [entry: string, path: string][]) => [entry: string, path: string][]

  /**
   * Get a representation of a value.
   *
   * @default 'value => typeof value'
   */
  resolveValueType?: (value: unknown) => any

  /**
   * Resolve the source path from a dist path, for example `dist/config.mjs` -> `src/config.ts`.
   *
   * Only used when `importMode` is set to `src`.
   *
   * @default `dist => dist.replace('dist', 'src').replace(/\.[mc]?js$/, '')`
   */
  resolveSourcePath?: (dist: string) => string

  /**
   * Resolve the value of the `exports` entry in `package.json`, and return a path to import.
   *
   * @default `value => value['module-sync'] || value.default || value.import || value.module || value.require`
   */
  resolveExportsValue?: (value: string | Record<string, string>) => string | undefined

  /**
   * Determine if an entry should be ignored.
   */
  shouldIgnoreEntry?: ({ entry, path }: { entry: string, path: string }) => boolean
}

export interface PackageExportsManifest {
  package: {
    name: string
    version?: string
  }
  importMode: 'package' | 'dist' | 'src'
  exports: Record<string, Record<string, unknown>>
}

export async function getPackageExportsManifest(options: PackageExportsManifestOptions): Promise<PackageExportsManifest> {
  const {
    importMode = 'dist',
    cwd = process.cwd(),
    resolveValueType = value => typeof value,
    resolveSourcePath = dist => dist.replace('dist', 'src').replace(/\.[mc]?js$/, ''),
    resolveExportsValue = value => typeof value === 'string'
      ? value
      : value['module-sync'] || value.default || value.import || value.module || value.require,
    shouldIgnoreEntry = () => false,
  } = options

  const path = await findUp('package.json', {
    cwd,
  })
  if (!path) {
    throw new Error('package.json not found')
  }
  const pkgRoot = dirname(path)
  const pkg = JSON.parse(await fs.readFile(path, 'utf-8'))
  if (!pkg.name || pkg.private) {
    throw new Error(`${path} is not a public package`)
  }

  const exportsObject = pkg.exports || { '.': './dist/index.mjs' }
  let exportsEntries = Object.entries(exportsObject)
    .filter(i => i[1] && !i[0].includes('*') && i[0] !== 'package.json' && i[0] !== './package.json' && !shouldIgnoreEntry({ entry: i[0], path: i[1] as string }))
    .map(i => [i[0], resolveExportsValue(i[1] as any) as string] as [string, string])
    .filter(i => i[1])

  exportsEntries = options.resolveExportEntries?.(exportsEntries) ?? exportsEntries

  const importEntryPoint = async (key: string, value: string): Promise<Record<string, unknown>> => {
    let obj: any
    if (importMode === 'package') {
      obj = await import(join(pkg.name, key))
    }
    else if (importMode === 'dist') {
      obj = await import(pathToFileURL(join(pkgRoot, value)).toString())
    }
    else if (importMode === 'src') {
      obj = await import(pathToFileURL(join(pkgRoot, resolveSourcePath(value))).toString())
    }
    return Object.fromEntries(
      Object.entries(obj)
        .map(([k, v]) => [k, resolveValueType(v)])
        .sort((a, b) => a[0].localeCompare(b[0])),
    )
  }

  let exports: Record<string, Record<string, unknown>> = {}

  if (options.sequence === 'sequential') {
    exports = Object.fromEntries(
      await Promise.all(
        exportsEntries.map(async ([key, value]) => [key, await importEntryPoint(key, value)]),
      ),
    )
  }
  else {
    for (const [key, value] of exportsEntries) {
      exports[key] = await importEntryPoint(key, value)
    }
  }

  return {
    package: {
      name: pkg.name,
      version: pkg.version,
    },
    importMode,
    exports,
  }
}
