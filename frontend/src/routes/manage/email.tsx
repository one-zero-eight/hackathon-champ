import { $api } from '@/api'
import { useMe } from '@/api/me.ts'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'
import { Input } from '@/components/ui/input.tsx'
import { Separator } from '@/components/ui/separator.tsx'
import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import Loader2 from '~icons/lucide/loader'

export const Route = createFileRoute('/manage/email')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: me } = useMe()
  const [email, setEmail] = useState('')
  const [verification_code, setVerification_code] = useState('')

  const queryClient = useQueryClient()

  const {
    mutate: connectEmail,
    isPending: connectIsPending,
    error: connectError,
    data: connectData,
    isSuccess: connectIsSuccess,
    reset: resetConnect,
  } = $api.useMutation('post', '/email/connect-email')

  const {
    mutate: verifyCode,
    isPending: verifyIsPending,
    error: verifyError,
  } = $api.useMutation('post', '/email/validate-code', {
    onSuccess: () => {
      queryClient.clear()
      resetConnect()
    },
  })

  const handleEmailSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!email)
      return
    connectEmail({ body: { email } })
  }

  const handleOtpSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const email_flow_id = connectData?.email_flow_id
    if (!email_flow_id || !verification_code)
      return
    verifyCode({ body: { email_flow_id, verification_code } })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (!connectIsSuccess) {
        handleEmailSubmit()
      }
      else {
        handleOtpSubmit()
      }
    }
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Параметры электронной почты
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Чтобы получать уведомления на электронную почту, привяжите свой email
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl">Текущие параметры</CardTitle>
          <CardDescription className="text-sm">
            Привязанная электронная почта
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {me?.email
                ? (
                    <>
                      <span className="font-medium">{me.email}</span>
                      <Badge variant="secondary">Подтверждено</Badge>
                    </>
                  )
                : (
                    <>
                      <span className="font-medium">Email не указан</span>
                      <Badge variant="default">Не подтверждено</Badge>
                    </>
                  )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl">Привязка email</CardTitle>
          <CardDescription className="text-sm">
            Подтвердите свой email, чтобы мы могли отправлять вам уведомления
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connectError && (
            <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {connectError?.detail?.toString() || 'Произошла ошибка'}
            </div>
          )}

          <form
            onSubmit={handleEmailSubmit}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Электронная почта
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Введите email"
                required
                disabled={connectIsPending}
                aria-label="Email address"
                className="h-10 w-fit"
              />
            </div>

            <Button
              type="submit"
              className="w-fit"
              disabled={connectIsPending}
              size="lg"
            >
              {connectIsPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Отправить код
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={connectIsSuccess} onOpenChange={resetConnect}>
        <DialogContent>
          <DialogHeader className="text-left">
            <DialogTitle>Код отправлен</DialogTitle>

            <DialogDescription>
              На вашу почту отправлен одноразовый код подтверждения. Проверьте
              папку "Входящие" или "Спам".
            </DialogDescription>

            <form onSubmit={handleOtpSubmit}>
              <div className="flex flex-col gap-4 pt-4">
                <div className="space-y-2">
                  <label
                    htmlFor="otp"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Код подтверждения
                  </label>
                  <InputOTP
                    maxLength={6}
                    value={verification_code}
                    onChange={value => setVerification_code(value)}
                    disabled={connectIsPending}
                    aria-label="One-Time Password"
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>

                  {verifyError && (
                    <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                      {verifyError?.detail?.toString() === 'Bad Request'
                        ? 'Неверный код'
                        : (verifyError?.detail?.toString() || 'Произошла ошибка')}
                    </div>
                  )}
                </div>

                <Separator />

                <DialogFooter>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={verifyIsPending}
                    size="lg"
                  >
                    {verifyIsPending && (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    )}
                    Подтвердить код
                  </Button>
                </DialogFooter>
              </div>
            </form>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}
