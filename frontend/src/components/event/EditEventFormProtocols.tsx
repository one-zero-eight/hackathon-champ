import type { DropzoneOptions } from 'react-dropzone'
import type { UseFormReturn } from 'react-hook-form'
import type { EventResultsType } from './EditEventForm'
import { Button } from '@/components/ui/button'
import { FormField, FormItem } from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { cn, getProtocolLabel, getProtocolUrl } from '@/lib/utils'
import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Download from '~icons/lucide/download'
import Plus from '~icons/lucide/plus'
import Trash from '~icons/lucide/trash'
import { Separator } from '../ui/separator'

interface EditEventFormProtocolsProps {
  form: UseFormReturn<EventResultsType>
  onDrop: DropzoneOptions['onDrop']
  className?: string
}

export function EditEventFormProtocols({ form, onDrop, className }: EditEventFormProtocolsProps) {
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    maxSize: 50 * 1024 * 1024, // 50 MB
    multiple: true,
    noClick: true,
  })

  const protocols = form.watch('protocols')
  const handleDeleteProtocol = useCallback((index: number) => {
    form.setValue(
      'protocols',
      protocols.filter((_, i) => i !== index),
      { shouldDirty: true },
    )
  }, [form, protocols])

  return (
    <FormField
      control={form.control}
      name="protocols"
      render={({ field }) => (
        <FormItem className={cn('do-not-print flex flex-col gap-2', className)}>
          <Label className="text-base font-medium" htmlFor="event-protocols">
            Протоколы
          </Label>

          <div
            className="relative rounded-md border bg-neutral-100 p-4"
            {...getRootProps()}
            onClick={(e) => {
              if (field.value.length === 0) {
                e.preventDefault()
                e.stopPropagation()
                open()
              }
            }}
          >
            <input {...getInputProps({ id: 'event-protocols' })} />

            {isDragActive && (
              <div className="absolute inset-0 z-[1] flex flex-col items-center justify-center gap-2 bg-neutral-100 text-muted-foreground">
                <Download className="size-10 animate-bounce" />
                <p className="text-sm">
                  Перетащите файлы сюда или нажмите для выбора
                </p>
              </div>
            )}

            {field.value.length === 0
              ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    Перетащите файлы сюда или нажмите для выбора
                  </p>
                )
              : (
                  <div className="flex flex-col gap-2">
                    <ul className="flex flex-col gap-2">
                      {field.value.map((protocol, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="grow rounded-md border bg-white px-4 py-2">
                            {getProtocolLabel(protocol)}
                          </span>

                          <Button
                            asChild
                            variant="outline"
                            size="icon"
                          >
                            <a
                              href={getProtocolUrl(protocol)}
                              target="_blank"
                            >
                              <Download />
                            </a>
                          </Button>

                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleDeleteProtocol(index)
                            }}
                          >
                            <Trash />
                          </Button>
                        </li>
                      ))}
                    </ul>
                    <Separator />
                    <Button
                      type="button"
                      onClick={open}
                    >
                      <Plus />
                      Загрузить файл
                    </Button>
                  </div>
                )}
          </div>

          <p className="text-sm text-muted-foreground">
            Загрузите протоколы с результатами прошедшего соревнования
          </p>
        </FormItem>
      )}
    />
  )
}
