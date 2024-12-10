import type { SchemaMinMaxFilter } from '@/api/types'
import type { FilterBaseProps } from './common'
import { Input } from '@/components/ui/input.tsx'
import { BaseFilter } from './BaseFilter'

export function MinMaxFilter(
  props: FilterBaseProps<SchemaMinMaxFilter | null | undefined>,
) {
  const { disabled, value, onChange, ...rest } = props

  const handleMinChange = (v: number | null) => {
    onChange({
      ...value,
      min: v == null
        ? null
        : Math.min(Math.max(v, 0), value?.max || Infinity),
    })
  }
  const handleMaxChange = (v: number | null) => {
    onChange({
      ...value,
      max: v == null
        ? null
        : Math.max(Math.min(v, 1000000), value?.min || 0),
    })
  }

  return (
    <BaseFilter {...rest}>
      <div className="flex items-center gap-2">
        <Input
          disabled={disabled}
          type="number"
          min={0}
          value={value?.min ?? ''}
          onChange={(e) => {
            const int = e.target.value
              ? Number.parseInt(e.target.value)
              : null
            handleMinChange(Number.isNaN(int) ? null : int)
          }}
          placeholder="от"
          className="w-fit max-w-[90px]"
        />
        —
        <Input
          disabled={disabled}
          type="number"
          min={0}
          value={value?.max ?? ''}
          onChange={(e) => {
            const int = e.target.value
              ? Number.parseInt(e.target.value)
              : null
            handleMaxChange(Number.isNaN(int) ? null : int)
          }}
          placeholder="до"
          className="w-fit max-w-[90px]"
        />
      </div>
    </BaseFilter>
  )
}
