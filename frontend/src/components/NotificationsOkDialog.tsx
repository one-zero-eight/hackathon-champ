import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";

export function NotificationsOkDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Вы подписались на уведомления!</DialogTitle>
          <DialogDescription>
            Теперь вы будете получать уведомления о событиях в ваш браузер.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="default"
            onClick={() => setOpen(false)}
          >
            Ок
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
