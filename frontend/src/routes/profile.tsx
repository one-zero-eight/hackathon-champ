import { useMe } from '@/api/me.ts'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: me } = useMe()

  return (
    <div className="flex justify-center p-4">
      <div className="flex max-w-4xl flex-col gap-2">
        <h1 className="text-2xl font-bold">
          Профиль -
          {me?.login}
        </h1>
      </div>
    </div>
  )
}
