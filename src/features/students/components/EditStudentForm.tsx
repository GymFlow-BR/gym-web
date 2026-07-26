import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { isApiError } from "../../../services/apiError";
import { updateStudent } from "../services/studentService";
import type { Student } from "../types/student";

const editStudentSchema = z.object({
  name: z.string().trim().min(2, "Informe pelo menos 2 caracteres.").max(120),
  email: z.string().trim().email("Informe um e-mail válido.").max(160),
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
    defaultValues: { name: student.name, email: student.email },
  });

  useEffect(() => {
    reset({ name: student.name, email: student.email });
  }, [reset, student.email, student.name]);

  const mutation = useMutation({
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

  function getErrorMessage() {
    if (isApiError(mutation.error)) {
      if (mutation.error.status === 403) return "Você não possui permissão.";
      if (mutation.error.status === 404) return "Aluno não encontrado.";
      if (mutation.error.status === 409)
        return "Já existe um usuário com este e-mail.";
      if (mutation.error.status === 400) return "Revise os dados preenchidos.";
    }
    return "Não foi possível editar o aluno.";
  }

  const inputClass =
    "h-12 w-full rounded-xl border border-[#343b37] bg-[#1d211f] px-4 text-sm text-[#f5f7f5] outline-none transition focus:border-[#70e39b] focus:ring-2 focus:ring-[#70e39b]/15 disabled:opacity-60";

  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit((data) => mutation.mutate(data))}
    >
      {mutation.isError && (
        <p
          role="alert"
          className="rounded-xl border border-[#633a3a] bg-[#251918] px-4 py-3 text-xs text-[#ff8c87]"
        >
          {getErrorMessage()}
        </p>
      )}

      <div>
        <label
          htmlFor="editStudentName"
          className="mb-2 block text-xs font-medium text-[#d7dcd9]"
        >
          Nome
        </label>
        <input
          id="editStudentName"
          className={inputClass}
          disabled={mutation.isPending}
          {...register("name")}
        />
        {errors.name && (
          <p className="mt-2 text-xs text-[#ff7f79]">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="editStudentEmail"
          className="mb-2 block text-xs font-medium text-[#d7dcd9]"
        >
          E-mail
        </label>
        <input
          id="editStudentEmail"
          type="email"
          className={inputClass}
          disabled={mutation.isPending}
          {...register("email")}
        />
        {errors.email && (
          <p className="mt-2 text-xs text-[#ff7f79]">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={mutation.isPending}
          className="h-11 rounded-xl border border-[#39413c] px-4 text-sm font-semibold text-[#f5f7f5] hover:bg-[#1d211e] disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="h-11 rounded-xl bg-[#70e39b] px-5 text-sm font-semibold text-[#0d1b13] hover:bg-[#83e8a8] disabled:opacity-50"
        >
          {mutation.isPending ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}
