import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { SVGProps } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { z } from "zod";

import { isApiError } from "../../../services/apiError";
import { login } from "../services/authService";
import { getDefaultPathByRole } from "../utils/getDefaultPathByRole";

const loginSchema = z.object({
  email: z
  .string()
  .min(1, 'O e-mail é obrigatório.')
  .pipe(z.email('Informe um e-mail válido.')),
  password: z
    .string()
    .min(1, "A senha é obrigatória.")
    .min(6, "A senha deve ter pelo menos 6 caracteres."),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LogoMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-[#22C55E] to-[#0F3D31] ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-[64%] w-[64%]">
        <path
          d="M8.3 19c0-3.1 6-2.7 6-6.4s-6-2.5-6-6.4"
          stroke="#FFFFFF"
          strokeWidth={2.7}
          strokeLinecap="round"
        />
        <circle cx="15.4" cy="5.6" r="2.1" stroke="#FFFFFF" strokeWidth={2.2} />
      </svg>
    </span>
  );
}

function BrandRings({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className}>
      {[36, 68, 100, 132, 164, 196].map((radius) => (
        <circle
          key={radius}
          cx="0"
          cy="200"
          r={radius}
          stroke="white"
          strokeOpacity={0.12}
        />
      ))}
    </svg>
  );
}

function MailIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6.5 8.5 6 8.5-6" />
    </svg>
  );
}

function LockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V7.5a4 4 0 0 1 8 0V11" />
    </svg>
  );
}

function EyeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 5.1A10.6 10.6 0 0 1 12 5c7 0 10.5 7 10.5 7a13.4 13.4 0 0 1-3.2 4.1M6.5 6.6C3.4 8.5 1.5 12 1.5 12s3.5 7 10.5 7a10.4 10.4 0 0 0 4.6-1" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function GoogleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.94-2.9l-3.87-3.02c-1.07.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.12A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54V6.61H1.27a12 12 0 0 0 0 10.78l4-3.12Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.61l4 3.12C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      queryClient.setQueryData(["authenticated-user"], user);
      navigate(getDefaultPathByRole(user.role), { replace: true });
    },
  });

  const loginErrorMessage =
    isApiError(loginMutation.error) && loginMutation.error.status === 401
      ? "E-mail ou senha inválidos."
      : "Verifique seus dados e tente novamente.";

  function handleLogin(data: LoginFormData) {
    loginMutation.mutate(data);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white lg:bg-gray-100 lg:px-6 lg:py-12">
      <div className="flex w-full flex-col overflow-hidden bg-white lg:mx-auto lg:max-w-5xl lg:flex-row lg:rounded-3xl lg:border lg:border-gray-200 lg:shadow-xl">
        <div className="relative flex flex-col items-center justify-center gap-3 overflow-hidden bg-gradient-to-br from-[#0B2A24] via-[#0F3D31] to-[#155741] px-8 py-14 text-center lg:w-1/2 lg:px-10 lg:py-16">
          <BrandRings className="pointer-events-none absolute -bottom-16 -left-16 h-72 w-72" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-56 w-56 rounded-full bg-[#22C55E] opacity-30 blur-3xl" />

          <div className="relative z-10 flex items-center gap-3">
            <LogoMark className="h-11 w-11" />
            <span className="text-2xl font-bold text-white lg:text-3xl">
              GymFlow
            </span>
          </div>

          <p className="relative z-10 text-xs text-white/70 lg:text-sm">
            Treine. Acompanhe. Evolua.
          </p>
        </div>

        <div className="-mt-6 rounded-t-3xl bg-white px-6 py-8 lg:mt-0 lg:w-1/2 lg:rounded-none lg:px-12 lg:py-16">
          <h1 className="text-2xl font-semibold text-gray-900">
            Bem-vindo de volta!
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Entre para continuar sua jornada.
          </p>

          {loginMutation.isError && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-600">{loginErrorMessage}</p>
            </div>
          )}

          <form
            className="mt-6 space-y-4"
            onSubmit={handleSubmit(handleLogin)}
            noValidate
          >
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                E-mail
              </label>

              <div className="relative">
                <MailIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                <input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#1BA65A] focus:ring-4 focus:ring-[#1BA65A]/10"
                  {...register("email")}
                />
              </div>

              {errors.email && (
                <p className="mt-1.5 text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Senha
              </label>

              <div className="relative">
                <LockIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua senha"
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-11 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#1BA65A] focus:ring-4 focus:ring-[#1BA65A]/10"
                  {...register("password")}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="mt-1.5 text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm font-medium text-gray-500 hover:text-[#0F3D31]"
              >
                Esqueceu sua senha?
              </button>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F3D31] py-3 text-sm font-semibold text-white transition hover:bg-[#0B2E25] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loginMutation.isPending ? "Entrando..." : "Entrar"}
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">ou</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <GoogleIcon className="h-4.5 w-4.5" />
            Entrar com Google
          </button>

          <p className="mt-6 text-center text-sm text-gray-500">
            Ainda não tem conta?{" "}
            <button type="button" className="font-semibold text-[#1BA65A]">
              Cadastre-se
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
