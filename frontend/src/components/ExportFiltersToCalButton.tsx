import type { Filters } from '@/lib/types.ts'
import { ExportFiltersToCalDialog } from '@/components/ExportFiltersToCalDialog'
import { Button } from '@/components/ui/button.tsx'
import { useState } from 'react'
import CalendarPlus from '~icons/lucide/calendar-plus'

interface ExportFiltersToCalButtonProps {
  filters: Filters | undefined
}

export function ExportFiltersToCalButton({ filters }: ExportFiltersToCalButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleOpenDialog = () => setIsDialogOpen(true)
  const handleCloseDialog = () => setIsDialogOpen(false)

  return (
    <>
      <Button
        className="w-full gap-2 transition-all duration-200 hover:opacity-90 focus:ring-2 focus:ring-primary/50 active:scale-[0.98] sm:text-base md:text-lg"
        variant="default"
        onClick={handleOpenDialog}
      >
        <CalendarPlus className="size-4 sm:size-5" />
        <span className="truncate">Экспортировать в календарь</span>
      </Button>

      <ExportFiltersToCalDialog
        open={isDialogOpen}
        setOpen={handleCloseDialog}
        filters={filters}
      />
    </>
  )
}
