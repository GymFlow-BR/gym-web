import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { isApiError } from "../../../services/apiError";
import { updateStudent } from "../services/studentService";
import type { Student } from "../types/student";

const editStudentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "O nome do aluno é obrigatório.")
    .min(2, "O nome do aluno deve ter pelo menos 2 caracteres.")
    .max(120, "O nome do aluno deve ter no máximo 120 caracteres."),
  email: z
    .string()
    .trim()
    .min(1, "O email do aluno é obrigatório.")
    .email("Informe um email válido.")
    .max(160, "O email deve ter no máximo 160 caracteres."),
});

type EditStudentFormData = z.infer<typeof editStudentSchema>;

type EditStudentFormProps = {
  student: Student;
  onCancel: () => void;
  onSuccess: () => void;
};

export function EditStudentForm({
  student,
  onCancel,
  onSuccess,
}: EditStudentFormProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditStudentFormData>({
    resolver: zodResolver(editStudentSchema),
    defaultValues: {
      name: student.name,
      email: student.email,
    },
  });

  useEffect(() => {
    reset({
      name: student.name,
      email: student.email,
    });
  }, [reset, student.email, student.name]);

  const updateStudentMutation = useMutation({
    mutationFn: (data: EditStudentFormData) =>
      updateStudent(student.id, {
        name: data.name.trim(),
        email: data.email.trim(),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["students"] });

      onSuccess();
    },
  });

  function handleEditStudent(data: EditStudentFormData) {
    updateStudentMutation.mutate(data);
  }

  function getUpdateStudentErrorMessage() {
    if (!updateStudentMutation.error) {
      return null;
    }

    if (isApiError(updateStudentMutation.error)) {
      if (updateStudentMutation.error.status === 403) {
        return "Você não possui permissão para editar este aluno.";
      }

      if (updateStudentMutation.error.status === 404) {
        return "Aluno não encontrado.";
      }

      if (updateStudentMutation.error.status === 409) {
        return "Já existe um usuário cadastrado com este email.";
      }

      if (updateStudentMutation.error.status === 400) {
        return "Revise os dados preenchidos e tente novamente.";
      }
    }

    return "Não foi possível editar o aluno. Tente novamente.";
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(handleEditStudent)}>
      {updateStudentMutation.isError && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4"
        >
          <p className="text-sm font-semibold text-red-700">
            Erro ao editar aluno.
          </p>
          <p className="mt-1 text-sm text-red-600">
            {getUpdateStudentErrorMessage()}
          </p>
        </div>
      )}

      <div>
        <label
          htmlFor="editStudentName"
          className="mb-2 block text-sm font-medium text-[#1F1F1F]"
        >
          Nome
        </label>

        <input
          id="editStudentName"
          placeholder="Ex: Maria Silva"
          autoComplete="off"
          className="h-12 w-full rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] px-4 text-sm text-[#1F1F1F] outline-none transition placeholder:text-[#B7B2A8] focus:border-[#2F4F3E] focus:ring-2 focus:ring-[#2F4F3E]/10 disabled:cursor-not-allowed disabled:bg-[#F3F0E8] disabled:text-[#8A8378]"
          disabled={updateStudentMutation.isPending}
          {...register("name")}
        />

        {errors.name && (
          <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="editStudentEmail"
          className="mb-2 block text-sm font-medium text-[#1F1F1F]"
        >
          Email
        </label>

        <input
          id="editStudentEmail"
          type="email"
          placeholder="aluno@email.com"
          autoComplete="off"
          className="h-12 w-full rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] px-4 text-sm text-[#1F1F1F] outline-none transition placeholder:text-[#B7B2A8] focus:border-[#2F4F3E] focus:ring-2 focus:ring-[#2F4F3E]/10 disabled:cursor-not-allowed disabled:bg-[#F3F0E8] disabled:text-[#8A8378]"
          disabled={updateStudentMutation.isPending}
          {...register("email")}
        />

        {errors.email && (
          <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-[#E4DFD6] pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={updateStudentMutation.isPending}
          className="flex h-11 items-center justify-center rounded-2xl border border-[#D8D2C8] bg-[#FFFEFB] px-5 text-sm font-semibold text-[#2F4F3E] transition hover:border-[#2F4F3E] hover:bg-[#F3F0E8] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={updateStudentMutation.isPending}
          className="flex h-11 items-center justify-center rounded-2xl bg-[#2F4F3E] px-5 text-sm font-semibold text-white transition hover:bg-[#243D30] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {updateStudentMutation.isPending
            ? "Salvando..."
            : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}
