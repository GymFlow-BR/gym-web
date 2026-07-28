import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Mail,
  MoreHorizontal,
  Pencil,
  Power,
  RotateCcw,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";

import { isApiError } from "../../../services/apiError";
import { updateTeacher } from "../services/teacherService";
import type { Teacher } from "../types/teacher";
import { EditTeacherForm } from "./EditTeacherForm";

type TeachersListProps = {
  teachers: Teacher[];
  isLoading: boolean;
  hasLoadError: boolean;
  hasSearchTerm: boolean;
  onSuccessMessage: (message: string) => void;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const avatarStyles = [
  "bg-[#302d3b] text-[#caa5ff]",
  "bg-[#253139] text-[#83baff]",
  "bg-[#392f27] text-[#ffae72]",
  "bg-[#1f382b] text-[#70e39b]",
];

function formatRole() {
  return "Professor";
}

function getToggleStatusErrorMessage(error: unknown) {
  if (isApiError(error)) {
    if (error.status === 403) {
      return "Você não possui permissão para alterar o status do professor.";
    }

    if (error.status === 404) {
      return "Professor não encontrado.";
    }

    if (error.status === 400) {
      return "Não foi possível alterar o status. Revise os dados.";
    }
  }

  return "Não foi possível alterar o status do professor.";
}

export function TeachersList({
  teachers,
  isLoading,
  hasLoadError,
  hasSearchTerm,
  onSuccessMessage,
}: TeachersListProps) {
  const queryClient = useQueryClient();
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(
    null,
  );
  const [isEditingTeacher, setIsEditingTeacher] = useState(false);

  useEffect(() => {
    if (teachers.length === 0) {
      setSelectedTeacherId(null);
      setIsEditingTeacher(false);
      return;
    }

    const selectedTeacherIsVisible = teachers.some(
      (teacher) => teacher.id === selectedTeacherId,
    );

    if (!selectedTeacherIsVisible) {
      setSelectedTeacherId(teachers[0].id);
      setIsEditingTeacher(false);
    }
  }, [selectedTeacherId, teachers]);

  const selectedTeacher =
    teachers.find((teacher) => teacher.id === selectedTeacherId) ?? null;

  const selectedTeacherIndex = selectedTeacher
    ? teachers.findIndex((teacher) => teacher.id === selectedTeacher.id)
    : -1;

  const toggleStatusMutation = useMutation({
    mutationFn: (teacher: Teacher) =>
      updateTeacher(teacher.id, {
        active: !teacher.active,
      }),
    onSuccess: async (updatedTeacher) => {
      await queryClient.invalidateQueries({ queryKey: ["teachers"] });

      onSuccessMessage(
        updatedTeacher.active
          ? `${updatedTeacher.name} foi reativado com sucesso.`
          : `${updatedTeacher.name} foi inativado com sucesso.`,
      );
    },
  });

  function handleSelectTeacher(teacherId: number) {
    setSelectedTeacherId(teacherId);
    setIsEditingTeacher(false);
  }

  function handleToggleTeacherStatus() {
    if (!selectedTeacher) {
      return;
    }

    toggleStatusMutation.mutate(selectedTeacher);
  }

  if (isLoading) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-[#29302c] bg-[#171a18] px-5 py-10 text-center"
      >
        <p className="text-sm text-[#98a39d]">Carregando professores...</p>
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
          Erro ao carregar professores.
        </p>

        <p className="mt-1 text-sm text-[#c99591]">
          Não foi possível buscar os dados necessários. Tente novamente.
        </p>
      </div>
    );
  }

  if (teachers.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#303733] bg-[#151816] px-5 py-12 text-center">
        <p className="text-sm font-semibold text-[#f5f7f5]">
          {hasSearchTerm
            ? "Nenhum professor corresponde à busca"
            : "Nenhum professor cadastrado"}
        </p>

        <p className="mt-1 text-sm text-[#89948e]">
          {hasSearchTerm
            ? "Tente buscar usando outro nome ou e-mail."
            : "Use o botão “Adicionar professor” para criar o primeiro acesso."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <section className="self-start overflow-hidden rounded-2xl border border-[#29302c] bg-[#171a18]">
          <div className="hidden grid-cols-[minmax(260px,1.4fr)_minmax(220px,1fr)_130px_24px] gap-4 border-b border-[#29302c] px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#758078] md:grid">
            <span>Professor</span>
            <span>E-mail</span>
            <span>Status</span>
            <span className="sr-only">Selecionar</span>
          </div>

          <div className="divide-y divide-[#29302c]">
            {teachers.map((teacher, index) => {
              const isSelected = teacher.id === selectedTeacherId;

              return (
                <button
                  key={teacher.id}
                  type="button"
                  onClick={() => handleSelectTeacher(teacher.id)}
                  className={[
                    "grid w-full gap-4 px-4 py-4 text-left transition md:grid-cols-[minmax(260px,1.4fr)_minmax(220px,1fr)_130px_24px] md:items-center md:px-5",
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
                      {getInitials(teacher.name)}
                    </span>

                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-[#f5f7f5]">
                        {teacher.name}
                      </span>

                      <span className="mt-1 flex items-center gap-1.5 text-xs text-[#7f8a84] md:hidden">
                        <Mail aria-hidden="true" className="h-3.5 w-3.5" />
                        <span className="truncate">{teacher.email}</span>
                      </span>
                    </span>
                  </span>

                  <span className="hidden truncate text-xs text-[#9aa59f] md:block">
                    {teacher.email}
                  </span>

                  <span className="flex items-center justify-between gap-3 md:block">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#758078] md:hidden">
                      Status
                    </span>

                    <span
                      className={[
                        "inline-flex min-h-7 items-center rounded-full px-3 text-[10px] font-semibold uppercase tracking-[0.04em]",
                        teacher.active
                          ? "bg-[#183725] text-[#70e39b]"
                          : "bg-[#292c2a] text-[#9aa29d]",
                      ].join(" ")}
                    >
                      {teacher.active ? "Ativo" : "Inativo"}
                    </span>
                  </span>

                  <ArrowRight
                    aria-hidden="true"
                    className="hidden h-4 w-4 text-[#7e8983] md:block"
                  />

                  <div className="flex items-center gap-2 rounded-xl border border-[#29302c] bg-[#151816] px-3 py-3 text-xs text-[#89948e] md:hidden">
                    <UserRound aria-hidden="true" className="h-4 w-4" />
                    <span>Professor da organização</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {selectedTeacher && (
          <aside className="self-start rounded-2xl border border-[#29302c] bg-[#171a18] p-5">
            <div className="flex items-start justify-between gap-4">
              <span
                aria-hidden="true"
                className={`flex h-[60px] w-[60px] items-center justify-center rounded-2xl text-base font-semibold ${
                  avatarStyles[
                    selectedTeacherIndex >= 0
                      ? selectedTeacherIndex % avatarStyles.length
                      : 0
                  ]
                }`}
              >
                {getInitials(selectedTeacher.name)}
              </span>

              <button
                type="button"
                aria-label={`Mais opções para ${selectedTeacher.name}`}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#303733] text-[#89948e] transition hover:border-[#465049] hover:text-[#f5f7f5]"
              >
                <MoreHorizontal aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-semibold tracking-[-0.025em] text-[#f5f7f5]">
                {selectedTeacher.name}
              </h2>

              <p className="mt-2 break-all text-xs text-[#89948e]">
                {selectedTeacher.email}
              </p>
            </div>

            <dl className="mt-7 divide-y divide-[#29302c] border-y border-[#29302c]">
              <div className="flex items-center justify-between gap-4 py-4">
                <dt className="text-xs text-[#7f8a84]">Perfil</dt>
                <dd className="text-right text-xs font-semibold text-[#f5f7f5]">
                  {formatRole()}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-4 py-4">
                <dt className="text-xs text-[#7f8a84]">Organização</dt>
                <dd className="text-right text-xs font-semibold text-[#f5f7f5]">
                  {selectedTeacher.organizationName}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-4 py-4">
                <dt className="text-xs text-[#7f8a84]">Status</dt>

                <dd>
                  <span
                    className={[
                      "inline-flex min-h-7 items-center rounded-full px-3 text-[10px] font-semibold uppercase tracking-[0.04em]",
                      selectedTeacher.active
                        ? "bg-[#183725] text-[#70e39b]"
                        : "bg-[#292c2a] text-[#9aa29d]",
                    ].join(" ")}
                  >
                    {selectedTeacher.active ? "Ativo" : "Inativo"}
                  </span>
                </dd>
              </div>
            </dl>

            {toggleStatusMutation.isError && (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-[#633a3a] bg-[#251918] px-4 py-3"
              >
                <p className="text-xs leading-5 text-[#ff8c87]">
                  {getToggleStatusErrorMessage(toggleStatusMutation.error)}
                </p>
              </div>
            )}

            <div className="mt-6 space-y-2">
              <button
                type="button"
                onClick={() => {
                  onSuccessMessage("");
                  setIsEditingTeacher(true);
                }}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#70e39b] px-4 text-sm font-semibold text-[#0d1b13] transition hover:bg-[#83e8a8]"
              >
                <Pencil aria-hidden="true" className="h-[17px] w-[17px]" />
                Editar professor
              </button>

              <button
                type="button"
                onClick={handleToggleTeacherStatus}
                disabled={toggleStatusMutation.isPending}
                className={[
                  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
                  selectedTeacher.active
                    ? "border-[#633a3a] bg-[#251918] text-[#ff8c87] hover:bg-[#2c1d1c]"
                    : "border-[#2f5b40] bg-[#20382a] text-[#70e39b] hover:bg-[#244531]",
                ].join(" ")}
              >
                {selectedTeacher.active ? (
                  <Power aria-hidden="true" className="h-[17px] w-[17px]" />
                ) : (
                  <RotateCcw aria-hidden="true" className="h-[17px] w-[17px]" />
                )}

                {toggleStatusMutation.isPending
                  ? "Atualizando..."
                  : selectedTeacher.active
                    ? "Inativar professor"
                    : "Reativar professor"}
              </button>
            </div>
          </aside>
        )}
      </div>

      {selectedTeacher && isEditingTeacher && (
        <EditTeacherForm
          teacher={selectedTeacher}
          onClose={() => setIsEditingTeacher(false)}
          onSuccess={(message) => {
            setIsEditingTeacher(false);
            onSuccessMessage(message);
          }}
        />
      )}
    </>
  );
}
