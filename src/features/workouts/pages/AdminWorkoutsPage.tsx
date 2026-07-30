import { useMemo, useState } from "react";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";

import {
  deactivateWorkout,
  getWorkoutExercises,
  getWorkouts,
} from "../services/workoutService";
import type { Workout } from "../types/workout";
import { CreateWorkoutForm } from "../components/CreateWorkoutForm";
import { EditWorkoutForm } from "../components/EditWorkoutForm";

type WorkoutFilter = "ALL" | "ACTIVE" | "INACTIVE";

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function WorkoutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M6 9v6M3.5 10.5v3M9 7.5v9M15 7.5v9M18 9v6M20.5 10.5v3M9 12h6" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="m4 20 4.2-1 10.6-10.6a2.1 2.1 0 0 0-3-3L5.2 16 4 20Z" />
    </svg>
  );
}

function BanIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M9 5v14M15 5v14" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </svg>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function statusLabel(status: Workout["status"]) {
  if (status === "ACTIVE") return "Ativo";
  if (status === "ARCHIVED") return "Arquivado";
  return "Inativo";
}

export function AdminWorkoutsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<WorkoutFilter>("ALL");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const workoutsQuery = useQuery({
    queryKey: ["workouts"],
    queryFn: getWorkouts,
  });

  const workouts = workoutsQuery.data ?? [];

  const exerciseQueries = useQueries({
    queries: workouts.map((workout) => ({
      queryKey: ["workout-exercises", workout.workoutId],
      queryFn: () => getWorkoutExercises(workout.workoutId),
      staleTime: 60_000,
    })),
  });

  const exerciseCountByWorkoutId = useMemo(() => {
    return new Map(
      workouts.map((workout, index) => [
        workout.workoutId,
        exerciseQueries[index]?.data?.length,
      ]),
    );
  }, [exerciseQueries, workouts]);

  const filteredWorkouts = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");

    return workouts.filter((workout) => {
      const matchesSearch =
        !normalizedSearch ||
        workout.workoutName
          .toLocaleLowerCase("pt-BR")
          .includes(normalizedSearch);

      const matchesFilter =
        filter === "ALL" ||
        (filter === "ACTIVE"
          ? workout.status === "ACTIVE"
          : workout.status !== "ACTIVE");

      return matchesSearch && matchesFilter;
    });
  }, [filter, search, workouts]);

  const deactivateMutation = useMutation({
    mutationFn: deactivateWorkout,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["workouts"] });
      setFeedback("Treino inativado com sucesso.");
      window.setTimeout(() => setFeedback(null), 3500);
    },
  });

  function handleDeactivate(workout: Workout) {
    setOpenMenuId(null);

    const confirmed = window.confirm(
      `Deseja inativar o treino "${workout.workoutName}"?`,
    );

    if (confirmed) {
      deactivateMutation.mutate(workout.workoutId);
    }
  }

  return (
    <main className="min-h-full bg-[#0B0F0D] text-white">
      <div className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
        <header className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#91A097]">
              Área do professor
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Treinos
            </h1>
          </div>

          <label className="flex h-12 w-full items-center gap-3 rounded-xl border border-[#2A302C] bg-[#121614] px-4 text-[#7F8B84] transition focus-within:border-[#70E39B]/50 sm:w-60">
            <SearchIcon />
            <span className="sr-only">Pesquisar treino</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Pesquisar"
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#68736C]"
            />
          </label>
        </header>

        {feedback && (
          <div
            role="status"
            className="mt-7 rounded-xl border border-[#2D6945] bg-[#173323] px-4 py-3 text-sm text-[#70E39B]"
          >
            {feedback}
          </div>
        )}

        {deactivateMutation.isError && (
          <div
            role="alert"
            className="mt-7 rounded-xl border border-[#6A3434] bg-[#2B1919] px-4 py-3 text-sm text-[#FF8A8A]"
          >
            Não foi possível inativar o treino. Tente novamente.
          </div>
        )}

        <section className="mt-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#91A097]">
                Treinos reutilizáveis
              </p>
              <p className="mt-2 text-sm text-[#91A097]">
                Crie uma vez e atribua para diferentes alunos.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex rounded-xl border border-[#2A302C] bg-[#101412] p-1">
                {[
                  ["ALL", "Todos"],
                  ["ACTIVE", "Ativos"],
                  ["INACTIVE", "Inativos"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilter(value as WorkoutFilter)}
                    className={`rounded-lg px-4 py-2 text-xs transition ${
                      filter === value
                        ? "bg-[#252C28] text-[#70E39B]"
                        : "text-[#91A097] hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#70E39B] px-5 text-sm font-semibold text-[#07100A] transition hover:-translate-y-0.5 hover:bg-[#85EBAB]"
              >
                <PlusIcon />
                Criar treino
              </button>
            </div>
          </div>

          {workoutsQuery.isLoading && (
            <div className="mt-6 rounded-2xl border border-[#2A302C] bg-[#171A18] px-6 py-12 text-center text-sm text-[#91A097]">
              Carregando treinos...
            </div>
          )}

          {workoutsQuery.isError && (
            <div className="mt-6 rounded-2xl border border-[#6A3434] bg-[#2B1919] px-6 py-12 text-center text-sm text-[#FF8A8A]">
              Não foi possível carregar os treinos.
            </div>
          )}

          {!workoutsQuery.isLoading && !workoutsQuery.isError && (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredWorkouts.map((workout, index) => {
                const exerciseCount = exerciseCountByWorkoutId.get(
                  workout.workoutId,
                );
                const isActive = workout.status === "ACTIVE";

                return (
                  <article
                    key={workout.workoutId}
                    className="group relative h-[260px] rounded-2xl border border-[#2A302C] bg-[#171A18] p-5 transition duration-200 hover:-translate-y-1 hover:border-[#3C5546] hover:bg-[#1A1F1C]"
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className={`grid h-11 w-11 place-items-center rounded-xl ${
                          index % 3 === 1
                            ? "bg-[#222E39] text-[#75B5FF]"
                            : index % 3 === 2
                              ? "bg-[#2E2937] text-[#C895FF]"
                              : "bg-[#1D3B2A] text-[#70E39B]"
                        }`}
                      >
                        <WorkoutIcon />
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                          isActive
                            ? "bg-[#183925] text-[#70E39B]"
                            : "bg-[#292D2A] text-[#9AA49E]"
                        }`}
                      >
                        {statusLabel(workout.status)}
                      </span>
                    </div>

                    <div className="mt-8">
                      <h2 className="text-lg font-semibold tracking-[-0.02em]">
                        {workout.workoutName}
                      </h2>
                      <p className="mt-2 text-sm text-[#91A097]">
                        {exerciseCount === undefined
                          ? "Carregando exercícios..."
                          : `${exerciseCount} ${
                              exerciseCount === 1 ? "exercício" : "exercícios"
                            }`}
                      </p>
                      {workout.teacherName && (
                        <p className="mt-2 text-sm text-[#91A097]">
                          Prof. {workout.teacherName}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-[#68736C]">
                        Criado em {formatDate(workout.createdAt)}
                      </p>
                    </div>

                    <div className="absolute inset-x-5 bottom-5 flex items-center justify-between">
                      <Link
                        to={`/admin/workouts/${workout.workoutId}`}
                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#39413C] px-4 text-xs font-semibold text-white transition hover:border-[#70E39B]/50 hover:bg-[#1D2A22]"
                      >
                        <EyeIcon />
                        Gerenciar treino
                      </Link>

                      <button
                        type="button"
                        aria-label={`Abrir ações de ${workout.workoutName}`}
                        aria-expanded={openMenuId === workout.workoutId}
                        onClick={() =>
                          setOpenMenuId((current) =>
                            current === workout.workoutId
                              ? null
                              : workout.workoutId,
                          )
                        }
                        className="grid h-10 w-10 place-items-center rounded-xl border border-[#303733] text-[#91A097] transition hover:border-[#70E39B]/40 hover:text-white"
                      >
                        <MoreIcon />
                      </button>
                    </div>

                    {openMenuId === workout.workoutId && (
                      <div className="absolute bottom-16 right-5 z-20 w-52 overflow-hidden rounded-xl border border-[#3A423D] bg-[#202522] p-2 shadow-2xl">
                        <Link
                          to={`/admin/workouts/${workout.workoutId}`}
                          onClick={() => setOpenMenuId(null)}
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#DDE3DF] transition hover:bg-[#2A302C]"
                        >
                          <ListIcon />
                          Gerenciar exercícios
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingWorkout(workout);
                            setOpenMenuId(null);
                          }}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-[#DDE3DF] transition hover:bg-[#2A302C]"
                        >
                          <PencilIcon />
                          Editar treino
                        </button>
                        {isActive && (
                          <button
                            type="button"
                            onClick={() => handleDeactivate(workout)}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-[#FF7A7A] transition hover:bg-[#3A2222]"
                          >
                            <BanIcon />
                            Inativar
                          </button>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}

              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="group h-[260px] rounded-2xl border border-dashed border-[#343B37] bg-[#151917] p-5 transition hover:border-[#70E39B]/45 hover:bg-[#18201B]"
              >
                <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-[#202522] text-[#91A097] transition group-hover:bg-[#1D3B2A] group-hover:text-[#70E39B]">
                  <PlusIcon />
                </span>
                <span className="mt-4 block text-sm font-semibold text-white">
                  Novo treino modelo
                </span>
                <span className="mt-2 block text-xs text-[#7F8B84]">
                  Começar do zero
                </span>
              </button>
            </div>
          )}

          {!workoutsQuery.isLoading &&
            !workoutsQuery.isError &&
            filteredWorkouts.length === 0 && (
              <div className="mt-6 rounded-2xl border border-[#2A302C] bg-[#171A18] px-6 py-12 text-center">
                <p className="font-medium">Nenhum treino encontrado.</p>
                <p className="mt-2 text-sm text-[#91A097]">
                  Ajuste a busca ou o filtro para visualizar outros resultados.
                </p>
              </div>
            )}
        </section>
      </div>

      {isCreateOpen && (
        <CreateWorkoutForm
          onCancel={() => setIsCreateOpen(false)}
          onSuccess={(workout) => {
            setIsCreateOpen(false);
            navigate(`/admin/workouts/${workout.workoutId}`);
          }}
        />
      )}

      {editingWorkout && (
        <EditWorkoutForm
          workout={editingWorkout}
          onCancel={() => setEditingWorkout(null)}
          onSuccess={() => {
            setEditingWorkout(null);
            setFeedback("Treino atualizado com sucesso.");
            window.setTimeout(() => setFeedback(null), 3500);
          }}
        />
      )}
    </main>
  );
}
