import type { Filters } from '@/lib/types'
import type { FilterBaseProps } from './common'
import { Button } from '@/components/ui/button.tsx'
import { cn } from '@/lib/utils.ts'
import { BaseFilter } from './BaseFilter'

export function GenderSelect(props: FilterBaseProps<Filters['gender']>) {
  const { disabled, value, onChange, ...rest } = props

  return (
    <BaseFilter {...rest}>
      <div className="flex">
        <Button
          type="button"
          disabled={disabled}
          variant="outline"
          className={cn(
            'rounded-r-none border-r-0',
            value == null
            && 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
          )}
          onClick={() => onChange(null)}
        >
          любой
        </Button>
        <Button
          type="button"
          disabled={disabled}
          variant="outline"
          className={cn(
            'rounded-none',
            value === 'male'
            && 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
          )}
          onClick={() => onChange('male')}
        >
          муж
        </Button>
        <Button
          type="button"
          disabled={disabled}
          variant="outline"
          className={cn(
            'rounded-l-none border-l-0',
            value === 'female'
            && 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
          )}
          onClick={() => onChange('female')}
        >
          жен
        </Button>
      </div>
    </BaseFilter>
  )
}
