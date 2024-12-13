import { $api } from '@/api'
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
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import Loader2 from '~icons/lucide/loader'

export function TelegramImport() {
  const [url, setUrl] = useState('')
  const telegramPost = urlToTelegramPost(url)

  const navigate = useNavigate()
  const { mutateAsync: hint, isPending } = $api.useMutation('post', '/events/hint-event')
  const { mutate: create, isPending: createIsPending } = $api.useMutation('post', '/events/suggest', {
    onSuccess: (data) => {
      navigate({ to: '/manage/events/$id', params: { id: data.id } })
    },
  })

  const exampleLinks = [
    'https://t.me/fsp_RT/77',
    'https://t.me/fsp_RT/67',
    'https://t.me/fsp_RT/66',
    'https://t.me/fsp_RT/53',
    'https://t.me/fsprussia/1162',
  ]

  const submit = async () => {
    const res = await hint({ body: { telegram_post_link: `https://t.me/${telegramPost}` } })
    if (res) {
      create({ body: {
        status: 'draft',
        location: [res.location],
        title: res.title,
        description: res.description,
        start_date: res.start_date,
        end_date: res.end_date,
        discipline: res.discipline,
      } })
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          Импорт из Telegram
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-full max-w-4xl overflow-auto">
        <DialogHeader className="text-left">
          <DialogTitle>Импорт из Telegram</DialogTitle>

          <DialogDescription>
            Введите ссылку на пост в Telegram, чтобы импортировать его в систему.
            <p className="mt-2 text-sm">Среднее время ожидания 15 секунд</p>
          </DialogDescription>

          <div className="flex gap-4">
            <div className="space-y-4">
              <Input
                value={url}
                onChange={e => setUrl(e.target.value)}
              />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Примеры постов:</p>
                <div className="flex flex-wrap gap-2">
                  {exampleLinks.map((link) => (
                    <Button
                      key={link}
                      variant="outline"
                      size="sm"
                      onClick={() => setUrl(link)}
                    >
                      {link.split('/').slice(-2).join('/')}
                    </Button>
                  ))}
                </div>
              </div>
              <Button
                type="button"
                variant="default"
                disabled={!telegramPost || isPending || createIsPending}
                onClick={() => submit()}
              >
                {(isPending || createIsPending) && <Loader2 />}
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
