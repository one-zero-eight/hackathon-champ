import { Button } from "@/components/ui/button.tsx";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command.tsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { FilterBaseProps } from "./common";
import { $api } from "@/api";
import { BaseFilter } from "./BaseFilter";
import { Filters } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "../ui/badge";
import { useDebounce } from "react-use";
import { cn, locationText } from "@/lib/utils";

type FlatLocation = {
  t: "country" | "region" | "city";
  name: string;
  filter: LocationFilterItem;
};

type LocationFilterItem = Exclude<
  Filters["location"],
  null | undefined
>[number];

const filterItemToFlat = (i: LocationFilterItem): FlatLocation => {
  return {
    t: i.city ? "city" : i.region ? "region" : "country",
    name: locationText(i),
    filter: i,
  };
};

const LocBadge = ({ t }: { t: FlatLocation["t"] }) => {
  return (
    <Badge variant="outline" className="ml-auto mr-2">
      {t === "city" ? "Город" : t === "country" ? "Страна" : "Регион"}
    </Badge>
  );
};

const compItems = (a: LocationFilterItem, b: LocationFilterItem) =>
  a.country === b.country && a.region === b.region && a.city === b.city;

export function LocationFilter(props: FilterBaseProps<Filters["location"]>) {
  const { disabled, value: valueRaw, onChange, ...rest } = props;

  const value = valueRaw ?? [];

  const { data } = $api.useQuery("get", "/events/search/filters/locations");

  const selected = useMemo<FlatLocation[]>(
    () => value.map(filterItemToFlat),
    [value],
  );
  const all = useMemo<FlatLocation[]>(() => {
    const flat = [] as FlatLocation[];
    for (const x of data ?? []) {
      const filter = { country: x.country };
      if (filter.country) {
        flat.push({
          name: locationText(filter),
          t: "country",
          filter,
        });
      }
      for (const y of x.regions) {
        const filter = { country: x.country, region: y.region };
        if (filter.region) {
          flat.push({
            name: locationText(filter),
            t: "region",
            filter,
          });
        }
        for (const z of y.cities) {
          const filter = { country: x.country, region: y.region, city: z };
          if (filter.city) {
            flat.push({
              name: locationText(filter),
              t: "city",
              filter,
            });
          }
        }
      }
    }
    return flat;
  }, [data]);

  const [open, setOpen] = useState(false)
  const [q, setQ] = useState("");
  const [qDeb, setQDeb] = useState("");
  useDebounce(
    () => {
      setQDeb(q);
    },
    500,
    [q, setQDeb],
  );

  useEffect(() => {
    if (!open) {
      setQ('')
      setQDeb('')
    }
  }, [open])

  const filtered = useMemo(
    () =>
      all
        .filter(({ name }) => name.toLowerCase().includes(qDeb.trim().toLowerCase()))
        .slice(0, 300)
        .map((x) => ({
          ...x,
          selected: selected.some((s) => s.name === x.name),
        })),
    [qDeb, all, selected],
  );

  const handleSelect = (l: LocationFilterItem) => {
    if (value.find((x) => compItems(x, l)))
      onChange(value.filter((x) => !compItems(x, l)));
    else onChange([...value, l]);
  };

  const label = value.length === 0 ? "Любое" : value.map(locationText).join(", ");

  return (
    <BaseFilter {...rest}>
      <Popover open={open} onOpenChange={setOpen}>
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
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Страна, регион, город..."
              className="h-9"
              value={q}
              onValueChange={setQ}
            />
            <CommandList>
              <CommandEmpty>Ничего не найдено</CommandEmpty>
              {filtered.map(({ t, name, filter, selected }) => (
                <CommandItem key={name} onSelect={() => handleSelect(filter)}>
                  <span>{name}</span>
                  <LocBadge t={t} />
                  <Check
                    className={cn(
                      "ml-2 h-4 w-4",
                      selected ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="flex flex-col gap-2">
        {selected.map(({ t, name, filter }) => (
          <div
            key={name}
            className="flex items-center rounded bg-blue-50 p-2 pl-4"
          >
            <span className="mr-2 text-sm">{name}</span>
            <LocBadge t={t} />
            <Button
              variant="outline"
              size="icon"
              className="flex-shrink-0"
              onClick={() => handleSelect(filter)}
            >
              <X />
            </Button>
          </div>
        ))}
      </div>
    </BaseFilter>
  );
}
