import type { Event } from '@/lib/types'
import type { Temporal } from 'temporal-polyfill'
import { useMe } from '@/api/me.ts'
import { EventExportToCalButton } from '@/components/EventExportToCalButton'
import { Button } from '@/components/ui/button.tsx'
import { cn, infoForDateRange, locationText, urlToMaps } from '@/lib/utils.ts'
import { Link } from '@tanstack/react-router'
import LinkIcon from '~icons/lucide/link'
import MapPin from '~icons/lucide/map-pin'
import Users from '~icons/lucide/users'
import { EventStatusBadge } from './EventStatusBadge'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'

const MONTH_NAMES: Record<number, string> = {
  1: 'ЯНВ',
  2: 'ФЕВ',
  3: 'МАР',
  4: 'АПР',
  5: 'МАЙ',
  6: 'ИЮН',
  7: 'ИЮЛ',
  8: 'АВГ',
  9: 'СЕН',
  10: 'ОКТ',
  11: 'НОЯ',
  12: 'ДЕК',
}

function plainDateStr(d: Temporal.PlainDate) {
  return `${d.day} ${MONTH_NAMES[d.month]}`
}

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
          <EventExportToCalButton event={event} />
          {((me?.federation && me.federation === event.host_federation) || me?.role === 'admin') && (
            <Button
              asChild
              className="h-7 w-fit rounded-md px-2 text-xs"
              variant="secondary"
            >
              <Link to="/manage/events/$id" params={{ id: event.id }} className="!text-blue-500">
                Редактировать
              </Link>
            </Button>
          )}
        </div>
      </div>

      <EventStatusBadge className="absolute right-4 top-4" status={event.status} />
    </div>
  )
}
