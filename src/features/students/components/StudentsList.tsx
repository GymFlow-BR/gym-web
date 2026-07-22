import { Link } from "react-router";

import { Card } from "../../../components/ui/Card";
import type { Student } from "../types/student";

type StudentsListProps = {
  students: Student[];
  isLoading: boolean;
  hasLoadError: boolean;
};

export function StudentsList({
  students,
  isLoading,
  hasLoadError,
}: StudentsListProps) {
  const hasStudents = students.length > 0;

  return (
    <Card>
      <div className="mb-5 flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
          Alunos cadastrados
        </p>

        <h2 className="text-lg font-semibold text-[#1F1F1F]">
          Lista de alunos
        </h2>

        <p className="text-sm text-[#6F6A62]">
          Visualize os alunos disponíveis para receber um treino.
        </p>
      </div>

      {isLoading && (
        <div
          role="status"
          className="rounded-2xl border border-[#E4DFD6] bg-[#FAF9F6] p-4"
        >
          <p className="text-sm text-[#6F6A62]">Carregando alunos...</p>
        </div>
      )}

      {hasLoadError && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4"
        >
          <p className="text-sm font-semibold text-red-700">
            Erro ao carregar alunos.
          </p>
          <p className="mt-1 text-sm text-red-600">
            Não foi possível buscar os dados necessários. Tente novamente.
          </p>
        </div>
      )}

      {!isLoading && !hasLoadError && !hasStudents && (
        <div className="rounded-2xl border border-dashed border-[#D8D2C8] bg-[#FAF9F6] p-6 text-center">
          <p className="text-sm font-semibold text-[#1F1F1F]">
            Nenhum aluno encontrado
          </p>
          <p className="mt-1 text-sm text-[#6F6A62]">
            Quando houver alunos cadastrados, eles aparecerão nesta lista.
          </p>
        </div>
      )}

      {!isLoading && !hasLoadError && hasStudents && (
        <div className="overflow-hidden rounded-2xl border border-[#E4DFD6]">
          <div className="grid bg-[#FAF9F6] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#8A8378] md:grid-cols-[minmax(0,1fr)_160px_160px] md:items-center">
            <span>Aluno</span>
            <span className="hidden text-center md:block">Status</span>
            <span className="hidden text-right md:block">Detalhes</span>
          </div>

          <div className="divide-y divide-[#E4DFD6]">
            {students.map((student) => (
              <div
                key={student.id}
                className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(0,1fr)_160px_160px] md:items-center"
              >
                <div>
                  <Link
                    to={`/admin/students/${student.id}`}
                    className="font-medium text-[#1F1F1F] transition hover:text-[#2F4F3E] hover:underline"
                  >
                    {student.name}
                  </Link>

                  <p className="mt-1 text-sm text-[#6F6A62]">{student.email}</p>

                  <p className="mt-2 text-xs text-[#8A8378] md:hidden">
                    Acesse os detalhes para visualizar o treino atual.
                  </p>
                </div>

                <div className="md:flex md:justify-center">
                  <span
                    className={
                      student.active
                        ? "inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700"
                        : "inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500"
                    }
                  >
                    {student.active ? "Ativo" : "Inativo"}
                  </span>
                </div>

                <div className="flex md:justify-end">
                  <Link
                    to={`/admin/students/${student.id}`}
                    className="inline-flex h-10 items-center justify-center rounded-2xl bg-[#2F4F3E] px-4 text-sm font-semibold text-white transition hover:bg-[#243D30]"
                  >
                    Ver detalhes
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
