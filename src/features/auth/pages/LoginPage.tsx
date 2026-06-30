import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Input } from '../../../components/ui/Input'

export function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F6F4EF] px-5 py-10 text-[#1F1F1F]">
      <Card className="w-full max-w-md p-8">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-[#1F1F1F]">
            GymFlow
          </h1>

          <p className="mt-2 text-sm font-medium text-[#2F4F3E]">
            Entenda. Execute. Evolua.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">Bem-vindo de volta</h2>

          <p className="mt-1 text-sm text-[#6F6A62]">
            Faça login para continuar.
          </p>
        </div>

        <form className="mt-6 space-y-4">
          <Input
            label="E-mail"
            name="email"
            type="email"
            placeholder="seu@email.com"
          />

          <Input
            label="Senha"
            name="password"
            type="password"
            placeholder="Digite sua senha"
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-[#6F6A62]">
              <input type="checkbox" className="h-4 w-4 accent-[#2F4F3E]" />
              Lembrar de mim
            </label>

            <button
              type="button"
              className="font-medium text-[#2F4F3E] hover:underline"
            >
              Esqueci minha senha
            </button>
          </div>

          <Button fullWidth type="submit">
            Entrar
          </Button>
        </form>

        <div className="mt-6 border-t border-[#E4DFD6] pt-6 text-center text-sm text-[#6F6A62]">
          Ainda não tem conta?{' '}
          <span className="font-semibold text-[#2F4F3E]">
            Fale com sua academia
          </span>
        </div>
      </Card>
    </main>
  )
}