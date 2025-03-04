# vitest-package-exports

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

An Vitest util to get all exported APIs of a package and prevent unintended breaking changes.

## Install

```bash
npm i -D vitest-package-exports
```

Update your Vitest config:

```ts
export default defineConfig({
  test: {
    server: {
      deps: {
        inline: [
          'vitest-package-exports',
        ],
      },
    },
  },
})
```

## Usage

A typical usage is to make a snapshot to freeze the exported APIs of a package:

```ts
import { fileURLToPath } from 'node:url'
import { expect, it } from 'vitest'
import { getPackageExportsManifest } from 'vitest-package-exports'

it('exports snapshot', async () => {
  const manifest = await getPackageExportsManifest({
    importMode: 'src', // or 'dist' or 'package'
    cwd: fileURLToPath(import.meta.url),
  })

  expect(manifest.exports)
    .toMatchInlineSnapshot(`
      {
        ".": {
          "getPackageExportsManifest": "function",
        },
      }
    `)
})
```

Everytime you adding or remove the exported APIs, the snapshot will break and requires explicit review. This would help you to catch unintended breaking changes, or unintentional internal leaks.

For example, if I renamed the `getPackageExportsManifest` function to `getPackageExportsManifestRenamed`, the test will fail until I update the snapshot:

![Image](https://github.com/user-attachments/assets/c1d14e7f-e3c3-48f5-ad3e-8d35884b26d0)

<details>
<summary>If you want a cleaner snapshot:</summary>

You can use `js-yaml` to format the object:

```ts
import { fileURLToPath } from 'node:url'
import yaml from 'js-yaml' // <---
import { expect, it } from 'vitest'
import { getPackageExportsManifest } from 'vitest-package-exports'

it('exports snapshot', async () => {
  const manifest = await getPackageExportsManifest({
    importMode: 'src',
    cwd: fileURLToPath(import.meta.url),
  })

  expect(yaml.dump(manifest.exports)) // <---
    .toMatchInlineSnapshot(`
      .:
        getPackageExportsManifest: function
    `)
})
```

</details>

[A more complete usage example in Shiki](https://github.com/shikijs/shiki/commit/ece4b02a82febea02349ad200e0d07ab59a6a304)

## How it works

When `getPackageExportsManifest` is called, it will:

1. Find the `package.json` file in the current working directory.
2. Parse the `exports` field in the `package.json` file.
3. Depend on the `importMode`, it will resolve the exports to the corresponding import path.
  - `package`: Import from package name directly, for example `import('vitest/config')`
  - `dist`: Import the module from the defined `exports` entry, for example `import('./dist/config.mjs')`
  - `src`: Import the module from the `src` directory (replace `dist` with `src`), for example `import('./src/config.ts')`
4. For each entry, it will import the module at runtime to get the exports object. Essentially `Object.keys(await import(entry))` (so it's better to only use this in sandboxed environments like Vitest)
5. Return the manifest of the exported APIs.

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg'/>
  </a>
</p>

## License

[MIT](./LICENSE) License © [Anthony Fu](https://github.com/antfu)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/vitest-package-exports?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/vitest-package-exports
[npm-downloads-src]: https://img.shields.io/npm/dm/vitest-package-exports?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/vitest-package-exports
[bundle-src]: https://img.shields.io/bundlephobia/minzip/vitest-package-exports?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=vitest-package-exports
[license-src]: https://img.shields.io/github/license/antfu/vitest-package-exports.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/antfu/vitest-package-exports/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/vitest-package-exports
