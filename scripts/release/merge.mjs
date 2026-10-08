import { execFileSync } from 'node:child_process'
import { assertPullRequest, assertSHA } from './policy.mjs'
const gh = (...args) => execFileSync('gh', args, { encoding: 'utf8' })
const number = process.argv[2]
if (!/^\d+$/.test(number || ''))
  throw new Error('Usage: node scripts/release/merge.mjs PR_NUMBER')
const repository = JSON.parse(
  gh('repo', 'view', '--json', 'nameWithOwner'),
).nameWithOwner
const pr = JSON.parse(gh('api', `repos/${repository}/pulls/${number}`))
assertPullRequest({ pull_request: pr }, repository)
if (pr.state !== 'open' || pr.draft)
  throw new Error('An open, ready PR is required')
const sha = assertSHA(pr.head.sha)
const protection = JSON.parse(
  gh('api', `repos/${repository}/branches/${pr.base.ref}/protection`),
)
if (
  !protection.enforce_admins?.enabled ||
  !protection.required_pull_request_reviews ||
  !protection.required_status_checks?.contexts?.includes('ci')
)
  throw new Error('Required branch protections are not active')
if (pr.base.ref === 'develop') {
  const releases = JSON.parse(
    gh('api', `repos/${repository}/pulls?state=open&base=main`),
  )
  const runs = JSON.parse(
    gh('api', `repos/${repository}/actions/runs?branch=main&per_page=100`),
  ).workflow_runs
  if (
    releases.length ||
    runs.some(
      (run) => run.name === 'Controlled release' && run.status !== 'completed',
    )
  )
    throw new Error('Production release in progress; pause develop merges')
}
gh('pr', 'checks', number, '--required')
// GitHub checks protections and this exact head again atomically at merge time.
process.stdout.write(
  gh(
    'pr',
    'merge',
    number,
    pr.base.ref === 'main' ? '--merge' : '--squash',
    '--match-head-commit',
    sha,
  ),
)
