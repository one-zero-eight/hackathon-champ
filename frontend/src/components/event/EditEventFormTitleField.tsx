import type { UseFormReturn } from 'react-hook-form'
import type { EditEventFormType } from './EditEventForm'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'

export function EditEventFormTitleField({ form }: { form: UseFormReturn<EditEventFormType> }) {
  return (
    <FormField
      control={form.control}
      name="title"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-base">Название</FormLabel>
          <FormControl>
            <Input
              placeholder="Введите название мероприятия"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
