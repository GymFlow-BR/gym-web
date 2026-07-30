import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { isApiError } from "../../../services/apiError";
import { changePassword } from "../../auth/services/authService";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "A senha atual é obrigatória."),
    newPassword: z
      .string()
      .min(1, "A nova senha é obrigatória.")
      .min(6, "A nova senha deve ter pelo menos 6 caracteres."),
    confirmPassword: z.string().min(1, "Confirme a nova senha."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "A nova senha deve ser diferente da senha atual.",
    path: ["newPassword"],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 5.1A10.6 10.6 0 0 1 12 5c7 0 10.5 7 10.5 7a13.4 13.4 0 0 1-3.2 4.1M6.5 6.6C3.4 8.5 1.5 12 1.5 12s3.5 7 10.5 7a10.4 10.4 0 0 0 4.6-1" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

function fieldClassName(hasError: boolean) {
  return [
    "h-14 w-full rounded-[14px] border bg-[#1D211F] px-4 pr-12 text-[15px] text-[#F4F7F5] outline-none transition placeholder:text-[#727B76]",
    hasError
      ? "border-[#D66565] focus:border-[#EF7676] focus:ring-2 focus:ring-[#EF7676]/15"
      : "border-[#343A36] focus:border-[#69DF98] focus:ring-2 focus:ring-[#69DF98]/15",
  ].join(" ");
}

export function ChangePasswordForm() {
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>(
    {},
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      reset();
      setVisibleFields({});
    },
  });

  function toggleVisibility(field: string) {
    setVisibleFields((current) => ({ ...current, [field]: !current[field] }));
  }

  function getErrorMessage() {
    if (!isApiError(mutation.error)) {
      return "Não foi possível alterar a senha. Tente novamente.";
    }

    if (mutation.error.status === 401) {
      return "Sua sessão expirou. Faça login novamente.";
    }

    if (mutation.error.status === 400) {
      // A API responde em inglês; traduzimos os casos conhecidos.
      const apiMessage = mutation.error.message ?? "";

      if (apiMessage.includes("Current password is invalid")) {
        return "A senha atual está incorreta.";
      }

      if (apiMessage.includes("must be different")) {
        return "A nova senha deve ser diferente da senha atual.";
      }

      return "Não foi possível alterar a senha. Verifique os dados informados.";
    }

    return "Não foi possível alterar a senha. Tente novamente.";
  }

  const submit = handleSubmit((data) => {
    mutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  });

  const fields = [
    {
      name: "currentPassword" as const,
      label: "Senha atual",
      placeholder: "Digite sua senha atual",
      autoComplete: "current-password",
      error: errors.currentPassword?.message,
    },
    {
      name: "newPassword" as const,
      label: "Nova senha",
      placeholder: "Pelo menos 6 caracteres",
      autoComplete: "new-password",
      error: errors.newPassword?.message,
    },
    {
      name: "confirmPassword" as const,
      label: "Confirmar nova senha",
      placeholder: "Repita a nova senha",
      autoComplete: "new-password",
      error: errors.confirmPassword?.message,
    },
  ];

  return (
    <section className="rounded-[22px] border border-[#2A302C] bg-[#171A18] p-6 text-[#F4F7F5] sm:p-7">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8D9791]">
          Segurança
        </p>

        <h2 className="mt-3 text-[22px] font-semibold tracking-[-0.03em]">
          Alterar senha
        </h2>

        <p className="mt-2 text-[14px] leading-6 text-[#8D9791]">
          Para sua segurança, confirme a senha atual antes de definir uma nova.
        </p>
      </header>

      {mutation.isSuccess && (
        <div
          role="status"
          className="mt-5 rounded-[14px] border border-[#2D6945] bg-[#173323] px-4 py-3"
        >
          <p className="text-[13px] font-semibold text-[#70E39B]">
            Senha alterada com sucesso.
          </p>
        </div>
      )}

      {mutation.isError && (
        <div
          role="alert"
          className="mt-5 rounded-[14px] border border-[#6A3434] bg-[#2B1919] px-4 py-3"
        >
          <p className="text-[13px] font-semibold text-[#FF8A8A]">
            Erro ao alterar senha.
          </p>

          <p className="mt-1 text-[13px] text-[#FFB0B0]">{getErrorMessage()}</p>
        </div>
      )}

      <form onSubmit={submit} className="mt-6 space-y-5" noValidate>
        {fields.map((field) => {
          const isVisible = Boolean(visibleFields[field.name]);

          return (
            <div key={field.name}>
              <label
                htmlFor={field.name}
                className="mb-2 block text-[12px] font-medium text-[#C9D0CC]"
              >
                {field.label}
              </label>

              <div className="relative">
                <input
                  id={field.name}
                  type={isVisible ? "text" : "password"}
                  placeholder={field.placeholder}
                  autoComplete={field.autoComplete}
                  aria-invalid={field.error ? true : undefined}
                  aria-describedby={
                    field.error ? `${field.name}-error` : undefined
                  }
                  className={fieldClassName(Boolean(field.error))}
                  {...register(field.name)}
                />

                <button
                  type="button"
                  onClick={() => toggleVisibility(field.name)}
                  aria-label={
                    isVisible
                      ? `Ocultar ${field.label.toLowerCase()}`
                      : `Mostrar ${field.label.toLowerCase()}`
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#8C9690] transition hover:bg-[#232825] hover:text-white"
                >
                  {isVisible ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              {field.error && (
                <p
                  id={`${field.name}-error`}
                  className="mt-2 text-[13px] text-[#FF7B7B]"
                >
                  {field.error}
                </p>
              )}
            </div>
          );
        })}

        <button
          type="submit"
          disabled={mutation.isPending}
          aria-busy={mutation.isPending}
          className="inline-flex h-12 items-center justify-center rounded-[14px] bg-[#1BA65A] px-6 text-[14px] font-semibold text-white transition hover:bg-[#159452] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {mutation.isPending ? "Alterando..." : "Alterar senha"}
        </button>
      </form>
    </section>
  );
}
