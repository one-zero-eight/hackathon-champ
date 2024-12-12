import type { SchemaParticipantRef } from '@/api/types'
import type { ButtonProps } from '../ui/button'
import { $api } from '@/api'
import { useEffect, useState } from 'react'
import Plus from '~icons/lucide/plus'
import { Button } from '../ui/button'
import { Command, CommandInput, CommandItem, CommandList } from '../ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'

export function AddParticipantButton({
  onAdd,
  disabled,
  className,
  variant,
}: {
  onAdd?: (participant: SchemaParticipantRef) => void
  disabled?: boolean
  className?: string
  variant?: ButtonProps['variant']
}) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const {
    data: suggested,
    isPending: suggestedLoading,
  } = $api.useQuery('get', '/participants/person/hint', {
    params: { query: { name: inputValue } },
  })

  useEffect(() => {
    if (!open) {
      setInputValue('')
    }
  }, [open])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          role="combobox"
          aria-expanded={open}
          className={className}
          disabled={disabled}
        >
          <Plus className="mr-2 size-4" />
          Добавить участника
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="ФИО участника..."
            value={inputValue}
            onValueChange={setInputValue}
            disabled={disabled}
          />
          <CommandList>
            {inputValue.trim().length > 0 && (
              <CommandItem
                onSelect={() => {
                  onAdd?.({ id: null, name: inputValue })
                  setOpen(false)
                }}
              >
                <span>
                  {`Добавить: "${inputValue}"`}
                </span>
              </CommandItem>
            )}

            {suggestedLoading
              ? ('Загрузка...')
              : (
                  suggested?.map(participant => (
                    <CommandItem
                      key={participant.id}
                      value={participant.id}
                      onSelect={() => {
                        onAdd?.(participant)
                        setOpen(false)
                      }}
                    >
                      {participant.name}
                    </CommandItem>
                  ))
                )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
