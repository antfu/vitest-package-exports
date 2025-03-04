import { fileURLToPath } from 'node:url'
import { expect, it } from 'vitest'
import { getPackageExportsManifest } from '../src'

it('exports snapshot', async () => {
  const manifest = await getPackageExportsManifest({
    importMode: 'src',
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
