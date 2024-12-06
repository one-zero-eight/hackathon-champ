import { $api } from "@/api";
import { useMe } from "@/api/me.ts";
import { sendNotification } from "@/api/notifications.ts";
import { NotificationsDialog } from "@/components/NotificationsDialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { useQueries } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, Check, CircleX } from "lucide-react";
import { Fragment, useEffect, useState } from "react";

export const Route = createFileRoute("/profile")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: me } = useMe();
  const { data: subscriptions } = $api.useQuery(
    "post",
    "/notify/my-subscriptions",
  );
  const { data: sports } = $api.useQuery("get", "/sports/");

  const selections = useQueries({
    queries:
      me?.favorites?.map((v) =>
        $api.queryOptions("get", "/events/search/share/{selection_id}", {
          params: { path: { selection_id: v } },
        }),
      ) ?? [],
  });

  const [notificationPermission, setNotificationPermission] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const checkNotificationPermission = async () => {
    if (!("Notification" in window)) {
      setNotificationPermission(false);
    } else {
      setNotificationPermission(Notification.permission === "granted");
    }
  };

  const requestNotificationPermission = async () => {
    const permission = await sendNotification();
    setNotificationPermission(permission);
    return permission;
  };

  useEffect(() => {
    checkNotificationPermission();
  }, []);

  return (
    <div className="flex justify-center p-4">
      <div className="flex max-w-4xl flex-col gap-2">
        <h1 className="text-2xl font-bold">Профиль - {me?.login}</h1>

        <Card className="flex w-full flex-col gap-2 p-4">
          <div>
            <h2 className="mb-2 text-2xl font-semibold">Уведомления</h2>
            <div className="flex items-center gap-2">
              <p>Разрешение:</p>
              {notificationPermission ? (
                <p className="flex flex-row items-center gap-1 text-green-500">
                  <Check size={18} />
                  <span>есть</span>
                </p>
              ) : (
                <p className="flex flex-row items-center gap-1 text-red-500">
                  <CircleX size={18} />
                  <span>нет</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-2 text-black"
                    onClick={async () => {
                      if (!(await requestNotificationPermission())) {
                        setDialogOpen(true);
                      }
                    }}
                  >
                    Проверить
                  </Button>
                  <NotificationsDialog
                    open={dialogOpen}
                    setOpen={setDialogOpen}
                    retry={() => requestNotificationPermission()}
                  />
                </p>
              )}
            </div>

            <h2 className="mt-4 text-xl font-medium">Ближайшие уведомления:</h2>
            <div className="flex flex-col gap-2">
              {subscriptions?.length ? (
                subscriptions?.map((v, i) => (
                  <Fragment key={v.id}>
                    <div key={v.id} className="flex items-center gap-4 p-2">
                      <div className="flex flex-col items-center gap-2 text-xl font-medium">
                        <Calendar />
                        <div className="flex flex-col">
                          {v.event_dates.slice(0, 3).map((d) => (
                            <div>{new Date(d).toLocaleDateString("ru-RU")}</div>
                          ))}
                        </div>
                      </div>

                      <div>
                        {v.sport_id ? (
                          <Link
                            to="/sports/$sportId"
                            params={{ sportId: v.sport_id ?? "" }}
                            className="text-xl"
                          >
                            {v.sport_title}
                          </Link>
                        ) : (
                          <>
                            <Link
                              to="/sports/$sportId"
                              params={{
                                sportId:
                                  sports?.find((s) => s.sport === v.sport_title)
                                    ?.id ?? "",
                              }}
                              className="text-gray-500 underline"
                            >
                              {v.sport_title}
                            </Link>
                            <div className="text-xl">{v.event_title}</div>
                          </>
                        )}
                      </div>
                    </div>
                    {i < subscriptions.length - 1 && <Separator />}
                  </Fragment>
                ))
              ) : (
                <div className="text-gray-500">
                  Нет настроенных уведомлений. Подпишитесь на какое-нибудь
                  событие в Поиске или выберите понравившийся вид спорта.
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="flex w-full flex-col gap-2 p-4">
          <div>
            <h2 className="mb-2 text-2xl font-semibold">Мои подборки</h2>
            <div className="flex flex-col gap-2">
              {selections?.length ? (
                selections?.map(
                  (v, i) =>
                    v?.data && (
                      <Fragment key={v.data.id}>
                        <div className="flex items-center gap-4 p-2">
                          <div>
                            <Link
                              to="/search"
                              search={{
                                share: v.data.id,
                              }}
                              className="underline"
                            >
                              Подборка # {i + 1}
                            </Link>
                          </div>
                        </div>
                        {i < selections.length - 1 && <Separator />}
                      </Fragment>
                    ),
                )
              ) : (
                <div className="text-gray-500">
                  Нет подборок. Сохраните фильтры на странице поиска.
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
