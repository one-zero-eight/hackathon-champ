import type { SchemaParticipant, SchemaParticipantRef } from '@/api/types'
import type { UseFormReturn } from 'react-hook-form'
import type { EventResultsType } from './EditEventForm'
import { AddParticipantButton } from '@/components/event/AddParticipantButton'
import { CreateParticipantDialog } from '@/components/participants/CreateParticipantDialog'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useFieldArray } from 'react-hook-form'
import BadgeCheck from '~icons/lucide/badge-check'
import Plus from '~icons/lucide/plus'
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
  const [newParticipant, setNewParticipant] = useState<{ data: SchemaParticipantRef, index: number } | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogKey, setDialogKey] = useState(0)

  const handleCreateParticipant = (
    participant: SchemaParticipantRef,
    index: number,
  ) => {
    setNewParticipant({ data: participant, index })
    setDialogOpen(true)
    setDialogKey(prev => prev + 1)
  }

  const onParticipantCreated = (created: SchemaParticipant) => {
    if (newParticipant != null) {
      form.setValue(`solo_places.${newParticipant.index}.participant`, {
        id: created.id,
        name: created.name,
      })
    }
    setNewParticipant(null)
    setDialogOpen(false)
  }

  return (
    <>
      <CreateParticipantDialog
        key={dialogKey}
        open={dialogOpen && newParticipant != null}
        setOpen={setDialogOpen}
        initialData={{
          name: newParticipant?.data.name || '',
        }}
        onParticipantCreated={onParticipantCreated}
      />

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
                      <FormItem className="w-[70px]">
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
                    name={`solo_places.${index}.participant`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="inline-flex items-center gap-1">
                          <span>Участник</span>
                          {field.value?.id != null && <BadgeCheck className="text-green-600" />}
                        </FormLabel>

                        <div className="flex gap-2">
                          {field.value?.id != null
                            ? (
                                <p className="h-10 leading-10">
                                  {field.value.name}
                                </p>
                              )
                            : (
                                <FormControl>
                                  <Input
                                    {...field}
                                    value={field.value?.name ?? ''}
                                    onChange={e => field.onChange({
                                      ...field.value,
                                      name: e.target.value,
                                    })}
                                    disabled={disabled}
                                  />
                                </FormControl>
                              )}
                          {field.value?.id == null && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="do-not-print flex-shrink-0"
                              disabled={disabled}
                              onClick={() => handleCreateParticipant(field.value, index)}
                            >
                              <Plus className="size-4" />
                            </Button>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`solo_places.${index}.score`}
                    render={({ field }) => (
                      <FormItem className="w-[100px]">
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
                    className="do-not-print mt-6 self-end"
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
    </>
  )
}
