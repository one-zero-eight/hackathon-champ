import type { Filters } from '@/lib/types.ts'
import { ExportFiltersToCalDialog } from '@/components/ExportFiltersToCalDialog'
import { Button } from '@/components/ui/button.tsx'
import { useState } from 'react'
import CalendarPlus from '~icons/lucide/calendar-plus'

export function ExportFiltersToCalButton({
  filters,
}: {
  filters: Filters | undefined
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button className="w-full" variant="default" onClick={() => setOpen(true)}>
        <CalendarPlus />
        Экспортировать подборку в календарь
      </Button>
      <ExportFiltersToCalDialog
        open={open}
        setOpen={setOpen}
        filters={filters}
      />
    </>
  )
}
