import type { SchemaParticipant, SchemaParticipantRef } from '@/api/types'
import type { UseFormReturn } from 'react-hook-form'
import type { EventResultsType } from './EditEventForm'
import { AddParticipantButton } from '@/components/event/AddParticipantButton'
import { CreateParticipantDialog } from '@/components/participants/CreateParticipantDialog'
import { Button } from '@/components/ui/button'
import { FormControl, FormField } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useCallback, useState } from 'react'
import { useFieldArray } from 'react-hook-form'
import BadgeCheck from '~icons/lucide/badge-check'
import Plus from '~icons/lucide/plus'
import X from '~icons/lucide/x'

export function EditEventFormTeamMembers({
  form,
  teamIndex,
  disabled,
}: {
  form: UseFormReturn<EventResultsType>
  teamIndex: number
  disabled?: boolean
}) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `team_places.${teamIndex}.members`,
  })

  const [newParticipant, setNewParticipant] = useState<{ data: SchemaParticipantRef, index: number } | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogKey, setDialogKey] = useState(0)

  const handleCreateParticipant = useCallback((
    participant: SchemaParticipantRef,
    index: number,
  ) => {
    setNewParticipant({ data: participant, index })
    setDialogOpen(true)
    setDialogKey(prev => prev + 1)
  }, [])

  const onParticipantCreated = useCallback((created: SchemaParticipant) => {
    if (newParticipant != null) {
      form.setValue(`team_places.${teamIndex}.members.${newParticipant.index}`, {
        id: created.id,
        name: created.name,
      })
    }
    setNewParticipant(null)
    setDialogOpen(false)
  }, [form, newParticipant, teamIndex])

  const handleAdd = useCallback((participant: SchemaParticipantRef) => {
    append({ id: participant.id ?? null, name: participant.name })
  }, [append])

  const handleRemove = useCallback((index: number) => {
    remove(index)
  }, [remove])

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

      <div className="print:flex print:flex-wrap print:items-start print:gap-2">
        {fields.map(({ id }, memberIndex) => (
          <div key={id} className="flex items-center gap-2 py-2 [&:not(:last-of-type)]:border-b">
            <FormField
              control={form.control}
              name={`team_places.${teamIndex}.members.${memberIndex}`}
              render={({ field }) => (
                <div className="flex flex-1 items-center gap-2">
                  {field.value.id != null
                    ? (
                        <div className="flex items-center gap-1">
                          <span className="flex-1">{field.value.name}</span>
                          <BadgeCheck className="text-green-600" />
                        </div>
                      )
                    : (
                        <>
                          <FormControl>
                            <Input
                              value={field.value.name}
                              onChange={e => field.onChange({
                                ...field.value,
                                name: e.target.value,
                              })}
                              disabled={disabled}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="do-not-print flex-shrink-0"
                            disabled={disabled}
                            onClick={() => handleCreateParticipant(field.value, memberIndex)}
                          >
                            <Plus className="size-4" />
                          </Button>
                        </>
                      )}
                </div>
              )}
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="do-not-print"
              onClick={() => handleRemove(memberIndex)}
              disabled={disabled}
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}

        <AddParticipantButton
          onAdd={handleAdd}
          disabled={disabled}
          className="do-not-print w-full"
          variant="outline"
        />
      </div>
    </>
  )
}
