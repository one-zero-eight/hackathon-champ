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
import { getProtocolLabel, getProtocolUrl, infoForDateRange, locationText, plainDateStr, urlToMaps } from '@/lib/utils'
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
      <DialogContent className="max-h-full overflow-auto">
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

  if (!results?.protocols)
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
            <span className="min-w-8 shrink-0 rounded-md border bg-white px-4 py-2">
              {team.place}
            </span>
            <span className="grow rounded-md border bg-white px-4 py-2">
              {team.team}
              {team.place <= 3 && (
                <span className="ml-2">
                  {emoji[team.place === 1 ? 'gold' : team.place === 2 ? 'silver' : 'bronze']}
                </span>
              )}
            </span>
            <span className=" rounded-md border bg-white px-4 py-2">
              {team.score}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function EventSoloPlaces({ event }: { event: SchemaEvent }) {
  const { data: results } = $api.useQuery('get', '/results/for-event', {
    params: { query: { event_id: event.id } },
  })

  if (!results?.solo_places?.length)
    return null

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="text-xl font-semibold">Места по личным дисциплинам</div>
        <div className="text-sm">Результаты личных дисциплин</div>
      </div>
      <ul className="flex max-h-[200px] flex-col gap-2 overflow-hidden">
        {results.solo_places.map((solo, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="grow rounded-md border bg-white px-4 py-2">
              {solo.place}
            </span>
            <span className="grow rounded-md border bg-white px-4 py-2">
              {solo.participant.name}
            </span>
            <span className="grow rounded-md border bg-white px-4 py-2">
              {solo.score}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
