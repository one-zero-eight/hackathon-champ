import type { SchemaEvent } from '@/api/types'
import { $api } from '@/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { cn, getProtocolLabel, getProtocolUrl, infoForDateRange, locationText, plainDateStr, urlToMaps } from '@/lib/utils'
import { ParticipantDialogContent } from '@/routes/participants'
import { useState } from 'react'
import Download from '~icons/lucide/download'
import MapPin from '~icons/lucide/map-pin'
import NotebookText from '~icons/lucide/notebook-text'
import Users from '~icons/lucide/users'

export function EventDetailsDialog({ event }: { event: SchemaEvent }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <NotebookText />
        Подробнее
      </Button>
      {open && (
        <DetailsDialog
          event={event}
          open={open}
          setOpen={setOpen}
        />
      )}
    </>
  )
}

function DetailsDialog({ event, open, setOpen }: { event: SchemaEvent, open: boolean, setOpen: (open: boolean) => void }) {
  const {
    start,
    end,
    label: timeLabel,
  } = infoForDateRange(
    event.start_date.split('T')[0],
    event.end_date.split('T')[0],
  )
  const singleDay = start.toString() === end.toString()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-full max-w-3xl overflow-auto">
        <DialogHeader className="text-left">
          <DialogTitle>{event.title}</DialogTitle>

          <DialogDescription className="whitespace-pre-wrap">
            {event.description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div>
            <span className="mr-2">
              {start.year}
              {' '}
              год
            </span>
            {singleDay
              ? (
                  <span className="">{plainDateStr(start)}</span>
                )
              : (
                  <>
                    <span className="">{plainDateStr(start)}</span>
                    {' — '}
                    <span className="">{plainDateStr(end)}</span>
                  </>
                )}
            <span className="ml-2 text-xs opacity-60">
              (
              {timeLabel}
              )
            </span>
          </div>

          <div className="flex flex-wrap gap-1">
            {event.location.map(loc => (
              <a
                key={locationText(loc)}
                href={urlToMaps(loc)}
                target="_blank"
                rel="noreferrer"
              >
                <Badge
                  className="flex items-center gap-1 text-xs underline hover:text-blue-700"
                  variant="outline"
                >
                  <MapPin className="text-[18px]" />
                  <span>{locationText(loc)}</span>
                </Badge>
              </a>
            ))}
            {event.participant_count && (
              <Badge
                className="flex items-center gap-1 text-xs"
                variant="outline"
              >
                <Users className="text-[18px]" />
                <span>{`${event.participant_count} чел.`}</span>
              </Badge>
            )}
          </div>

          {event.discipline.length > 0 && (
            <>
              <Separator />
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-bold">Дисциплины:</span>
                {event.discipline.slice(0, 3).map(d => (
                  <Badge className="text-xs" variant="outline" key={d}>
                    {d}
                  </Badge>
                ))}
                {event.discipline.length > 3 && (
                  <Badge className="text-xs" variant="outline">
                    {`+${event.discipline.length - 3}`}
                  </Badge>
                )}
              </div>
            </>
          )}

          <Separator />

          <EventProtocols event={event} />
          <EventTeamPlaces event={event} />
          <EventSoloPlaces event={event} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

function EventProtocols({ event }: { event: SchemaEvent }) {
  const { data: results } = $api.useQuery('get', '/results/for-event', {
    params: { query: { event_id: event.id } },
  })

  if (!results?.protocols?.length)
    return null

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="text-xl font-semibold">
          Протоколы соревнования
        </div>
        <div className="text-sm">
          Загруженные файлы итогов соревнования
        </div>
      </div>
      <ul className="flex max-h-[200px] flex-col gap-2 overflow-auto">
        {results.protocols.map((protocol, index) => (
          <li key={index} className="flex items-center gap-2">
            <span className="grow rounded-md border bg-white px-4 py-2">
              {getProtocolLabel(protocol)}
            </span>

            <Button
              asChild
              variant="outline"
              size="icon"
            >
              <a
                href={getProtocolUrl(protocol)}
                target="_blank"
              >
                <Download />
              </a>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function EventTeamPlaces({ event }: { event: SchemaEvent }) {
  const [open, setOpen] = useState(false)
  const [teamName, setTeamName] = useState('')
  const { data: results } = $api.useQuery('get', '/results/for-event', {
    params: { query: { event_id: event.id } },
  })

  if (!results?.team_places?.length)
    return null

  const emoji = {
    gold: '🥇',
    silver: '🥈',
    bronze: '🥉',
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="text-xl font-semibold">Места по командам</div>
        <div className="text-sm">Результаты командных соревнований</div>
      </div>
      <ul className="flex max-h-[200px] flex-col gap-2 overflow-auto">
        {results.team_places.map(team => (
          <li key={team.team} className="flex items-center gap-2">
            <div className="flex h-full min-w-8 shrink-0 flex-col items-center justify-center rounded-md border bg-white px-4 py-2">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted text-xl font-semibold text-muted-foreground">
                #
                {team.place}
              </div>
              <span className="text-xs">{team.score}</span>
              <span className="text-xs">очков</span>
            </div>

            <span
              className="h-full grow cursor-pointer rounded-md border bg-white px-4 py-2 hover:bg-muted"
              onClick={() => {
                setTeamName(team.team)
                setOpen(true)
              }}
            >
              <div>
                {team.team}
                {team.place <= 3 && (
                  <span className="ml-2">
                    {
                      emoji[
                        team.place === 1
                          ? 'gold'
                          : team.place === 2
                            ? 'silver'
                            : 'bronze'
                      ]
                    }
                  </span>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {team.members.map(m => m.name).join(', ')}
              </div>
            </span>
          </li>
        ))}
      </ul>
      <ParticipantTeamDialog
        teamName={teamName}
        open={open}
        setOpen={setOpen}
      />
    </div>
  )
}

function ParticipantTeamDialog({ teamName, open, setOpen }: { teamName: string, open: boolean, setOpen: (open: boolean) => void }) {
  const { data: participant } = $api.useQuery('get', '/participants/team/', {
    params: { query: { name: teamName } },
  }, { enabled: open })
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {participant ? <ParticipantDialogContent participant={participant} place={undefined} /> : null}
    </Dialog>
  )
}

function EventSoloPlaces({ event }: { event: SchemaEvent }) {
  const [open, setOpen] = useState(false)
  const [participantId, setParticipantId] = useState('')
  const { data: results } = $api.useQuery('get', '/results/for-event', {
    params: { query: { event_id: event.id } },
  })

  if (!results?.solo_places?.length)
    return null

  const emoji = {
    gold: '🥇',
    silver: '🥈',
    bronze: '🥉',
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="text-xl font-semibold">Места по личным дисциплинам</div>
        <div className="text-sm">Результаты личных дисциплин</div>
      </div>
      <ul className="flex max-h-[200px] flex-col gap-2 overflow-auto">
        {results.solo_places.map((solo, i) => (
          <li key={i} className="flex items-center gap-2">
            <div className="flex h-full min-w-8 shrink-0 flex-col items-center justify-center rounded-md border bg-white px-4 py-2">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted text-xl font-semibold text-muted-foreground">
                #
                {solo.place}
              </div>
              {solo.score && (
                <>
                  <span className="text-xs">{solo.score}</span>
                  <span className="text-xs">очков</span>
                </>
              )}
            </div>

            <span
              className={cn(
                'grow cursor-pointer rounded-md border bg-white px-4 py-2 hover:bg-muted h-full flex items-center',
                !solo.participant.id && 'cursor-default hover:bg-white',
              )}
              onClick={() => {
                if (solo.participant.id) {
                  setParticipantId(solo.participant.id)
                  setOpen(true)
                }
              }}
            >
              <div>
                {solo.participant.name}
                {solo.place <= 3 && (
                  <span className="ml-2">
                    {
                      emoji[
                        solo.place === 1
                          ? 'gold'
                          : solo.place === 2
                            ? 'silver'
                            : 'bronze'
                      ]
                    }
                  </span>
                )}
              </div>
            </span>
          </li>
        ))}
      </ul>
      <ParticipantSoloDialog
        participantId={participantId}
        open={open}
        setOpen={setOpen}
      />
    </div>
  )
}

function ParticipantSoloDialog({ participantId, open, setOpen }: { participantId: string, open: boolean, setOpen: (open: boolean) => void }) {
  const { data: participant } = $api.useQuery('get', '/participants/person/stats/{id}', {
    params: { path: { id: participantId } },
  }, { enabled: open })
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {participant ? <ParticipantDialogContent participant={participant} place={undefined} /> : null}
    </Dialog>
  )
}
