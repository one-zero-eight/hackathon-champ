import { $api } from "@/api";
import { EventCard } from "@/components/EventCard";
import { SportBadge } from "@/components/SportBadge";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Filters, Sort } from "@/lib/types";
import { plainDatesForFilter } from "@/lib/utils";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowDown, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import CountUp from "react-countup";
import Marquee from "react-fast-marquee";
import { Temporal } from "temporal-polyfill";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

const QUICKLINKS = {
  "1-month": {
    date: plainDatesForFilter(
      Temporal.Now.plainDateISO(),
      Temporal.Now.plainDateISO().add({ days: 30 }),
    ),
  },
  "3-months": {
    date: plainDatesForFilter(
      Temporal.Now.plainDateISO(),
      Temporal.Now.plainDateISO().add({ days: 30 * 3 }),
    ),
  },
  "6-months": {
    date: plainDatesForFilter(
      Temporal.Now.plainDateISO(),
      Temporal.Now.plainDateISO().add({ days: 30 * 6 }),
    ),
  },
};

function RouteComponent() {
  const navigate = useNavigate();
  const { data: sports } = $api.useQuery("get", "/sports/");
  const { data: eventsTotal } = $api.useQuery("post", "/events/search/count", {
    body: {},
  });
  const { data: randomEvent } = $api.useQuery("get", "/events/random-event");
  const [search, setSearch] = useState("");

  const handleQuicklinkClick = (q: keyof typeof QUICKLINKS) => {
    navigate({
      to: "/search",
      search: {
        filters: QUICKLINKS[q],
      },
    });
  };

  const [sports1, sports2, sports3] = useMemo(() => {
    if (!sports) return [[], [], []];

    const shuffled = sports.slice().sort(() => Math.random() - 0.5);
    const partSize = Math.ceil(sports.length / 3);
    return [
      shuffled.slice(0, partSize),
      shuffled.slice(partSize, partSize * 2),
      shuffled.slice(partSize * 2),
    ];
  }, [sports]);

  return (
    <main className="flex w-full flex-col">
      <section className="flex min-h-[calc(100vh-var(--header-height)-64px)] flex-col items-center justify-center">
        <img src="/favicon.png" className="-mt-36 mb-8 h-48 w-48" />
        <h1 className="mb-4 text-center text-6xl font-medium tracking-tight">
          Единый Календарь Спорта
        </h1>
        <h2 className="flex items-center gap-2 text-center text-2xl opacity-80">
          <CountUp
            end={eventsTotal ?? 1000}
            duration={eventsTotal == null ? 30 : 3.5}
            separator=" "
            suffix=" "
          ></CountUp>
          <span>спортивных мероприятий из </span>
          <a
            href="https://www.minsport.gov.ru/activity/government-regulation/edinyj-kalendarnyj-plan/"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            ЕКП
          </a>
          <span> в одном месте.</span>
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate({
              to: "/search",
              search: { filters: { query: search } },
            });
          }}
          className="mt-10 flex w-full max-w-[600px] gap-2"
        >
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Название мероприятия, вид спорта, город..."
            className="max-w-[600px]"
          />
          <Button type="submit" variant="default">
            Найти
          </Button>
        </form>

        <div className="mt-4 flex gap-2">
          <Button
            variant="secondary"
            onClick={() => handleQuicklinkClick("1-month")}
          >
            На ближайший месяц
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleQuicklinkClick("3-months")}
          >
            На 3 месяца
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleQuicklinkClick("6-months")}
          >
            На 6 месяцев
          </Button>
        </div>
      </section>

      <Button
        asChild
        size="icon"
        variant="ghost"
        className="h-16 w-16 cursor-pointer self-center text-gray-500"
        onClick={() =>
          window.scrollTo({
            top: window.innerHeight,
            behavior: "smooth",
          })
        }
      >
        <ArrowDown />
      </Button>

      <section className="my-[64px]">
        <h2 className="text-center text-2xl font-medium">
          Выбери свой вид спорта
        </h2>
        <div className="my-6 flex flex-col gap-2">
          <Marquee direction="left" speed={20} pauseOnHover>
            {sports1.map((sport) => (
              <SportBadge
                key={sport.id}
                name={sport.sport}
                id={sport.id}
                className="mx-2"
              />
            ))}
          </Marquee>
          <Marquee direction="right" speed={20} pauseOnHover>
            {sports2.map((sport) => (
              <SportBadge
                key={sport.id}
                name={sport.sport}
                id={sport.id}
                className="mx-2"
              />
            ))}
          </Marquee>
          <Marquee direction="left" speed={20} pauseOnHover>
            {sports3.map((sport) => (
              <SportBadge
                key={sport.id}
                name={sport.sport}
                id={sport.id}
                className="mx-2"
              />
            ))}
          </Marquee>
        </div>
        <div className="flex justify-center">
          <Button asChild>
            <Link to="/sports">
              <span>Все виды спорта</span>
              <ChevronRight />
            </Link>
          </Button>
        </div>
      </section>

      <EventSelection
        title="Текущие события"
        sort={{ date: "asc" }}
        filters={{
          date: plainDatesForFilter(Temporal.Now.plainDateISO(), null),
        }}
        shuffle
      />

      <EventSelection
        title="Самые крупные события 2024"
        sort={{ participant_count: "desc" }}
        filters={{
          date: plainDatesForFilter(
            Temporal.PlainDate.from("2024-01-01"),
            Temporal.PlainDate.from("2024-12-31"),
          ),
        }}
      />

      <section className="my-[64px]">
        <h2 className="mb-6 text-center text-2xl font-medium">"Мне повезёт"</h2>
        {randomEvent ? (
          <EventCard event={randomEvent} className="mx-auto w-[900px]" />
        ) : (
          <Skeleton className="mx-auto h-[225px] w-[900px]" />
        )}
      </section>
    </main>
  );
}

function EventSelection({
  title,
  filters,
  sort,
  shuffle = false,
}: {
  title: string;
  filters: Filters;
  sort: Sort;
  shuffle?: boolean;
}) {
  const { data } = $api.useQuery("post", "/events/search", {
    body: {
      filters,
      sort,
      pagination: {
        page_no: 1,
        page_size: 15,
      },
    },
  });

  const events = useMemo(() => {
    if (!data?.events) return [];
    return shuffle
      ? data.events.slice().sort(() => Math.random() - 0.5)
      : data.events;
  }, [data]);

  return (
    <section className="my-[64px] w-full">
      <h2 className="mb-6 text-center text-2xl font-medium">{title}</h2>
      <ScrollArea className="w-full">
        <div className="flex gap-4 px-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} className="w-[900px]" />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}
