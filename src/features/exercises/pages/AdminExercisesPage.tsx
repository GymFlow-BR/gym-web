import { PageHeader } from '../../../components/layout/PageHeader'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'

export function AdminExercisesPage() {
  return (
    <>
      <PageHeader
        title="Exercícios"
        description="Gerencie a biblioteca de exercícios da sua organização."
        action={<Button>Novo exercício</Button>}
      />

      <Card>
        <p className="text-sm text-[#6F6A62]">
          Página inicial de exercícios. A listagem real será implementada em uma
          próxima task.
        </p>
      </Card>
    </>
  )
}