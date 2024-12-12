import type { UseFormReturn } from 'react-hook-form'
import type { EventGeneralInfoType } from './EditEventForm'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

export function EditEventFormParticipantCountField({
  form,
  className,
}: {
  form: UseFormReturn<EventGeneralInfoType>
  className?: string
}) {
  return (
    <FormField
      control={form.control}
      name="participant_count"
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className="text-base">
            Количество участников
          </FormLabel>
          <FormControl>
            <Input
              placeholder="Введите количество участников"
              type="number"
              {...field}
              value={field.value ?? ''}
              onChange={e =>
                field.onChange(
                  e.target.value ? Number(e.target.value) : null,
                )}
              className="h-11"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
