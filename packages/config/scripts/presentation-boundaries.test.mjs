import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import ts from 'typescript'
import { checkPresentationBoundaries } from '../../publishing-core/src/presentationBoundary.mjs'

for (const [name, content, rejected] of [
  [
    'collections/Pages.ts',
    "import {createPagesCollection as factory} from '@danielmarkland/publishing-core/payloadCollections';export const Pages=factory({access,pageBlocks,preview})",
    false,
  ],
  [
    'globals/SiteSettings.ts',
    "import {createSiteSettingsGlobal} from '@danielmarkland/publishing-core/payloadCollections';export const SiteSettings=createSiteSettingsGlobal({access})",
    false,
  ],
  ['collections/Users.ts', 'export const Users={auth:true,access:{}}', false],
  [
    'collections/Pages.ts',
    "export const Pages={slug:'pages',fields:[],admin:{useAsTitle:'title'}}",
    true,
  ],
  [
    'collections/NewPublishing.ts',
    "export const NewPublishing={slug:'copied',fields:[]}",
    true,
  ],
  [
    'globals/SiteSettings.ts',
    "import {createSiteSettingsGlobal} from './copied';export const SiteSettings=createSiteSettingsGlobal({})",
    true,
  ],
  [
    'lib/api/services.ts',
    'async function verifyTurnstile(){return true}',
    true,
  ],
  [
    'lib/api/services.ts',
    "fetch('https://connect.mailerlite.com/api/subscribers')",
    true,
  ],
  [
    'lib/newRenderer.tsx',
    'export default () => <section>Copied</section>',
    true,
  ],
  [
    'app/(frontend)/posts/page.tsx',
    'export default () => <Article post={post} />',
    false,
  ],
  [
    'app/(frontend)/layout.tsx',
    'export default () => <html><head><style>{css}</style></head><body><SiteFrame /></body></html>',
    false,
  ],
  [
    'components/admin/Editor.tsx',
    'export default () => <div>Admin</div>',
    true,
  ],
  [
    'app/(frontend)/styles.css',
    "@import '@danielmarkland/publishing-ui/base.css';",
    false,
  ],
  [
    'lib/linkIcons.ts',
    "export { getLinkIcon } from '@danielmarkland/publishing-ui/linkIcons'",
    false,
  ],
  [
    'app/(frontend)/posts/page.tsx',
    'export default () => <article><h1>Copied</h1></article>',
    true,
  ],
  [
    'components/Article.tsx',
    "export default () => React.createElement('article', null)",
    true,
  ],
  [
    'app/(frontend)/layout.tsx',
    'export default () => <html><body><header>Copied</header></body></html>',
    true,
  ],
  ['app/(frontend)/styles.css', '/* copy */ .article { padding: 2rem }', true],
  ['components/icons.ts', "import { FaFacebook } from 'react-icons/fa6'", true],
  [
    'lib/siteConfig.ts',
    'export function siteConfigCSS() { return "copied" }',
    true,
  ],
  [
    'lib/tenants/service.ts',
    "import { getTenant } from '@/lib/api/services'",
    true,
  ],
  [
    'lib/publishing/repository.ts',
    "import { tenantContext } from '@/lib/tenants/context'",
    false,
  ],
  [
    'lib/getPage.ts',
    "import { publishingClient } from '@/lib/api/publishing'",
    false,
  ],
  [
    'lib/publishing/repository.ts',
    "import { find } from '../api/services'",
    true,
  ],
  [
    'lib/publishing/repository.ts',
    "const api=await import('../api/services')",
    true,
  ],
  ['lib/publishing/repository.ts', "export * from '../api/services'", true],
  [
    'lib/publishing/repository.ts',
    "const api=require('../api/services')",
    true,
  ],
  [
    'lib/api/app.ts',
    "createRoute({method:'get',path:'/posts',responses:{}})",
    true,
  ],
  ['lib/api/app.ts', 'createRoute(postsRoute)', false],
]) {
  test(`${rejected ? 'rejects' : 'accepts'} ${name}: ${content}`, async () => {
    const root = await mkdtemp(join(tmpdir(), 'presentation-boundary-'))
    try {
      const file = join(root, 'src', name)
      await mkdir(join(file, '..'), { recursive: true })
      await writeFile(file, content)
      const errors = await checkPresentationBoundaries(root, ts)
      assert.equal(errors.length > 0, rejected, errors.join('\n'))
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })
}
