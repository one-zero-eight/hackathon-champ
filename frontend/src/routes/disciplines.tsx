import type { SchemaEvent } from '@/api/types'
import { $api } from '@/api'
import { Separator } from '@/components/ui/separator'
import AlgorithmIcon from '@/icons/Algorithm_Icon.svg'
import DroneIcon from '@/icons/Drone_Icon.svg'
import ProductIcon from '@/icons/Product_Icon.svg'
import RobotIcon from '@/icons/Robot_Icon.svg'
import SecurityIcon from '@/icons/Security_Icon.svg'
import { createFileRoute } from '@tanstack/react-router'
import Calendar from '~icons/lucide/calendar'
import GraduationCap from '~icons/lucide/graduation-cap'

export const Route = createFileRoute('/disciplines')({
  component: RouteComponent,
})

type Discipline = {
  id: string
  name: string
  description: string
  type: 'algorithmic' | 'product' | 'drones' | 'robotics' | 'security'
  icon: any
  skills: string[]
  query: string
}

const DISCIPLINES: Discipline[] = [
  {
    id: 'algorithmic',
    name: 'Программирование алгоритмическое',
    description: 'Решение группы задач путем написания наиболее оптимальных программных алгоритмов в условиях ограниченного времени.',
    type: 'algorithmic',
    icon: AlgorithmIcon,
    skills: [
      'Алгоритмическое мышление',
      'Оптимизация кода',
      'Анализ сложности алгоритмов',
      'Отладка и тестирование',
    ],
    query: 'алгоритм',
  },
  {
    id: 'product',
    name: 'Программирование продуктовое',
    description: 'Создание программных продуктов (приложений, сайтов, сервисов), отвечающих заданным требованиям и выполняющих определенные прикладные задачи.',
    type: 'product',
    icon: ProductIcon,
    skills: [
      'Full-stack разработка',
      'UI/UX дизайн',
      'Работа в команде',
      'Git и CI/CD',
    ],
    query: 'продукт',
  },
  {
    id: 'drones',
    name: 'Программирование БАС',
    description: 'Написание кода для автономного полета дрона или роя дронов, а также выполнения им поставленных задач в условиях соревновательного полигона.',
    type: 'drones',
    icon: DroneIcon,
    skills: [
      'Программирование микроконтроллеров',
      'Работа с сенсорами',
      'Алгоритмы навигации',
      'Обработка сигналов',
    ],
    query: 'беспилотн',
  },
  {
    id: 'robotics',
    name: 'Программирование робототехники',
    description: 'Написание кода и поведенческих алгоритмов для автономных роботов, соревнующихся по определенным правилам.',
    type: 'robotics',
    icon: RobotIcon,
    skills: [
      'Программирование микроконтроллеров',
      'Работа с сенсорами',
      'Машинное обучение',
      'Механика',
    ],
    query: 'робот',
  },
  {
    id: 'security',
    name: 'Программирование систем информационной безопасности',
    description: 'Комплекс соревнований в области кибербезопасности, включающий в себя поиск и устранение системных уязвимостей, отработку кибератак и защиты от них.',
    type: 'security',
    icon: SecurityIcon,
    skills: [
      'Криптография',
      'Сетевая безопасность',
      'Реверс-инжиниринг',
      'Анализ вредоносного ПО',
    ],
    query: 'безопасност',
  },
]

function DisciplineEvents({ query }: { query: string }) {
  const { data: eventsData } = $api.useQuery('post', '/events/search', {
    body: {
      filters: {
        query,
      },
      sort: {
        date: 'asc',
      },
      pagination: {
        page_size: 3,
        page_no: 1,
      },
    },
  })
  const events = (eventsData as { events: SchemaEvent[] } | undefined)?.events ?? []

  if (events.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        Нет предстоящих мероприятий
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {events.map(event => (
        <div key={event.id} className="flex items-start gap-3 rounded-lg border p-4">
          <Calendar className="mt-0.5 size-5 shrink-0 text-purple-500" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-medium">{event.title}</h3>
            <div className="mt-1 text-sm text-muted-foreground">
              {new Date(event.start_date).toLocaleDateString('ru')}
              {' '}
              -
              {new Date(event.end_date).toLocaleDateString('ru')}
            </div>
            {event.description && (
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{event.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function RouteComponent() {
  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold">Дисциплины</h1>
        <p className="mt-2 text-muted-foreground">
          Ознакомьтесь с направлениями в спортивном программировании, представленными на платформе.
        </p>
      </div>

      <div className="space-y-12">
        {DISCIPLINES.map((discipline, index) => {
          return (
            <div key={discipline.id}>
              {index > 0 && <Separator className="mb-12" />}
              <div className="grid items-start gap-8 md:grid-cols-2">
                <div>
                  <div className="flex items-start gap-4">
                    <div className="flex size-16 items-center justify-center rounded-2xl border bg-white sm:size-20">
                      <img src={discipline.icon} alt={discipline.name} className="size-8 sm:size-10" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-semibold">{discipline.name}</h2>
                      <p className="mt-2 text-lg text-muted-foreground">
                        {discipline.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div>
                      <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                        <GraduationCap className="size-4 text-purple-500" />
                        Навыки
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {discipline.skills.map(skill => (
                          <div key={skill} className="rounded-full bg-muted px-3 py-1 text-sm">
                            {skill}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                    <Calendar className="size-4 text-purple-500" />
                    Ближайшие мероприятия
                  </div>
                  <DisciplineEvents query={discipline.query} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
