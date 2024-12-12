import type { UseFormReturn } from 'react-hook-form'
import type { EventGeneralInfoType } from './EditEventForm'
import { DatePicker } from '@/components/filters/DatesFilter'
import { FormControl, FormField, FormFieldMessage, FormItem } from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Temporal } from 'temporal-polyfill'

export function EditEventFormDatesField({
  form,
  className,
}: {
  form: UseFormReturn<EventGeneralInfoType>
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
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
