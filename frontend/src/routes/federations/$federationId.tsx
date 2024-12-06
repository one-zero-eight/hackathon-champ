import { $api } from '@/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { createFileRoute } from '@tanstack/react-router'
import Building from '~icons/lucide/building'
import Globe from '~icons/lucide/globe'
import Mail from '~icons/lucide/mail'
import MapPin from '~icons/lucide/map-pin'
import Medal from '~icons/lucide/medal'
import Phone from '~icons/lucide/phone'
import Trophy from '~icons/lucide/trophy'
import Users from '~icons/lucide/users'

type Federation = {
  id: string
  region: string
  district: string | null
  status: 'on_consideration' | 'accredited' | 'rejected'
  status_comment: string | null
  description: string | null
  head: string | null
  email: string | null
  phone: string | null
  logo: string | null
  website: string | null
  members_count: number
  competitions_count: number
  achievements: string[]
  address: string | null
  location: { lat: number, lng: number } | null
}

const STATUS_COLORS = {
  on_consideration: 'bg-yellow-500 text-yellow-950',
  accredited: 'bg-green-500 text-green-950',
  rejected: 'bg-red-500 text-red-950',
} as const

const STATUS_LABELS = {
  on_consideration: 'На рассмотрении',
  accredited: 'Аккредитована',
  rejected: 'Отклонена',
} as const

export const Route = createFileRoute('/federations/$federationId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { federationId } = Route.useParams()
  const { data, isPending, isError } = $api.useQuery('get', `/federations/{id}`, {
    params: { path: { id: federationId } },
  })
  const federation = data as Federation | undefined

  if (isPending) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-4">
          <div className="h-8 w-64 animate-pulse rounded bg-muted" />
          <div className="h-96 animate-pulse rounded bg-muted" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container mx-auto py-8">
        <div className="rounded bg-destructive/10 px-4 py-2 text-destructive">
          Произошла ошибка при загрузке данных федерации
        </div>
      </div>
    )
  }

  if (!federation)
    return null

  return (
    <div className="container mx-auto space-y-6 py-8">
      <div className="flex items-start gap-6">
        <div className="flex size-24 items-center justify-center rounded-xl bg-muted">
          <Building className="size-12" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">{federation.region}</h1>
            <div className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[federation.status]}`}>
              {STATUS_LABELS[federation.status]}
            </div>
          </div>
          {federation.district && (
            <p className="mt-1 text-lg text-muted-foreground">{federation.district}</p>
          )}
          {federation.description && (
            <p className="mt-4 text-muted-foreground">{federation.description}</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Контактная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {federation.head && (
              <div>
                <SectionLabel>Руководитель</SectionLabel>
                <div className="mt-1">{federation.head}</div>
              </div>
            )}

            {federation.email && (
              <div>
                <SectionLabel>Email</SectionLabel>
                <Button variant="link" className="mt-1 h-auto p-0" asChild>
                  <a href={`mailto:${federation.email}`} className="flex items-center gap-2">
                    <Mail className="size-4" />
                    {federation.email}
                  </a>
                </Button>
              </div>
            )}

            {federation.phone && (
              <div>
                <SectionLabel>Телефон</SectionLabel>
                <Button variant="link" className="mt-1 h-auto p-0" asChild>
                  <a href={`tel:${federation.phone}`} className="flex items-center gap-2">
                    <Phone className="size-4" />
                    {federation.phone}
                  </a>
                </Button>
              </div>
            )}

            {federation.website && (
              <div>
                <SectionLabel>Сайт</SectionLabel>
                <Button variant="link" className="mt-1 h-auto p-0" asChild>
                  <a href={federation.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    <Globe className="size-4" />
                    {federation.website}
                  </a>
                </Button>
              </div>
            )}

            {federation.address && (
              <div>
                <SectionLabel>Адрес</SectionLabel>
                <div className="mt-1 flex items-start gap-2">
                  <MapPin className="mt-1 size-4" />
                  <span>{federation.address}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Статистика</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <SectionLabel>Участников</SectionLabel>
                <div className="flex items-center gap-2 text-2xl font-bold">
                  <Users className="size-5" />
                  {federation.members_count}
                </div>
              </div>

              <div className="space-y-1">
                <SectionLabel>Соревнований</SectionLabel>
                <div className="flex items-center gap-2 text-2xl font-bold">
                  <Trophy className="size-5" />
                  {federation.competitions_count}
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <SectionLabel>Достижения</SectionLabel>
              {federation.achievements && federation.achievements.length > 0
                ? (
                    <div className="space-y-2">
                      {federation.achievements.map(achievement => (
                        <div key={achievement} className="flex items-start gap-2">
                          <Medal className="mt-1 size-4" />
                          <span>{achievement}</span>
                        </div>
                      ))}
                    </div>
                  )
                : (<div className="text-sm text-muted-foreground">Нет данных о достижениях</div>)}
            </div>
          </CardContent>
        </Card>
      </div>

      {federation.location && (
        <Card>
          <CardHeader>
            <CardTitle>Расположение на карте</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] rounded-lg bg-muted">
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Карта будет добавлена позже
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-sm font-semibold text-muted-foreground">{children}</div>
}
