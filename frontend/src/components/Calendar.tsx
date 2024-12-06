import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

const MONTH_NAMES: { [n in number]?: string } = {
  0: "Январь",
  1: "Февраль",
  2: "Март",
  3: "Апрель",
  4: "Май",
  5: "Июнь",
  6: "Июль",
  7: "Август",
  8: "Сентябрь",
  9: "Октябрь",
  10: "Ноябрь",
  11: "Декабрь",
};

const MONTH_IDX = Object.keys(MONTH_NAMES).map((n) => Number(n));

export function Calendar({
  year,
  onYearChange,
  onMonthSelect,
  disabled = false,
  className,
  countByMonth,
}: {
  year: number;
  onYearChange: (newYear: number) => void;
  onMonthSelect: (year: number, monthIdx: number) => void;
  disabled?: boolean;
  countByMonth: Record<number, number>;
  className?: string;
}) {
  const visibleYears = [
    year - 3,
    year - 2,
    year - 1,
    year,
    year + 1,
    year + 2,
    year + 3,
  ];

  return (
    <div className={cn("h-fit overflow-hidden rounded-md border", className)}>
      <div className="flex justify-between gap-2 border-b px-4 py-2">
        <Button
          className="flex-shrink-0"
          disabled={disabled}
          variant="outline"
          size="icon"
          onClick={() => onYearChange(year - 1)}
        >
          <ChevronLeft />
        </Button>
        <div className="flex min-w-0 flex-shrink justify-center gap-2 overflow-hidden">
          {visibleYears.map((visibleYear) => (
            <Button
              disabled={disabled}
              key={visibleYear}
              onClick={() => onYearChange(visibleYear)}
              variant={visibleYear === year ? "default" : "ghost"}
            >
              {visibleYear}
            </Button>
          ))}
        </div>
        <Button
          className="flex-shrink-0"
          disabled={disabled}
          variant="outline"
          size="icon"
          onClick={() => onYearChange(year + 1)}
        >
          <ChevronRight />
        </Button>
      </div>
      <div className="grid grid-cols-4 grid-rows-3 gap-2 bg-stone-100 p-4">
        {MONTH_IDX.map((idx) => (
          <Button
            disabled={disabled}
            variant="outline"
            className="group flex h-fit min-w-[165px] flex-col items-center p-2"
            key={idx}
            onClick={() => onMonthSelect(year, idx)}
          >
            <span className="text-xl">{MONTH_NAMES[idx]}</span>
            <Badge
              variant="secondary"
              className={cn(
                (countByMonth[idx] ?? 0) > 0
                  ? "bg-green-100 group-hover:bg-green-200"
                  : "bg-stone-100 group-hover:bg-stone-200",
              )}
            >
              {`${countByMonth[idx] ?? "—"} мероприятий`}
            </Badge>
          </Button>
        ))}
      </div>
    </div>
  );
}
