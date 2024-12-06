import { $api } from "@/api";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/events/$eventId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { eventId } = Route.useParams();
  const { data: event } = $api.useQuery("get", "/events/{id}", {
    params: { path: { id: eventId } },
  });

  return (
    <div>
      Event {eventId}: {JSON.stringify(event)}
    </div>
  );
}
