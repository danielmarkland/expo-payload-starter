import { execFileSync, spawnSync } from 'node:child_process'
const repository = JSON.parse(
  execFileSync('gh', ['repo', 'view', '--json', 'nameWithOwner'], {
    encoding: 'utf8',
  }),
).nameWithOwner
for (const branch of ['develop', 'main']) {
  const probe = spawnSync(
    'gh',
    ['api', `repos/${repository}/branches/${branch}/protection`],
    { encoding: 'utf8' },
  )
  if (
    probe.status !== 0 &&
    !`${probe.stdout}${probe.stderr}`.includes('HTTP 404')
  )
    throw new Error(
      `Cannot manage ${branch} protections; verify repository permissions and GitHub plan before enabling rules`,
    )
}
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
// Rulesets enforce the merge method on each branch, including the GitHub UI.
const existingRules = JSON.parse(
  execFileSync('gh', ['api', `repos/${repository}/rulesets`], {
    encoding: 'utf8',
  }),
)
for (const branch of ['develop', 'main']) {
  const name = `Release merge method (${branch})`
  const existing = existingRules.find(
    (rule) => rule.name === name && rule.source === repository,
  )
  const method = branch === 'main' ? 'merge' : 'squash'
  const settings = {
    name,
    target: 'branch',
    enforcement: 'active',
    bypass_actors: [],
    conditions: {
      ref_name: { include: [`refs/heads/${branch}`], exclude: [] },
    },
    rules: [
      {
        type: 'pull_request',
        parameters: {
          required_approving_review_count: 0,
          dismiss_stale_reviews_on_push: true,
          require_code_owner_review: false,
          require_last_push_approval: false,
          required_review_thread_resolution: true,
          allowed_merge_methods: [method],
        },
      },
    ],
  }
  const path = `repos/${repository}/rulesets${existing ? `/${existing.id}` : ''}`
  const result = JSON.parse(
    execFileSync(
      'gh',
      ['api', '--method', existing ? 'PUT' : 'POST', path, '--input', '-'],
      { input: JSON.stringify(settings), encoding: 'utf8' },
    ),
  )
  const allowed = result.rules?.find((rule) => rule.type === 'pull_request')
    ?.parameters.allowed_merge_methods
  if (
    result.enforcement !== 'active' ||
    result.bypass_actors?.length ||
    allowed?.length !== 1 ||
    allowed[0] !== method
  )
    throw new Error(`Merge-method ruleset verification failed for ${branch}`)
  console.info(`${repository}/${branch}: ${method}-only ruleset verified`)
}
