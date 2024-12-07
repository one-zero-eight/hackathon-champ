import { $api } from '@/api'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn, pluralize } from '@/lib/utils'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import Search from '~icons/lucide/search'

export const Route = createFileRoute('/participants/')({
  component: RouteComponent,
})

function sortParticipants(participants: any[]) {
  return [...participants].sort((a, b) => {
    // Sort by gold medals
    if (a.golds !== b.golds) {
      return b.golds - a.golds
    }
    // If gold medals are equal, sort by silver
    if (a.silvers !== b.silvers) {
      return b.silvers - a.silvers
    }
    // If silver medals are equal, sort by bronze
    if (a.bronzes !== b.bronzes) {
      return b.bronzes - a.bronzes
    }
    // If all medals are equal, sort alphabetically by name
    return a.name.localeCompare(b.name, 'ru')
  })
}

function filterParticipants(participants: any[], search: string) {
  const searchLower = search.toLowerCase()
  return participants.filter(p =>
    p.name.toLowerCase().includes(searchLower),
  )
}

function MedalBadge({ count, type }: { count: number, type: 'gold' | 'silver' | 'bronze' }) {
  const colors = {
    gold: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
    silver: 'bg-stone-100 text-stone-700 hover:bg-stone-100',
    bronze: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
  }

  const emoji = {
    gold: '🥇',
    silver: '🥈',
    bronze: '🥉',
  }

  if (count === 0)
    return null

  return (
    <Badge
      className={cn('flex items-center gap-1 text-sm font-medium', colors[type])}
      variant="secondary"
    >
      {emoji[type]}
      <span>{count}</span>
    </Badge>
  )
}

function MedalDisplay({ participant }: { participant: any }) {
  return (
    <div className="flex flex-wrap gap-2">
      {participant.golds > 0 && <MedalBadge type="gold" count={participant.golds} />}
      {participant.silvers > 0 && <MedalBadge type="silver" count={participant.silvers} />}
      {participant.bronzes > 0 && <MedalBadge type="bronze" count={participant.bronzes} />}
    </div>
  )
}

function ParticipantCard({ participant, onClick, rank }: { participant: any, onClick: () => void, rank: number }) {
  return (
    <Card
      className="relative flex cursor-pointer overflow-hidden border bg-white shadow-sm transition-all hover:scale-[1.002] hover:bg-muted/50 hover:shadow-md"
      onClick={onClick}
    >
      <div className="flex w-full items-center gap-6 p-4">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-2xl font-semibold text-muted-foreground">
          #
          {rank}
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-medium leading-tight">{participant.name}</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            <MedalDisplay participant={participant} />
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold">
            {participant.total}
          </div>
          <div className="text-sm text-muted-foreground">
            {pluralize(participant.total, 'участие', 'участия', 'участий')}
          </div>
        </div>
      </div>
    </Card>
  )
}

function ParticipationCard({ participation }: { participation: any }) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b bg-muted/50 p-3">
        <h3 className="font-medium">{participation.event_title}</h3>
      </div>
      <div className="space-y-2 p-4">
        {participation.solo_place && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
              {participation.solo_place.place}
              {' '}
              место
            </Badge>
            {participation.solo_place.score && (
              <span className="text-sm text-muted-foreground">
                {participation.solo_place.score}
                {' '}
                очков
              </span>
            )}
            <Badge variant="outline" className="ml-auto">
              Личный зачёт
            </Badge>
          </div>
        )}
        {participation.team_place && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
              {participation.team_place.place}
              {' '}
              место
            </Badge>
            {participation.team_place.score && (
              <span className="text-sm text-muted-foreground">
                {participation.team_place.score}
                {' '}
                очков
              </span>
            )}
            <Badge variant="outline" className="ml-auto">
              Командный зачёт
            </Badge>
          </div>
        )}
      </div>
    </Card>
  )
}

function StatisticsCard({ participant }: { participant: any }) {
  // Calculate coefficient: (gold * 3 + silver * 2 + bronze * 1) / total_participations
  const coefficient = participant.total > 0
    ? ((participant.golds * 3 + participant.silvers * 2 + participant.bronzes) / participant.total).toFixed(2)
    : '0.00'

  // Calculate medal percentage
  const medalsCount = participant.golds + participant.silvers + participant.bronzes
  const medalPercentage = participant.total > 0
    ? Math.round((medalsCount / participant.total) * 100)
    : 0

  // Calculate gold medal percentage
  const goldPercentage = participant.total > 0
    ? Math.round((participant.golds / participant.total) * 100)
    : 0

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="overflow-hidden">
        <div className="border-b bg-muted/50 p-3">
          <h4 className="font-medium text-muted-foreground">Коэффициент</h4>
        </div>
        <div className="p-4">
          <p className="text-3xl font-bold tracking-tight">{coefficient}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            (золото × 3 + серебро × 2 + бронза) ÷ участия
          </p>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b bg-muted/50 p-3">
          <h4 className="font-medium text-muted-foreground">Медальный зачёт</h4>
        </div>
        <div className="p-4">
          <p className="text-3xl font-bold tracking-tight">
            {medalPercentage}
            %
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {medalsCount}
            {' '}
            из
            {' '}
            {participant.total}
            {' '}
            участий с медалями
          </p>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b bg-muted/50 p-3">
          <h4 className="font-medium text-muted-foreground">Золотой рейтинг</h4>
        </div>
        <div className="p-4">
          <p className="text-3xl font-bold tracking-tight">
            {goldPercentage}
            %
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {participant.golds}
            {' '}
            из
            {' '}
            {participant.total}
            {' '}
            участий с золотом
          </p>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b bg-muted/50 p-3">
          <h4 className="font-medium text-muted-foreground">Всего медалей</h4>
        </div>
        <div className="p-4">
          <p className="text-3xl font-bold tracking-tight">{medalsCount}</p>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            по данным платформы
          </div>
        </div>
      </Card>
    </div>
  )
}

function ParticipantDialog({ participant, rank }: { participant: any, rank: number }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div>
          <ParticipantCard participant={participant} onClick={() => setOpen(true)} rank={rank} />
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            #
            {rank}
            {' '}
            {participant.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <MedalDisplay participant={participant} />

          <StatisticsCard participant={participant} />

          <Separator />

          <div>
            <h3 className="mb-3 text-lg font-medium">
              Участия (
              {participant.total}
              )
            </h3>
            <div className="space-y-3">
              {participant.participations.map((p: any) => (
                <ParticipationCard key={p.event_id} participation={p} />
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SearchInput({ value, onChange }: { value: string, onChange: (value: string) => void }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Поиск по имени..."
        value={value}
        onChange={e => onChange(e.target.value)}
        className="pl-9"
      />
    </div>
  )
}

function ParticipantCardSkeleton() {
  return (
    <Card className="relative flex overflow-hidden border bg-white shadow-sm">
      <div className="flex w-full items-center gap-4 p-4">
        <Skeleton className="h-8 w-12" />
        <div className="flex-1">
          <Skeleton className="h-6 w-48" />
          <div className="mt-2 flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
        <Skeleton className="h-6 w-32" />
      </div>
    </Card>
  )
}

function RouteComponent() {
  const { data: allPersons, isLoading: isLoadingPersons } = $api.useQuery('get', '/participants/person/all')
  const { data: allTeams, isLoading: isLoadingTeams } = $api.useQuery('get', '/participants/team/all')
  const [search, setSearch] = useState('')

  const sortedPersons = allPersons ? sortParticipants(allPersons) : []
  const sortedTeams = allTeams ? sortParticipants(allTeams) : []

  const filteredPersons = filterParticipants(sortedPersons, search)
  const filteredTeams = filterParticipants(sortedTeams, search)

  const renderSkeletons = () => (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <ParticipantCardSkeleton key={i} />
      ))}
    </div>
  )

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold">Рейтинг участников</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Список участников и команд, их достижения и участие в мероприятиях
        </p>
      </div>

      <div className="space-y-6">
        <SearchInput value={search} onChange={setSearch} />

        <Tabs defaultValue="persons">
          <TabsList>
            <TabsTrigger value="persons">Личный зачёт</TabsTrigger>
            <TabsTrigger value="teams">Командный зачёт</TabsTrigger>
          </TabsList>

          <TabsContent value="persons" className="mt-6 space-y-2">
            {isLoadingPersons
              ? (
                  renderSkeletons()
                )
              : filteredPersons.length === 0
                ? (
                    <div className="py-8 text-center text-muted-foreground">
                      Участники не найдены
                    </div>
                  )
                : (
                    filteredPersons.map((person: any, index: number) => (
                      <ParticipantDialog key={person.name} participant={person} rank={index + 1} />
                    ))
                  )}
          </TabsContent>

          <TabsContent value="teams" className="mt-6 space-y-2">
            {isLoadingTeams
              ? (
                  renderSkeletons()
                )
              : filteredTeams.length === 0
                ? (
                    <div className="py-8 text-center text-muted-foreground">
                      Команды не найдены
                    </div>
                  )
                : (
                    filteredTeams.map((team: any, index: number) => (
                      <ParticipantDialog key={team.name} participant={team} rank={index + 1} />
                    ))
                  )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
