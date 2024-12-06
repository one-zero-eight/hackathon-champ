import { $api } from "@/api";
import { SchemaSort } from "@/api/types.ts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Filters } from "@/lib/types.ts";
import { useEffect } from "react";

export function GetUrlToFiltersDialog({
  open,
  setOpen,
  filters,
  sort,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  filters: Filters | undefined;
  sort: SchemaSort | undefined;
}) {
  const { mutate, data } = $api.useMutation("post", "/events/search/share");

  const url = data?.id
    ? `${window.location.origin}/search?share=${data.id}`
    : null;

  useEffect(() => {
    if (open) {
      mutate({
        body: { filters: filters || {}, sort: sort || {} },
      });
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader className="text-left">
          <DialogTitle>Поделиться подборкой</DialogTitle>
          <DialogDescription>
            Ваша ссылка на текущую подборку:
          </DialogDescription>
          <Input
            readOnly
            value={url ?? ""}
            className="px-2 text-sm text-gray-600"
            onFocus={(e) => e.target?.select?.()}
            // @ts-ignore
            onClick={(e) => e.target?.select?.()}
            // @ts-ignore
            onDoubleClick={(e) => e.target?.select?.()}
            // @ts-ignore
            onSelect={(e) => e.target?.select?.()}
          />
          <DialogDescription>
            Отправьте её своим друзьям, чтобы поделиться текущей подборкой.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
