import { $api } from "@/api";
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

export function ExportFiltersToCalendarDialog({
  open,
  setOpen,
  filters,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  filters: Filters | undefined;
}) {
  const { mutate, data } = $api.useMutation("post", "/events/search/share");

  const url = data?.id
    ? `${window.location.origin}/api/events/search/share/${data.id}/.ics`
    : null;

  useEffect(() => {
    if (!filters) return;
    if (open) {
      mutate({
        body: { filters, sort: {} },
      });
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader className="text-left">
          <DialogTitle>Экспорт в приложение календаря</DialogTitle>
          <DialogDescription>
            Вы можете добавить все события из данной подборки по фильтрам в свой
            календарь (например, Яндекс Календарь, Google Календарь или Apple
            Календарь).
          </DialogDescription>
          <DialogDescription>
            При обновлениях мероприятий в подборке, они также будут обновляться
            в вашем календаре.
          </DialogDescription>
          <DialogDescription>Скопируйте ссылку ниже:</DialogDescription>
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
            В приложении своего календаря укажите подписку на эту ссылку:
            <a
              className="ml-4 flex w-fit flex-row items-center gap-x-2 underline"
              href="https://calendar.yandex.ru/week?sidebar=addFeed"
              target="_blank"
            >
              <span className="icon-[material-symbols--link] text-contrast/50" />
              Яндекс Календарь
            </a>
            <a
              className="ml-4 flex w-fit flex-row items-center gap-x-2 underline"
              href="https://calendar.google.com/calendar/u/0/r/settings/addbyurl"
              target="_blank"
            >
              <span className="icon-[material-symbols--link] text-contrast/50" />
              Google Календарь
            </a>
          </DialogDescription>
          <DialogDescription>
            Поздравляем! Теперь вы будете видеть все события из подборки в своём
            календаре и получать уведомления о них.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
