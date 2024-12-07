import { $api } from '@/api'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/participants/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: allPersons } = $api.useQuery('get', '/participants/person/all')
  const { data: allTeams } = $api.useQuery('get', '/participants/team/all')

  return <div></div>
}
