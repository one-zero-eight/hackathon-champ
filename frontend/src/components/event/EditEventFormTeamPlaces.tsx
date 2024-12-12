import type { UseFormReturn } from 'react-hook-form'
import type { EventResultsType } from './EditEventForm'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useFieldArray } from 'react-hook-form'
import Plus from '~icons/lucide/plus'
import X from '~icons/lucide/x'
import { EditEventFormTeamMembers } from './EditEventFormTeamMembers'

export function EditEventFormTeamPlaces({
  form,
  className,
  disabled,
}: {
  form: UseFormReturn<EventResultsType>
  className?: string
  disabled?: boolean
}) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'team_places',
  })

  return (
    <div className={cn('flex flex-col gap-2', className, fields.length === 0 && 'do-not-print')}>
      <Label className="text-base font-medium">Места (по командам)</Label>

      <div className="flex flex-col gap-2 rounded-md border bg-neutral-100 p-4 print:border-0 print:bg-transparent print:p-0">
        {fields.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Места не указаны
          </p>
        )}

        <div className="max-h-[500px] overflow-y-auto">
          <div className="flex flex-col gap-2">
            {fields.map((field, index) => (
              <div key={field.id} className="print-no-break space-y-4 rounded-lg border bg-white p-4">
                <div className="flex items-start gap-4">
                  <FormField
                    control={form.control}
                    name={`team_places.${index}.place`}
                    render={({ field }) => (
                      <FormItem className="w-24">
                        <FormLabel>Место</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            {...field}
                            value={field.value ?? ''}
                            onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                            disabled={disabled}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`team_places.${index}.team`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Название команды</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={disabled} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`team_places.${index}.score`}
                    render={({ field }) => (
                      <FormItem className="w-32">
                        <FormLabel>Результат</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            {...field}
                            value={field.value ?? ''}
                            onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                            disabled={disabled}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="do-not-print mt-6"
                    onClick={() => remove(index)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <FormLabel>Участники команды</FormLabel>
                  <EditEventFormTeamMembers form={form} teamIndex={index} disabled={disabled} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator className="do-not-print" />

        <Button
          type="button"
          className="do-not-print"
          disabled={disabled}
          onClick={() => append({
            team: '',
            place: fields.length + 1,
            members: [],
            score: null,
          })}
        >
          <Plus className="mr-2 size-4" />
          Добавить команду
        </Button>
      </div>
    </div>
  )
}
