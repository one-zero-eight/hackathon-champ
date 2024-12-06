import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/events')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/manage/events"!</div>
}
