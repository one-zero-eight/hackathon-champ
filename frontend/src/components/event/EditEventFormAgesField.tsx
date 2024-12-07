import type { UseFormReturn } from 'react-hook-form'
import type { EditEventFormType } from './EditEventForm'
import { FormControl, FormField, FormFieldMessage, FormItem } from '../ui/form'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

export function EditEventFormAgesField({
  form,
}: {
  form: UseFormReturn<EditEventFormType>
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-base font-medium">Возраст</Label>
      <div className="flex items-center gap-2">
        <FormField
          control={form.control}
          name="age_min"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="От"
                  type="number"
                  min={0}
                  {...field}
                  value={field.value ?? ''}
                  onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <span>—</span>
        <FormField
          control={form.control}
          name="age_max"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="До"
                  type="number"
                  min={1}
                  {...field}
                  value={field.value ?? ''}
                  onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
      <div>
        <FormFieldMessage name="age_min" />
        <FormFieldMessage name="age_max" />
      </div>
    </div>
  )
}
