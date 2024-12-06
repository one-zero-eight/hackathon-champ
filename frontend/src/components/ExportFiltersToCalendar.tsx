import { ExportFiltersToCalendarDialog } from "@/components/ExportFiltersToCalendarDialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Filters } from "@/lib/types.ts";
import { CalendarPlus } from "lucide-react";
import { useState } from "react";

export function ExportFiltersToCalendar({
  filters,
}: {
  filters: Filters | undefined;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button className="w-full" onClick={() => setOpen(true)}>
        <CalendarPlus />
        Экспортировать подборку в календарь
      </Button>
      <ExportFiltersToCalendarDialog
        open={open}
        setOpen={setOpen}
        filters={filters}
      />
    </>
  );
}
