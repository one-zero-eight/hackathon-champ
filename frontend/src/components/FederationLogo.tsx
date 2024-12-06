import { cn } from '@/lib/utils'
import { useState } from 'react'

import Building from '~icons/lucide/building'

export function FederationLogo({
  logoUrl,
  alt,
  size,
}: {
  logoUrl?: string | undefined | null
  alt: string
  size: 'card' | 'federation'
}) {
  const [isError, setIsError] = useState(false)

  return (
    <div className={cn(
      'relative flex items-center justify-center overflow-hidden bg-[#1B1C21]',
      size === 'card' && 'size-12 rounded-md',
      size === 'federation' && 'size-[128px] rounded-lg',
    )}
    >
      {(!logoUrl || isError)
        ? (
            <Building className="size-1/2 text-muted-foreground" />
          )
        : (
            <>
              <img
                src={logoUrl}
                alt={alt}
                className="size-full translate-y-[5%]"
                onError={() => setIsError(true)}
              />
              {/* Hack to hide text at bottom. */}
              <span className="absolute inset-x-0 bottom-0 h-[12.5%] bg-[#1B1C21]" />
            </>
          )}
    </div>
  )
}
