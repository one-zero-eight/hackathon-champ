import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";

export function NotificationsDialog({
  open,
  setOpen,
  retry,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  retry: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Нет разрешения на уведомления</DialogTitle>
          <DialogDescription>
            Похоже, что вы не разрешили сайту отправлять вам уведомления.
            Пожалуйста, разрешите уведомления в настройках браузера и попробуйте
            снова.
          </DialogDescription>
          <a
            href="https://yandex.ru/support/common/ru/browsers-settings/notifications"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-blue-500 underline"
          >
            Инструкция для разных браузеров
          </a>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <Button type="button" variant="default" onClick={() => retry()}>
            Проверить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
