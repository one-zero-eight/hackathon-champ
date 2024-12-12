import type { SchemaResults } from '@/api/types'
import { apiFetch } from '@/api'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import MagicWand from '~icons/ph/magic-wand'
import { Button } from '../ui/button'

export function EventSuggestResultsButton({
  className,
  onSuggestStart,
  onSuggestSettled,
  disabled,
}: {
  className?: string
  onSuggestStart?: () => void
  onSuggestSettled?: (result: { ok: true, results: SchemaResults } | { ok: false, error: unknown }) => void
  disabled?: boolean
}) {
  const [isSuggesting, setIsSuggesting] = useState(false)
  const { getRootProps, getInputProps, open } = useDropzone({
    disabled: isSuggesting || disabled,
    noDrag: true,
    noClick: true,
    onDrop: (files) => {
      if (isSuggesting)
        return

      onSuggestStart?.()
      setIsSuggesting(true)

      const file = files[0]
      const formData = new FormData()
      formData.append('file', file)

      ;(async () => {
        try {
          const result = await apiFetch.POST('/events/hint-results', {
            // @ts-expect-error Incorrect OpenAPI type for file uploads.
            body: formData,
          })

          if (result.data) {
            onSuggestSettled?.({ ok: true, results: result.data })
          }
          else {
            onSuggestSettled?.({ ok: false, error: result.error })
          }
        }
        catch (error) {
          onSuggestSettled?.({ ok: false, error })
        }
        finally {
          setIsSuggesting(false)
        }
      })()
    },
    accept: {
      // Support CSV, Excel, PDF, ODF
      'application/pdf': ['.pdf'],
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.oasis.opendocument.spreadsheet': ['.ods'],
    },
  })

  return (
    <Button
      {...getRootProps({
        className: cn(className),
      })}
      disabled={isSuggesting || disabled}
      onClick={open}
      type="button"
    >
      <MagicWand />
      {isSuggesting ? 'Загружаем...' : 'Загрузить из файла'}
      <input {...getInputProps()} />
    </Button>
  )
}
