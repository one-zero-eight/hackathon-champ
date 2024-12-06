import { $api } from "@/api";
import { EventExportToCalendarButton } from "@/components/EventExportToCalendarButton.tsx";
import { EventSubscribeButton } from "@/components/EventSubscribeButton.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Event } from "@/lib/types";
import { cn, infoForDateRange, locationText } from "@/lib/utils.ts";
import { Link } from "@tanstack/react-router";
import { Link as LinkIcon, MapPin, Users } from "lucide-react";
import { ImMan, ImWoman } from "react-icons/im";
import { Temporal } from "temporal-polyfill";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";

const ageText = (min?: number | null, max?: number | null) => {
  if (min != null && max != null) {
    return `${min}-${max} лет`;
  } else if (min != null) {
    return `${min}+ лет`;
  } else if (max != null) {
    return `до ${max} лет`;
  }
  return "";
};

const MONTH_NAMES: Record<number, string> = {
  1: "ЯНВ",
  2: "ФЕВ",
  3: "МАР",
  4: "АПР",
  5: "МАЙ",
  6: "ИЮН",
  7: "ИЮЛ",
  8: "АВГ",
  9: "СЕН",
  10: "ОКТ",
  11: "НОЯ",
  12: "ДЕК",
};

const plainDateStr = (d: Temporal.PlainDate) =>
  `${d.day} ${MONTH_NAMES[d.month]}`;

export function EventCard({
  event,
  className,
}: {
  event: Event;
  className?: string;
}) {
  const { data: sports } = $api.useQuery("get", "/sports/");

  const sportId = sports?.find((s) => s.sport === event.sport)?.id;

  const {
    start,
    end,
    time,
    label: timeLabel,
  } = infoForDateRange(
    event.start_date.split("T")[0],
    event.end_date.split("T")[0],
  );

  const singleDay = start.toString() === end.toString();
  const age = ageText(event.age_min, event.age_max);

  return (
    <div
      className={cn(
        "flex overflow-hidden rounded-lg border bg-white shadow-sm",
        className,
      )}
    >
      <div
        className={cn(
          "flex w-[175px] flex-shrink-0 flex-grow-0 flex-col items-center justify-center text-white",
          time === "present" && "bg-green-600",
          time === "future" && "bg-blue-600",
          time === "past" && "bg-stone-600 text-stone-400",
        )}
      >
        <span className="mb-2">{start.year}</span>
        {singleDay ? (
          <span className="text-xl font-black">{plainDateStr(start)}</span>
        ) : (
          <>
            <span className="text-xl font-black">{plainDateStr(start)}</span>
            <span className="my-1 inline-block h-[4px] w-[16px] bg-current"></span>
            <span className="text-xl font-black">{plainDateStr(end)}</span>
          </>
        )}
        <span className="mt-2 text-xs opacity-60">{timeLabel}</span>
      </div>

      <div className="flex flex-grow flex-col gap-2 p-4">
        <div className="flex items-center justify-between">
          <Link
            to="/sports/$sportId"
            params={{ sportId: sportId ?? "" }}
            className="text-sm underline"
          >
            {event.sport}
          </Link>
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
              ЕКП СМ №{event.ekp_id}
            </a>
          </Button>
        </div>
        <h4 className="text-xl font-bold">{event.title}</h4>
        <div className="flex flex-wrap gap-1">
          {event.location.map((loc, i) => (
            <a
              key={i}
              href={`https://yandex.ru/maps/?text=${encodeURIComponent(locationText(loc))}`}
              target="_blank"
              rel="noreferrer"
            >
              <Badge
                className="flex items-center gap-1 text-xs underline hover:text-blue-700"
                variant="outline"
              >
                <MapPin size={18} />
                <span>{locationText(loc)}</span>
              </Badge>
            </a>
          ))}
          {event.participant_count && (
            <Badge
              className="flex items-center gap-1 text-xs"
              variant="outline"
            >
              <Users size={18} />
              <span>{`${event.participant_count} чел.`}</span>
            </Badge>
          )}
          {(event.gender || age) && (
            <Badge
              className="flex items-center gap-1 text-xs"
              variant="outline"
            >
              {event.gender === "male" ? (
                <ImMan className="inline text-blue-500" size={18} />
              ) : event.gender === "female" ? (
                <ImWoman className="inline text-pink-500" size={18} />
              ) : null}
              {age && <span>{ageText(event.age_min, event.age_max)}</span>}
            </Badge>
          )}
        </div>

        {event.description && (
          <p className="line-clamp-1 min-w-0 overflow-hidden overflow-ellipsis break-words">
            {event.description}
          </p>
        )}

        {event.discipline.length > 0 && (
          <>
            <Separator />
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-bold">Дисциплины:</span>
              {event.discipline.slice(0, 3).map((d) => (
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
        <div className="flex flex-wrap gap-2">
          <EventSubscribeButton event={event} />
          <EventExportToCalendarButton event={event} />
        </div>
      </div>
    </div>
  );
}
