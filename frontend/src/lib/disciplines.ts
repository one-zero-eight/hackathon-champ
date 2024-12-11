import AlgorithmIcon from '@/icons/Algorithm_Icon.svg'
import DroneIcon from '@/icons/Drone_Icon.svg'
import ProductIcon from '@/icons/Product_Icon.svg'
import RobotIcon from '@/icons/Robot_Icon.svg'
import SecurityIcon from '@/icons/Security_Icon.svg'

export type Discipline = {
  name: string
  slug: string
  description: string
  iconSrc: string
  skills: string[]
}

export const DISCIPLINES: Discipline[] = [
  {
    name: 'программирование алгоритмическое',
    slug: 'algorithmic',
    description: 'Решение группы задач путем написания наиболее оптимальных программных алгоритмов в условиях ограниченного времени.',
    iconSrc: AlgorithmIcon,
    skills: ['Алгоритмическое мышление', 'Оптимизация кода', 'Анализ сложности алгоритмов', 'Отладка и тестирование'],
  },
  {
    name: 'программирование продуктовое',
    slug: 'product',
    description: 'Создание программных продуктов (приложений, сайтов, сервисов), отвечающих заданным требованиям и выполняющих определенные прикладные задачи.',
    iconSrc: ProductIcon,
    skills: ['Full-stack разработка', 'UI/UX дизайн', 'Работа в команде', 'Git и CI/CD'],
  },
  {
    name: 'программирование беспилотных авиационных систем',
    slug: 'drone',
    description: 'Написание кода для автономного полета дрона или роя дронов, а также выполнения им поставленных задач в условиях соревновательного полигона.',
    iconSrc: DroneIcon,
    skills: ['Программирование микроконтроллеров', 'Работа с сенсорами', 'Алгоритмы навигации', 'Обработка сигналов'],
  },
  {
    name: 'программирование робототехники',
    slug: 'robotics',
    description: 'Написание кода и поведенческих алгоритмов для автономных роботов, соревнующихся по определенным правилам.',
    iconSrc: RobotIcon,
    skills: ['Программирование микроконтроллеров', 'Работа с сенсорами', 'Машинное обучение', 'Механика'],
  },
  {
    name: 'программирование систем информационной безопасности',
    slug: 'cybersecurity',
    description: 'Комплекс соревнований в области кибербезопасности, включающий в себя поиск и устранение системных уязвимостей, отработку кибератак и защиту от них.',
    iconSrc: SecurityIcon,
    skills: ['Криптография', 'Сетевая безопасность', 'Реверс-инжиниринг', 'Анализ вредоносного ПО'],
  },
]
