import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { SVGProps } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { z } from "zod";
import "@fontsource-variable/geist";
import { LockKeyhole, ShieldCheck } from "lucide-react";

import { isApiError } from "../../../services/apiError";
import { login } from "../services/authService";
import { getDefaultPathByRole } from "../utils/getDefaultPathByRole";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "O e-mail é obrigatório.")
    .pipe(z.email("Informe um e-mail válido.")),
  password: z
    .string()
    .min(1, "A senha é obrigatória.")
    .min(6, "A senha deve ter pelo menos 6 caracteres."),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LogoMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`flex items-center justify-center rounded-xl bg-[#74e29a] text-[#102117] ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-[62%] w-[62%]"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6.5 6.5 11 11" />
        <path d="m21 21-1-1" />
        <path d="m3 3 1 1" />
        <path d="m18 22 4-4" />
        <path d="m2 6 4-4" />
        <path d="m3 10 7-7" />
        <path d="m14 21 7-7" />
      </svg>
    </span>
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
    <main className="min-h-dvh bg-[#0d0f0e] font-['Geist_Variable',Arial,sans-serif] text-[#eef3ef] antialiased lg:grid lg:grid-cols-[minmax(420px,0.92fr)_minmax(500px,1.08fr)]">
      <section
        className="relative hidden min-h-dvh flex-col justify-between overflow-hidden border-r border-[#74e29a]/10 bg-[radial-gradient(circle_at_76%_24%,rgba(116,226,154,0.14),transparent_21rem),radial-gradient(circle_at_12%_85%,rgba(31,138,112,0.13),transparent_23rem),linear-gradient(145deg,#142019,#101511_58%,#0e100f)] p-[clamp(30px,4vw,58px)] lg:flex"
        aria-label="Apresentação do GymFlow"
      >
        <span className="pointer-events-none absolute right-[-330px] top-[15%] h-[540px] w-[540px] rounded-full border border-[#74e29a]/[0.07]" />
        <span className="pointer-events-none absolute right-[-155px] top-[28%] h-[340px] w-[340px] rounded-full border border-[#74e29a]/[0.07]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.18)_1px,transparent_1px)] [background-size:52px_52px] [mask-image:linear-gradient(115deg,transparent_10%,black_55%,transparent)]" />

        <header className="relative z-10 flex items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <LogoMark className="h-10 w-10" />
            <strong className="text-xl tracking-[-0.04em]">GymFlow</strong>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.11em] text-[#dee8e1]/50">
            Plataforma de treinos
          </span>
        </header>

        <div className="relative z-10 my-auto max-w-[590px] py-16">
          <span className="mb-6 flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#74e29a] before:h-px before:w-7 before:bg-[#74e29a]">
            Treino bem orientado
          </span>
          <h1 className="m-0 text-[clamp(39px,4.3vw,67px)] font-medium leading-[1.03] tracking-[-0.062em] text-[#f1f5f2]">
            Clareza para treinar.
            <br />
            Liberdade para evoluir.
          </h1>
          <p className="mt-6 max-w-[500px] text-sm leading-7 text-[#dee8e1]/60">
            Uma experiência simples para quem acompanha e para quem treina,
            conectando cada exercício ao que realmente importa.
          </p>
        </div>

        <div className="relative z-10 grid max-w-[500px] grid-cols-[auto_1fr] items-center gap-3.5 rounded-2xl border border-[#74e29a]/15 bg-[#74e29a]/5 p-4 backdrop-blur">
          <span className="grid h-11 w-11 place-items-center rounded-[13px] bg-[#74e29a]/10 text-[#74e29a]">
            <ShieldCheck size={20} strokeWidth={2} />
          </span>
          <div>
            <strong className="block text-[11px] font-semibold text-[#f4f6f4]/90">
              Seu treino sempre à mão
            </strong>
            <span className="mt-1 block text-[9px] leading-4 text-[#dee8e1]/50">
              Orientações, vídeos e progresso em uma experiência organizada.
            </span>
          </div>
        </div>
      </section>

      <section
        className="flex min-h-dvh flex-col lg:p-[clamp(28px,4vw,55px)]"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(116, 226, 154, 0.055), transparent 24rem), #0d0f0e",
        }}
      >
        <div className="relative flex min-h-[218px] flex-col justify-between overflow-hidden bg-[radial-gradient(circle_at_90%_5%,rgba(173,255,196,0.24),transparent_13rem),linear-gradient(145deg,#28583a,#173724_72%,#142c1e)] px-5 pb-10 pt-[max(22px,env(safe-area-inset-top))] lg:hidden">
          <div className="relative z-10 flex items-center gap-2.5">
            <LogoMark className="h-8 w-8" />
            <strong className="text-lg tracking-[-0.04em] text-white">
              GymFlow
            </strong>
          </div>
          <div className="relative z-10">
            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#bdf8cf]">
              Seu espaço de evolução
            </span>
            <strong className="mt-2 block text-[28px] font-semibold tracking-[-0.05em] text-white">
              Seu treino começa aqui.
            </strong>
            <p className="mt-1 text-xs text-white/65">
              Orientação e consistência, todos os dias.
            </p>
          </div>
          <span className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-[#74e29a]/20 blur-3xl" />
        </div>

        <div className="relative z-10 -mt-5 rounded-t-[24px] bg-[#0d0f0e] px-5 pb-8 pt-9 sm:px-8 lg:m-auto lg:w-full lg:max-w-[430px] lg:rounded-none lg:bg-transparent lg:p-0">
          <header className="mb-8">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.11em] text-[#8c9790]">
              Acesse sua conta
            </span>
            <h2 className="text-[clamp(31px,3.4vw,43px)] font-semibold leading-tight tracking-[-0.055em] text-[#eef3ef]">
              Bem-vindo de volta.
            </h2>
            <p className="mt-2.5 text-[13px] text-[#8c9790]">
              Entre para continuar de onde você parou.
            </p>
          </header>

          <button
            type="button"
            disabled
            title="Login com Google estará disponível em breve"
            aria-describedby="google-login-status"
            className="flex min-h-12 w-full cursor-not-allowed items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.025] text-[11px] font-semibold text-[#e6e9e7]/55"
          >
            <GoogleIcon className="h-[22px] w-[22px] opacity-70 grayscale-[35%]" />
            Continuar com Google
            <span className="rounded-full bg-white/[0.06] px-2 py-1 text-[8px] uppercase tracking-[0.08em] text-[#8c9790]">
              Em breve
            </span>
          </button>
          <span id="google-login-status" className="sr-only">
            A autenticação com Google ainda não está disponível.
          </span>

          <div className="my-[18px] flex items-center gap-3 text-[8px] uppercase tracking-[0.08em] text-[#68716c] before:h-px before:flex-1 before:bg-white/[0.07] after:h-px after:flex-1 after:bg-white/[0.07]">
            <span className="shrink-0">ou continue com e-mail</span>
          </div>

          {loginMutation.isError && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-[#ff8d88]/25 bg-[#ff8d88]/[0.055] px-3.5 py-3"
            >
              <p className="text-[12px] font-medium leading-5 text-[#ff9b96]">
                {loginErrorMessage}
              </p>
            </div>
          )}

          <form
            className="grid gap-[18px]"
            onSubmit={handleSubmit(handleLogin)}
            noValidate
          >
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-[10px] font-semibold text-[#cbd1cd]"
              >
                E-mail
              </label>
              <div
                className={`flex min-h-12 items-center gap-2.5 rounded-xl border px-3.5 transition focus-within:border-[#74e29a]/45 focus-within:bg-[#74e29a]/[0.025] focus-within:ring-3 focus-within:ring-[#74e29a]/5 ${errors.email ? "border-[#ff8d88]/50" : "border-white/[0.07]"} bg-white/[0.025]`}
              >
                <MailIcon className="h-[17px] w-[17px] shrink-0 text-[#8c9790]" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="seu@email.com"
                  aria-invalid={Boolean(errors.email)}
                  className="h-12 min-w-0 flex-1 border-0 bg-transparent text-xs text-[#eef3ef] outline-none placeholder:text-[#68716c] autofill:[-webkit-text-fill-color:#eef3ef] autofill:[-webkit-box-shadow:0_0_0_1000px_#111512_inset]"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-[11px] font-medium leading-4 text-[#ff8d88]">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-[10px] font-semibold text-[#cbd1cd]"
              >
                Senha
              </label>
              <div
                className={`flex min-h-12 items-center gap-2.5 rounded-xl border px-3.5 transition focus-within:border-[#74e29a]/45 focus-within:bg-[#74e29a]/[0.025] focus-within:ring-3 focus-within:ring-[#74e29a]/5 ${errors.password ? "border-[#ff8d88]/50" : "border-white/[0.07]"} bg-white/[0.025]`}
              >
                <LockKeyhole
                  size={17}
                  strokeWidth={1.8}
                  className="shrink-0 text-[#8c9790]"
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Sua senha"
                  aria-invalid={Boolean(errors.password)}
                  className="h-12 min-w-0 flex-1 border-0 bg-transparent text-xs text-[#eef3ef] outline-none placeholder:text-[#68716c] autofill:[-webkit-text-fill-color:#eef3ef] autofill:[-webkit-box-shadow:0_0_0_1000px_#111512_inset]"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#8c9790] transition hover:bg-white/[0.04] hover:text-[#eef3ef]"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-[17px] w-[17px]" />
                  ) : (
                    <EyeIcon className="h-[17px] w-[17px]" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-[11px] font-medium leading-4 text-[#ff8d88]">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="mt-1 flex min-h-[50px] w-full items-center justify-center gap-2.5 rounded-xl border border-[#74e29a] bg-[#74e29a] text-xs font-bold text-[#102117] transition hover:-translate-y-px hover:bg-[#88e9a7] hover:shadow-[0_10px_28px_rgba(59,156,91,0.15)] disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {loginMutation.isPending ? (
                <>
                  <span className="h-[15px] w-[15px] animate-spin rounded-full border-2 border-[#102117]/25 border-t-[#102117]" />
                  Acessando...
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRightIcon className="h-[18px] w-[18px]" />
                </>
              )}
            </button>
          </form>
        </div>

        <footer className="mt-auto hidden justify-between gap-5 text-[10px] tracking-[0.02em] text-[#747d77] lg:flex">
          <span>© 2026 GymFlow</span>
          <span>Treino simples. Evolução constante.</span>
        </footer>
      </section>
    </main>
  );
}
