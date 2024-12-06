import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/admin/home')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello!</div>
}
