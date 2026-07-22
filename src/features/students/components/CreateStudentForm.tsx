import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Card } from "../../../components/ui/Card";
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
    .min(1, "O email do aluno é obrigatório.")
    .email("Informe um email válido.")
    .max(160, "O email deve ter no máximo 160 caracteres."),
  password: z
    .string()
    .min(1, "A senha inicial é obrigatória.")
    .min(6, "A senha deve ter pelo menos 6 caracteres.")
    .max(72, "A senha deve ter no máximo 72 caracteres."),
});

type CreateStudentFormData = z.infer<typeof createStudentSchema>;

type CreateStudentFormProps = {
  organizationId?: number;
};

export function CreateStudentForm({ organizationId }: CreateStudentFormProps) {
  const queryClient = useQueryClient();
  const [isTemporaryPasswordVisible, setIsTemporaryPasswordVisible] =
    useState(false);

  const {
    register,
    handleSubmit,
    reset,
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
        organizationId: Number(organizationId),
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
        role: "STUDENT",
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["students"] });

      reset({
        name: "",
        email: "",
        password: "",
      });

      setIsTemporaryPasswordVisible(false);
    },
  });

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
      if (createStudentMutation.error.status === 403) {
        return "Você não possui permissão para cadastrar alunos.";
      }

      if (createStudentMutation.error.status === 409) {
        return "Já existe um usuário cadastrado com este email.";
      }

      if (createStudentMutation.error.status === 400) {
        return "Revise os dados preenchidos e tente novamente.";
      }
    }

    return "Não foi possível cadastrar o aluno. Tente novamente.";
  }

  return (
    <Card>
      <div className="mb-5 flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
          Novo aluno
        </p>

        <h2 className="text-lg font-semibold text-[#1F1F1F]">
          Cadastrar aluno
        </h2>

        <p className="max-w-2xl text-sm text-[#6F6A62]">
          Crie um acesso provisório para o aluno. Depois do cadastro, ele
          aparecerá na lista e poderá receber um treino modelo.
        </p>
      </div>

      {createStudentMutation.isSuccess && (
        <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-semibold text-green-700">
            Aluno cadastrado com sucesso.
          </p>
          <p className="mt-1 text-sm text-green-600">
            O aluno já aparece na lista e pode receber um treino.
          </p>
        </div>
      )}

      {createStudentMutation.isError && (
        <div
          role="alert"
          className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4"
        >
          <p className="text-sm font-semibold text-red-700">
            Erro ao cadastrar aluno.
          </p>
          <p className="mt-1 text-sm text-red-600">
            {getCreateStudentErrorMessage()}
          </p>
        </div>
      )}

      <form
        className="grid gap-4 lg:grid-cols-2"
        onSubmit={handleSubmit(handleCreateStudent)}
      >
        <div>
          <label
            htmlFor="studentName"
            className="mb-2 block text-sm font-medium text-[#1F1F1F]"
          >
            Nome
          </label>

          <input
            id="studentName"
            placeholder="Ex: Maria Silva"
            autoComplete="off"
            className="h-12 w-full rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] px-4 text-sm text-[#1F1F1F] outline-none transition placeholder:text-[#B7B2A8] focus:border-[#2F4F3E] focus:ring-2 focus:ring-[#2F4F3E]/10 disabled:cursor-not-allowed disabled:bg-[#F3F0E8] disabled:text-[#8A8378]"
            disabled={createStudentMutation.isPending}
            {...register("name")}
          />

          {errors.name && (
            <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="studentEmail"
            className="mb-2 block text-sm font-medium text-[#1F1F1F]"
          >
            Email
          </label>

          <input
            id="studentEmail"
            type="email"
            placeholder="aluno@email.com"
            autoComplete="off"
            className="h-12 w-full rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] px-4 text-sm text-[#1F1F1F] outline-none transition placeholder:text-[#B7B2A8] focus:border-[#2F4F3E] focus:ring-2 focus:ring-[#2F4F3E]/10 disabled:cursor-not-allowed disabled:bg-[#F3F0E8] disabled:text-[#8A8378]"
            disabled={createStudentMutation.isPending}
            {...register("email")}
          />

          {errors.email && (
            <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="lg:col-span-2">
          <label
            htmlFor="studentPassword"
            className="mb-2 block text-sm font-medium text-[#1F1F1F]"
          >
            Senha provisória
          </label>

          <div className="flex h-12 overflow-hidden rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] transition focus-within:border-[#2F4F3E] focus-within:ring-2 focus-within:ring-[#2F4F3E]/10">
            <input
              id="studentPassword"
              type={isTemporaryPasswordVisible ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Mín. 6 caracteres"
              className="h-full min-w-0 flex-1 bg-transparent px-4 text-sm text-[#1F1F1F] outline-none placeholder:text-[#B7B2A8] disabled:cursor-not-allowed disabled:bg-[#F3F0E8] disabled:text-[#8A8378]"
              disabled={createStudentMutation.isPending}
              {...register("password")}
            />

            <button
              type="button"
              onClick={() =>
                setIsTemporaryPasswordVisible((current) => !current)
              }
              disabled={createStudentMutation.isPending}
              className="h-full border-l border-[#E4DFD6] px-4 text-sm font-semibold text-[#2F4F3E] transition hover:bg-[#F3F0E8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isTemporaryPasswordVisible ? "Ocultar" : "Mostrar"}
            </button>
          </div>

          {errors.password && (
            <p className="mt-2 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}

          <p className="mt-2 text-xs text-[#8A8378]">
            Use uma senha provisória simples de comunicar ao aluno. Ele poderá
            alterá-la em uma etapa futura do produto.
          </p>
        </div>

        <div className="flex flex-col gap-3 border-t border-[#E4DFD6] pt-5 sm:flex-row sm:items-center sm:justify-between lg:col-span-2">
          <p className="text-sm text-[#6F6A62]">
            O acesso será criado para um <strong>aluno</strong> da sua
            organização.
          </p>

          <button
            type="submit"
            disabled={!organizationId || createStudentMutation.isPending}
            className="flex h-12 w-full items-center justify-center rounded-2xl bg-[#2F4F3E] px-5 text-sm font-semibold text-white transition hover:bg-[#243D30] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {createStudentMutation.isPending
              ? "Cadastrando..."
              : "Cadastrar aluno"}
          </button>
        </div>
      </form>
    </Card>
  );
}
