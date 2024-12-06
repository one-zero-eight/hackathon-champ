import { cn } from '@/lib/utils'
import { Link } from '@tanstack/react-router'
import { Button } from './ui/button'

export function NavLink({
  to,
  children,
  className,
  icon: Icon,
}: {
  to: string
  children: React.ReactNode
  className?: string
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <Button
      asChild
      variant="ghost"
      className={cn('flex items-center gap-2 justify-start', className)}
    >
      <Link
        to={to}
        activeProps={{ className: 'text-purple-700 bg-accent' }}
      >
        {Icon && <Icon className="size-5" />}
        {children}
      </Link>
    </Button>
  )
}
