import type { UseFormReturn } from 'react-hook-form'
import type { EditEventFormType } from './EditEventForm'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Textarea } from '../ui/textarea'

export function EditEventFormDescriptionField({ form }: { form: UseFormReturn<EditEventFormType> }) {
  return (
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-base">Описание</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Введите описание мероприятия"
              className="min-h-[120px] resize-y"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
