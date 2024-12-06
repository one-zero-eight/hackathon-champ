import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast key={id} {...props} className="flex items-center justify-between p-4 rounded-lg shadow-md bg-white">
          <div className="flex flex-col space-y-1">
            {title && <ToastTitle className="text-lg font-semibold">{title}</ToastTitle>}
            {description && <ToastDescription className="text-sm text-gray-600">{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose className="ml-4 text-gray-500 hover:text-gray-700" />
        </Toast>
      ))}
      <ToastViewport className="fixed bottom-0 right-0 p-4" />
    </ToastProvider>
  )
}