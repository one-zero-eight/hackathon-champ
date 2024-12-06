import { $api } from '@/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo } from 'react'

export const Route = createFileRoute('/manage/analytics/$id')({
  component: RouteComponent,
  parseParams: params => ({
    id: params.id,
  }),
})

function RouteComponent() {
  const { id } = Route.useParams()

  // Get federation data
  const { data: federation, isPending: federationLoading } = $api.useQuery(
    'get',
    '/federations/{id}',
    {
      params: {
        path: { id },
      },
    },
  )

  // Get federation's events
  const { data: eventsData, isPending: eventsLoading } = $api.useQuery(
    'get',
    '/events/',
  )

  const isLoading = federationLoading || eventsLoading
  const events = useMemo(
    () => eventsData?.filter(event => event.host_federation === id) ?? [],
    [eventsData, id],
  )

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-2 h-4 w-96" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!federation) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold">Федерация не найдена</h2>
        <p className="text-muted-foreground">
          Не удалось загрузить данные федерации
        </p>
        <Button asChild variant="outline">
          <Link to="/manage/analytics">
            Вернуться к списку
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{federation.region}</h1>
        <p className="text-muted-foreground">
          {federation.district ?? 'Федеральный округ не указан'}
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">Статус</h3>
              <p className="text-muted-foreground">{federation.status}</p>
            </div>
            <div>
              <h3 className="font-medium">Руководитель</h3>
              <p className="text-muted-foreground">{federation.head ?? 'Не указан'}</p>
            </div>
            <div>
              <h3 className="font-medium">Контакты</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>
                  Email:
                  {federation.email ?? 'Не указан'}
                </p>
                <p>
                  Телефон:
                  {federation.phone ?? 'Не указан'}
                </p>
                <p>
                  Сайт:
                  {federation.site ?? 'Не указан'}
                </p>
                <p>
                  Telegram:
                  {federation.telegram ?? 'Не указан'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Статистика мероприятий</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Всего мероприятий</h3>
                <p className="text-2xl font-bold">{events.length}</p>
              </div>
              <div>
                <h3 className="font-medium">По статусам</h3>
                <div className="space-y-2">
                  {Object.entries(
                    events.reduce((acc, event) => {
                      acc[event.status] = (acc[event.status] || 0) + 1
                      return acc
                    }, {} as Record<string, number>),
                  ).map(([status, count]) => (
                    <div key={status} className="flex justify-between">
                      <span className="text-muted-foreground">{status}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
