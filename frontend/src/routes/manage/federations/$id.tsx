import type { SchemaFederationSchema } from '@/api/types'
import { $api } from '@/api'
import { EventStatusBadge } from '@/components/EventStatusBadge'
import { AccrediteFederationDialog } from '@/components/federation/AccrediteDialog.tsx'
import { RejectFederationDialog } from '@/components/federation/RejectDialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { useMe } from '@/hooks/useMe'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import Loader from '~icons/lucide/loader'

const profileFormSchema = z.object({
  region: z.string().min(1, 'Введите название региона'),
  district: z.string().nullable(),
  description: z.string().nullable(),
  head: z.string().nullable(),
  email: z.string().email('Введите корректный email').nullable(),
  phone: z.string().nullable(),
  site: z.string().url('Введите корректный URL').nullable(),
  address: z.string().nullable(),
  logo: z.string().nullable(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export const Route = createFileRoute('/manage/federations/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { data: me, isError: meError } = useMe()

  useEffect(() => {
    if (meError) {
      navigate({ to: '/auth/login' })
    }
  }, [meError, navigate])

  const { id: federationId } = Route.useParams()
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()
  const { data: federation, refetch } = $api.useQuery('get', '/federations/{id}', {
    params: { path: { id: federationId } },
  })
  const { mutate: updateFederation } = $api.useMutation(
    'put',
    '/federations/{id}/',
  )
  const { mutate: touchFederation } = $api.useMutation(
    'post',
    '/federations/{id}/touch',
    {
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: $api.queryOptions('get', '/federations/{id}', { params: { path: { id: federationId } } }).queryKey,
        })
      },
    },
  )
  const { toast } = useToast()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      region: '',
      district: null,
      description: null,
      head: null,
      email: null,
      phone: null,
      site: null,
      address: null,
      logo: null,
    },
  })

  // Store initial values when federation data is loaded
  const [initialValues, setInitialValues] = useState<ProfileFormValues | null>(
    null,
  )

  useEffect(() => {
    if (federation) {
      const values = {
        region: federation.region,
        district: federation.district,
        description: federation.description,
        head: federation.head,
        email: federation.email,
        phone: federation.phone,
        site: federation.site,
        address: federation.address,
        logo: federation.logo,
      }
      form.reset(values)
      setInitialValues(values)
    }
  }, [federation, form])

  const handleCancel = () => {
    if (initialValues) {
      form.reset(initialValues)
      toast({
        description: 'Изменения отменены',
        duration: 3000,
      })
    }
  }

  async function onSubmit(data: ProfileFormValues) {
    if (!federation)
      return

    setIsLoading(true)
    try {
      const updateData: SchemaFederationSchema = {
        region: data.region,
        district: data.district,
        status: federation.status,
        description: data.description,
        head: data.head,
        email: data.email,
        phone: data.phone,
        site: data.site,
        address: data.address,
        logo: data.logo,
        notified_about_interaction: federation.notified_about_interaction,
      }

      updateFederation(
        {
          params: { path: { id: federation.id } },
          body: updateData,
        },
        {
          onSuccess: () => {
            toast({
              title: 'Успешно',
              description: 'Данные федерации обновлены',
              duration: 3000,
            })
            refetch()
          },
          onError: (error) => {
            toast({
              title: 'Ошибка',
              description: 'Не удалось обновить данные федерации',
              variant: 'destructive',
              duration: 5000,
            })
            console.error('Failed to update federation data:', error)
          },
        },
      )
    }
    finally {
      setIsLoading(false)
    }
  }

  // Check if form is dirty (has changes)
  const hasChanges = Object.keys(form.formState.dirtyFields).length > 0

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Профиль федерации
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Управление данными и настройками федерации
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl">Текущий статус</CardTitle>
          <CardDescription className="text-sm">
            Информация о статусе аккредитации федерации
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {federation
            ? (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">Статус:</span>
                    <EventStatusBadge status={federation.status} />
                  </div>
                  {federation.status_comment && (
                    <div className="flex flex-col gap-1.5">
                      <span className="font-medium">Комментарий к статусу:</span>
                      <p className="text-sm text-muted-foreground">
                        {federation.status_comment}
                      </p>
                    </div>
                  )}
                  {federation.accreditation_comment && (
                    <div className="flex flex-col gap-1.5">
                      <span className="font-medium">
                        Комментарий к аккредитации:
                      </span>
                      <p className="text-sm text-muted-foreground">
                        {federation.accreditation_comment}
                      </p>
                    </div>
                  )}

                  {me?.role === 'admin' && (
                    <div className="flex flex-col gap-1.5">
                      <span className="font-medium">Сменить статус:</span>
                      <div className="flex gap-2">
                        {federation.status !== 'accredited' && <AccrediteFederationDialog federationId={federationId} />}
                        {federation.status !== 'rejected' && <RejectFederationDialog federationId={federationId} />}
                      </div>
                    </div>
                  )}

                  {(federation.last_interaction_at === null
                    || new Date(federation.last_interaction_at).getTime() < Date.now() - 60 * 1000) // 1 minute
                    && (
                      <div className="flex flex-col gap-1.5">
                        <span className="font-medium">Данные давно не обновлялись:</span>
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" onClick={() => touchFederation({ params: { path: { id: federationId } } })}>
                            Отметить как актуальные
                          </Button>
                        </div>
                      </div>
                    )}
                </div>
              )
            : (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Статус:</span>
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="font-medium">Комментарий к статусу:</span>
                    <Skeleton className="h-16 w-full" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="font-medium">Комментарий к аккредитации:</span>
                    <Skeleton className="h-16 w-full" />
                  </div>
                  {me?.role === 'admin' && (
                    <div className="flex flex-col gap-1.5">
                      <span className="font-medium">Сменить статус:</span>
                      <div className="flex gap-2">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-32" />
                      </div>
                    </div>
                  )}
                </div>
              )}
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Основная информация</CardTitle>
              <CardDescription className="text-sm">
                Общие данные о федерации
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:gap-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Регион</FormLabel>
                      <FormControl>
                        <Input placeholder="Название региона" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Федеральный округ</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Название федерального округа"
                          {...field}
                          value={field.value || ''}
                          onChange={e =>
                            field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Описание</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Описание федерации"
                        className="min-h-[100px]"
                        {...field}
                        value={field.value || ''}
                        onChange={e => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Контактная информация</CardTitle>
              <CardDescription className="text-sm">
                Контактные данные федерации
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:gap-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="head"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ФИО руководителя</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Иванов Иван Иванович"
                          {...field}
                          value={field.value || ''}
                          onChange={e =>
                            field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="example@mail.ru"
                          {...field}
                          value={field.value || ''}
                          onChange={e =>
                            field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Телефон</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+7 (999) 123-45-67"
                          {...field}
                          value={field.value || ''}
                          onChange={e =>
                            field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="site"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Сайт</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com"
                          {...field}
                          value={field.value || ''}
                          onChange={e =>
                            field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Адрес офиса</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="ул. Примерная, д. 1, офис 123"
                        {...field}
                        value={field.value || ''}
                        onChange={e => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex flex-col justify-end gap-3 sm:flex-row sm:gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading || !hasChanges}
              className="w-full sm:w-auto"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !hasChanges}
              className="w-full sm:w-auto"
            >
              {isLoading
                ? (
                    <>
                      <Loader className="mr-2 size-4 animate-spin" />
                      Сохранение...
                    </>
                  )
                : (
                    'Сохранить изменения'
                  )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
