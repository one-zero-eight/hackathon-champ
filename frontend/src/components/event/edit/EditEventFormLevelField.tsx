import type { UseFormReturn } from 'react-hook-form'
import type { EventGeneralInfoType } from './EditEventForm'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx'

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
              onValueChange={field.onChange}
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
