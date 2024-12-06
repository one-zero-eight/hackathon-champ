import { Filters } from "@/lib/types";
import { FilterBaseProps } from "./common";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ArrowRight, Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { $api } from "@/api";
import { useEffect, useMemo, useState } from "react";
import { BaseFilter } from "./BaseFilter";

type FilterItem = Exclude<Filters["discipline"], null | undefined>[number];

const filterName = (f: FilterItem) =>
  f.discipline ? `${f.sport} (${f.discipline})` : f.sport;

export function DisciplineFilter(
  props: FilterBaseProps<Filters["discipline"]>,
) {
  const { disabled, value: valueRaw, onChange, ...rest } = props;

  const value = valueRaw ?? [];

  const selectedSports = useMemo(
    () => value.filter((x) => !x.discipline).map((x) => x.sport),
    [value],
  );

  const { data } = $api.useQuery("get", "/events/search/filters/disciplines");
  const [sports, disciplinesBySport] = useMemo(() => {
    const bySport = new Map<string, string[]>();
    const sports = [] as string[];

    for (const s of data ?? []) {
      sports.push(s.sport);
      bySport.set(s.sport, s.disciplines);
    }

    return [sports, bySport];
  }, [data]);

  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [pendingSport, setPendingSport] = useState<string | null>(null);

  useEffect(() => {
    setQ("");
  }, [pendingSport]);

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  const pendingDisciplines = pendingSport
    ? disciplinesBySport.get(pendingSport)
    : null;

  const selectedPendingDisciplines = useMemo(
    () =>
      value
        .filter(
          (x) => x.discipline && pendingDisciplines?.includes(x.discipline),
        )
        .map((x) => x.discipline),
    [pendingDisciplines, value],
  );

  const handleRemoveFilter = (i: FilterItem) => {
    onChange(
      value.filter(
        (x) => !(x.sport === i.sport && x.discipline === i.discipline),
      ),
    );
  };
  const handleWholeSportSelect = (s: string) => {
    onChange([...value.filter((x) => x.sport !== s), { sport: s }]);
    setPendingSport(null);
  };
  const handleSportToggle = (s: string) => {
    const selectedIdx = value.findIndex((x) => x.sport === s && !x.discipline);
    if (selectedIdx >= 0) {
      onChange([
        ...value.slice(0, selectedIdx),
        ...value.slice(selectedIdx + 1),
      ]);
    } else if (!disciplinesBySport.get(s)?.length) {
      handleWholeSportSelect(s);
    } else {
      setPendingSport(s);
    }
  };
  const handleDisciplineToggle = (d: string) => {
    if (!pendingSport) return;

    const selectedIdx = value.findIndex(
      (x) => x.sport === pendingSport && x.discipline === d,
    );
    if (selectedIdx >= 0) {
      onChange([
        ...value.slice(0, selectedIdx),
        ...value.slice(selectedIdx + 1),
      ]);
    } else {
      onChange([...value, { sport: pendingSport, discipline: d }]);
    }
  };

  const label = value.length === 0 ? "Любой" : value.map(filterName).join(", ");

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen === false && pendingSport) {
      setPendingSport(null);
      return;
    }

    setOpen(newOpen);
  };

  return (
    <BaseFilter {...rest}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            disabled={disabled}
            variant="outline"
            role="combobox"
            className="justify-between"
          >
            <span className="min-w-0 overflow-hidden overflow-ellipsis">
              {label}
            </span>
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command
            loop
            onKeyDown={(e) => {
              if (e.key === "Escape" || (e.key === "Backspace" && !q)) {
                e.preventDefault();
                e.stopPropagation();
                setPendingSport(null);
              }
            }}
          >
            <CommandInput
              placeholder={pendingSport ? "Дисциплины..." : "Вид спорта..."}
              className="h-9"
              value={q}
              onValueChange={setQ}
            />
            <CommandList>
              <CommandEmpty>Ничего не найдено</CommandEmpty>
              {!pendingSport &&
                sports.map((s) => (
                  <CommandItem
                    key={s}
                    value={s}
                    onSelect={() => handleSportToggle(s)}
                  >
                    {s}
                    {selectedSports.includes(s) ? (
                      <Check className="ml-auto h-4 w-4" />
                    ) : Boolean(disciplinesBySport.get(s)?.length) ? (
                      <ArrowRight className="ml-auto h-4 w-4 opacity-50" />
                    ) : null}
                  </CommandItem>
                ))}
              {pendingSport && (
                <CommandGroup heading={pendingSport}>
                  <CommandItem
                    value="$all"
                    onSelect={() => handleWholeSportSelect(pendingSport)}
                  >
                    Все дисциплины
                  </CommandItem>
                  {pendingDisciplines &&
                    pendingDisciplines.map((d) => (
                      <CommandItem
                        value={d}
                        key={d}
                        onSelect={() => handleDisciplineToggle(d)}
                      >
                        {d}
                        {selectedPendingDisciplines.includes(d) && (
                          <Check className="ml-auto h-4 w-4" />
                        )}
                      </CommandItem>
                    ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <div className="flex flex-col gap-2">
        {value.map((f) => (
          <div
            key={filterName(f)}
            className="flex items-center rounded bg-blue-50 p-2 pl-4"
          >
            <span className="mr-2 text-sm">{filterName(f)}</span>
            <Button
              variant="outline"
              size="icon"
              className="ml-auto flex-shrink-0"
              onClick={() => handleRemoveFilter(f)}
            >
              <X />
            </Button>
          </div>
        ))}
      </div>
    </BaseFilter>
  );
}
