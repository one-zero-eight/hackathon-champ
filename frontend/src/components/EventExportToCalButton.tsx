import type { Event, Filters } from '@/lib/types.ts'
import { ExportFiltersToCalDialog } from '@/components/ExportFiltersToCalDialog'
import { Button } from '@/components/ui/button.tsx'
import { useState } from 'react'
import CalendarPlus from '~icons/lucide/calendar-plus'

export function EventExportToCalButton({
  event,
}: {
  event: Event
}) {
  const [open, setOpen] = useState(false)
  const filters: Filters = {
    by_ids: [event.id],
  }
  return (
    <>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => setOpen(true)}
      >
        <CalendarPlus />
        Экспорт в календарь
      </Button>
      <ExportFiltersToCalDialog
        open={open}
        setOpen={setOpen}
        filters={filters}
      />
    </>
  )
}
