import { CreateForm } from '@/components/event/CreateForm.tsx'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/region/events/suggest')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <CreateForm />
      </div>
    </div>
  )
}