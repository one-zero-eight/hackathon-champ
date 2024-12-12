import type { SchemaParticipantRef } from '@/api/types'
import type { UseFormReturn } from 'react-hook-form'
import type { EventResultsType } from './EditEventForm'
import { AddParticipantButton } from '@/components/event/AddParticipantButton'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form'
import { useCallback } from 'react'
import { useFieldArray } from 'react-hook-form'
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

  const handleAdd = useCallback((participant: SchemaParticipantRef) => {
    append({ id: participant.id ?? null, name: participant.name })
  }, [append])

  const handleRemove = useCallback((index: number) => {
    remove(index)
  }, [remove])

  return (
    <div className="space-y-2 print:flex print:flex-wrap print:items-start print:gap-2 print:space-y-0">
      {fields.map(({ id }, memberIndex) => (
        <div key={id} className="flex items-center gap-2 rounded-md border py-2 pl-4 pr-2 print:pl-2">
          <FormField
            control={form.control}
            name={`team_places.${teamIndex}.members.${memberIndex}`}
            render={({ field }) => (<span className="flex-1">{field.value.name}</span>)}
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
  )
}
