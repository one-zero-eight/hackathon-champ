import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/regional')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/manage/regional"!</div>
}
