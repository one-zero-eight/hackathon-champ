import { createFileRoute } from '@tanstack/react-router'
import { Separator } from '@/components/ui/separator'
import GraduationCap from '~icons/lucide/graduation-cap'
import Calendar from '~icons/lucide/calendar'
import { $api } from '@/api'
import type { SchemaEventOutput } from '@/api/types'
import AlgorithmIcon from '@/icons/Algorithm_Icon.svg'
import ProductIcon from '@/icons/Product_Icon.svg'
import DroneIcon from '@/icons/Drone_Icon.svg'
import RobotIcon from '@/icons/Robot_Icon.svg'
import SecurityIcon from '@/icons/Security_Icon.svg'

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
  const events = (eventsData as { events: SchemaEventOutput[] } | undefined)?.events ?? []

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
        <div key={event.id} className="flex items-start gap-3 p-4 rounded-lg border">
          <Calendar className="h-5 w-5 mt-0.5 shrink-0 text-purple-500" />
          <div className="min-w-0 flex-1">
            <h3 className="font-medium truncate">{event.title}</h3>
            <div className="mt-1 text-sm text-muted-foreground">
              {new Date(event.start_date).toLocaleDateString('ru')} - {new Date(event.end_date).toLocaleDateString('ru')}
            </div>
            {event.description && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{event.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function RouteComponent() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Дисциплины</h1>
        <p className="text-muted-foreground mt-2">
          Ознакомьтесь с направлениями в спортивном программировании, представленными на платформе.
        </p>
      </div>

      <div className="space-y-12">
        {DISCIPLINES.map((discipline, index) => {
          return (
            <div key={discipline.id}>
              {index > 0 && <Separator className="mb-12" />}
              <div className="grid gap-8 md:grid-cols-2 items-start">
                <div>
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-white border flex items-center justify-center">
                      <img src={discipline.icon} alt={discipline.name} className="h-8 w-8 sm:h-10 sm:w-10" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-semibold">{discipline.name}</h2>
                      <p className="text-lg text-muted-foreground mt-2">
                        {discipline.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div>
                      <div className="text-sm font-medium mb-3 flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-purple-500" />
                        Навыки
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {discipline.skills.map(skill => (
                          <div key={skill} className="text-sm px-3 py-1 rounded-full bg-muted">
                            {skill}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-500" />
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
