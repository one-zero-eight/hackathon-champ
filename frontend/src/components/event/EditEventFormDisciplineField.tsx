import type { UseFormReturn } from 'react-hook-form'
import type { EventGeneralInfoType } from './EditEventForm'
import { DisciplineFilter } from '../filters/DisciplineFilter'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'

export function EditEventFormDisciplineField({
  form,
  className,
}: {
  form: UseFormReturn<EventGeneralInfoType>
  className?: string
}) {
  return (
    <FormField
      control={form.control}
      name="discipline"
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className="text-base">Дисциплины</FormLabel>
          <FormControl>
            <DisciplineFilter
              value={field.value}
              onChange={field.onChange}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
