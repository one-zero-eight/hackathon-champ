import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/region/requests')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello!</div>
}
