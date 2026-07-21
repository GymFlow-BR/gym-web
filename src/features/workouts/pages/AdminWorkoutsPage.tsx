import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { SVGProps } from "react";
import { Link } from "react-router";
import { PageHeader } from "../../../components/layout/PageHeader";

import { isApiError } from "../../../services/apiError";
import { CreateWorkoutForm } from "../components/CreateWorkoutForm";
import { EditWorkoutForm } from "../components/EditWorkoutForm";
import { deactivateWorkout, getWorkouts } from "../services/workoutService";
import type { Workout, WorkoutStatus } from "../types/workout";

function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function PencilIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function ManageIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 6h11M9 12h11M9 18h11" />
      <path d="M4 6h.01M4 12h.01M4 18h.01" />
    </svg>
  );
}

function BanIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m5.5 5.5 13 13" />
    </svg>
  );
}

function WorkoutTileIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 8v8M3.2 10v4M19 8v8M20.8 10v4M8.5 12h7" />
      <rect x="5" y="6.5" width="3" height="11" rx="1" />
      <rect x="16" y="6.5" width="3" height="11" rx="1" />
    </svg>
  );
}

const statusLabels: Record<WorkoutStatus, string> = {
  ACTIVE: "Ativo",
  INACTIVE: "Inativo",
  ARCHIVED: "Arquivado",
};

const statusBadgeClassName: Record<WorkoutStatus, string> = {
  ACTIVE: "bg-[#2F4F3E]/10 text-[#2F4F3E]",
  INACTIVE: "bg-[#EDEAE3] text-[#6F6A62]",
  ARCHIVED: "bg-amber-50 text-amber-700",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function AdminWorkoutsPage() {
  const queryClient = useQueryClient();
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | WorkoutStatus>(
    "ALL",
  );

  const {
    data: workouts,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["workouts"],
    queryFn: getWorkouts,
  });

  const deactivateWorkoutMutation = useMutation<void, Error, number>({
    mutationFn: (workoutId: number) => deactivateWorkout(workoutId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });

  const deactivateErrorMessage =
    isApiError(deactivateWorkoutMutation.error) &&
    deactivateWorkoutMutation.error.status === 403
      ? "Você não possui permissão para inativar treinos."
      : "Não foi possível inativar o treino. Tente novamente.";

  function handleDeactivateWorkout(workoutId: number) {
    deactivateWorkoutMutation.mutate(workoutId);
  }

  function handleEditWorkout(workout: Workout) {
    setIsCreateOpen(false);
    setSelectedWorkout(workout);
  }

  function handleCancelEdit() {
    setSelectedWorkout(null);
  }

  function handleUpdateSuccess() {
    setSelectedWorkout(null);
  }

  function handleToggleCreate() {
    setSelectedWorkout(null);
    setIsCreateOpen((value) => !value);
  }

  const filteredWorkouts = (workouts ?? []).filter((workout) => {
    const matchesSearch = workout.workoutName
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || workout.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Treinos"
        description="Gerencie os treinos modelo da sua organização."
        action={
          <button
            type="button"
            onClick={handleToggleCreate}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#2F4F3E] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#243D30]"
          >
            <PlusIcon className="h-4 w-4" />
            Novo treino
          </button>
        }
      />

      {isCreateOpen && (
        <div className="mt-6">
          <CreateWorkoutForm onCancel={() => setIsCreateOpen(false)} />
        </div>
      )}

      {selectedWorkout && (
        <div className="mt-6">
          <EditWorkoutForm
            workout={selectedWorkout}
            onCancel={handleCancelEdit}
            onSuccess={handleUpdateSuccess}
          />
        </div>
      )}

      {deactivateWorkoutMutation.isError && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4"
        >
          <p className="text-sm font-semibold text-red-700">
            Erro ao inativar treino.
          </p>
          <p className="mt-1 text-sm text-red-600">{deactivateErrorMessage}</p>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-[#E4DFD6] bg-[#FFFEFB] shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#E4DFD6] p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Filtrar por nome do treino"
              aria-label="Buscar treino"
              className="w-full rounded-xl border border-[#D8D3CA] bg-[#FFFEFB] py-2.5 pl-9 pr-3 text-sm text-[#1F1F1F] outline-none transition placeholder:text-[#B7B2A8] focus:border-[#2F4F3E] focus:ring-4 focus:ring-[#2F4F3E]/10"
            />
          </div>

          <div className="relative">
            <select
              aria-label="Filtrar por status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as "ALL" | WorkoutStatus)
              }
              className="w-full appearance-none rounded-xl border border-[#D8D3CA] bg-[#FFFEFB] py-2.5 pl-3 pr-9 text-sm text-[#1F1F1F] outline-none transition focus:border-[#2F4F3E] focus:ring-4 focus:ring-[#2F4F3E]/10 sm:w-44"
            >
              <option value="ALL">Todos os status</option>
              <option value="ACTIVE">Ativo</option>
              <option value="INACTIVE">Inativo</option>
              <option value="ARCHIVED">Arquivado</option>
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {searchTerm.trim() && !isLoading && !isError && (
          <div className="border-b border-[#EDEAE3] px-5 py-3">
            <p className="text-sm text-[#6F6A62]">
              Filtrando por:{" "}
              <span className="font-semibold text-[#1F1F1F]">
                {searchTerm.trim()}
              </span>
            </p>
          </div>
        )}

        {isLoading && (
          <p role="status" className="p-6 text-sm text-gray-500">
            Carregando treinos cadastrados...
          </p>
        )}

        {isError && (
          <div
            role="alert"
            className="m-4 rounded-xl border border-red-200 bg-red-50 p-4"
          >
            <p className="text-sm font-semibold text-red-700">
              Não foi possível carregar os treinos.
            </p>
            <p className="mt-1 text-sm text-red-600">
              Verifique se a API está rodando e se o usuário possui permissão
              para acessar este recurso.
            </p>
            <p className="mt-2 text-xs text-red-500">
              {error instanceof Error
                ? error.message
                : "Erro inesperado ao comunicar com a API."}
            </p>
          </div>
        )}

        {!isLoading && !isError && workouts && workouts.length === 0 && (
          <p className="p-6 text-sm text-gray-500">
            Nenhum treino cadastrado. Clique em "Novo treino" para começar.
          </p>
        )}

        {!isLoading &&
          !isError &&
          workouts &&
          workouts.length > 0 &&
          filteredWorkouts.length === 0 && (
            <p className="p-6 text-sm text-gray-500">
              Nenhum treino encontrado para os filtros selecionados.
            </p>
          )}

        {!isLoading && !isError && filteredWorkouts.length > 0 && (
          <>
            <div className="hidden grid-cols-[1fr_140px_110px_140px] gap-4 border-b border-[#EDEAE3] px-5 py-3 text-xs font-medium text-[#8A8378] md:grid">
              <span>Treino</span>
              <span>Criado em</span>
              <span>Status</span>
              <span className="text-right">Ações</span>
            </div>

            <div className="divide-y divide-[#EDEAE3]">
              {filteredWorkouts.map((workout) => (
                <div
                  key={workout.workoutId}
                  className="grid grid-cols-1 gap-3 px-5 py-4 transition hover:bg-[#FAF9F6] md:grid-cols-[1fr_140px_110px_140px] md:items-center"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#22C55E] to-[#0F3D31] text-white">
                      <WorkoutTileIcon className="h-6 w-6" />
                    </span>

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#1F1F1F]">
                        {workout.workoutName}
                      </p>
                      <p className="truncate text-sm text-[#6F6A62]">
                        Treino modelo
                      </p>
                    </div>
                  </div>

                  <div className="text-sm text-[#1F1F1F]">
                    <span className="text-xs text-[#8A8378] md:hidden">
                      Criado em:{" "}
                    </span>
                    {formatDate(workout.createdAt)}
                  </div>

                  <div>
                    <span
                      className={[
                        "inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold",
                        statusBadgeClassName[workout.status],
                      ].join(" ")}
                    >
                      {statusLabels[workout.status]}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 md:justify-end">
                    <Link
                      to={`/admin/workouts/${workout.workoutId}`}
                      aria-label="Gerenciar treino"
                      title="Gerenciar treino"
                      className="rounded-lg p-2 text-[#8A8378] transition hover:bg-[#EDEAE3] hover:text-[#1F1F1F]"
                    >
                      <ManageIcon className="h-4 w-4" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleEditWorkout(workout)}
                      aria-label="Editar treino"
                      title="Editar treino"
                      className="rounded-lg p-2 text-[#8A8378] transition hover:bg-[#EDEAE3] hover:text-[#1F1F1F]"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeactivateWorkout(workout.workoutId)}
                      disabled={deactivateWorkoutMutation.isPending}
                      aria-label="Inativar treino"
                      title="Inativar treino"
                      className="rounded-lg p-2 text-[#8A8378] transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <BanIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[#E4DFD6] px-5 py-3">
              <p className="text-sm text-[#6F6A62]">
                Mostrando {filteredWorkouts.length} de {workouts?.length ?? 0}{" "}
                treinos
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
