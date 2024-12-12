import type { UseFormReturn } from 'react-hook-form'
import type { EventGeneralInfoType } from './EditEventForm'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'

export function EditEventFormDescriptionField({
  form,
  className,
}: {
  form: UseFormReturn<EventGeneralInfoType>
  className?: string
}) {
  return (
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem className={className}>
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
