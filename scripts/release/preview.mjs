// Vercel: exit 0 skips a build; exit 1 permits it. Missing handover flags retain tracked deployments.
const tracked = ['main', 'develop'].includes(process.env.VERCEL_GIT_COMMIT_REF)
const controlled = process.env.RELEASE_AUTOMATION_ENABLED === 'true'
const canonical = process.env.RELEASE_CANONICAL_PREVIEW
const skip = tracked ? controlled : canonical === 'false'
console.info(
  skip
    ? 'Deployment owned by release workflow or non-canonical preview'
    : 'Build permitted',
)
process.exit(skip ? 0 : 1)
