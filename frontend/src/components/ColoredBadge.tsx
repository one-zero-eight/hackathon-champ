import { cn } from '@/lib/utils'
import { Badge } from './ui/badge'

export function ColoredBadge({
  color,
  children,
  className,
}: {
  color: 'gray' | 'blue' | 'green' | 'red'
  children: React.ReactNode
  className?: string
}) {
  return (
    <Badge
      className={cn(
        'font-medium',
        color === 'gray' && 'bg-stone-100 text-stone-700 hover:bg-stone-100',
        color === 'blue' && 'bg-blue-100 text-blue-700 hover:bg-blue-100',
        color === 'green' && 'bg-green-100 text-green-700 hover:bg-green-100',
        color === 'red' && 'bg-red-100 text-red-700 hover:bg-red-100',
        className,
      )}
      variant="secondary"
    >
      {children}
    </Badge>
  )
}
