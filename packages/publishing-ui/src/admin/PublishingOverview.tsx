import { AdminDate } from './AdminDate.js'
import { Button, Pill } from '@payloadcms/ui'
import { PageActions } from './PageActions.js'

export type PublishingOverviewData = {
  drafts: { label: string; count: number; href: string }[]
  recent: {
    id: string
    title: string
    collection: string
    status: string
    updatedAt: string
    href: string
  }[]
}
export function PublishingOverview({
  title,
  summary,
  data,
  canCreatePosts,
  publicURL,
  searchURL,
  appURL,
  advancedLinks = [],
}: {
  title: string
  summary?: string
  data: PublishingOverviewData
  canCreatePosts: boolean
  publicURL?: string | null
  appURL?: string | null
  advancedLinks?: { href: string; label: string }[]
  searchURL?: string
}) {
  return (
    <section className="overview">
      <header className="admin-page-header">
        <div>
          <h1>{title}</h1>
          {summary && <p>{summary}</p>}
        </div>
        <PageActions>
          {publicURL && (
            <Button el="anchor" url={publicURL} newTab buttonStyle="secondary">
              Open Website
            </Button>
          )}
          {appURL && (
            <Button el="anchor" url={appURL} newTab buttonStyle="secondary">
              Open App
            </Button>
          )}
          {canCreatePosts && (
            <Button el="link" to="/admin/collections/posts/create" icon="plus">
              New Post
            </Button>
          )}
        </PageActions>
      </header>
      <section>
        <h2>Drafts</h2>
        <div className="table">
          <table>
            <thead>
              <tr>
                <th>Content</th>
                <th>Drafts</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.drafts.map((item) => (
                <tr key={item.href}>
                  <td>{item.label}</td>
                  <td>
                    <Pill>{item.count}</Pill>
                  </td>
                  <td>
                    <Button
                      el="link"
                      to={item.href}
                      buttonStyle="secondary"
                      size="small"
                      margin={false}
                    >
                      View Drafts
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h2>Recent Content</h2>
        {data.recent.length ? (
          <div className="table">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {data.recent.map((item) => (
                  <tr key={`${item.collection}:${item.id}`}>
                    <td>
                      <a href={item.href}>{item.title}</a>
                    </td>
                    <td>{item.collection}</td>
                    <td>
                      <Pill>{item.status}</Pill>
                    </td>
                    <td>
                      <AdminDate value={item.updatedAt} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No content yet.</p>
        )}
      </section>
      {(searchURL || advancedLinks.length > 0) && (
        <details>
          <summary>Advanced Tools</summary>
          {searchURL && (
            <Button el="link" to={searchURL} buttonStyle="secondary">
              Search Results
            </Button>
          )}
          {advancedLinks.map((link) => (
            <Button
              key={link.href}
              el="link"
              to={link.href}
              buttonStyle="secondary"
            >
              {link.label}
            </Button>
          ))}
        </details>
      )}
    </section>
  )
}
