import type { Filters, Sort } from '@/lib/types'
import { $api } from '@/api'
import { EventCard } from '@/components/EventCard'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { plainDatesForFilter } from '@/lib/utils'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import CountUp from 'react-countup'
import { Temporal } from 'temporal-polyfill'
import Calendar from '~icons/lucide/calendar'
import Users from '~icons/lucide/users'
import FileText from '~icons/lucide/file-text'
import BarChart from '~icons/lucide/bar-chart'
import ChevronRight from '~icons/lucide/chevron-right'
import { motion } from 'framer-motion'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { data: eventsTotal } = $api.useQuery('post', '/events/search/count', {
    body: {},
  })
  const { data: randomEvent } = $api.useQuery('get', '/events/random-event')
  const [search, setSearch] = useState('')

  return (
    <main className="flex w-full flex-col">
      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 px-4 pt-[calc(var(--header-height)-6rem)]">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-30 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-fuchsia-500/20 to-indigo-500/20 animate-gradient" />
          <div className="absolute inset-0 backdrop-blur-[1px]" />
        </div>
        <div className="relative mx-auto max-w-7xl py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center text-center"
          >
            <div className="relative mb-6">
              <img
                src="/favicon.png"
                alt="ФСП Линк"
                className="relative size-20 drop-shadow-xl sm:size-24"
              />
            </div>
            <h1 className="bg-gradient-to-r from-white to-white/90 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-6xl">
              ФСП Линк
            </h1>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mt-12 max-w-3xl"
            >
              <h2 className="text-2xl font-medium leading-tight text-white/90 sm:text-4xl">
                Объединяя регионы, развиваем спортивное программирование
              </h2>
              <p className="mt-6 text-lg text-white/70 sm:text-xl">
                Единая платформа для организации и проведения соревнований по спортивному программированию
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mt-10 flex flex-col gap-4 sm:flex-row"
            >
              <Button
                size="lg"
                className="bg-white px-8 text-blue-600 hover:bg-white/90"
              >
                Зарегистрироваться
                <ChevronRight className="ml-2 size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/10 px-8 text-white backdrop-blur-sm hover:bg-white/20"
              >
                Узнать больше
              </Button>
            </motion.div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Key Features Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
              Ключевые функции платформы
            </h2>
          </motion.div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <FileText className="size-5" />,
                title: 'Подача заявок',
                description: 'Удобная система подачи и обработки заявок на соревнования',
              },
              {
                icon: <Users className="size-5" />,
                title: 'Управление участниками',
                description: 'Эффективне управление профилями участников',
              },
              {
                icon: <Calendar className="size-5" />,
                title: 'Календарь соревнований',
                description: 'Централизованное управление календарём мероприятий',
              },
              {
                icon: <BarChart className="size-5" />,
                title: 'Аналитика',
                description: 'Подробная статистика и аналитика по соревнованиям',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
                className="group rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md"
              >
                <div className="mb-4 inline-flex rounded-lg bg-purple-100 p-2.5 text-purple-600">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Calendar Preview Section */}
      <section className="relative overflow-hidden bg-gray-50 py-24 sm:py-32">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />
        <div className="relative mx-auto max-w-7xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Ближайшие соревнования
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Актуальный календарь предстоящих мероприятий
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mt-16"
          >
            <EventSelection
              title=""
              sort={{ date: 'asc' }}
              filters={{
                date: plainDatesForFilter(Temporal.Now.plainDateISO(), null),
              }}
              shuffle
            />
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="relative overflow-hidden bg-purple-600 py-16 sm:py-24">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                value: eventsTotal ?? 1000,
                suffix: '',
                label: 'Мероприятий в системе',
              },
              {
                value: 85,
                suffix: '%',
                label: 'Регионов уе с нами',
              },
              {
                value: 10000,
                suffix: '+',
                label: 'Участников соревнований',
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-white">
                  <CountUp
                    end={stat.value}
                    duration={2}
                    separator=" "
                    suffix={stat.suffix}
                  />
                </div>
                <p className="mt-2 text-sm text-white/80">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Start Section */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
              Как начать?
            </h2>
          </motion.div>
          
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                step: 1,
                title: 'Зарегистрируйтесь',
                description: 'Создайте аккаунт представителя региона',
              },
              {
                step: 2,
                title: 'Настройте профиль',
                description: 'Заполните информацию о вашем регионе',
              },
              {
                step: 3,
                title: 'Начните работу',
                description: 'Создавайте заявки и управляйте календарём',
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
                className="relative text-center"
              >
                <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-purple-600 text-xl font-semibold text-white">
                  {step.step}
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-12 flex justify-center"
          >
            <Button
              size="lg"
              className="bg-purple-600 px-8 hover:bg-purple-700"
            >
              Начать сейчас
              <ChevronRight className="ml-2 size-4" />
            </Button>
          </motion.div>
        </div>
      </section>
    </main>
  )
}

function EventSelection({
  title,
  filters,
  sort,
  shuffle = false,
}: {
  title: string
  filters: Filters
  sort: Sort
  shuffle?: boolean
}) {
  const { data } = $api.useQuery('post', '/events/search', {
    body: {
      filters,
      sort,
      pagination: {
        page_no: 1,
        page_size: 15,
      },
    },
  })

  const events = useMemo(() => {
    if (!data?.events)
      return []
    return shuffle
      ? data.events.slice().sort(() => Math.random() - 0.5)
      : data.events
  }, [data, shuffle])

  return (
    <section className="my-[64px] w-full">
      <h2 className="mb-6 text-center text-2xl font-medium">{title}</h2>
      <ScrollArea className="w-full">
        <div className="flex gap-4 px-4">
          {events.map(event => (
            <EventCard key={event.id} event={event} className="w-[900px]" />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  )
}
