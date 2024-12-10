import { TelegramPostWidget } from '@/components/TelegramPostWidget.tsx'
import { Button } from '@/components/ui/button.tsx'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx'
import { Input } from '@/components/ui/input.tsx'
import { useState } from 'react'

export function TelegramImport() {
  const [url, setUrl] = useState('')

  const telegramPost = urlToTelegramPost(url)

  const submit = () => {
    console.log(telegramPost)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          Импорт из Telegram
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader className="text-left">
          <DialogTitle>Импорт из Telegram</DialogTitle>

          <DialogDescription>
            Введите ссылку на пост в Telegram, чтобы импортировать его в систему.
          </DialogDescription>

          <div className="flex gap-4">
            <div className="space-y-4">
              <Input
                value={url}
                onChange={e => setUrl(e.target.value)}
              />
              <Button type="button" variant="default" disabled={!telegramPost} onClick={() => submit()}>
                Импортировать
              </Button>
            </div>

            <TelegramPostWidget telegramPost={telegramPost} className="max-w-lg grow" />
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

function urlToTelegramPost(url: string) {
  // Url: https://t.me/durov/43; https://t.me/s/durov/43; https://t.me/durov/43?single; https://t.me/durov/43?single=1
  // Result: durov/43
  const regex = /t\.me\/(?:s\/)?([^/]+\/\d+)/
  const match = url.match(regex)
  return match ? match[1] : ''
}
