import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/disciplines')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/disciplines"!</div>
}
