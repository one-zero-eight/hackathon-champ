import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";

export function NotificationsPastDialog({
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
          <DialogTitle>Это событие уже прошло</DialogTitle>
          <DialogDescription>
            Вы не можете подписаться на уведомления о прошедшем событии.
            Выберите другое событие, которое еще не началось.
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
