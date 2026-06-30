import { PageHeader } from '../../../components/layout/PageHeader'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'

export function AdminStudentsPage() {
  return (
    <>
      <PageHeader
        title="Alunos"
        description="Gerencie os alunos vinculados à sua academia ou assessoria."
        action={<Button>Novo aluno</Button>}
      />

      <Card>
        <p className="text-sm text-[#6F6A62]">
          Página inicial de alunos. A listagem real será implementada em uma
          próxima task.
        </p>
      </Card>
    </>
  )
}