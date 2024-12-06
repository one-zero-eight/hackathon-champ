import { $api } from "@/api";
import { EventCard } from "@/components/EventCard";
import { ExportSportToCalendar } from "@/components/ExportSportToCalendar.tsx";
import { SportSubscribeButton } from "@/components/SportSubscribeButton.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, normalizeFilters, plainDatesForFilter } from "@/lib/utils.ts";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowUpRight, ChevronsUpDown, Link as LinkIcon } from "lucide-react";
import { Temporal } from "temporal-polyfill";
import SportSVG from "./sport.svg";

export const Route = createFileRoute("/sports/$sportId")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { sportId } = Route.useParams();
  const { data: sport, isLoading } = $api.useQuery("get", "/sports/{id}", {
    params: { path: { id: sportId } },
  });

  const { data: upcomingEvents, isLoading: upcomingLoading } = $api.useQuery(
    "post",
    "/events/search",
    {
      body: {
        filters: normalizeFilters({
          date: plainDatesForFilter(Temporal.Now.plainDateISO(), null),
          discipline: [{ sport: sport?.sport ?? "" }],
        }),
        pagination: { page_size: 100, page_no: 1 },
        sort: {
          date: "asc",
        },
      },
    },
    { enabled: !!sport?.sport },
  );

  const avatarUrl = sport
    ? `/api/static/${sport.sport.toLocaleLowerCase().replace(" ", "_")}.png`
    : null;

  const handleDisciplineSelect = (d: string) => {
    if (sport) {
      navigate({
        to: "/search",
        search: {
          filters: {
            discipline: [{ sport: sport.sport, discipline: d }],
          },
        },
        replace: false,
      });
    }
  };

  return (
    <div className="container mx-auto my-6 flex w-full max-w-[1140px] flex-col px-4">
      <div className="flex flex-col gap-4 rounded-lg border px-8 py-4">
        <div className="flex items-center gap-6">
          <div className="h-[256px] w-[256px] flex-shrink-0 flex-grow-0 overflow-hidden rounded-xl">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <img
                src={avatarUrl ?? ""}
                onError={(e) => {
                  if (avatarUrl) {
                    // @ts-ignore
                    e.target.src = SportSVG;
                  }
                }}
                className={cn(
                  "h-full w-full bg-black",
                  !avatarUrl && "invisible",
                )}
              />
            )}
          </div>
          <div className="flex flex-grow flex-col">
            {isLoading ? (
              <>
                <Skeleton className="mb-3 h-10 w-[150px]" />
                <Skeleton className="h-12 w-full" />
              </>
            ) : (
              <>
                <h1 className="mb-1 text-3xl font-medium">{sport?.sport}</h1>
                <p>{sport?.description}</p>
                <Button
                  asChild
                  className="mt-2 w-fit rounded-md text-xs"
                  variant="secondary"
                >
                  <a
                    href={`https://storage.minsport.gov.ru/cms-uploads/cms/II_chast_EKP_2024_14_11_24_65c6deea36.pdf#page=${sport?.page}&search=${sport?.sport}`}
                    target="_blank"
                    rel="noreferrer"
                    className="!text-blue-500"
                  >
                    <LinkIcon />
                    Найти в ЕКП
                  </a>
                </Button>
              </>
            )}
          </div>
        </div>
        <Separator />
        <div className="flex items-stretch gap-2">
          {isLoading ? (
            <Skeleton className="w-[150px]" />
          ) : (
            <Button asChild variant="outline">
              <Link
                to="/search"
                search={{
                  filters: { discipline: [{ sport: sport?.sport ?? "" }] },
                }}
              >
                События спорта
                <ArrowUpRight />
              </Link>
            </Button>
          )}
          {isLoading ? (
            <Skeleton className="w-[225px]" />
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-fit justify-between"
                >
                  <span>{`События по ${sport?.disciplines.length || ""} дисциплинам`}</span>
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Command>
                  <CommandInput
                    placeholder="Поиск дисциплины..."
                    className="h-9"
                  />
                  <CommandList>
                    <CommandGroup>
                      {sport?.disciplines.map((discipline, i) => {
                        return (
                          <CommandItem
                            key={i}
                            value={discipline}
                            onSelect={handleDisciplineSelect}
                          >
                            <span>{discipline}</span>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}

          <div className="ml-auto flex flex-wrap gap-2">
            <SportSubscribeButton sportId={sportId} />
            <ExportSportToCalendar sportId={sportId} className="w-fit" />
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <h2 className="text-xl">Предстоящие события</h2>
        {isLoading || upcomingLoading ? (
          <>
            <Skeleton className="h-[150px] w-full" />
            <Skeleton className="h-[150px] w-full" />
            <Skeleton className="h-[150px] w-full" />
            <Skeleton className="h-[150px] w-full" />
            <Skeleton className="h-[150px] w-full" />
          </>
        ) : (upcomingEvents?.events.length ?? 0) > 0 ? (
          <>
            {upcomingEvents?.events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </>
        ) : (
          <div className="mx-auto rounded-xl bg-stone-100 px-[64px] py-10 text-lg text-stone-500">
            <span>Нет запланированных событий</span>
          </div>
        )}
      </div>
    </div>
  );
}
