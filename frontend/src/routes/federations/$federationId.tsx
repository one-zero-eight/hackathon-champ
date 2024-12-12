import { $api } from '@/api'
import { ColoredBadge } from '@/components/ColoredBadge'
import { EventCard } from '@/components/EventCard'
import { FederationPublicStats } from '@/components/federation/FederationPublicStats.tsx'
import { FederationLogo } from '@/components/FederationLogo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { urlToMaps } from '@/lib/utils'
import { createFileRoute, Link } from '@tanstack/react-router'
import Globe from '~icons/lucide/globe'
import Mail from '~icons/lucide/mail'
import MapPin from '~icons/lucide/map-pin'
import Phone from '~icons/lucide/phone'
import Telegram from '~icons/ph/telegram-logo'

const STATUS_LABELS = {
  on_consideration: 'На рассмотрении',
  accredited: 'Аккредитована',
  rejected: 'Отклонена',
} as const
const STATUS_COLORS = {
  on_consideration: 'blue',
  accredited: 'green',
  rejected: 'red',
} as const

const FRESH_LABELS = {
  fresh: 'Актуальные данные',
  stale: 'Данные устарели',
} as const
const FRESH_COLORS = {
  fresh: 'green',
  stale: 'red',
} as const

export const Route = createFileRoute('/federations/$federationId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { federationId } = Route.useParams()
  const { data: federation, isPending, isError } = $api.useQuery('get', `/federations/{id}`, {
    params: { path: { id: federationId } },
  })
  const {
    data: events,
    isPending: isEventsPending,
  } = $api.useQuery(
    'post',
    '/events/search',
    {
      body: {
        filters: {
          host_federation: federationId,
          status: ['accredited'],
        },
        pagination: {
          page_no: 1,
          page_size: 100,
        },
        sort: { type: 'date', direction: -1 },
      },
    },
  )

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

  const isFresh = federation.last_interaction_at !== null
    && new Date(federation.last_interaction_at).getTime() > Date.now() - 1000 * 60 * 60 * 24 * 7 // 7 days

  return (
    <div className="container mx-auto space-y-6 py-8">
      <div className="flex items-center gap-6">
        <FederationLogo logoUrl={federation.logo} alt={federation.region} size="federation" />
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">{federation.region}</h1>
            <ColoredBadge color={STATUS_COLORS[federation.status]}>
              {STATUS_LABELS[federation.status]}
            </ColoredBadge>
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
            <CardTitle>
              <span className="mr-4">
                Контактная информация
              </span>
              <ColoredBadge color={FRESH_COLORS[isFresh ? 'fresh' : 'stale']}>
                {FRESH_LABELS[isFresh ? 'fresh' : 'stale']}
              </ColoredBadge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
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
                    <Phone />
                    {federation.phone}
                  </a>
                </Button>
              </div>
            )}

            {federation.site && (
              <div>
                <SectionLabel>Сайт</SectionLabel>
                <Button variant="link" className="mt-1 h-auto p-0" asChild>
                  <a href={federation.site} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    <Globe />
                    {federation.site}
                  </a>
                </Button>
              </div>
            )}

            {federation.telegram && (
              <div>
                <SectionLabel>Telegram</SectionLabel>
                <Button variant="link" className="mt-1 h-auto p-0" asChild>
                  <a href={federation.telegram} target="_blank" rel="noopener noreferrer">
                    <Telegram />
                    {federation.telegram}
                  </a>
                </Button>
              </div>
            )}

            {federation.address && (
              <div>
                <SectionLabel>Адрес</SectionLabel>
                <Button variant="link" className="mt-1 flex h-auto items-start justify-start gap-2 whitespace-break-spaces p-0" asChild>
                  <a
                    href={urlToMaps({ country: 'Россия', region: federation.region, city: federation.address })}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MapPin className="mt-1" />
                    <span>{federation.address}</span>
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Статистика</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FederationPublicStats federationId={federationId} />
          </CardContent>
        </Card>
      </div>

      <div className="flex items-start justify-between">
        <h2 className="text-2xl font-bold">События федерации</h2>
        <Button asChild>
          <Link
            to="/search"
            search={{
              filters: {
                host_federation: federationId,
              },
            }}
          >
            Все cобытия федерации
          </Link>
        </Button>
      </div>

      {isEventsPending
        ? (
            <div className="flex flex-col gap-6">
              <Skeleton className="h-[200px]" />
              <Skeleton className="h-[200px]" />
              <Skeleton className="h-[200px]" />
            </div>
          )
        : (events?.events && events.events.length > 0)
            ? (
                <div className="flex flex-col gap-6">
                  {events.events.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )
            : (
                <div className="rounded-lg bg-neutral-100 py-12">
                  <p className="text-center text-lg text-muted-foreground">
                    У этой федерации ещё нет событий
                  </p>
                </div>
              )}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-sm font-semibold text-muted-foreground">{children}</div>
}
