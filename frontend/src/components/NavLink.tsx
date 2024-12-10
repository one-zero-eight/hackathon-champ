import { cn } from '@/lib/utils'
import { Link } from '@tanstack/react-router'
import { Button } from './ui/button'

export function NavLink({
  to,
  params,
  children,
  className,
  icon: Icon,
}: {
  to: string
  params?: any
  children: React.ReactNode
  className?: string
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <Button
      asChild
      variant="ghost"
      className={cn('flex items-center gap-2 justify-start hover:text-purple-700', className)}
    >
      <Link
        to={to}
        params={params}
        activeProps={{ className: 'text-purple-700 bg-accent' }}
      >
        {Icon && <Icon className="size-5" />}
        {children}
      </Link>
    </Button>
  )
}
