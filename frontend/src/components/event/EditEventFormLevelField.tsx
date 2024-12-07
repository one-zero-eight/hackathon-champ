import type { UseFormReturn } from 'react-hook-form'
import type { EventGeneralInfoType } from './EditEventForm'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'

type Level = 'local' | 'regional' | 'interregional' | 'federal' | 'international'
const LEVELS: Record<Level, string> = {
  local: 'Местный',
  regional: 'Региональный',
  interregional: 'Межрегиональный',
  federal: 'Федеральный',
  international: 'Международный',
}

export function EditEventFormLevelField({
  form,
  className,
}: {
  form: UseFormReturn<EventGeneralInfoType>
  className?: string
}) {
  return (
    <FormField
      control={form.control}
      name="level"
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className="text-base">Уровень мероприятия</FormLabel>
          <FormControl>
            <Select
              value={field.value ?? ''}
              onValueChange={(e) => {
                console.log(e)
                field.onChange(e)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите уровень" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {Object.entries(LEVELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
