import { Card } from "../../../components/ui/Card";
import { EditStudentForm } from "./EditStudentForm";
import type { Student } from "../types/student";

type StudentProfileCardProps = {
  student?: Student;
  isLoading: boolean;
  isError: boolean;
  isEditing: boolean;
  successMessage: string | null;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onEditSuccess: () => void;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function StudentProfileCard({
  student,
  isLoading,
  isError,
  isEditing,
  successMessage,
  onStartEditing,
  onCancelEditing,
  onEditSuccess,
}: StudentProfileCardProps) {
  return (
    <Card>
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
            Perfil do aluno
          </p>

          <h2 className="text-lg font-semibold text-[#1F1F1F]">
            Informações principais
          </h2>

          <p className="text-sm text-[#6F6A62]">
            Dados básicos vinculados à organização atual.
          </p>
        </div>

        {student && !isEditing && (
          <button
            type="button"
            onClick={onStartEditing}
            className="inline-flex h-10 items-center justify-center rounded-2xl bg-[#2F4F3E] px-4 text-sm font-semibold text-white transition hover:bg-[#243D30]"
          >
            Editar
          </button>
        )}
      </div>

      {successMessage && !isEditing && (
        <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-semibold text-green-700">
            {successMessage}
          </p>
        </div>
      )}

      {isLoading && (
        <div
          role="status"
          className="rounded-2xl border border-[#E4DFD6] bg-[#FAF9F6] p-4"
        >
          <p className="text-sm text-[#6F6A62]">Carregando dados do aluno...</p>
        </div>
      )}

      {isError && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4"
        >
          <p className="text-sm font-semibold text-red-700">
            Erro ao carregar aluno.
          </p>
          <p className="mt-1 text-sm text-red-600">
            Não foi possível buscar os dados do aluno.
          </p>
        </div>
      )}

      {!isLoading && !isError && !student && (
        <div className="rounded-2xl border border-dashed border-[#D8D2C8] bg-[#FAF9F6] p-6 text-center">
          <p className="text-sm font-semibold text-[#1F1F1F]">
            Aluno não encontrado
          </p>
          <p className="mt-1 text-sm text-[#6F6A62]">
            Verifique se o aluno pertence à sua organização.
          </p>
        </div>
      )}

      {student && isEditing && (
        <EditStudentForm
          student={student}
          onCancel={onCancelEditing}
          onSuccess={onEditSuccess}
        />
      )}

      {student && !isEditing && (
        <div className="space-y-5">
          <div className="rounded-3xl border border-[#E4DFD6] bg-[#FAF9F6] p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#2F4F3E] text-base font-bold text-white">
                {getInitials(student.name)}
              </div>

              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-[#1F1F1F]">
                  {student.name}
                </p>
                <p className="truncate text-sm text-[#6F6A62]">
                  {student.email}
                </p>

                <span
                  className={
                    student.active
                      ? "mt-2 inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700"
                      : "mt-2 inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500"
                  }
                >
                  {student.active ? "Ativo" : "Inativo"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
                Nome completo
              </p>
              <p className="mt-1 text-sm text-[#1F1F1F]">{student.name}</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
                Email
              </p>
              <p className="mt-1 wrap-break-word text-sm text-[#1F1F1F]">
                {student.email}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
                Organização
              </p>
              <p className="mt-1 text-sm text-[#1F1F1F]">
                {student.organizationName}
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
