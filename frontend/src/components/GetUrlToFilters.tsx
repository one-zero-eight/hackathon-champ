import { SchemaSort } from "@/api/types.ts";
import { GetUrlToFiltersDialog } from "@/components/GetUrlToFiltersDialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Filters } from "@/lib/types.ts";
import { Share2 } from "lucide-react";
import { useState } from "react";

export function GetUrlToFilters({
  filters,
  sort,
}: {
  filters: Filters | undefined;
  sort: SchemaSort | undefined;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button className="w-full" onClick={() => setOpen(true)}>
        <Share2 />
        Поделиться подборкой
      </Button>
      <GetUrlToFiltersDialog
        open={open}
        setOpen={setOpen}
        filters={filters}
        sort={sort}
      />
    </>
  );
}
