import { $api } from '@/api'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/region/events/suggest')({
  component: RouteComponent,
})

function RouteComponent() {
  const { mutate } = $api.useMutation('post', '/events/suggest')

  return (
    <div>

    </div>
  )
}
