export type IdentityRealm =
  { kind: 'platform' } | { kind: 'customer'; tenantId: string }
export function realmKey(realm: IdentityRealm): string {
  if (realm.kind === 'platform') return 'platform'
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      realm.tenantId,
    )
  )
    throw new Error('Invalid tenant identity realm')
  return `customer:${realm.tenantId.toLowerCase()}`
}
