import { PageHeader } from '../../../components/layout/PageHeader'
import { Card } from '../../../components/ui/Card'

export function AdminDashboardPage() {
  return (
    <>
      <PageHeader
        title="Visão geral"
        description="Acompanhe os principais indicadores da sua operação."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-[#6F6A62]">Alunos ativos</p>
          <p className="mt-2 text-3xl font-bold text-[#1F1F1F]">128</p>
        </Card>

        <Card>
          <p className="text-sm text-[#6F6A62]">Treinos criados</p>
          <p className="mt-2 text-3xl font-bold text-[#1F1F1F]">36</p>
        </Card>

        <Card>
          <p className="text-sm text-[#6F6A62]">Exercícios</p>
          <p className="mt-2 text-3xl font-bold text-[#1F1F1F]">214</p>
        </Card>
      </div>
    </>
  )
}