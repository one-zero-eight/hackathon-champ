import { $api } from '@/api'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/participants/teams')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: allTeams } = $api.useQuery('get', '/participants/team/all')

  return <div></div>
}
