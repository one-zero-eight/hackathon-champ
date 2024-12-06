import { $api } from '@/api'
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import Mail from '~icons/lucide/mail'
import Phone from '~icons/lucide/phone'
import Globe from '~icons/lucide/globe'
import MapPin from '~icons/lucide/map-pin'
import Building from '~icons/lucide/building'
import Users from '~icons/lucide/users'
import Trophy from '~icons/lucide/trophy'
import Medal from '~icons/lucide/medal'

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
  location: { lat: number; lng: number } | null
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
          <div className="h-8 w-64 bg-muted rounded animate-pulse" />
          <div className="h-96 bg-muted rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-destructive/10 text-destructive px-4 py-2 rounded">
          Произошла ошибка при загрузке данных федерации
        </div>
      </div>
    )
  }

  if (!federation) return null

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-start gap-6">
        <div className="h-24 w-24 rounded-xl bg-muted flex items-center justify-center">
          <Building className="h-12 w-12" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">{federation.region}</h1>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[federation.status]}`}>
              {STATUS_LABELS[federation.status]}
            </div>
          </div>
          {federation.district && (
            <p className="text-lg text-muted-foreground mt-1">{federation.district}</p>
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
                <div className="text-sm font-medium">Руководитель</div>
                <div className="mt-1">{federation.head}</div>
              </div>
            )}
            
            {federation.email && (
              <div>
                <div className="text-sm font-medium">Email</div>
                <Button variant="link" className="mt-1 h-auto p-0" asChild>
                  <a href={`mailto:${federation.email}`} className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {federation.email}
                  </a>
                </Button>
              </div>
            )}

            {federation.phone && (
              <div>
                <div className="text-sm font-medium">Телефон</div>
                <Button variant="link" className="mt-1 h-auto p-0" asChild>
                  <a href={`tel:${federation.phone}`} className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {federation.phone}
                  </a>
                </Button>
              </div>
            )}

            {federation.website && (
              <div>
                <div className="text-sm font-medium">Сайт</div>
                <Button variant="link" className="mt-1 h-auto p-0" asChild>
                  <a href={federation.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {federation.website}
                  </a>
                </Button>
              </div>
            )}

            {federation.address && (
              <div>
                <div className="text-sm font-medium">Адрес</div>
                <div className="mt-1 flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-1" />
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
                <div className="text-sm font-medium text-muted-foreground">Участников</div>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {federation.members_count}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Соревнований</div>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  {federation.competitions_count}
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <div className="text-sm font-medium mb-2">Достижения</div>
              {federation.achievements && federation.achievements.length > 0 ? (
                <div className="space-y-2">
                  {federation.achievements.map((achievement: string, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <Medal className="h-4 w-4 mt-1" />
                      <span>{achievement}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Нет данных о достижениях</div>
              )}
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
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Карта будет добавлена позже
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
