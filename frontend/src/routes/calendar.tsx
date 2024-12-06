import { $api } from "@/api";
import { Calendar } from "@/components/Calendar";
import { AllFilters } from "@/components/filters/AllFilters";
import { Separator } from "@/components/ui/separator";
import { Filters } from "@/lib/types";
import { normalizeFilters, plainDatesForFilter } from "@/lib/utils";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Temporal } from "temporal-polyfill";

export const Route = createFileRoute("/calendar")({
  component: RouteComponent,
});

const monthRanges = (
  year: number,
  monthIdx: number,
): [Temporal.PlainDate, Temporal.PlainDate] => {
  const startDate = Temporal.PlainDate.from(
    `${year}-${(monthIdx + 1).toString().padStart(2, "0")}-01`,
  );
  const endDate = startDate.add({ months: 1 });
  return [startDate, endDate];
};

function RouteComponent() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Filters>({});
  const [year, setYear] = useState(new Date().getFullYear());

  const dateFilter = useMemo(
    () => ({
      start_date: `${year}-01-01`,
      end_date: `${year + 1}-01-01`,
    }),
    [year],
  );

  const completeFilters = useMemo(
    () => ({
      ...filters,
      date: dateFilter,
    }),
    [filters, dateFilter],
  );

  const { data, isLoading } = $api.useQuery(
    "post",
    "/events/search/count-by-month",
    {
      body: normalizeFilters(completeFilters),
    },
  );

  const countByMonth = useMemo(() => {
    const byMonth = Object.fromEntries(
      Array.from({ length: 12 }, (_, i) => [i, 0]),
    );
    Object.entries(data ?? {}).forEach(([month, count]) => {
      const [yearStr, monthStr] = month.split("-");
      if (yearStr === String(year)) {
        byMonth[Number(monthStr) - 1] = count;
      }
    });
    return byMonth;
  }, [data]);

  return (
    <div className="mx-auto mt-8 flex gap-4">
      <AllFilters filters={filters} onChange={setFilters} exclude={["date"]} />
      <Separator orientation="vertical" />
      <Calendar
        disabled={isLoading}
        year={year}
        onYearChange={setYear}
        countByMonth={countByMonth}
        onMonthSelect={(y, m) => {
          navigate({
            to: "/search",
            search: {
              filters: {
                ...filters,
                date: plainDatesForFilter(...monthRanges(y, m)),
              },
            },
          });
        }}
      />
    </div>
  );
}
