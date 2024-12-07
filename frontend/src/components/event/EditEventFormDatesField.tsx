import type { UseFormReturn } from 'react-hook-form'
import type { EditEventFormType } from './EditEventForm'
import { Temporal } from 'temporal-polyfill'
import { DatePicker } from '../filters/DatesFilter'
import { FormControl, FormField, FormFieldMessage, FormItem } from '../ui/form'
import { Label } from '../ui/label'

export function EditEventFormDatesField({ form }: { form: UseFormReturn<EditEventFormType> }) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-base font-medium">
        Даты проведения
      </Label>
      <div className="flex items-center gap-2">
        <FormField
          control={form.control}
          name="start_date"
          render={({ field: { ref, ...field } }) => (
            <FormItem>
              <FormControl>
                <DatePicker
                  {...field}
                  value={field.value ? Temporal.PlainDate.from(field.value.split('T')[0]) : null}
                  onChange={v => field.onChange(v ? v.toString() : null)}
                  placeholder="Начало"
                  className="h-11 max-w-[150px] flex-1 basis-0"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <span>—</span>
        <FormField
          control={form.control}
          name="end_date"
          render={({ field: { ref, ...field } }) => (
            <FormItem>
              <FormControl>
                <DatePicker
                  {...field}
                  value={field.value ? Temporal.PlainDate.from(field.value.split('T')[0]) : null}
                  onChange={v => field.onChange(v ? v.toString() : null)}
                  placeholder="Конец"
                  className="h-11 max-w-[150px] flex-1 basis-0"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormFieldMessage name="start_date" />
        <FormFieldMessage name="end_date" />
      </div>
    </div>
  )
}
