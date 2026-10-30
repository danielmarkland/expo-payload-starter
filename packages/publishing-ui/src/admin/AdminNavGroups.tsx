import { Link, NavGroup } from '@payloadcms/ui'

export type AdminNavLink = { href: string; label: string }
export function AdminNavGroups({
  groups,
}: {
  groups: { label: string; links: AdminNavLink[] }[]
}) {
  return (
    <>
      {groups
        .filter((group) => group.links.length)
        .map((group) => (
          <NavGroup key={group.label} label={group.label} isOpen>
            {group.links.map((link) => (
              <Link className="nav__link" key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </NavGroup>
        ))}
    </>
  )
}
