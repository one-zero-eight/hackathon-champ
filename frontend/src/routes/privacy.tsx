import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'framer-motion'

export const Route = createFileRoute('/privacy')({
  component: PrivacyPolicy,
})

function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50/50 px-4 pt-[calc(var(--header-height)+2rem)] pb-16">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100"
        >
          {/* Header */}
          <div className="border-b border-gray-100 bg-gray-50/50 px-8 py-12">
            <h1 className="bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-center text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
              Политика конфиденциальности
            </h1>
            <div className="mt-4 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-1.5 text-sm text-purple-700">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex size-2 rounded-full bg-purple-500"></span>
                </span>
                Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-12 px-8 py-12">
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-xl font-bold text-purple-600">
                  1
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">Общие положения</h2>
              </div>
              <div className="ml-16">
                <p className="text-lg leading-relaxed text-gray-600">
                  Настоящая политика конфиденциальности описывает, как ФСП Линк собирает, использует и защищает информацию, которую вы предоставляете при использовании нашей платформы.
                </p>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-xl font-bold text-purple-600">
                  2
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">Сбор информации</h2>
              </div>
              <div className="ml-16 space-y-4">
                <p className="text-lg leading-relaxed text-gray-600">
                  Мы собираем следующие типы информации:
                </p>
                <ul className="grid gap-3">
                  <li className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
                    <span className="size-2 rounded-full bg-purple-600"></span>
                    <span className="text-lg text-gray-600">Личные данные (имя, email, контактная информация)</span>
                  </li>
                  <li className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
                    <span className="size-2 rounded-full bg-purple-600"></span>
                    <span className="text-lg text-gray-600">Данные об использовании платформы</span>
                  </li>
                  <li className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
                    <span className="size-2 rounded-full bg-purple-600"></span>
                    <span className="text-lg text-gray-600">Техническая информация о вашем устройстве</span>
                  </li>
                </ul>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-xl font-bold text-purple-600">
                  3
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">Использование информации</h2>
              </div>
              <div className="ml-16 space-y-4">
                <p className="text-lg leading-relaxed text-gray-600">
                  Собранная информация используется для:
                </p>
                <ul className="grid gap-3">
                  <li className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
                    <span className="size-2 rounded-full bg-purple-600"></span>
                    <span className="text-lg text-gray-600">Организации и проведения соревнований</span>
                  </li>
                  <li className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
                    <span className="size-2 rounded-full bg-purple-600"></span>
                    <span className="text-lg text-gray-600">Улучшения качества сервиса</span>
                  </li>
                  <li className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
                    <span className="size-2 rounded-full bg-purple-600"></span>
                    <span className="text-lg text-gray-600">Коммуникации с пользователями</span>
                  </li>
                  <li className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
                    <span className="size-2 rounded-full bg-purple-600"></span>
                    <span className="text-lg text-gray-600">Аналитики и статистики</span>
                  </li>
                </ul>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-xl font-bold text-purple-600">
                  4
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">Защита информации</h2>
              </div>
              <div className="ml-16 space-y-4">
                <p className="text-lg leading-relaxed text-gray-600">
                  Мы принимаем все необходимые меры для защиты ваших данных, включая:
                </p>
                <ul className="grid gap-3">
                  <li className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
                    <span className="size-2 rounded-full bg-purple-600"></span>
                    <span className="text-lg text-gray-600">Шифрование данных</span>
                  </li>
                  <li className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
                    <span className="size-2 rounded-full bg-purple-600"></span>
                    <span className="text-lg text-gray-600">Регулярное обновление систем безопасности</span>
                  </li>
                  <li className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
                    <span className="size-2 rounded-full bg-purple-600"></span>
                    <span className="text-lg text-gray-600">Ограниченный доступ к личным данным</span>
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </main>
  )
} 