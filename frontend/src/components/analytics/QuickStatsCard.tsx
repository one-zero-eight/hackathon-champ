import { cn } from '@/lib/utils'
import { Card, CardContent } from '../ui/card'
import { Skeleton } from '../ui/skeleton'

export function QuickStatsCard({
  title,
  icon: Icon,
  value,
  secondaryValue,
  color,
  secondaryText,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  value?: number | string | undefined | null
  secondaryValue?: number | string | undefined | null
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
  secondaryText?: string | undefined | null
}) {
  return (
    <Card>
      <CardContent className="flex h-full flex-col p-4">
        <p className="mb-2 text-sm font-medium text-gray-500">
          {title}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">
            {value ?? (<Skeleton className="mr-2 h-8 w-12" />)}
          </span>
          <Icon className={cn(
            'size-8',
            color === 'blue' && 'text-blue-500',
            color === 'green' && 'text-green-500',
            color === 'yellow' && 'text-yellow-500',
            color === 'red' && 'text-red-500',
            color === 'purple' && 'text-purple-500',
          )}
          />
        </div>
        {secondaryText && (
          <>
            <span className="mb-4 w-full"></span>
            <div className="mt-auto flex items-center text-sm text-gray-500">
              {secondaryValue === null ? (<Skeleton className="mr-2 size-6" />) : secondaryValue}
              {' '}
              {secondaryText}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
