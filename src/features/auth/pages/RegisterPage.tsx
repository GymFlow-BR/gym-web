import { zodResolver } from "@hookform/resolvers/zod";
import { GymFlowLogo } from "../../../components/brand/GymFlowLogo";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import type { SVGProps } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { z } from "zod";
import "@fontsource-variable/geist";
import { Building2, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";

import { isApiError } from "../../../services/apiError";
import { registerOrganization } from "../services/authService";
import type {
  OrganizationType,
  RegisterOrganizationRequest,
} from "../types/auth";

const registerSchema = z
  .object({
    organizationName: z
      .string()
      .trim()
      .min(1, "O nome da organização é obrigatório.")
      .min(2, "O nome da organização deve ter pelo menos 2 caracteres.")
      .max(150, "O nome da organização deve ter no máximo 150 caracteres."),

    organizationType: z.enum(["ACADEMY", "PERSONAL"], {
      message: "Selecione o tipo da organização.",
    }),

    organizationEmail: z
      .string()
      .trim()
      .min(1, "O e-mail da organização é obrigatório.")
      .pipe(z.email("Informe um e-mail válido para a organização.")),

    organizationPhone: z
      .string()
      .trim()
      .max(30, "O telefone deve ter no máximo 30 caracteres.")
      .optional()
      .or(z.literal("")),

    adminName: z
      .string()
      .trim()
      .min(1, "O nome do administrador é obrigatório.")
      .min(2, "O nome do administrador deve ter pelo menos 2 caracteres.")
      .max(150, "O nome do administrador deve ter no máximo 150 caracteres."),

    adminEmail: z
      .string()
      .trim()
      .min(1, "O e-mail do administrador é obrigatório.")
      .pipe(z.email("Informe um e-mail válido para o administrador.")),

    password: z
      .string()
      .min(1, "A senha é obrigatória.")
      .min(6, "A senha deve ter pelo menos 6 caracteres.")
      .max(100, "A senha deve ter no máximo 100 caracteres."),

    confirmPassword: z.string().min(1, "Confirme sua senha."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas precisam ser iguais.",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

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

function normalizeOptionalValue(value?: string) {
  if (!value || value.trim() === "") {
    return null;
  }

  return value.trim();
}

function toRegisterOrganizationRequest(
  data: RegisterFormData,
): RegisterOrganizationRequest {
  return {
    organizationName: data.organizationName.trim(),
    organizationType: data.organizationType as OrganizationType,
    organizationEmail: data.organizationEmail.trim(),
    organizationPhone: normalizeOptionalValue(data.organizationPhone),
    adminName: data.adminName.trim(),
    adminEmail: data.adminEmail.trim(),
    password: data.password,
  };
}

function getRegisterErrorMessage(error: unknown) {
  if (isApiError(error) && error.status === 409) {
    return "Já existe uma organização ou usuário cadastrado com este e-mail.";
  }

  if (isApiError(error) && error.status === 400) {
    return "Revise os dados informados e tente novamente.";
  }

  return "Não foi possível criar sua conta. Tente novamente.";
}

function getFieldWrapperClassName(hasError?: boolean) {
  return [
    "flex min-h-12 items-center gap-2.5 rounded-xl border px-3.5 transition focus-within:border-[#74e29a]/45 focus-within:bg-[#74e29a]/[0.025] focus-within:ring-3 focus-within:ring-[#74e29a]/5 bg-white/[0.025]",
    hasError ? "border-[#ff8d88]/50" : "border-white/[0.07]",
  ].join(" ");
}

export function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      organizationName: "",
      organizationType: "ACADEMY",
      organizationEmail: "",
      organizationPhone: "",
      adminName: "",
      adminEmail: "",
      password: "",
      confirmPassword: "",
    },
  });

  const selectedOrganizationType = watch("organizationType");

  const registerMutation = useMutation({
    mutationFn: registerOrganization,
    onSuccess: (response) => {
      setSuccessMessage(
        `${response.organizationName} foi cadastrada com sucesso. Redirecionando para o login...`,
      );

      window.setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            registeredEmail: response.adminEmail,
          },
        });
      }, 1400);
    },
  });

  function handleRegister(data: RegisterFormData) {
    setSuccessMessage(null);
    registerMutation.mutate(toRegisterOrganizationRequest(data));
  }

  return (
    <main className="min-h-dvh bg-[#0d0f0e] font-['Geist_Variable',Arial,sans-serif] text-[#eef3ef] antialiased lg:grid lg:grid-cols-[minmax(420px,0.92fr)_minmax(560px,1.08fr)]">
      <section
        className="relative hidden min-h-dvh flex-col justify-between overflow-hidden border-r border-[#74e29a]/10 bg-[radial-gradient(circle_at_76%_24%,rgba(116,226,154,0.14),transparent_21rem),radial-gradient(circle_at_12%_85%,rgba(31,138,112,0.13),transparent_23rem),linear-gradient(145deg,#142019,#101511_58%,#0e100f)] p-[clamp(30px,4vw,58px)] lg:flex"
        aria-label="Apresentação do GymFlow"
      >
        <span className="pointer-events-none absolute right-[-330px] top-[15%] h-[540px] w-[540px] rounded-full border border-[#74e29a]/[0.07]" />
        <span className="pointer-events-none absolute right-[-155px] top-[28%] h-[340px] w-[340px] rounded-full border border-[#74e29a]/[0.07]" />

        <header className="relative z-10 flex items-center justify-between gap-5">
          <GymFlowLogo
            markClassName="h-10 w-10"
            textClassName="text-xl font-semibold tracking-[-0.04em] text-[#f4f7f4]"
          />
          <span className="text-[12px] font-semibold uppercase tracking-[0.11em] text-[#dee8e1]/50">
            Plataforma de treinos
          </span>
        </header>

        <div className="relative z-10 my-auto max-w-[590px] py-16">
          <span className="mb-6 flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#74e29a] before:h-px before:w-7 before:bg-[#74e29a]">
            Comece com sua organização
          </span>
          <h1 className="m-0 text-[clamp(39px,4.3vw,67px)] font-medium leading-[1.03] tracking-[-0.062em] text-[#f1f5f2]">
            Estruture treinos.
            <br />
            Organize alunos.
            <br />
            Evolua seu serviço.
          </h1>
          <p className="mt-6 max-w-[500px] text-sm leading-7 text-[#dee8e1]/60">
            Crie sua organização, cadastre o primeiro administrador e comece a
            montar uma operação de treinos mais clara e profissional.
          </p>
        </div>

        <div className="relative z-10 grid max-w-[500px] grid-cols-[auto_1fr] items-center gap-3.5 rounded-2xl border border-[#74e29a]/15 bg-[#74e29a]/5 p-4 backdrop-blur">
          <span className="grid h-11 w-11 place-items-center rounded-[13px] bg-[#74e29a]/10 text-[#74e29a]">
            <ShieldCheck size={20} strokeWidth={2} />
          </span>
          <div>
            <strong className="block text-[13px] font-semibold text-[#f4f6f4]/90">
              Primeiro admin criado automaticamente
            </strong>
            <span className="mt-1 block text-[11px] leading-4 text-[#dee8e1]/50">
              Sua organização já começa pronta para cadastrar alunos, treinos e
              exercícios.
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
        <div className="relative flex min-h-[210px] flex-col justify-between overflow-hidden bg-[radial-gradient(circle_at_90%_5%,rgba(173,255,196,0.24),transparent_13rem),linear-gradient(145deg,#28583a,#173724_72%,#142c1e)] px-5 pb-10 pt-[max(22px,env(safe-area-inset-top))] lg:hidden">
          <GymFlowLogo
            className="relative z-10 mt-7 w-full justify-center gap-0"
            markClassName="absolute left-1/2 h-10 w-11 -translate-x-[92px]"
            textClassName="mx-auto text-[24px] font-semibold tracking-[-0.05em] text-white"
          />

          <div className="relative z-10">
            <strong className="block text-[28px] font-semibold tracking-[-0.05em] text-white">
              Crie sua conta.
            </strong>

            <span className="mt-3 block text-[9px] font-bold uppercase tracking-[0.12em] text-[#bdf8cf]">
              Cadastro inicial
            </span>
          </div>

          <span className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-[#74e29a]/20 blur-3xl" />
        </div>

        <div className="relative z-10 -mt-5 rounded-t-[24px] bg-[#0d0f0e] px-5 pb-8 pt-9 sm:px-8 lg:m-auto lg:w-full lg:max-w-[560px] lg:rounded-none lg:bg-transparent lg:p-0">
          <header className="mb-8">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.11em] text-[#8c9790]">
              Crie sua organização
            </span>

            <h2 className="text-[clamp(31px,3.4vw,43px)] font-semibold leading-tight tracking-[-0.055em] text-[#eef3ef]">
              Comece no GymFlow.
            </h2>

            <p className="mt-2.5 text-[13px] leading-6 text-[#8c9790]">
              Cadastre sua academia ou atuação como personal e crie o primeiro
              administrador da conta.
            </p>
          </header>

          {successMessage && (
            <div
              role="status"
              className="mb-5 rounded-xl border border-[#74e29a]/25 bg-[#74e29a]/[0.075] px-3.5 py-3"
            >
              <p className="text-[12px] font-medium leading-5 text-[#8ff0ad]">
                {successMessage}
              </p>
            </div>
          )}

          {registerMutation.isError && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-[#ff8d88]/25 bg-[#ff8d88]/[0.055] px-3.5 py-3"
            >
              <p className="text-[12px] font-medium leading-5 text-[#ff9b96]">
                {getRegisterErrorMessage(registerMutation.error)}
              </p>
            </div>
          )}

          <form
            className="grid gap-[18px]"
            onSubmit={handleSubmit(handleRegister)}
            noValidate
          >
            <div className="grid gap-[18px] sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="organizationName"
                  className="mb-2 block text-[12px] font-semibold text-[#d7ddd9]"
                >
                  Nome da organização
                </label>

                <div
                  className={getFieldWrapperClassName(
                    Boolean(errors.organizationName),
                  )}
                >
                  <Building2
                    size={17}
                    strokeWidth={1.8}
                    className="shrink-0 text-[#8c9790]"
                  />

                  <input
                    id="organizationName"
                    type="text"
                    placeholder="Ex: GymFlow Academy"
                    aria-invalid={Boolean(errors.organizationName)}
                    className="h-12 min-w-0 flex-1 border-0 bg-transparent text-xs text-[#eef3ef] outline-none placeholder:text-[#68716c]"
                    {...register("organizationName")}
                  />
                </div>

                {errors.organizationName && (
                  <p className="mt-2 text-[12px] font-medium leading-4 text-[#ff8d88]">
                    {errors.organizationName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-[12px] font-semibold text-[#d7ddd9]">
                  Tipo de organização
                </label>

                <input type="hidden" {...register("organizationType")} />

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setValue("organizationType", "ACADEMY", {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                    className={[
                      "group relative h-12 overflow-hidden rounded-xl border px-3 text-left transition-all duration-300",
                      "hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(116,226,154,0.08)]",
                      selectedOrganizationType === "ACADEMY"
                        ? "border-[#74e29a]/65 bg-[#74e29a]/[0.10] text-[#eef3ef] shadow-[0_0_0_3px_rgba(116,226,154,0.055)]"
                        : "border-white/[0.07] bg-white/[0.025] text-[#8c9790] hover:border-[#74e29a]/35 hover:bg-[#74e29a]/[0.045]",
                    ].join(" ")}
                  >
                    <span className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100">
                      <span className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-[#74e29a]/10 blur-2xl" />
                    </span>

                    <span className="relative flex h-full items-center justify-between gap-3">
                      <span
                        className={[
                          "text-[12px] font-semibold transition",
                          selectedOrganizationType === "ACADEMY"
                            ? "text-[#eef3ef]"
                            : "text-[#c5ccc8]",
                        ].join(" ")}
                      >
                        Academia
                      </span>

                      <span
                        className={[
                          "grid h-4 w-4 shrink-0 place-items-center rounded-full border transition",
                          selectedOrganizationType === "ACADEMY"
                            ? "border-[#74e29a] bg-[#74e29a]"
                            : "border-white/15 bg-white/[0.03] group-hover:border-[#74e29a]/45",
                        ].join(" ")}
                      >
                        {selectedOrganizationType === "ACADEMY" && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#102117]" />
                        )}
                      </span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setValue("organizationType", "PERSONAL", {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                    className={[
                      "group relative h-12 overflow-hidden rounded-xl border px-3 text-left transition-all duration-300",
                      "hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(116,226,154,0.08)]",
                      selectedOrganizationType === "PERSONAL"
                        ? "border-[#74e29a]/65 bg-[#74e29a]/[0.10] text-[#eef3ef] shadow-[0_0_0_3px_rgba(116,226,154,0.055)]"
                        : "border-white/[0.07] bg-white/[0.025] text-[#8c9790] hover:border-[#74e29a]/35 hover:bg-[#74e29a]/[0.045]",
                    ].join(" ")}
                  >
                    <span className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100">
                      <span className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-[#74e29a]/10 blur-2xl" />
                    </span>

                    <span className="relative flex h-full items-center justify-between gap-3">
                      <span
                        className={[
                          "text-[12px] font-semibold transition",
                          selectedOrganizationType === "PERSONAL"
                            ? "text-[#eef3ef]"
                            : "text-[#c5ccc8]",
                        ].join(" ")}
                      >
                        Personal
                      </span>

                      <span
                        className={[
                          "grid h-4 w-4 shrink-0 place-items-center rounded-full border transition",
                          selectedOrganizationType === "PERSONAL"
                            ? "border-[#74e29a] bg-[#74e29a]"
                            : "border-white/15 bg-white/[0.03] group-hover:border-[#74e29a]/45",
                        ].join(" ")}
                      >
                        {selectedOrganizationType === "PERSONAL" && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#102117]" />
                        )}
                      </span>
                    </span>
                  </button>
                </div>

                {errors.organizationType && (
                  <p className="mt-2 text-[12px] font-medium leading-5 text-[#ff8d88]">
                    {errors.organizationType.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="organizationPhone"
                  className="mb-2 block text-[12px] font-semibold text-[#d7ddd9]"
                >
                  Telefone <span className="text-[#68716c]">(opcional)</span>
                </label>

                <div
                  className={getFieldWrapperClassName(
                    Boolean(errors.organizationPhone),
                  )}
                >
                  <input
                    id="organizationPhone"
                    type="text"
                    placeholder="Ex: 11999999999"
                    aria-invalid={Boolean(errors.organizationPhone)}
                    className="h-12 min-w-0 flex-1 border-0 bg-transparent text-xs text-[#eef3ef] outline-none placeholder:text-[#68716c]"
                    {...register("organizationPhone")}
                  />
                </div>

                {errors.organizationPhone && (
                  <p className="mt-2 text-[12px] font-medium leading-4 text-[#ff8d88]">
                    {errors.organizationPhone.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="organizationEmail"
                  className="mb-2 block text-[12px] font-semibold text-[#d7ddd9]"
                >
                  E-mail da organização
                </label>

                <div
                  className={getFieldWrapperClassName(
                    Boolean(errors.organizationEmail),
                  )}
                >
                  <MailIcon className="h-[17px] w-[17px] shrink-0 text-[#8c9790]" />

                  <input
                    id="organizationEmail"
                    type="email"
                    inputMode="email"
                    placeholder="contato@academia.com"
                    aria-invalid={Boolean(errors.organizationEmail)}
                    className="h-12 min-w-0 flex-1 border-0 bg-transparent text-xs text-[#eef3ef] outline-none placeholder:text-[#68716c]"
                    {...register("organizationEmail")}
                  />
                </div>

                {errors.organizationEmail && (
                  <p className="mt-2 text-[12px] font-medium leading-4 text-[#ff8d88]">
                    {errors.organizationEmail.message}
                  </p>
                )}
              </div>
            </div>

            <div className="my-1 flex items-center gap-3 text-[12px] uppercase tracking-[0.08em] text-[#68716c] before:h-px before:flex-1 before:bg-white/[0.07] after:h-px after:flex-1 after:bg-white/[0.07]">
              <span className="shrink-0">dados do administrador</span>
            </div>

            <div>
              <label
                htmlFor="adminName"
                className="mb-2 block text-[12px] font-semibold text-[#d7ddd9]"
              >
                Nome do administrador
              </label>

              <div
                className={getFieldWrapperClassName(Boolean(errors.adminName))}
              >
                <UserRound
                  size={17}
                  strokeWidth={1.8}
                  className="shrink-0 text-[#8c9790]"
                />

                <input
                  id="adminName"
                  type="text"
                  placeholder="Seu nome"
                  aria-invalid={Boolean(errors.adminName)}
                  className="h-12 min-w-0 flex-1 border-0 bg-transparent text-xs text-[#eef3ef] outline-none placeholder:text-[#68716c]"
                  {...register("adminName")}
                />
              </div>

              {errors.adminName && (
                <p className="mt-2 text-[12px] font-medium leading-4 text-[#ff8d88]">
                  {errors.adminName.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="adminEmail"
                className="mb-2 block text-[12px] font-semibold text-[#d7ddd9]"
              >
                E-mail do administrador
              </label>

              <div
                className={getFieldWrapperClassName(Boolean(errors.adminEmail))}
              >
                <MailIcon className="h-[17px] w-[17px] shrink-0 text-[#8c9790]" />

                <input
                  id="adminEmail"
                  type="email"
                  inputMode="email"
                  placeholder="voce@email.com"
                  aria-invalid={Boolean(errors.adminEmail)}
                  className="h-12 min-w-0 flex-1 border-0 bg-transparent text-xs text-[#eef3ef] outline-none placeholder:text-[#68716c]"
                  {...register("adminEmail")}
                />
              </div>

              {errors.adminEmail && (
                <p className="mt-2 text-[12px] font-medium leading-4 text-[#ff8d88]">
                  {errors.adminEmail.message}
                </p>
              )}
            </div>

            <div className="grid gap-[18px] sm:grid-cols-2">
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-[12px] font-semibold text-[#d7ddd9]"
                >
                  Senha
                </label>

                <div
                  className={getFieldWrapperClassName(Boolean(errors.password))}
                >
                  <LockKeyhole
                    size={17}
                    strokeWidth={1.8}
                    className="shrink-0 text-[#8c9790]"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Mínimo de 6 caracteres"
                    aria-invalid={Boolean(errors.password)}
                    className="h-12 min-w-0 flex-1 border-0 bg-transparent text-xs text-[#eef3ef] outline-none placeholder:text-[#68716c]"
                    {...register("password")}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#8c9790] transition hover:bg-white/[0.04] hover:text-[#eef3ef]"
                    aria-label={
                      showPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-[17px] w-[17px]" />
                    ) : (
                      <EyeIcon className="h-[17px] w-[17px]" />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="mt-2 text-[12px] font-medium leading-4 text-[#ff8d88]">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-[12px] font-semibold text-[#d7ddd9]"
                >
                  Confirmar senha
                </label>

                <div
                  className={getFieldWrapperClassName(
                    Boolean(errors.confirmPassword),
                  )}
                >
                  <LockKeyhole
                    size={17}
                    strokeWidth={1.8}
                    className="shrink-0 text-[#8c9790]"
                  />

                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Repita a senha"
                    aria-invalid={Boolean(errors.confirmPassword)}
                    className="h-12 min-w-0 flex-1 border-0 bg-transparent text-xs text-[#eef3ef] outline-none placeholder:text-[#68716c]"
                    {...register("confirmPassword")}
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#8c9790] transition hover:bg-white/[0.04] hover:text-[#eef3ef]"
                    aria-label={
                      showConfirmPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOffIcon className="h-[17px] w-[17px]" />
                    ) : (
                      <EyeIcon className="h-[17px] w-[17px]" />
                    )}
                  </button>
                </div>

                {errors.confirmPassword && (
                  <p className="mt-2 text-[12px] font-medium leading-4 text-[#ff8d88]">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="mt-1 flex min-h-[50px] w-full items-center justify-center gap-2.5 rounded-xl border border-[#74e29a] bg-[#74e29a] text-xs font-bold text-[#102117] transition hover:-translate-y-px hover:bg-[#88e9a7] hover:shadow-[0_10px_28px_rgba(59,156,91,0.15)] disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {registerMutation.isPending ? (
                <>
                  <span className="h-[15px] w-[15px] animate-spin rounded-full border-2 border-[#102117]/25 border-t-[#102117]" />
                  Criando conta...
                </>
              ) : (
                <>
                  Criar conta
                  <ArrowRightIcon className="h-[18px] w-[18px]" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[12px] text-[#8c9790]">
            Já possui conta?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#74e29a] transition hover:text-[#8ff0ad]"
            >
              Entrar
            </Link>
          </p>
        </div>

        <footer className="mt-auto hidden justify-between gap-5 text-[12px] tracking-[0.02em] text-[#747d77] lg:flex">
          <span>© 2026 GymFlow</span>
          <span>Cadastro simples. Gestão organizada.</span>
        </footer>
      </section>
    </main>
  );
}
