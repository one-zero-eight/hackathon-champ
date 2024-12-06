import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/region/events/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/manage/region/events/$id"!</div>
}
