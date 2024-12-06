import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/federations')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/federations"!</div>
}
