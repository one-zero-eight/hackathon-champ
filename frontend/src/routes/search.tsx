import { $api } from "@/api";
import { EventCard } from "@/components/EventCard.tsx";
import { ExportFiltersToCalendar } from "@/components/ExportFiltersToCalendar.tsx";
import { AllFilters } from "@/components/filters/AllFilters";
import { GetUrlToFilters } from "@/components/GetUrlToFilters.tsx";
import { SaveFilters } from "@/components/SaveFilters.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Filters } from "@/lib/types";
import { normalizeFilters, plainDatesForFilter } from "@/lib/utils";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useDebounce } from "react-use";
import { Temporal } from "temporal-polyfill";

export const Route = createFileRoute("/search")({
  component: RouteComponent,
  validateSearch: (search): { filters?: Filters; share?: string } => {
    return {
      filters: (search.filters as Filters | undefined) || undefined,
      share: (search.share as string | undefined) || undefined,
    };
  },
});

const getInitialFilters: () => Filters = () => ({
  date: plainDatesForFilter(Temporal.Now.plainDateISO(), null),
});

const SORT_PRESETS = {
  "Сначала ранние": {
    date: "asc",
  },
  "Сначала поздние": {
    date: "desc",
  },
  "Больше участников": {
    participant_count: "desc",
  },
  "Меньше участников": {
    participant_count: "asc",
  },
};

function RouteComponent() {
  const navigate = useNavigate();
  const { filters: routeFilters, share } = Route.useSearch();
  const [actualFilters, setActualFilters] = useState<Filters | undefined>(
    getInitialFilters,
  );
  const [filtersChanging, setFiltersChanging] = useState(false);
  const [debouncedFilters, setDebouncedFilters] = useState<Filters | undefined>(
    actualFilters,
  );
  const [query, setQuery] = useState("");
  const { data: shareFilters, isLoading: sharedLoading } = $api.useQuery(
    "get",
    "/events/search/share/{selection_id}",
    { params: { path: { selection_id: share ?? "" } } },
    { enabled: !!share },
  );
  const [sortPreset, setSortPreset] = useState<
    keyof typeof SORT_PRESETS | undefined
  >("Сначала ранние");

  useEffect(() => {
    const newFilters = shareFilters?.filters ?? routeFilters;
    if (newFilters) {
      setActualFilters(newFilters);
      setQuery(newFilters.query ?? "");
    }
  }, [routeFilters, shareFilters]);

  useDebounce(
    () => {
      setDebouncedFilters(actualFilters);
      setFiltersChanging(false);
      if (!sharedLoading) {
        const newFilters = { ...actualFilters, query: query || undefined };
        navigate({
          to: "/search",
          search: {
            filters: Object.keys(newFilters).length ? newFilters : undefined,
          },
        });
      }
    },
    300,
    [actualFilters, query, filtersChanging],
  );

  const handleFiltersChange = (newFilters: Filters) => {
    setFiltersChanging(true);
    setActualFilters(newFilters);
  };

  const handleQueryChange = (newQuery: string) => {
    setFiltersChanging(true);
    setQuery(newQuery);
  };

  const handleResetFilters = () => {
    const initial = getInitialFilters();
    setActualFilters(initial);
    setDebouncedFilters(initial);
    setQuery("");
  };

  const { data, isPending: dataLoading } = $api.useQuery(
    "post",
    "/events/search",
    {
      body: {
        filters: normalizeFilters(debouncedFilters || {}),
        pagination: {
          page_no: 1,
          page_size: 100,
        },
        sort: sortPreset ? SORT_PRESETS[sortPreset] : {},
      },
    },
    { enabled: !filtersChanging && !sharedLoading },
  );

  const loading = dataLoading || filtersChanging || sharedLoading;

  return (
    <div
      className="flex gap-4 pl-[var(--sidebar-width)]"
      style={
        {
          "--sidebar-width": "400px",
        } as React.CSSProperties
      }
    >
      <aside className="fixed left-0 h-[calc(100vh-var(--header-height))] w-[400px] flex-shrink-0 flex-grow-0 overflow-auto border-r p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Фильтры</h3>
            <Button size="sm" variant="secondary" onClick={handleResetFilters}>
              Сбросить
            </Button>
          </div>
          <Separator />
          <AllFilters
            filters={actualFilters || {}}
            onChange={handleFiltersChange}
            className="w-full"
          />
          <Separator />
          <div className="flex flex-col gap-2">
            <SaveFilters filters={actualFilters} sort={{}} />
            <GetUrlToFilters filters={actualFilters} sort={{}} />
            <ExportFiltersToCalendar filters={actualFilters} />
          </div>
        </div>
      </aside>

      <main className="flex-grow gap-2">
        <div className="sticky top-[var(--header-height)] z-10 border-b bg-white bg-opacity-90 p-4 backdrop-blur">
          <Input
            className="rounded-md border border-gray-300 px-2 py-1"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Название, вид спорта, город..."
          />
          <div className="mt-2">
            <Select value={sortPreset} onValueChange={setSortPreset as any}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Сортировка" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {Object.keys(SORT_PRESETS).map((preset) => (
                    <SelectItem key={preset} value={preset}>
                      {preset}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-col gap-4 bg-stone-100 p-4">
          {loading ? (
            <>
              <Skeleton className="h-[200px] bg-stone-200" />
              <Skeleton className="h-[200px] bg-stone-200" />
              <Skeleton className="h-[200px] bg-stone-200" />
              <Skeleton className="h-[200px] bg-stone-200" />
              <Skeleton className="h-[200px] bg-stone-200" />
            </>
          ) : data?.events.length ? (
            data.events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))
          ) : (
            <div className="flex h-[200px] w-full items-center justify-center">
              Ничего не найдено
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
