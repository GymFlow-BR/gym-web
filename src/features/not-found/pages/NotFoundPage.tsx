import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F6F4EF] px-5 text-[#1F1F1F]">
      <Card className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#2F4F3E]">
          GymFlow
        </p>

        <h1 className="mt-3 text-3xl font-bold">Página não encontrada</h1>

        <p className="mt-2 text-sm text-[#6F6A62]">
          A rota acessada não existe ou ainda não foi implementada.
        </p>

        <a href="/login">
          <Button className="mt-6">Voltar para o login</Button>
        </a>
      </Card>
    </main>
  )
}