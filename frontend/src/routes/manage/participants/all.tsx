import { $api } from '@/api'
import { CreateParticipantDialog } from '@/components/participants/CreateParticipantDialog.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.tsx'
import { useMe } from '@/hooks/useMe.ts'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import Plus from '~icons/lucide/plus'

export const Route = createFileRoute('/manage/participants/all')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { data: me, isError: meError } = useMe()

  useEffect(() => {
    if (meError) {
      navigate({ to: '/auth/login' })
    }
    else if (me && me.role !== 'admin') {
      navigate({ to: me.federation ? '/manage/participants/region' : '/' })
    }
  }, [me, meError, navigate])

  const { data: allPersons } = $api.useQuery('get', '/participants/person/')
  const { data: federations } = $api.useQuery('get', '/federations/')

  const getFederation = (id: string) => federations?.find(f => f.id === id)

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Реестр участников</h1>
          <p className="text-muted-foreground">
            Все участники в системе ФСП Линк
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="default" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 size-4" />
            Добавить участника
          </Button>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold">Список</h1>
      </div>

      <div className="space-y-4 bg-card">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">ФИО</TableHead>
                <TableHead className="w-[250px]">Дата рождения</TableHead>
                <TableHead className="w-[250px]">Контакты</TableHead>
                <TableHead className="w-[150px]">Федерация</TableHead>
                <TableHead className="w-[300px]">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allPersons?.map(person => (
                <TableRow key={person.id}>
                  <TableCell className="flex flex-col">
                    <span className="w-fit">{person.name}</span>
                    {person.gender && (
                      <div className="text-sm">
                        {person.gender === 'male'
                          ? '(муж)'
                          : person.gender === 'female'
                            ? '(жен)'
                            : null}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {person.birth_date && (
                        <div className="text-sm">{person.birth_date}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {person.email
                      ? <div className="text-sm">{person.email}</div>
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {person.related_federation && getFederation(person.related_federation)
                      ? <div className="text-sm">{getFederation(person.related_federation)?.region}</div>
                      : '-'}
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button asChild variant="outline">
                      <Link
                        to="/manage/participants/$id"
                        params={{ id: person.id }}
                      >
                        Редактировать
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <CreateParticipantDialog
        open={isCreateDialogOpen}
        setOpen={setIsCreateDialogOpen}
        federationId={undefined}
      />
    </div>
  )
}
