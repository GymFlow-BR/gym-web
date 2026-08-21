import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, LockKeyhole, Plus, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { isApiError } from "../../../services/apiError";
import { createStudent } from "../services/studentService";

const createStudentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "O nome do aluno é obrigatório.")
    .min(2, "O nome do aluno deve ter pelo menos 2 caracteres.")
    .max(120, "O nome do aluno deve ter no máximo 120 caracteres."),
  email: z
    .string()
    .trim()
    .min(1, "O e-mail do aluno é obrigatório.")
    .email("Informe um e-mail válido.")
    .max(160, "O e-mail deve ter no máximo 160 caracteres."),
  password: z
    .string()
    .min(1, "A senha provisória é obrigatória.")
    .min(6, "A senha deve ter pelo menos 6 caracteres.")
    .max(72, "A senha deve ter no máximo 72 caracteres."),
});

type CreateStudentFormData = z.infer<typeof createStudentSchema>;

type CreateStudentFormProps = {
  organizationId?: number;
  onClose: () => void;
};

export function CreateStudentForm({
  organizationId,
  onClose,
}: CreateStudentFormProps) {
  const queryClient = useQueryClient();
  const [isTemporaryPasswordVisible, setIsTemporaryPasswordVisible] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateStudentFormData>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const createStudentMutation = useMutation({
    mutationFn: (data: CreateStudentFormData) =>
      createStudent({
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
        role: "STUDENT",
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["students"] });
      onClose();
    },
  });

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !createStudentMutation.isPending) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [createStudentMutation.isPending, onClose]);

  function handleCreateStudent(data: CreateStudentFormData) {
    if (!organizationId) {
      return;
    }

    createStudentMutation.mutate(data);
  }

  function getCreateStudentErrorMessage() {
    if (!createStudentMutation.error) {
      return null;
    }

    if (isApiError(createStudentMutation.error)) {
      const errorMessage = createStudentMutation.error.message.toLowerCase();

      if (createStudentMutation.error.status === 401) {
        return "Sua sessão expirou. Faça login novamente para cadastrar alunos.";
      }

      if (createStudentMutation.error.status === 403) {
        return "Você não possui permissão para cadastrar alunos.";
      }

      if (
        createStudentMutation.error.status === 409 ||
        errorMessage.includes("email already in use") ||
        errorMessage.includes("e-mail já") ||
        errorMessage.includes("email já")
      ) {
        return "Já existe um usuário cadastrado com este e-mail.";
      }

      if (createStudentMutation.error.status === 400) {
        return "Revise os dados preenchidos e tente novamente.";
      }
    }

    return "Não foi possível cadastrar o aluno. Tente novamente.";
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-student-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#050706]/80 px-4 py-8 backdrop-blur-[5px]"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !createStudentMutation.isPending
        ) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-[575px] rounded-[22px] border border-[#39413c] bg-[#191c1a] p-6 shadow-2xl shadow-black/40 sm:p-7">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.17em] text-[#909b95]">
              Novo aluno
            </p>
            <h2
              id="create-student-title"
              className="mt-3 text-[28px] font-semibold leading-none tracking-[-0.035em] text-[#f5f7f5]"
            >
              Adicionar aluno
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={createStudentMutation.isPending}
            aria-label="Fechar cadastro de aluno"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#343b37] text-[#8f9993] transition hover:border-[#4a554e] hover:text-[#f5f7f5] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-4 max-w-[470px] text-xs leading-5 text-[#89948e]">
          Crie o acesso provisório. Depois do cadastro, o aluno ficará
          disponível para receber um treino.
        </p>

        {createStudentMutation.isError && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-[#633a3a] bg-[#251918] px-4 py-3"
          >
            <p className="text-sm text-[#ff8c87]">
              {getCreateStudentErrorMessage()}
            </p>
          </div>
        )}

        <form
          className="mt-8 space-y-5"
          onSubmit={handleSubmit(handleCreateStudent)}
        >
          <div>
            <label
              htmlFor="studentName"
              className="mb-2 block text-xs font-medium text-[#d7dcd9]"
            >
              Nome completo
            </label>
            <input
              id="studentName"
              placeholder="Ex.: Maria Silva"
              autoComplete="off"
              autoFocus
              disabled={createStudentMutation.isPending}
              className="h-[52px] w-full rounded-xl border border-[#343b37] bg-[#1d211f] px-4 text-sm text-[#f5f7f5] outline-none transition placeholder:text-[#7e8782] focus:border-[#70e39b] focus:ring-2 focus:ring-[#70e39b]/15 disabled:cursor-not-allowed disabled:opacity-60"
              {...register("name")}
            />
            {errors.name && (
              <p className="mt-2 text-xs text-[#ff7f79]">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="studentEmail"
              className="mb-2 block text-xs font-medium text-[#d7dcd9]"
            >
              E-mail
            </label>
            <input
              id="studentEmail"
              type="email"
              placeholder="aluno@email.com"
              autoComplete="off"
              disabled={createStudentMutation.isPending}
              className="h-[52px] w-full rounded-xl border border-[#343b37] bg-[#1d211f] px-4 text-sm text-[#f5f7f5] outline-none transition placeholder:text-[#7e8782] focus:border-[#70e39b] focus:ring-2 focus:ring-[#70e39b]/15 disabled:cursor-not-allowed disabled:opacity-60"
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-2 text-xs text-[#ff7f79]">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="studentPassword"
              className="mb-2 block text-xs font-medium text-[#d7dcd9]"
            >
              Senha provisória
            </label>

            <div className="flex h-[52px] items-center rounded-xl border border-[#343b37] bg-[#1d211f] transition focus-within:border-[#70e39b] focus-within:ring-2 focus-within:ring-[#70e39b]/15">
              <LockKeyhole
                aria-hidden="true"
                className="ml-4 h-[18px] w-[18px] shrink-0 text-[#8d9791]"
              />
              <input
                id="studentPassword"
                type={isTemporaryPasswordVisible ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Mínimo de 6 caracteres"
                disabled={createStudentMutation.isPending}
                className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-[#f5f7f5] outline-none placeholder:text-[#7e8782] disabled:cursor-not-allowed"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() =>
                  setIsTemporaryPasswordVisible((current) => !current)
                }
                disabled={createStudentMutation.isPending}
                aria-label={
                  isTemporaryPasswordVisible
                    ? "Ocultar senha provisória"
                    : "Mostrar senha provisória"
                }
                className="mr-2 flex h-10 w-10 items-center justify-center rounded-lg text-[#8d9791] transition hover:bg-[#242925] hover:text-[#f5f7f5] disabled:cursor-not-allowed"
              >
                {isTemporaryPasswordVisible ? (
                  <EyeOff aria-hidden="true" className="h-[18px] w-[18px]" />
                ) : (
                  <Eye aria-hidden="true" className="h-[18px] w-[18px]" />
                )}
              </button>
            </div>

            {errors.password && (
              <p className="mt-2 text-xs text-[#ff7f79]">
                {errors.password.message}
              </p>
            )}

            <p className="mt-2 text-[11px] leading-4 text-[#78827c]">
              O aluno poderá alterar essa senha em uma etapa futura do produto.
            </p>
          </div>

          <div className="flex gap-3 rounded-xl border border-[#2f5b40] bg-[#20382a] px-4 py-4">
            <UserRound
              aria-hidden="true"
              className="mt-0.5 h-5 w-5 shrink-0 text-[#70e39b]"
            />
            <div>
              <p className="text-xs font-semibold text-[#70e39b]">
                Acesso vinculado à sua organização
              </p>
              <p className="mt-1 text-[11px] leading-4 text-[#90a097]">
                O novo perfil será criado como aluno e começará sem treino
                atribuído.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <button
              type="submit"
              disabled={!organizationId || createStudentMutation.isPending}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#70e39b] px-5 text-sm font-semibold text-[#0d1b13] transition hover:bg-[#83e8a8] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus aria-hidden="true" className="h-[18px] w-[18px]" />
              {createStudentMutation.isPending
                ? "Cadastrando..."
                : "Cadastrar aluno"}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={createStudentMutation.isPending}
              className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-[#39413c] bg-[#1d211f] px-5 text-sm font-semibold text-[#f5f7f5] transition hover:border-[#4b5750] hover:bg-[#222724] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
