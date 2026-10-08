import { execFileSync } from 'node:child_process'
import { appendFileSync, readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
export function assertPullRequest(event, repository) {
  const pr = event.pull_request
  if (!pr) return
  if (
    pr.base.ref === 'main' &&
    (pr.head.ref !== 'develop' || pr.head.repo?.full_name !== repository)
  )
    throw new Error(
      "Production releases must originate from this repository's develop branch",
    )
  if (!['main', 'develop'].includes(pr.base.ref))
    throw new Error('Target develop for features or main for releases')
}
export function documentationOnly(paths) {
  return (
    paths.length > 0 &&
    paths.every(
      (path) =>
        /^(README|AGENTS|CLAUDE)(\.[^/]+)?\.md$/.test(path) ||
        /^docs\/.*\.(md|png|jpg|jpeg|svg|webp)$/.test(path) ||
        /^\.instructions\/.*\.md$/.test(path),
    )
  )
}
export function assertSHA(value) {
  if (!/^[a-f0-9]{40}$/.test(value || ''))
    throw new Error('Expected an exact Git commit SHA')
  return value
}
export function inspectChange(event, repository, sha) {
  assertPullRequest(event, repository)
  const head = assertSHA(sha),
    base = event.pull_request?.base.sha || event.before
  if (!base || /^0+$/.test(base)) return { documentation: false }
  assertSHA(base)
  const paths = execFileSync('git', ['diff', '--name-only', '-z', base, head], {
    encoding: 'utf8',
  })
    .split('\0')
    .filter(Boolean)
  execFileSync('git', ['diff', '--check', base, head])
  return { documentation: documentationOnly(paths) }
}
export async function requireDevelopmentDeployment(
  event,
  repository,
  enabled,
  token,
  transport = fetch,
) {
  const pr = event.pull_request
  if (!enabled || pr?.base.ref !== 'main') return
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
  }
  const query = await transport(
    `https://api.github.com/repos/${repository}/deployments?environment=development&sha=${assertSHA(pr.head.sha)}&per_page=100`,
    { headers },
  )
  if (!query.ok) throw new Error('Cannot verify development deployment')
  for (const deployment of await query.json()) {
    if (
      deployment.sha !== pr.head.sha ||
      deployment.environment !== 'development'
    )
      continue
    const response = await transport(
      `https://api.github.com/repos/${repository}/deployments/${deployment.id}/statuses`,
      { headers },
    )
    if (!response.ok) throw new Error('Cannot verify deployment status')
    const [latest] = await response.json()
    if (latest?.state === 'success') return
  }
  throw new Error(
    'The exact develop commit must finish controlled deployment and smoke checks before release',
  )
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH))
  const result = inspectChange(
    event,
    process.env.GITHUB_REPOSITORY,
    process.env.GITHUB_SHA,
  )
  await requireDevelopmentDeployment(
    event,
    process.env.GITHUB_REPOSITORY,
    process.env.RELEASE_AUTOMATION_ENABLED === 'true',
    process.env.GH_TOKEN,
  )
  appendFileSync(
    process.env.GITHUB_OUTPUT,
    `documentation=${result.documentation}\n`,
  )
}
