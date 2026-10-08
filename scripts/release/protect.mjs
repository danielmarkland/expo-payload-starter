import { execFileSync } from 'node:child_process'
const repository = JSON.parse(
  execFileSync('gh', ['repo', 'view', '--json', 'nameWithOwner'], {
    encoding: 'utf8',
  }),
).nameWithOwner
execFileSync(
  'gh',
  ['api', '--method', 'PATCH', `repos/${repository}`, '--input', '-'],
  {
    input: JSON.stringify({
      allow_squash_merge: true,
      allow_merge_commit: true,
      allow_rebase_merge: false,
    }),
    encoding: 'utf8',
  },
)
for (const branch of ['develop', 'main']) {
  // Main keeps release ancestry without forcing synthetic main→develop merge commits.
  const settings = {
    required_status_checks: { strict: branch === 'develop', contexts: ['ci'] },
    enforce_admins: true,
    required_linear_history: branch === 'develop',
    required_pull_request_reviews: {
      required_approving_review_count: 0,
      dismiss_stale_reviews: true,
    },
    restrictions: null,
    allow_force_pushes: false,
    allow_deletions: false,
    block_creations: false,
    required_conversation_resolution: true,
  }
  const result = execFileSync(
    'gh',
    [
      'api',
      '--method',
      'PUT',
      `repos/${repository}/branches/${branch}/protection`,
      '--input',
      '-',
    ],
    { input: JSON.stringify(settings), encoding: 'utf8' },
  )
  const applied = JSON.parse(result)
  if (
    !applied.enforce_admins?.enabled ||
    applied.allow_force_pushes?.enabled ||
    applied.allow_deletions?.enabled ||
    !applied.required_status_checks?.contexts?.includes('ci')
  )
    throw new Error(`Protection verification failed for ${branch}`)
  console.info(`${repository}/${branch}: PR/ci protections verified`)
}
