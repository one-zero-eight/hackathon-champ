import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useCallback, useEffect, useRef, useState } from 'react'

function RotatingLogo() {
  const logoRef = useRef<HTMLImageElement>(null)
  const [rotation, setRotation] = useState(20)
  const frameRef = useRef<number>()

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!logoRef.current)
      return

    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current)
    }

    frameRef.current = requestAnimationFrame(() => {
      const rect = logoRef.current!.getBoundingClientRect()
      const logoX = rect.left + rect.width / 2
      const logoY = rect.top + rect.height / 2

      const deltaX = e.clientX - logoX
      const deltaY = e.clientY - logoY

      const degrees = (Math.atan2(deltaY, deltaX) * 180) / Math.PI + 90
      setRotation(degrees)
    })
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [handleMouseMove])

  return (
    <div className="relative">
      {/* Logo background effect */}
      <div className="absolute -inset-8 rounded-full bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 blur-3xl" />

      {/* Actual logo */}
      <img
        ref={logoRef}
        src="/favicon.png"
        alt="Platform Logo"
        style={{
          transform: `rotate(${rotation - 34}deg)`,
          willChange: 'transform',
        }}
        className="relative size-48 object-contain drop-shadow-2xl"
      />
    </div>
  )
}

function StaticLogo() {
  return (
    <div className="relative">
      {/* Logo background effect */}
      <div className="absolute -inset-8 rounded-full bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 blur-3xl" />
      {/* Actual logo */}
      <img
        src="/favicon.png"
        alt="Platform Logo"
        className="relative size-48 object-contain drop-shadow-2xl"
      />
    </div>
  )
}

export function AuthLayout() {
  return (
    <main className="fixed inset-0 flex min-h-screen bg-white">
      {/* Left panel - Decorative */}
      <div className="hidden w-1/2 bg-gradient-to-br from-violet-50 via-violet-100/50 to-fuchsia-50 lg:block">
        <div className="relative flex h-full flex-col items-center justify-center p-8">
          <div className="absolute inset-0">
            <div className="absolute left-1/4 top-1/4 size-32 rounded-full bg-violet-200/50 blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 size-32 rounded-full bg-fuchsia-200/50 blur-3xl" />
          </div>

          <div className="relative space-y-12 text-center">
            {/* Logo section */}
            <div className="mx-auto flex items-center justify-center">
              {location.pathname === '/auth/login'
                ? (
                    <RotatingLogo />
                  )
                : (
                    <StaticLogo />
                  )}
            </div>

            <div className="space-y-6">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                Платформа ФСП Линк
              </h1>
              <div className="space-y-4">
                <p className="mx-auto max-w-sm text-gray-600">
                  Современное решение для эффективного управления и мониторинга
                  федераций спортивного программирования
                </p>
                <p className="mx-auto max-w-sm text-sm text-gray-500">
                  Аналитика • Мониторинг • Управление
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - Auth form */}
      <div className="relative flex w-full flex-col justify-center bg-white lg:w-1/2">
        <div className="mx-auto w-full max-w-[440px] px-8">
          <Outlet />
        </div>
      </div>
    </main>
  )
}

export const Route = createFileRoute('/auth')({
  component: AuthLayout,
})
