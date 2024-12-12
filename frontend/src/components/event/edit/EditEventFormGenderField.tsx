import type { UseFormReturn } from 'react-hook-form'
import type { EventGeneralInfoType } from './EditEventForm'
import { GenderSelect } from '@/components/filters/GenderSelect'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

export function EditEventFormGenderField({
  form,
  className,
}: {
  form: UseFormReturn<EventGeneralInfoType>
  className?: string
},
) {
  return (
    <FormField
      control={form.control}
      name="gender"
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className="text-base">Пол</FormLabel>
          <FormControl>
            <GenderSelect
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
