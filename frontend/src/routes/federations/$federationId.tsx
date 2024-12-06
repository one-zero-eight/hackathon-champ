import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/federations/$federationId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/federations/$federationId"!</div>
}
