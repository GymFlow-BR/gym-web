import { useQueries } from "@tanstack/react-query";
import { ArrowRight, MoreHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { isApiError } from "../../../services/apiError";
import { getStudentCurrentWorkout } from "../../student-workout/services/studentWorkoutService";
import type { StudentCurrentWorkout } from "../../student-workout/types/studentWorkout";
import type { Student } from "../types/student";

type StudentsListProps = {
  students: Student[];
  isLoading: boolean;
  hasLoadError: boolean;
  hasSearchTerm: boolean;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function isNotFoundError(error: unknown) {
  return isApiError(error) && error.status === 404;
}

const avatarStyles = [
  "bg-[#302d3b] text-[#caa5ff]",
  "bg-[#253139] text-[#83baff]",
  "bg-[#392f27] text-[#ffae72]",
  "bg-[#1f382b] text-[#70e39b]",
];

export function StudentsList({
  students,
  isLoading,
  hasLoadError,
  hasSearchTerm,
}: StudentsListProps) {
  const navigate = useNavigate();
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null,
  );

  const currentWorkoutQueries = useQueries({
    queries: students.map((student) => ({
      queryKey: ["student-current-workout", student.id],
      queryFn: () => getStudentCurrentWorkout(student.id),
      retry: false,
      staleTime: 60_000,
    })),
  });

  const currentWorkoutByStudentId = useMemo(() => {
    return new Map<number, StudentCurrentWorkout | null>(
      students.map((student, index) => {
        const query = currentWorkoutQueries[index];
        const currentWorkout =
          query?.data ?? (isNotFoundError(query?.error) ? null : null);

        return [student.id, currentWorkout];
      }),
    );
  }, [currentWorkoutQueries, students]);

  useEffect(() => {
    if (students.length === 0) {
      setSelectedStudentId(null);
      return;
    }

    const selectedStudentIsVisible = students.some(
      (student) => student.id === selectedStudentId,
    );

    if (!selectedStudentIsVisible) {
      setSelectedStudentId(students[0].id);
    }
  }, [selectedStudentId, students]);

  const selectedStudent =
    students.find((student) => student.id === selectedStudentId) ?? null;

  const selectedStudentIndex = selectedStudent
    ? students.findIndex((student) => student.id === selectedStudent.id)
    : -1;

  const selectedStudentWorkout = selectedStudent
    ? currentWorkoutByStudentId.get(selectedStudent.id)
    : null;

  const selectedStudentWorkoutQuery =
    selectedStudentIndex >= 0
      ? currentWorkoutQueries[selectedStudentIndex]
      : undefined;

  if (isLoading) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-[#29302c] bg-[#171a18] px-5 py-10 text-center"
      >
        <p className="text-sm text-[#98a39d]">Carregando alunos...</p>
      </div>
    );
  }

  if (hasLoadError) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-[#633a3a] bg-[#201716] px-5 py-8"
      >
        <p className="text-sm font-semibold text-[#ff8c87]">
          Erro ao carregar alunos.
        </p>
        <p className="mt-1 text-sm text-[#c99591]">
          Não foi possível buscar os dados necessários. Tente novamente.
        </p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#303733] bg-[#151816] px-5 py-12 text-center">
        <p className="text-sm font-semibold text-[#f5f7f5]">
          {hasSearchTerm
            ? "Nenhum aluno corresponde à busca"
            : "Nenhum aluno cadastrado"}
        </p>
        <p className="mt-1 text-sm text-[#89948e]">
          {hasSearchTerm
            ? "Tente buscar usando outro nome ou e-mail."
            : "Use o botão “Adicionar aluno” para criar o primeiro acesso."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_290px] xl:items-stretch">
      <section className="overflow-hidden rounded-2xl border border-[#29302c] bg-[#171a18]">
        <div className="hidden grid-cols-[minmax(260px,1.5fr)_minmax(180px,0.9fr)_130px_24px] gap-4 border-b border-[#29302c] px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#758078] md:grid">
          <span>Aluno</span>
          <span>Treino atual</span>
          <span>Status</span>
          <span className="sr-only">Selecionar</span>
        </div>

        <div className="divide-y divide-[#29302c]">
          {students.map((student, index) => {
            const currentWorkoutQuery = currentWorkoutQueries[index];
            const currentWorkout = currentWorkoutByStudentId.get(student.id);
            const isSelected = student.id === selectedStudentId;

            return (
              <button
                key={student.id}
                type="button"
                onClick={() => setSelectedStudentId(student.id)}
                className={[
                  "grid w-full gap-4 px-4 py-4 text-left transition md:grid-cols-[minmax(260px,1.5fr)_minmax(180px,0.9fr)_130px_24px] md:items-center md:px-5",
                  isSelected
                    ? "bg-[#1b211d]"
                    : "hover:bg-[#1a1e1b] focus:bg-[#1a1e1b]",
                ].join(" ")}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span
                    aria-hidden="true"
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-semibold ${avatarStyles[index % avatarStyles.length]}`}
                  >
                    {getInitials(student.name)}
                  </span>

                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-[#f5f7f5]">
                      {student.name}
                    </span>
                    <span className="mt-1 block truncate text-xs text-[#7f8a84]">
                      {student.email}
                    </span>
                  </span>
                </span>

                <span className="flex items-center justify-between gap-3 md:block">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#758078] md:hidden">
                    Treino atual
                  </span>
                  <span className="text-xs text-[#9aa59f]">
                    {currentWorkoutQuery?.isLoading
                      ? "Carregando..."
                      : (currentWorkout?.workoutName ?? "Sem treino")}
                  </span>
                </span>

                <span className="flex items-center justify-between gap-3 md:block">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#758078] md:hidden">
                    Status
                  </span>
                  <span
                    className={[
                      "inline-flex min-h-7 items-center rounded-full px-3 text-[10px] font-semibold uppercase tracking-[0.04em]",
                      student.active
                        ? "bg-[#183725] text-[#70e39b]"
                        : "bg-[#292c2a] text-[#9aa29d]",
                    ].join(" ")}
                  >
                    {student.active ? "Ativo" : "Inativo"}
                  </span>
                </span>

                <ArrowRight
                  aria-hidden="true"
                  className="hidden h-4 w-4 text-[#7e8983] md:block"
                />
              </button>
            );
          })}
        </div>
      </section>

      {selectedStudent && (
        <aside className="flex min-h-full flex-col rounded-2xl border border-[#29302c] bg-[#171a18] p-5">
          <div className="flex items-start justify-between gap-4">
            <span
              aria-hidden="true"
              className="flex h-[60px] w-[60px] items-center justify-center rounded-2xl bg-[#302d3b] text-base font-semibold text-[#caa5ff]"
            >
              {getInitials(selectedStudent.name)}
            </span>

            <button
              type="button"
              aria-label={`Mais opções para ${selectedStudent.name}`}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#303733] text-[#89948e] transition hover:border-[#465049] hover:text-[#f5f7f5]"
            >
              <MoreHorizontal aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold tracking-[-0.025em] text-[#f5f7f5]">
              {selectedStudent.name}
            </h2>
            <p className="mt-2 break-all text-xs text-[#89948e]">
              {selectedStudent.email}
            </p>
          </div>

          <dl className="mt-7 divide-y divide-[#29302c] border-y border-[#29302c]">
            <div className="flex items-center justify-between gap-4 py-4">
              <dt className="text-xs text-[#7f8a84]">Treino atual</dt>
              <dd className="text-right text-xs font-semibold text-[#f5f7f5]">
                {selectedStudentWorkoutQuery?.isLoading
                  ? "Carregando..."
                  : (selectedStudentWorkout?.workoutName ?? "Sem treino")}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-4 py-4">
              <dt className="text-xs text-[#7f8a84]">Status</dt>
              <dd>
                <span
                  className={[
                    "inline-flex min-h-7 items-center rounded-full px-3 text-[10px] font-semibold uppercase tracking-[0.04em]",
                    selectedStudent.active
                      ? "bg-[#183725] text-[#70e39b]"
                      : "bg-[#292c2a] text-[#9aa29d]",
                  ].join(" ")}
                >
                  {selectedStudent.active ? "Ativo" : "Inativo"}
                </span>
              </dd>
            </div>
          </dl>

          <div className="mt-auto space-y-2 pt-6">
            <button
              type="button"
              onClick={() => navigate(`/admin/students/${selectedStudent.id}`)}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#70e39b] px-4 text-sm font-semibold text-[#0d1b13] transition hover:bg-[#83e8a8]"
            >
              Ver perfil
              <ArrowRight aria-hidden="true" className="h-[18px] w-[18px]" />
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(`/admin/students/${selectedStudent.id}`, {
                  state: { startEditing: true },
                })
              }
              className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-[#38403b] bg-[#1a1d1b] px-4 text-sm font-semibold text-[#f5f7f5] transition hover:border-[#4b5750] hover:bg-[#1d211e]"
            >
              Editar
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
