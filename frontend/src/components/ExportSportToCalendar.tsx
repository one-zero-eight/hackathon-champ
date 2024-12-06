import { ExportSportToCalendarDialog } from "@/components/ExportSportToCalendarDialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { CalendarPlus } from "lucide-react";
import { useState } from "react";

export function ExportSportToCalendar({
  sportId,
  className,
}: {
  sportId: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button className={className} onClick={() => setOpen(true)}>
        <CalendarPlus />
        Добавить в календарь
      </Button>
      <ExportSportToCalendarDialog
        open={open}
        setOpen={setOpen}
        sportId={sportId}
      />
    </>
  );
}
