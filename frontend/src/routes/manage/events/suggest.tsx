import { useMe } from '@/api/me.ts'
import { CreateEventForm } from '@/components/event/CreateEventForm.tsx'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/manage/events/suggest')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { isError: meError } = useMe()

  useEffect(() => {
    if (meError) {
      navigate({ to: '/auth/login' })
    }
  }, [meError, navigate])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <CreateEventForm />
      </div>
    </div>
  )
}
