import { $api, apiTypes } from "@/api";
import { useMe } from "@/api/me.ts";
import {
  receivePushSubscription,
  sendNotification,
} from "@/api/notifications.ts";
import { NotificationsDialog } from "@/components/NotificationsDialog.tsx";
import { NotificationsOkDialog } from "@/components/NotificationsOkDialog.tsx";
import { NotificationsPastDialog } from "@/components/NotificationsPastDialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useNavigate } from "@tanstack/react-router";
import { BellPlus } from "lucide-react";
import { useState } from "react";

export function EventSubscribeButton({
  event,
}: {
  event: apiTypes.SchemaEventOutput;
}) {
  const navigate = useNavigate();

  const { data: me } = useMe();
  const { mutate } = $api.useMutation("post", "/notify/", {
    onSuccess: () => setOkDialogOpen(true),
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [okDialogOpen, setOkDialogOpen] = useState(false);
  const [pastDialogOpen, setPastDialogOpen] = useState(false);

  const subscribe = async () => {
    if (!me) {
      navigate({
        to: "/auth/login",
        search: { redirectTo: window.location.href },
      });
      return;
    }

    const pushSubscription = await receivePushSubscription();
    if (!pushSubscription) {
      setDialogOpen(true);
      return;
    }

    setDialogOpen(false);

    if (new Date(event.start_date) < new Date()) {
      setPastDialogOpen(true);
      return;
    }

    sendNotification();
    mutate({
      body: {
        notification_options: pushSubscription.toJSON() as any,
        notification_type: {
          type: "event",
          id: event.id,
        },
      },
    });
  };

  return (
    <>
      <Button
        className="h-7 w-fit rounded-md px-2"
        variant="secondary"
        onClick={() => subscribe()}
      >
        <BellPlus />
        Получать уведомления
      </Button>

      <NotificationsDialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        retry={() => subscribe()}
      />
      <NotificationsOkDialog open={okDialogOpen} setOpen={setOkDialogOpen} />
      <NotificationsPastDialog
        open={pastDialogOpen}
        setOpen={setPastDialogOpen}
      />
    </>
  );
}
