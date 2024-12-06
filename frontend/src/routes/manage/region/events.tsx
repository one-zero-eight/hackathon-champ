import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/region/events')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello!</div>
}
