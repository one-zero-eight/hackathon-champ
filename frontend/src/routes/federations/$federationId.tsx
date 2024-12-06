import { $api } from '@/api'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/federations/$federationId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { federationId } = Route.useParams()
  const { data: federation, isPending, isError } = $api.useQuery('get', `/federations/{id}`, {
    params: { path: { id: federationId } },
  })

  return (
    <div>
      {isPending && 'Загрузка...'}
      {isError && 'Ошибка'}
      {federation && (
        <div>
          {federation.region}
        </div>
      )}
    </div>
  )
}
