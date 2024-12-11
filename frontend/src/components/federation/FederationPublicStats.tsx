import { $api } from '@/api'
import { getStatusText } from '@/lib/utils'
import { useMemo } from 'react'
import Trophy from '~icons/lucide/trophy'
import Users from '~icons/lucide/users'

export function FederationPublicStats({ federationId }: { federationId: string }) {
  const { data: eventsData, isPending } = $api.useQuery(
    'get',
    '/events/',
  )
  const events = useMemo(
    () => eventsData?.filter(
      event => event.host_federation === federationId
        && event.status === 'accredited',
    ) ?? [],
    [eventsData, federationId],
  )

  const stats = useMemo(() => {
    const eventsByStatus = events.reduce((acc, event) => {
      acc[event.status] = (acc[event.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const eventsByMonth = events.reduce((acc, event) => {
      const date = new Date(event.start_date)
      const month = date.toLocaleString('ru', { month: 'long', year: 'numeric' })
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const parseRussianMonth = (monthYear: string) => {
      const [month, year] = monthYear.split(' ')
      const russianMonths = [
        'январь',
        'февраль',
        'март',
        'апрель',
        'май',
        'июнь',
        'июль',
        'август',
        'сентябрь',
        'октябрь',
        'ноябрь',
        'декабрь',
      ]
      const monthIndex = russianMonths.findIndex(m =>
        month.toLowerCase().startsWith(m.toLowerCase()),
      )
      return new Date(Number.parseInt(year), monthIndex)
    }

    const monthlyData = Object.entries(eventsByMonth)
      .sort(([a], [b]) => {
        const dateA = parseRussianMonth(a)
        const dateB = parseRussianMonth(b)
        return dateA.getTime() - dateB.getTime()
      })
      .map(([name, value]) => ({
        name,
        value,
      }))

    const statusData = Object.entries(eventsByStatus).map(([name, value]) => ({
      name: getStatusText(name),
      value,
    }))

    const averageParticipants = events.reduce((acc, event) => acc + (event.participant_count || 0), 0) / events.length || 0

    return {
      total: events.length,
      byStatus: eventsByStatus,
      statusData,
      monthlyData,
      averageParticipants: Math.round(averageParticipants),
    }
  }, [events])

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-1">
        <div className="text-sm font-semibold text-muted-foreground">
          Всего мероприятий
        </div>
        <div className="flex items-center gap-2 text-2xl font-bold">
          <Trophy className="size-5" />
          {isPending ? '...' : stats.total}
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-sm font-semibold text-muted-foreground">
          Среднее число участников
        </div>
        <div className="flex items-center gap-2 text-2xl font-bold">
          <Users className="size-5" />
          {isPending ? '...' : stats.averageParticipants}
        </div>
      </div>
    </div>
  )
}
