import type { UseFormReturn } from 'react-hook-form'
import type { EditEventFormType } from './EditEventForm'
import { DisciplineFilter } from '../filters/DisciplineFilter'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'

export function EditEventFormDisciplineField({ form }: { form: UseFormReturn<EditEventFormType> }) {
  return (
    <FormField
      control={form.control}
      name="discipline"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-base">Дисциплина</FormLabel>
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
