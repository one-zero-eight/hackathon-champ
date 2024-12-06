import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export function SportBadge({
  id,
  name,
  className,
}: {
  id: string;
  name: string;
  className?: string;
}) {
  return (
    <Button
      asChild
      className={cn("flex items-center gap-2 px-4 py-2", className)}
      variant="outline"
    >
      <Link to="/sports/$sportId" params={{ sportId: id }}>
        {name}
      </Link>
    </Button>
  );
}
