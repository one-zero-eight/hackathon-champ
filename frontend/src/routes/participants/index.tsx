import { $api } from '@/api'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
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
      className="relative flex cursor-pointer overflow-hidden border bg-white shadow-sm transition-colors hover:bg-muted/50 hover:shadow-none"
      onClick={onClick}
    >
      <div className="flex w-full items-center gap-4 p-4">
        <div className="w-12 text-2xl font-semibold text-muted-foreground">
          #
          {rank}
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-medium">{participant.name}</h4>
          <div className="mt-1 flex flex-wrap gap-2">
            <MedalDisplay participant={participant} />
          </div>
        </div>
        <div className="text-lg font-semibold">
          {participant.total}
          {' '}
          {pluralize(participant.total, 'участие', 'участия', 'участий')}
        </div>
      </div>
    </Card>
  )
}

function ParticipationCard({ participation }: { participation: any }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <h3 className="text-lg font-medium">{participation.event_title}</h3>
      <div className="mt-2 space-y-1">
        {participation.solo_place && (
          <Badge variant="secondary" className="bg-blue-100 text-sm text-blue-700 hover:bg-blue-100">
            Личное место:
            {' '}
            {participation.solo_place.place}
            {participation.solo_place.score && ` (Очки: ${participation.solo_place.score})`}
          </Badge>
        )}
        {participation.team_place && (
          <Badge variant="secondary" className="bg-green-100 text-sm text-green-700 hover:bg-green-100">
            Командное место:
            {' '}
            {participation.team_place.place}
            {participation.team_place.score && ` (Очки: ${participation.team_place.score})`}
          </Badge>
        )}
      </div>
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            #
            {rank}
            {' '}
            {participant.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <MedalDisplay participant={participant} />

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

function RouteComponent() {
  const { data: allPersons } = $api.useQuery('get', '/participants/person/all')
  const { data: allTeams } = $api.useQuery('get', '/participants/team/all')
  const [search, setSearch] = useState('')

  const sortedPersons = allPersons ? sortParticipants(allPersons) : []
  const sortedTeams = allTeams ? sortParticipants(allTeams) : []

  const filteredPersons = filterParticipants(sortedPersons, search)
  const filteredTeams = filterParticipants(sortedTeams, search)

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
            {filteredPersons.length === 0
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
            {filteredTeams.length === 0
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
