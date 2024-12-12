import type { UseFormReturn } from 'react-hook-form'
import type { EventResultsType } from './EditEventForm'
import { useCallback } from 'react'
import { useFieldArray } from 'react-hook-form'
import Plus from '~icons/lucide/plus'
import X from '~icons/lucide/x'
import { Button } from '../ui/button'
import { FormControl, FormField, FormItem, FormMessage } from '../ui/form'
import { Input } from '../ui/input'

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

  const handleAdd = useCallback(() => {
    append({ id: null, name: '' })
  }, [append])

  const handleRemove = useCallback((index: number) => {
    remove(index)
  }, [remove])

  return (
    <div className="space-y-2 print:flex print:items-start print:gap-2 print:space-y-0">
      {fields.map(({ id }, memberIndex) => (
        <div key={id} className="flex gap-2">
          <FormField
            control={form.control}
            name={`team_places.${teamIndex}.members.${memberIndex}.name`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Имя участника"
                    value={field.value as string}
                    disabled={disabled}
                    onChange={(e) => {
                      field.onChange(e.target.value)
                    }}
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
            className="do-not-print"
            onClick={() => handleRemove(memberIndex)}
            disabled={disabled}
          >
            <X className="size-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        className="do-not-print w-full"
        onClick={handleAdd}
        disabled={disabled}
      >
        <Plus className="mr-2 size-4" />
        Добавить участника
      </Button>
    </div>
  )
}
