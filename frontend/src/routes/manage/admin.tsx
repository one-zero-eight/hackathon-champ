import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/admin')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/manage/admin"!</div>
}
