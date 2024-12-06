import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/manage/profile"!</div>
}
