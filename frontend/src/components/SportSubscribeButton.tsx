import { $api } from "@/api";
import { useMe } from "@/api/me.ts";
import {
  receivePushSubscription,
  sendNotification,
} from "@/api/notifications.ts";
import { NotificationsDialog } from "@/components/NotificationsDialog.tsx";
import { NotificationsOkDialog } from "@/components/NotificationsOkDialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useNavigate } from "@tanstack/react-router";
import { BellPlus } from "lucide-react";
import { useState } from "react";

export function SportSubscribeButton({ sportId }: { sportId: string }) {
  const navigate = useNavigate();

  const { data: me } = useMe();
  const { mutate } = $api.useMutation("post", "/notify/", {
    onSuccess: () => setOkDialogOpen(true),
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [okDialogOpen, setOkDialogOpen] = useState(false);

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
    sendNotification();
    mutate({
      body: {
        notification_options: pushSubscription.toJSON() as any,
        notification_type: {
          type: "sport",
          id: sportId,
        },
      },
    });
  };

  return (
    <>
      <Button className="w-fit" onClick={() => subscribe()}>
        <BellPlus />
        Получать уведомления
      </Button>

      <NotificationsDialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        retry={() => subscribe()}
      />
      <NotificationsOkDialog open={okDialogOpen} setOpen={setOkDialogOpen} />
    </>
  );
}
