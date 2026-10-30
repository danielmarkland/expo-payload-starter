import { Gutter, SetStepNav } from '@payloadcms/ui'
import { publishingOverview } from '@danielmarkland/publishing-core/adminOverview'
import { PublishingOverview } from '@danielmarkland/publishing-ui/admin/PublishingOverview'
import type { AdminViewServerProps } from 'payload'

export async function OverviewView(props: AdminViewServerProps) {
  const { req, permissions } = props.initPageResult
  const data = await publishingOverview(req)
  return (
    <>
      <SetStepNav nav={[{ label: 'Overview' }]} />
      <Gutter>
        <PublishingOverview
          title="Overview"
          data={data}
          canCreatePosts={Boolean(permissions.collections?.posts?.create)}
          searchURL="/admin/collections/search"
        />
      </Gutter>
    </>
  )
}
