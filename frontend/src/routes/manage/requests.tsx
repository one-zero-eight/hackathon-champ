import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/requests')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/manage/requests"!</div>
}
