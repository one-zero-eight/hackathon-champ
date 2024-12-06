import { EditEventForm } from '@/components/event/EditEventForm.tsx'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/region/events/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()

  return (
    <EditEventForm eventId={id} />
  )
}
