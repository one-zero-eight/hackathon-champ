import type { UseFormReturn } from 'react-hook-form'
import type { EditEventFormType } from './EditEventForm'
import { GenderSelect } from '../filters/GenderSelect'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'

export function EditEventFormGenderField({ form }: { form: UseFormReturn<EditEventFormType> }) {
  return (
    <FormField
      control={form.control}
      name="gender"
      render={({ field }) => (
        <FormItem>
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
