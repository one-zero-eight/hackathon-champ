import { $api } from '@/api'
import { createFileRoute } from '@tanstack/react-router'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import Mail from '~icons/lucide/mail'
import Phone from '~icons/lucide/phone'
import ChevronRight from '~icons/lucide/chevron-right'
import Building from '~icons/lucide/building'

type Federation = {
  id: string
  region: string
  district: string | null
  status: 'on_consideration' | 'accredited' | 'rejected'
  status_comment: string | null
  description: string | null
  head: string | null
  email: string | null
  phone: string | null
  logo: string | null
}

const STATUS_COLORS = {
  on_consideration: 'bg-yellow-500',
  accredited: 'bg-green-500',
  rejected: 'bg-red-500',
} as const

const STATUS_LABELS = {
  on_consideration: 'На рассмотрении',
  accredited: 'Аккредитована',
  rejected: 'Отклонена',
} as const

export const Route = createFileRoute('/federations/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [districtFilter, setDistrictFilter] = useState<string>('all')
  const [contactFilter, setContactFilter] = useState<string>('all')

  const { data, isPending } = $api.useQuery('get', '/federations/')
  const federations = (data as Federation[] | undefined) ?? []

  const filteredFederations = federations.filter((federation: Federation) => {
    const matchesSearch = federation.region.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || federation.status === statusFilter
    const matchesDistrict = districtFilter === 'all' || federation.district === districtFilter
    const matchesContact = contactFilter === 'all' || (
      contactFilter === 'has' ? (federation.email || federation.phone) : (!federation.email && !federation.phone)
    )
    return matchesSearch && matchesStatus && matchesDistrict && matchesContact
  })

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Региональные федерации</h1>
        <p className="text-muted-foreground mt-2">
          Список региональных федераций, их статус, контактная информация и описание
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Input
          placeholder="Поиск по региону..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="on_consideration">На рассмотрении</SelectItem>
            <SelectItem value="accredited">Аккредитована</SelectItem>
            <SelectItem value="rejected">Отклонена</SelectItem>
          </SelectContent>
        </Select>

        <Select value={districtFilter} onValueChange={setDistrictFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Федеральный округ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все округа</SelectItem>
            <SelectItem value="central">Центральный</SelectItem>
            <SelectItem value="northwest">Северо-Западный</SelectItem>
            <SelectItem value="south">Южный</SelectItem>
            <SelectItem value="volga">Приволжский</SelectItem>
            <SelectItem value="ural">Уральский</SelectItem>
            <SelectItem value="siberian">Сибирский</SelectItem>
            <SelectItem value="fareast">Дальневосточный</SelectItem>
          </SelectContent>
        </Select>

        <Select value={contactFilter} onValueChange={setContactFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Контактная информация" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все</SelectItem>
            <SelectItem value="has">Есть контакты</SelectItem>
            <SelectItem value="no">Нет контактов</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isPending ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-[200px] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredFederations.map((federation: Federation) => (
            <Card key={federation.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                    <Building className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{federation.region}</h3>
                      <div className={`h-2 w-2 rounded-full ${STATUS_COLORS[federation.status]}`} />
                    </div>
                    {federation.district && (
                      <p className="text-sm text-muted-foreground">{federation.district}</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                {federation.head && (
                  <p className="text-sm">Руководитель: {federation.head}</p>
                )}
                <div className="mt-2 space-y-1">
                  {federation.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4" />
                      <span>{federation.email}</span>
                    </div>
                  )}
                  {federation.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4" />
                      <span>{federation.phone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="ghost" className="ml-auto">
                  <Link to="/federations/$federationId" params={{ federationId: federation.id }}>
                    Подробнее
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
