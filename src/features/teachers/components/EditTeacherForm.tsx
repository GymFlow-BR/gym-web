import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserRound, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { isApiError } from "../../../services/apiError";
import { updateTeacher } from "../services/teacherService";
import type { Teacher } from "../types/teacher";

const editTeacherSchema = z.object({
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
});

type EditTeacherFormData = z.infer<typeof editTeacherSchema>;

type EditTeacherFormProps = {
  teacher: Teacher;
  onClose: () => void;
  onSuccess: (message: string) => void;
};

export function EditTeacherForm({
  teacher,
  onClose,
  onSuccess,
}: EditTeacherFormProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditTeacherFormData>({
    resolver: zodResolver(editTeacherSchema),
    defaultValues: {
      name: teacher.name,
      email: teacher.email,
    },
  });

  useEffect(() => {
    reset({
      name: teacher.name,
      email: teacher.email,
    });
  }, [reset, teacher.email, teacher.name]);

  const mutation = useMutation({
    mutationFn: (data: EditTeacherFormData) =>
      updateTeacher(teacher.id, {
        name: data.name.trim(),
        email: data.email.trim(),
      }),
    onSuccess: async (updatedTeacher) => {
      await queryClient.invalidateQueries({ queryKey: ["teachers"] });
      onSuccess(`${updatedTeacher.name} foi atualizado com sucesso.`);
      onClose();
    },
  });

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !mutation.isPending) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [mutation.isPending, onClose]);

  function getErrorMessage() {
    if (isApiError(mutation.error)) {
      if (mutation.error.status === 403) {
        return "Você não possui permissão para editar professores.";
      }

      if (mutation.error.status === 404) {
        return "Professor não encontrado.";
      }

      if (mutation.error.status === 409) {
        return "Já existe um usuário cadastrado com este e-mail.";
      }

      if (mutation.error.status === 400) {
        return "Revise os dados preenchidos e tente novamente.";
      }
    }

    return "Não foi possível editar o professor.";
  }

  const inputClass =
    "h-[52px] w-full rounded-xl border border-[#343b37] bg-[#1d211f] px-4 text-sm text-[#f5f7f5] outline-none transition placeholder:text-[#7e8782] focus:border-[#70e39b] focus:ring-2 focus:ring-[#70e39b]/15 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-teacher-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#050706]/80 px-4 py-8 backdrop-blur-[5px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !mutation.isPending) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-[575px] rounded-[22px] border border-[#39413c] bg-[#191c1a] p-6 shadow-2xl shadow-black/40 sm:p-7">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.17em] text-[#909b95]">
              Dados do professor
            </p>

            <h2
              id="edit-teacher-title"
              className="mt-3 text-[28px] font-semibold leading-none tracking-[-0.035em] text-[#f5f7f5]"
            >
              Editar professor
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            aria-label="Fechar edição de professor"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#343b37] text-[#8f9993] transition hover:border-[#4a554e] hover:text-[#f5f7f5] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-4 max-w-[470px] text-xs leading-5 text-[#89948e]">
          Atualize os dados básicos do professor. Essas informações serão usadas
          no acesso e na identificação dentro da organização.
        </p>

        {mutation.isError && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-[#633a3a] bg-[#251918] px-4 py-3"
          >
            <p className="text-sm text-[#ff8c87]">{getErrorMessage()}</p>
          </div>
        )}

        <form
          className="mt-8 space-y-5"
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
          noValidate
        >
          <div>
            <label
              htmlFor="editTeacherName"
              className="mb-2 block text-xs font-medium text-[#d7dcd9]"
            >
              Nome completo
            </label>

            <input
              id="editTeacherName"
              placeholder="Ex.: Marina Costa"
              disabled={mutation.isPending}
              className={inputClass}
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
              htmlFor="editTeacherEmail"
              className="mb-2 block text-xs font-medium text-[#d7dcd9]"
            >
              E-mail
            </label>

            <input
              id="editTeacherEmail"
              type="email"
              placeholder="professor@email.com"
              disabled={mutation.isPending}
              className={inputClass}
              {...register("email")}
            />

            {errors.email && (
              <p className="mt-2 text-xs text-[#ff7f79]">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="flex gap-3 rounded-xl border border-[#2f5b40] bg-[#20382a] px-4 py-4">
            <UserRound
              aria-hidden="true"
              className="mt-0.5 h-5 w-5 shrink-0 text-[#70e39b]"
            />

            <div>
              <p className="text-xs font-semibold text-[#70e39b]">
                Perfil vinculado à organização
              </p>

              <p className="mt-1 text-[12px] leading-4 text-[#90a097]">
                A edição altera apenas nome e e-mail. Permissões e vínculo com a
                organização continuam preservados.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#70e39b] px-5 text-sm font-semibold text-[#0d1b13] transition hover:bg-[#83e8a8] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {mutation.isPending ? "Salvando..." : "Salvar alterações"}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
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
