import { Filters } from "@/lib/types";
import { DisciplineFilter } from "./DisciplineFilter";
import { MinMaxFilter } from "./MinMaxFilter";
import { DatesFilter } from "./DatesFilter";
import { GenderSelect } from "./GenderSelect";
import { LocationFilter } from "./LocationFilter";
import { cn } from "@/lib/utils";

export function AllFilters({
  disabled,
  filters,
  onChange,
  className,
  exclude = [],
}: {
  disabled?: boolean;
  filters: Filters;
  onChange: (v: Filters) => void;
  className?: string;
  exclude?: "date"[];
}) {
  function getOnChange<K extends keyof Filters>(
    k: K,
  ): (value: Filters[K]) => void {
    return (newValue) => {
      onChange({ ...filters, [k]: newValue });
    };
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <DisciplineFilter
        disabled={disabled}
        label="Виды спорта"
        value={filters.discipline}
        onChange={getOnChange("discipline")}
      />
      <LocationFilter
        disabled={disabled}
        label="Место проведения"
        value={filters.location}
        onChange={getOnChange("location")}
      />
      {!exclude.includes("date") && (
        <DatesFilter
          disabled={disabled}
          label="Даты проведения"
          value={filters.date}
          onChange={getOnChange("date")}
        />
      )}
      <MinMaxFilter
        disabled={disabled}
        label="Количество участников"
        value={filters.participant_count}
        onChange={getOnChange("participant_count")}
      />
      <MinMaxFilter
        disabled={disabled}
        label="Возраст"
        value={filters.age}
        onChange={getOnChange("age")}
      />
      <GenderSelect
        disabled={disabled}
        label="Пол"
        value={filters.gender}
        onChange={getOnChange("gender")}
      />
    </div>
  );
}
