import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import ChevronRight from '~icons/lucide/chevron-right'

export const Route = createFileRoute('/about')({
  component: AboutPage,
})

function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 pb-16 pt-[calc(var(--header-height)+2rem)]">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100"
        >
          {/* Header */}
          <div className="border-b border-gray-100 px-8 py-12">
            <h1 className="bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-center text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
              О проекте
            </h1>
            <p className="mt-4 text-center text-lg text-gray-600">
              Единая платформа для организации и проведения соревнований по спортивному программированию
            </p>
          </div>

          {/* Content */}
          <div className="space-y-12 px-8 py-12">
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-xl font-bold text-purple-600">
                  1
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">Что такое ФСП Линк?</h2>
              </div>
              <div className="ml-16">
                <p className="text-lg leading-relaxed text-gray-600">
                  ФСП Линк - это современная цифровая платформа, разработанная для эффективной организации и проведения соревнований по спортивному программированию. Наша цель - объединить все федерации, участников и организаторов в едином информационном пространстве.
                </p>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-xl font-bold text-purple-600">
                  2
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">Наши дисциплины</h2>
              </div>
              <div className="ml-16 space-y-4">
                <p className="text-lg leading-relaxed text-gray-600">
                  Мы поддерживаем различные направления спортивного программирования:
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold">Продуктовое программирование</h3>
                      <p className="mt-2 text-sm text-gray-600">Создание программных продуктов, отвечающих заданным требованиям</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold">Программирование БАС</h3>
                      <p className="mt-2 text-sm text-gray-600">Разработка ПО для беспилотных авиационных систем</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold">Робототехника</h3>
                      <p className="mt-2 text-sm text-gray-600">Программирование автономных роботов и систем</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold">Информационная безопасность</h3>
                      <p className="mt-2 text-sm text-gray-600">Соревнования в области кибербезопасности</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold">Программирование алгоритмическое</h3>
                      <p className="mt-2 text-sm text-gray-600">Разработка и оптимизация алгоритмов для решения сложных задач</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-xl font-bold text-purple-600">
                  3
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">Возможности платформы</h2>
              </div>
              <div className="ml-16 space-y-4">
                <p className="text-lg leading-relaxed text-gray-600">
                  ФСП Линк предоставляет широкий спектр функций:
                </p>
                <ul className="grid gap-3">
                  <li className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
                    <span className="size-2 rounded-full bg-purple-600"></span>
                    <span className="text-lg text-gray-600">Удобная система подачи и обработки заявок на соревнования</span>
                  </li>
                  <li className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
                    <span className="size-2 rounded-full bg-purple-600"></span>
                    <span className="text-lg text-gray-600">Эффективное управление профилями участников</span>
                  </li>
                  <li className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
                    <span className="size-2 rounded-full bg-purple-600"></span>
                    <span className="text-lg text-gray-600">Централизованное управление календарем мероприятий</span>
                  </li>
                  <li className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
                    <span className="size-2 rounded-full bg-purple-600"></span>
                    <span className="text-lg text-gray-600">Подробная статистика и аналитика по соревнованиям</span>
                  </li>
                </ul>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-xl font-bold text-purple-600">
                  4
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">Начните работу</h2>
              </div>
              <div className="ml-16">
                <p className="text-lg leading-relaxed text-gray-600">
                  Присоединяйтесь к нашей платформе и станьте частью сообщества спортивного программирования.
                </p>
                <div className="mt-6 flex gap-4">
                  <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
                    <Link to="/auth/login">
                      Начать сейчас
                      <ChevronRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/feedback">
                      Связаться с нами
                    </Link>
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
