import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, LockKeyhole, Plus, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { isApiError } from "../../../services/apiError";
import { createTeacher } from "../services/teacherService";

const createTeacherSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "O nome do professor é obrigatório.")
    .min(2, "O nome do professor deve ter pelo menos 2 caracteres.")
    .max(120, "O nome do professor deve ter no máximo 120 caracteres."),
  email: z
    .string()
    .trim()
    .min(1, "O e-mail do professor é obrigatório.")
    .email("Informe um e-mail válido.")
    .max(160, "O e-mail deve ter no máximo 160 caracteres."),
  password: z
    .string()
    .min(1, "A senha provisória é obrigatória.")
    .min(6, "A senha deve ter pelo menos 6 caracteres.")
    .max(72, "A senha deve ter no máximo 72 caracteres."),
});

type CreateTeacherFormData = z.infer<typeof createTeacherSchema>;

type CreateTeacherFormProps = {
  organizationId?: number;
  onClose: () => void;
  onSuccess?: (message: string) => void;
};

export function CreateTeacherForm({
  organizationId,
  onClose,
  onSuccess,
}: CreateTeacherFormProps) {
  const queryClient = useQueryClient();
  const [isTemporaryPasswordVisible, setIsTemporaryPasswordVisible] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTeacherFormData>({
    resolver: zodResolver(createTeacherSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const createTeacherMutation = useMutation({
    mutationFn: (data: CreateTeacherFormData) =>
      createTeacher({
        organizationId: Number(organizationId),
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
        role: "TEACHER",
      }),
    onSuccess: async (teacher) => {
      await queryClient.invalidateQueries({ queryKey: ["teachers"] });
      onSuccess?.(`${teacher.name} foi cadastrado com sucesso.`);
      onClose();
    },
  });

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !createTeacherMutation.isPending) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [createTeacherMutation.isPending, onClose]);

  function handleCreateTeacher(data: CreateTeacherFormData) {
    if (!organizationId) {
      return;
    }

    createTeacherMutation.mutate(data);
  }

  function getCreateTeacherErrorMessage() {
    if (!createTeacherMutation.error) {
      return null;
    }

    if (isApiError(createTeacherMutation.error)) {
      const errorMessage = createTeacherMutation.error.message.toLowerCase();

      if (createTeacherMutation.error.status === 401) {
        return "Sua sessão expirou. Faça login novamente para cadastrar professores.";
      }

      if (createTeacherMutation.error.status === 403) {
        return "Você não possui permissão para cadastrar professores.";
      }

      if (
        createTeacherMutation.error.status === 409 ||
        errorMessage.includes("email already in use") ||
        errorMessage.includes("e-mail já") ||
        errorMessage.includes("email já")
      ) {
        return "Já existe um usuário cadastrado com este e-mail.";
      }

      if (createTeacherMutation.error.status === 400) {
        return "Revise os dados preenchidos e tente novamente.";
      }
    }

    return "Não foi possível cadastrar o professor. Tente novamente.";
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-teacher-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#050706]/80 px-4 py-8 backdrop-blur-[5px]"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !createTeacherMutation.isPending
        ) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-[575px] rounded-[22px] border border-[#39413c] bg-[#191c1a] p-6 shadow-2xl shadow-black/40 sm:p-7">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.17em] text-[#909b95]">
              Novo professor
            </p>

            <h2
              id="create-teacher-title"
              className="mt-3 text-[28px] font-semibold leading-none tracking-[-0.035em] text-[#f5f7f5]"
            >
              Adicionar professor
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={createTeacherMutation.isPending}
            aria-label="Fechar cadastro de professor"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#343b37] text-[#8f9993] transition hover:border-[#4a554e] hover:text-[#f5f7f5] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-4 max-w-[470px] text-xs leading-5 text-[#89948e]">
          Crie o acesso provisório para um professor da sua organização. Depois
          do cadastro, ele poderá acessar a área de gestão.
        </p>

        {createTeacherMutation.isError && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-[#633a3a] bg-[#251918] px-4 py-3"
          >
            <p className="text-sm text-[#ff8c87]">
              {getCreateTeacherErrorMessage()}
            </p>
          </div>
        )}

        <form
          className="mt-8 space-y-5"
          onSubmit={handleSubmit(handleCreateTeacher)}
          noValidate
        >
          <div>
            <label
              htmlFor="teacherName"
              className="mb-2 block text-xs font-medium text-[#d7dcd9]"
            >
              Nome completo
            </label>

            <input
              id="teacherName"
              placeholder="Ex.: Marina Costa"
              autoComplete="off"
              autoFocus
              disabled={createTeacherMutation.isPending}
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
              htmlFor="teacherEmail"
              className="mb-2 block text-xs font-medium text-[#d7dcd9]"
            >
              E-mail
            </label>

            <input
              id="teacherEmail"
              type="email"
              placeholder="professor@email.com"
              autoComplete="off"
              disabled={createTeacherMutation.isPending}
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
              htmlFor="teacherPassword"
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
                id="teacherPassword"
                type={isTemporaryPasswordVisible ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Mínimo de 6 caracteres"
                disabled={createTeacherMutation.isPending}
                className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-[#f5f7f5] outline-none placeholder:text-[#7e8782] disabled:cursor-not-allowed"
                {...register("password")}
              />

              <button
                type="button"
                onClick={() =>
                  setIsTemporaryPasswordVisible((current) => !current)
                }
                disabled={createTeacherMutation.isPending}
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
              O professor poderá alterar essa senha em uma etapa futura do
              produto.
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

              <p className="mt-1 text-[12px] leading-4 text-[#90a097]">
                O novo perfil será criado como professor e poderá acessar a área
                administrativa do GymFlow.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <button
              type="submit"
              disabled={!organizationId || createTeacherMutation.isPending}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#70e39b] px-5 text-sm font-semibold text-[#0d1b13] transition hover:bg-[#83e8a8] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus aria-hidden="true" className="h-[18px] w-[18px]" />
              {createTeacherMutation.isPending
                ? "Cadastrando..."
                : "Cadastrar professor"}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={createTeacherMutation.isPending}
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
