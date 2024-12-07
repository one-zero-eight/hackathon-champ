import type { UseFormReturn } from 'react-hook-form'
import type { EditEventFormType } from './EditEventForm'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'

export function EditEventFormEkpIdField({ form }: { form: UseFormReturn<EditEventFormType> }) {
  return (
    <FormField
      control={form.control}
      name="ekp_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-base">Номер ЕКП</FormLabel>
          <FormControl>
            <Input
              placeholder="Введите номер в ЕКП"
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
