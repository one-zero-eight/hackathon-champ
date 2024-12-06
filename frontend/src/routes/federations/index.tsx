import { $api } from '@/api'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/federations/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: federations, isPending } = $api.useQuery('get', '/federations/')

  return (
    <div>
      {isPending && 'Загрузка...'}
      {federations?.map(federation => (
        <div key={federation.id}>
          {federation.region}
        </div>
      ))}
    </div>
  )
}
