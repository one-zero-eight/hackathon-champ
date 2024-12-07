import { useMe } from '@/api/me.ts'
import { EditEventForm } from '@/components/event/EditEventForm.tsx'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/manage/events/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { isError: meError } = useMe()

  useEffect(() => {
    if (meError) {
      navigate({ to: '/auth/login' })
    }
  }, [meError, navigate])

  return <EditEventForm eventId={id} />
}
