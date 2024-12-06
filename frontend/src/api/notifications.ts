export async function sendNotification(
  message: string = "Теперь вы будете получать уведомления об интересующих вас мероприятиях",
) {
  const registration = await navigator.serviceWorker.register("/sw.js");
  const permissionResult = await Notification.requestPermission();

  if (permissionResult !== "granted") {
    return false;
  }

  await registration.showNotification("Единый Календарь Событий", {
    body: message,
  });
  return true;
}

export async function receivePushSubscription() {
  const registration = await navigator.serviceWorker.register("/sw.js");
  const permissionResult = await Notification.requestPermission();

  if (permissionResult !== "granted") {
    return false;
  }

  const existing = await registration.pushManager.getSubscription();
  console.log("existing", JSON.stringify(existing));
  if (existing) {
    // Check if the existing subscription is the same as the current one
    const applicationServerKey = btoa(
      String.fromCharCode.apply(
        null,
        // @ts-ignore
        new Uint8Array(existing.options.applicationServerKey),
      ),
    );
    const currentKey = applicationServerKey
      .replace("+", "-")
      .replace("/", "_")
      .replace("=", "");

    if (currentKey.indexOf(import.meta.env.VITE_NOTIFY_PUBLIC_KEY) > -1) {
      return existing;
    } else {
      console.log("existing.unsubscribe");
      await existing.unsubscribe();
    }
  }

  const pushSubscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: import.meta.env.VITE_NOTIFY_PUBLIC_KEY,
  });
  console.log("pushSubscription", JSON.stringify(pushSubscription));
  return pushSubscription;
}
