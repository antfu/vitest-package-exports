import { fileURLToPath } from 'node:url'
import { expect, it } from 'vitest'
import { getPackageExportsManifest } from '../src'

it('vite', async () => {
  const manifest = await getPackageExportsManifest({
    importMode: 'dist',
    cwd: fileURLToPath(new URL('../node_modules/vite', import.meta.url)),
  })

  expect(manifest)
    .toMatchInlineSnapshot(`
      {
        "exports": {
          ".": {
            "BuildEnvironment": "function",
            "DevEnvironment": "function",
            "build": "function",
            "buildErrorMessage": "function",
            "createBuilder": "function",
            "createFetchableDevEnvironment": "function",
            "createFilter": "function",
            "createIdResolver": "function",
            "createLogger": "function",
            "createRunnableDevEnvironment": "function",
            "createServer": "function",
            "createServerHotChannel": "function",
            "createServerModuleRunner": "function",
            "createServerModuleRunnerTransport": "function",
            "defaultAllowedOrigins": "object",
            "defaultClientConditions": "object",
            "defaultClientMainFields": "object",
            "defaultExternalConditions": "object",
            "defaultServerConditions": "object",
            "defaultServerMainFields": "object",
            "defineConfig": "function",
            "esbuildVersion": "string",
            "fetchModule": "function",
            "formatPostcssSourceMap": "function",
            "isCSSRequest": "function",
            "isFetchableDevEnvironment": "function",
            "isFileLoadingAllowed": "function",
            "isFileServingAllowed": "function",
            "isRunnableDevEnvironment": "function",
            "loadConfigFromFile": "function",
            "loadEnv": "function",
            "mergeAlias": "function",
            "mergeConfig": "function",
            "moduleRunnerTransform": "function",
            "normalizePath": "function",
            "optimizeDeps": "function",
            "parseAst": "function",
            "parseAstAsync": "function",
            "perEnvironmentPlugin": "function",
            "perEnvironmentState": "function",
            "preprocessCSS": "function",
            "preview": "function",
            "resolveConfig": "function",
            "resolveEnvPrefix": "function",
            "rollupVersion": "string",
            "runnerImport": "function",
            "searchForWorkspaceRoot": "function",
            "send": "function",
            "sortUserPlugins": "function",
            "transformWithEsbuild": "function",
            "version": "string",
          },
          "./module-runner": {
            "ESModulesEvaluator": "function",
            "EvaluatedModules": "function",
            "ModuleRunner": "function",
            "createDefaultImportMeta": "function",
            "createNodeImportMeta": "function",
            "createWebSocketModuleRunnerTransport": "function",
            "normalizeModuleId": "function",
            "ssrDynamicImportKey": "string",
            "ssrExportAllKey": "string",
            "ssrExportNameKey": "string",
            "ssrImportKey": "string",
            "ssrImportMetaKey": "string",
            "ssrModuleExportsKey": "string",
          },
        },
        "importMode": "dist",
        "package": {
          "name": "vite",
          "version": "7.3.0",
        },
      }
    `)
})

it('rollup - dist', async () => {
  const manifest = await getPackageExportsManifest({
    importMode: 'dist',
    cwd: fileURLToPath(new URL('../node_modules/rollup', import.meta.url)),
  })

  expect(manifest)
    .toMatchInlineSnapshot(`
      {
        "exports": {
          ".": {
            "VERSION": "string",
            "defineConfig": "function",
            "rollup": "function",
            "watch": "function",
          },
          "./getLogFilter": {
            "getLogFilter": "function",
          },
          "./loadConfigFile": {
            "default": "object",
            "loadConfigFile": "function",
            "module.exports": "object",
          },
          "./parseAst": {
            "parseAst": "function",
            "parseAstAsync": "function",
          },
        },
        "importMode": "dist",
        "package": {
          "name": "rollup",
          "version": "4.54.0",
        },
      }
    `)
})

it('rollup - package', async () => {
  const manifest = await getPackageExportsManifest({
    importMode: 'package',
    cwd: fileURLToPath(new URL('../node_modules/rollup', import.meta.url)),
  })

  expect(manifest)
    .toMatchInlineSnapshot(`
      {
        "exports": {
          ".": {
            "VERSION": "string",
            "defineConfig": "function",
            "rollup": "function",
            "watch": "function",
          },
          "./getLogFilter": {
            "getLogFilter": "function",
          },
          "./loadConfigFile": {
            "default": "object",
            "loadConfigFile": "function",
            "module.exports": "object",
          },
          "./parseAst": {
            "parseAst": "function",
            "parseAstAsync": "function",
          },
        },
        "importMode": "package",
        "package": {
          "name": "rollup",
          "version": "4.54.0",
        },
      }
    `)
})
