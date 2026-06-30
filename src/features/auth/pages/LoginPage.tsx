import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Input } from '../../../components/ui/Input'

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'O e-mail é obrigatório.')
    .email('Informe um e-mail válido.'),
  password: z
    .string()
    .min(1, 'A senha é obrigatória.')
    .min(6, 'A senha deve ter pelo menos 6 caracteres.'),
  rememberMe: z.boolean(),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  async function handleLogin(data: LoginFormData) {
    setIsSubmitting(true)

    await new Promise((resolve) => setTimeout(resolve, 800))

    console.log('Login form data:', data)

    setIsSubmitting(false)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F3F0E8] px-5 py-10 text-[#1F1F1F]">
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
            Faça login para acessar seus treinos e gerenciar sua rotina.
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(handleLogin)}>
          <Input
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Senha"
            type="password"
            placeholder="Digite sua senha"
            error={errors.password?.message}
            {...register('password')}
          />

          <div className="flex items-center justify-between gap-4 text-sm">
            <label className="flex items-center gap-2 text-[#6F6A62]">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[#2F4F3E]"
                {...register('rememberMe')}
              />
              Lembrar de mim
            </label>

            <button
              type="button"
              className="font-medium text-[#2F4F3E] hover:underline"
            >
              Esqueci minha senha
            </button>
          </div>

          <Button fullWidth type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
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