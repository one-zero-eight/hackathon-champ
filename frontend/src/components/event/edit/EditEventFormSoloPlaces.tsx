import type { UseFormReturn } from 'react-hook-form'
import type { EventResultsType } from './EditEventForm'
import { AddParticipantButton } from '@/components/event/AddParticipantButton'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useFieldArray } from 'react-hook-form'
import X from '~icons/lucide/x'

export function EditEventFormSoloPlaces({
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
    name: 'solo_places',
  })

  return (
    <div className={cn('flex flex-col gap-2', className, fields.length === 0 && 'do-not-print')}>
      <Label className="text-base font-medium">Места (индивидуальные)</Label>

      <div className="flex flex-col gap-2 rounded-md border bg-neutral-100 p-4 print:border-0 print:bg-transparent print:p-0">
        {fields.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Места не указаны
          </p>
        )}

        <div className="max-h-[500px] overflow-y-auto">
          <div className="flex flex-col gap-2">
            {fields.map((field, index) => (
              <div key={field.id} className="print-no-break flex items-start gap-4 rounded-lg border bg-white p-4">
                <FormField
                  control={form.control}
                  name={`solo_places.${index}.place`}
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
                  name={`solo_places.${index}.participant.name`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Имя участника</FormLabel>
                      <div className="flex-1 rounded-md p-2">
                        <span>{field.value}</span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`solo_places.${index}.score`}
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
                  disabled={disabled}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <Separator className="do-not-print" />

        <AddParticipantButton
          onAdd={(participant) => {
            append({
              participant: {
                id: participant.id ?? null,
                name: participant.name,
              },
              place: fields.length + 1,
              score: null,
            })
          }}
          disabled={disabled}
          className="do-not-print"
        />
      </div>
    </div>
  )
}
