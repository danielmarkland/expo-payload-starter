export function releaseTarget(environment, profile) {
  if (!['development', 'production'].includes(environment))
    throw new Error('Invalid release environment')
  if (!['platform', 'starter'].includes(profile))
    throw new Error('Invalid release profile')
  return environment === 'development' ? 'dev' : 'production'
}
export function assertDevDomain(domain, environmentId) {
  if (
    !domain.name ||
    domain.redirect ||
    domain.gitBranch ||
    domain.customEnvironmentId !== environmentId
  )
    throw new Error('Dev domain is assigned to a different environment')
}
export function assertDeploymentTarget(deployment, context) {
  if (context.target === 'dev') {
    if (deployment.customEnvironment?.id !== context.customEnvironmentId)
      throw new Error('Deployment belongs to a different custom environment')
  } else if (deployment.target !== 'production')
    throw new Error('Deployment is not a production candidate')
}

export function assertDevSmokeTargets(targets, domains) {
  for (const target of targets) {
    const hostname = new URL(target.url).hostname.toLowerCase()
    const assigned = domains.some(({ name }) => {
      const domain = name.toLowerCase()
      if (!domain.startsWith('*.')) return domain === hostname
      const suffix = domain.slice(2)
      return (
        hostname.endsWith(`.${suffix}`) &&
        hostname.slice(0, -(suffix.length + 1)).split('.').length === 1
      )
    })
    if (!assigned)
      throw new Error('Dev smoke target is outside the assigned dev domains')
  }
}
