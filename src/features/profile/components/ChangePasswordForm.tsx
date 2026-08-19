import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
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

type ChangePasswordFormProps = {
  variant?: "card" | "plain";
  onSuccess?: () => void;
};

function fieldClassName(hasError: boolean) {
  return [
    "student-password-input h-13 w-full rounded-2xl border bg-[#0d130f] px-4 pr-12 text-[15px] text-[#f5f7f5] caret-[#70e39b] outline-none transition placeholder:text-[#66716a]",
    hasError
      ? "border-red-400/45 focus:border-red-300 focus:ring-2 focus:ring-red-400/15"
      : "border-[#26322b] focus:border-[#70e39b]/70 focus:ring-2 focus:ring-[#70e39b]/15",
  ].join(" ");
}

export function ChangePasswordForm({
  variant = "card",
  onSuccess,
}: ChangePasswordFormProps) {
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>(
    {},
  );

  const [readOnlyFields, setReadOnlyFields] = useState<Record<string, boolean>>(
    {
      currentPassword: true,
    },
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
      setReadOnlyFields({ currentPassword: true });
      onSuccess?.();
    },
  });

  function toggleVisibility(field: string) {
    setVisibleFields((current) => ({ ...current, [field]: !current[field] }));
  }

  function enableField(field: string) {
    setReadOnlyFields((current) => ({ ...current, [field]: false }));
  }

  function getErrorMessage() {
    if (!isApiError(mutation.error)) {
      return "Não foi possível alterar a senha. Tente novamente.";
    }

    if (mutation.error.status === 401) {
      return "Sua sessão expirou. Faça login novamente.";
    }

    if (mutation.error.status === 400) {
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
      confirmNewPassword: data.confirmPassword,
    });
  });

  const fields = [
    {
      name: "currentPassword" as const,
      label: "Senha atual",
      placeholder: "Digite sua senha atual",
      autoComplete: "new-password",
      error: errors.currentPassword?.message,
      preventAutofill: true,
    },
    {
      name: "newPassword" as const,
      label: "Nova senha",
      placeholder: "Pelo menos 6 caracteres",
      autoComplete: "new-password",
      error: errors.newPassword?.message,
      preventAutofill: false,
    },
    {
      name: "confirmPassword" as const,
      label: "Confirmar nova senha",
      placeholder: "Repita a nova senha",
      autoComplete: "new-password",
      error: errors.confirmPassword?.message,
      preventAutofill: false,
    },
  ];

  const autofillStyles = (
    <style>
      {`
        .student-password-input:-webkit-autofill,
        .student-password-input:-webkit-autofill:hover,
        .student-password-input:-webkit-autofill:focus,
        .student-password-input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px #0d130f inset !important;
          -webkit-text-fill-color: #f5f7f5 !important;
          caret-color: #70e39b !important;
          transition: background-color 9999s ease-in-out 0s !important;
        }
      `}
    </style>
  );

  const formContent = (
    <>
      {mutation.isSuccess && (
        <div
          role="status"
          className="mb-5 rounded-2xl border border-[#70e39b]/25 bg-[#1d3828] px-4 py-3"
        >
          <p className="text-sm font-semibold text-[#70e39b]">
            Senha alterada com sucesso.
          </p>
        </div>
      )}

      {mutation.isError && (
        <div
          role="alert"
          className="mb-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3"
        >
          <p className="text-sm font-semibold text-red-200">
            Erro ao alterar senha.
          </p>

          <p className="mt-1 text-sm leading-6 text-red-100/80">
            {getErrorMessage()}
          </p>
        </div>
      )}

      <form
        onSubmit={submit}
        className="space-y-5"
        autoComplete="off"
        noValidate
      >
        <input
          type="text"
          name="fake-username"
          autoComplete="username"
          className="hidden"
          tabIndex={-1}
          aria-hidden="true"
        />

        <input
          type="password"
          name="fake-password"
          autoComplete="current-password"
          className="hidden"
          tabIndex={-1}
          aria-hidden="true"
        />

        {fields.map((field) => {
          const isVisible = Boolean(visibleFields[field.name]);

          return (
            <div key={field.name}>
              <label
                htmlFor={field.name}
                className="mb-2 block text-xs font-semibold text-[#c9d0cc]"
              >
                {field.label}
              </label>

              <div className="relative">
                <input
                  id={field.name}
                  type={isVisible ? "text" : "password"}
                  placeholder={field.placeholder}
                  autoComplete={field.autoComplete}
                  readOnly={field.preventAutofill && readOnlyFields[field.name]}
                  onFocus={() => {
                    if (field.preventAutofill) {
                      enableField(field.name);
                    }
                  }}
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-1.5 text-[#8c9690] transition hover:bg-[#17221b] hover:text-[#f5f7f5]"
                >
                  {isVisible ? (
                    <EyeOff aria-hidden="true" className="h-5 w-5" />
                  ) : (
                    <Eye aria-hidden="true" className="h-5 w-5" />
                  )}
                </button>
              </div>

              {field.error && (
                <p
                  id={`${field.name}-error`}
                  className="mt-2 text-sm text-red-300"
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
          className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[#70e39b] px-6 text-sm font-bold text-[#0d1b13] transition hover:bg-[#83e8a8] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {mutation.isPending ? "Alterando..." : "Alterar senha"}
        </button>
      </form>
    </>
  );

  if (variant === "plain") {
    return (
      <>
        {autofillStyles}
        {formContent}
      </>
    );
  }

  return (
    <section className="overflow-hidden rounded-[24px] border border-[#253128] bg-[#111914] shadow-xl shadow-black/10">
      {autofillStyles}

      <header className="border-b border-[#253128] bg-[#101812] p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1d3828] text-[#70e39b]">
            <LockKeyhole aria-hidden="true" className="h-5 w-5" />
          </span>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#70e39b]">
              Segurança
            </p>

            <h2 className="mt-1 text-xl font-semibold tracking-[-0.035em] text-[#f5f7f5]">
              Alterar senha
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#8fa098]">
              Confirme a senha atual antes de definir uma nova.
            </p>
          </div>
        </div>
      </header>

      <div className="p-5">{formContent}</div>
    </section>
  );
}
