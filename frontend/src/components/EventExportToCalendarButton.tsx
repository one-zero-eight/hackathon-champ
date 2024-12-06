import { apiTypes } from "@/api";
import { ExportFiltersToCalendarDialog } from "@/components/ExportFiltersToCalendarDialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Filters } from "@/lib/types.ts";
import { CalendarPlus } from "lucide-react";
import { useState } from "react";

export function EventExportToCalendarButton({
  event,
}: {
  event: apiTypes.SchemaEventOutput;
}) {
  const [open, setOpen] = useState(false);

  const filters: Filters = {
    by_ids: [event.id],
  };

  return (
    <>
      <Button
        className="h-7 w-fit rounded-md px-2"
        variant="secondary"
        onClick={() => setOpen(true)}
      >
        <CalendarPlus />
        Экспорт в календарь
      </Button>
      <ExportFiltersToCalendarDialog
        open={open}
        setOpen={setOpen}
        filters={filters}
      />
    </>
  );
}
