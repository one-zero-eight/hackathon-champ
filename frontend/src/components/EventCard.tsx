import type { Event, Location } from '@/lib/types'
import { EventDetailsDialog } from '@/components/EventDetailsDialog'
import { EventExportToCalButton } from '@/components/EventExportToCalButton'
import { Button } from '@/components/ui/button'
import { useMe } from '@/hooks/useMe'
import { cn, infoForDateRange, locationText, plainDateStr, urlToMaps } from '@/lib/utils'
import { Link } from '@tanstack/react-router'
import LinkIcon from '~icons/lucide/link'
import MapPin from '~icons/lucide/map-pin'
import Pencil from '~icons/lucide/pencil'
import Users from '~icons/lucide/users'
import { EventStatusBadge } from './EventStatusBadge'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'

export function EventCard({
  event,
  className,
}: {
  event: Event
  className?: string
}) {
  const { data: me } = useMe()
  const {
    start,
    end,
    time,
    label: timeLabel,
  } = infoForDateRange(
    event.start_date.split('T')[0],
    event.end_date.split('T')[0],
  )

  const singleDay = start.toString() === end.toString()

  return (
    <div
      className={cn(
        'relative flex overflow-hidden rounded-lg border bg-white shadow-sm',
        className,
      )}
    >
      <div
        className={cn(
          'flex w-[175px] flex-shrink-0 flex-grow-0 py-6 flex-col items-center justify-center text-white',
          time === 'present' && 'bg-green-600',
          time === 'future' && 'bg-blue-600',
          time === 'past' && 'bg-stone-600 text-stone-400',
        )}
      >
        <span className="mb-2">{start.year}</span>
        {singleDay
          ? (
              <span className="text-xl font-black">{plainDateStr(start)}</span>
            )
          : (
              <>
                <span className="text-xl font-black">{plainDateStr(start)}</span>
                <span className="my-1 inline-block h-[4px] w-[16px] bg-current"></span>
                <span className="text-xl font-black">{plainDateStr(end)}</span>
              </>
            )}
        <span className="mt-2 text-xs opacity-60">{timeLabel}</span>
      </div>

      <div className="flex grow flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          {event.ekp_id && (
            <Button
              asChild
              className="h-7 w-fit rounded-md px-2 text-xs"
              variant="secondary"
            >
              <a
                href={`https://storage.minsport.gov.ru/cms-uploads/cms/II_chast_EKP_2024_14_11_24_65c6deea36.pdf#page=${event.page}&search=${event.ekp_id}`}
                target="_blank"
                rel="noreferrer"
                className="!text-blue-500"
              >
                <LinkIcon />
                ЕКП СМ №
                {event.ekp_id}
              </a>
            </Button>
          )}
        </div>
        <h4 className="text-xl font-bold">{event.title}</h4>
        <div className="flex flex-wrap gap-1">
          {event.location.map(loc => (
            <LocationBadge
              key={locationText(loc)}
              location={loc}
            />
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

        {event.description && (
          <p className="line-clamp-1 min-w-0 overflow-hidden text-ellipsis break-words">
            {event.description}
          </p>
        )}

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

        <Separator className="mt-auto" />

        <div className="flex items-center gap-2">
          {((me?.federation && me.federation === event.host_federation) || me?.role === 'admin') && (
            <Button asChild size="sm" className="mr-auto">
              <Link
                to="/manage/events/$id"
                params={{ id: event.id }}
              >
                <Pencil />
                Редактировать
              </Link>
            </Button>
          )}
          <EventExportToCalButton event={event} />
          <EventDetailsDialog event={event} />
        </div>
      </div>

      <EventStatusBadge
        className="absolute right-4 top-4"
        status={event.status}
      />
    </div>
  )
}

export function LocationBadge({ location }: { location: Location }) {
  const text = locationText(location)

  const inner = (
    <Badge
      className="flex items-center gap-1 text-xs underline hover:text-blue-700"
      variant="outline"
    >
      <MapPin className="text-[18px]" />
      <span>{text}</span>
    </Badge>
  )

  if (text.match(/ПО МЕСТУ НАХОЖДЕНИЯ/i)) {
    return inner
  }

  return (
    <a
      href={urlToMaps(location)}
      target="_blank"
      rel="noreferrer"
    >
      {inner}
    </a>
  )
}
