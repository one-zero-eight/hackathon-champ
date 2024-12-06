import { Button } from "@/components/ui/button.tsx";
import { Calendar } from "@/components/ui/calendar.tsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx";
import { cn, plainDatesForFilter } from "@/lib/utils.ts";
import { ru } from "date-fns/locale/ru";
import { Calendar as CalendarIcon } from "lucide-react";
import { FilterBaseProps } from "./common";
import { Filters } from "@/lib/types";
import { BaseFilter } from "./BaseFilter";
import { Temporal } from "temporal-polyfill";
import { useState } from "react";

export function DatesFilter(props: FilterBaseProps<Filters["date"]>) {
  const { disabled, value, onChange, ...rest } = props;

  const valueStartDate = value?.start_date ? new Date(value.start_date) : null;
  const valueStartPlain = valueStartDate ? dateToPlain(valueStartDate) : null;
  const valueEndDate = value?.end_date ? new Date(value.end_date) : null;
  const valueEndPlain = valueEndDate ? dateToPlain(valueEndDate) : null;

  return (
    <BaseFilter {...rest}>
      <div className="flex items-center gap-2">
        <DatePicker
          value={valueStartPlain}
          onChange={(v) => onChange(plainDatesForFilter(v, valueEndPlain))}
          placeholder="Не раньше"
        />
        <span>—</span>
        <DatePicker
          value={valueEndPlain}
          onChange={(v) => onChange(plainDatesForFilter(valueStartPlain, v))}
          placeholder="Не позже"
        />
      </div>
    </BaseFilter>
  );
}

function DatePicker({
  value,
  onChange,
  placeholder,
}: {
  value: Temporal.PlainDate | null;
  onChange: (v: Temporal.PlainDate | null) => void;
  placeholder: string;
}) {
  const selectedDate = value ? plainToDate(value) : undefined;
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant={"outline"}
          className={cn(
            "justify-start text-left font-normal flex-auto",
            !value && "text-muted-foreground",
          )}
        >
          <CalendarIcon />
          <span>
            {value
              ? plainToDate(value).toLocaleString("ru-RU", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })
              : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="center">
        <Calendar
          mode="single"
          defaultMonth={selectedDate}
          selected={selectedDate}
          onSelect={(newDate) => {
            onChange(newDate ? dateToPlain(newDate) : null);
          }}
          numberOfMonths={1}
          locale={ru}
        />
        <div className="flex justify-end gap-2 px-4 pb-4">
          <Button
            variant="default"
            onClick={() => {
              onChange(Temporal.Now.plainDateISO());
              setOpen(false);
            }}
          >
            Сегодня
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
          >
            Сбросить
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const plainToDate = (d: Temporal.PlainDate) =>
  new Date(d.year, d.month - 1, d.day);

const dateToPlain = (d: Date) =>
  Temporal.PlainDate.from({
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
  });
