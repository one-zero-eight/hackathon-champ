import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/participants/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/manage/participants/$id"!</div>
}
