import type { Filters, Sort } from '@/lib/types'
import { $api } from '@/api'
import { EventCard } from '@/components/EventCard'
import { Button } from '@/components/ui/button.tsx'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { plainDatesForFilter } from '@/lib/utils'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useMemo, useRef } from 'react'
import CountUp from 'react-countup'
import { Temporal } from 'temporal-polyfill'
import BarChart from '~icons/lucide/bar-chart'
import Calendar from '~icons/lucide/calendar'
import ChevronRight from '~icons/lucide/chevron-right'
import FileText from '~icons/lucide/file-text'
import Users from '~icons/lucide/users'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

// First, let's extract the features data and types
interface Feature {
  icon: React.ReactNode
  title: string
  description: string
}

const FEATURES: Feature[] = [
  {
    icon: <FileText className="size-5" />,
    title: 'Подача заявок',
    description: 'Удобная система подачи и обработки заявок на соревнования',
  },
  {
    icon: <Users className="size-5" />,
    title: 'Управление участниками',
    description: 'Эффективное управление профилями участников',
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
] as const

// Extract reusable components
function FeatureCard({ feature, index }: { feature: Feature, index: number }) {
  return (
    <motion.div
      key={feature.title}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group rounded-2xl bg-gradient-to-b from-white/10 to-white/5 p-6 ring-1 ring-white/10 backdrop-blur-lg transition-all hover:shadow-xl hover:shadow-purple-500/5"
    >
      <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 p-3 text-purple-300 transition-colors group-hover:from-purple-500/30 group-hover:to-indigo-500/30">
        {feature.icon}
      </div>
      <h3 className="text-lg font-medium text-white">
        {feature.title}
      </h3>
      <p className="mt-2 text-sm text-white/70">
        {feature.description}
      </p>
    </motion.div>
  )
}

function HeroSection({ onParticipantClick }: { onParticipantClick: () => void }) {
  return (
    <section className="relative mt-[-var(--header-height)] min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 px-4">
      <BackgroundEffects />
      <div className="container relative mx-auto flex min-h-screen items-center justify-between px-4">
        <HeroContent onParticipantClick={onParticipantClick} />
        <HeroLogo />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950" />
    </section>
  )
}

function BackgroundEffects() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-center opacity-5 mix-blend-overlay" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      <div className="absolute inset-0 animate-[pulse_8s_ease-in-out_infinite] bg-gradient-to-br from-purple-400/5 via-blue-400/5 to-indigo-400/5" />
    </div>
  )
}

function HeroContent({ onParticipantClick }: { onParticipantClick: () => void }) {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-2xl px-4 text-center lg:text-left"
    >
      <div className="mb-6 inline-flex rounded-full bg-white/5 px-4 py-1.5 text-sm text-white/90 ring-1 ring-white/10 backdrop-blur-sm">
        🚀 Новое поколение платформы для соревнований
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-7xl">
        ФСП
        {' '}
        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
          Линк
        </span>
      </h1>
      <p className="mt-6 text-base leading-relaxed text-white/90 sm:text-lg lg:text-xl">
        Единая платформа для организации и проведения соревнований по спортивному программированию
      </p>
      <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
        <Button
          size="lg"
          className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 px-8 text-white transition-all hover:from-purple-600 hover:to-indigo-600 hover:shadow-lg hover:shadow-purple-500/20 sm:w-auto"
          onClick={onParticipantClick}
        >
          Я участник
          <ChevronRight className="ml-2 size-4" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="w-full border-white/10 bg-white/5 px-8 text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:text-white/90 hover:shadow-lg hover:shadow-white/5 sm:w-auto"
          onClick={() => navigate({ to: '/auth/login' })}
        >
          Я представитель ФСП
        </Button>
      </div>
    </motion.div>
  )
}

function HeroLogo() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="hidden lg:block"
    >
      <div className="relative aspect-square w-96">
        <div className="absolute inset-0 animate-[pulse_4s_ease-in-out_infinite] rounded-[2.5rem] bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-indigo-500/20 blur-2xl" />
        <img
          src="/favicon.png"
          alt="ФСП Линк"
          className="relative size-full rounded-[2.5rem] object-contain transition-all duration-700 hover:rotate-[360deg] hover:scale-105"
        />
      </div>
    </motion.div>
  )
}

// Main component
function RouteComponent() {
  const { data: eventsTotal } = $api.useQuery('post', '/events/search/count', {
    body: {},
  })
  const { data: federations } = $api.useQuery('get', '/federations/')
  const { data: participantsCount } = $api.useQuery('get', '/participants/person/count')
  const navigate = useNavigate()

  const calendarRef = useRef<HTMLDivElement>(null)

  const handleParticipantClick = () => {
    calendarRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main className="flex w-full flex-col">
      <HeroSection onParticipantClick={handleParticipantClick} />

      {/* Features Section */}
      <section className="relative bg-slate-950 py-16 sm:py-24">
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-slate-950 via-slate-950 to-transparent opacity-50" />
        <div className="container relative mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative max-w-2xl text-center lg:text-left"
          >
            <h2 className="text-2xl font-medium text-white sm:text-3xl">
              Ключевые функции
            </h2>
            <p className="mt-4 text-base text-white/70 sm:text-lg">
              Все необходимые инструменты для эффективной организации соревнований
            </p>
          </motion.div>

          <div className="relative mt-12 grid grid-cols-1 gap-6 sm:mt-16 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
            {FEATURES.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                feature={feature}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Calendar Preview Section */}
      <section ref={calendarRef} className="relative bg-gray-50 py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <h2 className="text-3xl font-medium text-gray-900">
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
            transition={{ delay: 0.2 }}
            className="mt-16"
          >
            <EventSelection
              title=""
              sort={{ type: 'date', direction: 1 }}
              filters={{
                date: plainDatesForFilter(Temporal.Now.plainDateISO(), null),
              }}
              shuffle
            />
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-950 via-indigo-950 to-purple-950 py-12 sm:py-16 lg:py-24">
        <div className="absolute inset-0 bg-center opacity-5" />
        <div className="container relative mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                value: eventsTotal ?? 1000,
                suffix: '',
                label: 'Мероприятий в системе',
              },
              {
                value: federations?.length ?? 1000,
                suffix: '',
                label: 'Регионов уже с нами',
              },
              {
                value: participantsCount ?? 1000,
                suffix: '',
                label: 'Приняли участие',
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
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
      <section className="bg-gray-50 py-16 sm:py-24">
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
                key={step.step}
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
              onClick={() => navigate({ to: '/auth/login' })}
            >
              Начать сейчас
              <ChevronRight className="ml-2 size-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Logo and Description */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <img src="/favicon.png" alt="ФСП Линк" className="size-8" />
                <span className="text-lg font-semibold text-white">ФСП Линк</span>
              </div>
              <p className="text-sm">
                Инновационная платформа для организации соревнований по спортивному программированию. Объединяем регионы, развиваем таланты.
              </p>
            </div>

            {/* Navigation Links */}
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
                Навигация
              </h3>
              <ul className="space-y-2">
                <li><Link to="/search" className="text-sm hover:text-white">Поиск соревнований</Link></li>
                <li><Link to="/calendar" className="text-sm hover:text-white">Календарь</Link></li>
                <li><Link to="/disciplines" className="text-sm hover:text-white">Дисциплины</Link></li>
                <li><Link to="/feedback" className="text-sm hover:text-white">Обратная связь</Link></li>
              </ul>
            </div>

            {/* Information */}
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
                Информация
              </h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-sm hover:text-white">О платформе</Link></li>
                <li><Link to="/federations" className="text-sm hover:text-white">Федерации</Link></li>
                <li><Link to="/participants" className="text-sm hover:text-white">Участники</Link></li>
                <li><Link to="/auth/login" className="text-sm hover:text-white">Вход в систему</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
                Связаться с нами
              </h3>
              <ul className="space-y-2">
                <li><a href="mailto:contact@fsplink.ru" className="text-sm hover:text-white">contact@fsplink.ru</a></li>
                <li><a href="https://t.me/one_zero_eight" target="_blank" rel="noreferrer" className="text-sm hover:text-white">Telegram-канал</a></li>
                <li><a href="https://vk.com/russiafsp" target="_blank" rel="noreferrer" className="text-sm hover:text-white">Группа ВКонтакте</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 border-t border-gray-800 pt-6 sm:mt-12 sm:pt-8">
            <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
              <p className="text-center text-xs sm:text-left">
                ©
                {' '}
                {new Date().getFullYear()}
                {' '}
                ФСП Линк. Все права защищены.
              </p>
              <div className="flex flex-col space-y-2 text-center sm:flex-row sm:space-x-6 sm:space-y-0 sm:text-left">
                <Link to="/terms" className="text-xs hover:text-white">Пользовательское соглашение</Link>
                <Link to="/privacy" className="text-xs hover:text-white">Политика конфиденциальности</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
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
  const navigate = useNavigate()
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

    const accreditedEvents = data.events.filter(event => event.status === 'accredited')

    return shuffle
      ? accreditedEvents.slice().sort(() => Math.random() - 0.5)
      : accreditedEvents
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
        <ScrollBar
          orientation="horizontal"
          className="rounded-full bg-gray-400"
          style={{
            height: '12px',
            backgroundColor: 'var(--muted)',
            borderRadius: 'var(--radius)',
            border: '3px solid var(--muted)',
            overflow: 'scroll',
          }}
        />
      </ScrollArea>
      <div className="mt-8 flex justify-center">
        <Button
          size="lg"
          variant="outline"
          onClick={() => navigate({ to: '/search' })}
        >
          Все соревнования
          <ChevronRight className="ml-2 size-4" />
        </Button>
      </div>
    </section>
  )
}
