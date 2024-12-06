import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/feedback')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/manage/feedback"!</div>
}
