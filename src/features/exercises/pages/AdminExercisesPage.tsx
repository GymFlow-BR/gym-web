import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Ellipsis,
  Image as ImageIcon,
  Pencil,
  Play,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { isApiError } from "../../../services/apiError";
import { CreateExerciseForm } from "../components/CreateExerciseForm";
import { EditExerciseForm } from "../components/EditExerciseForm";
import { deactivateExercise, getExercises } from "../services/exerciseService";
import type { Exercise } from "../types/exercise";

type ExerciseFilter = "ALL" | "ACTIVE" | "INACTIVE";
type MediaPreview = {
  type: "image" | "video";
  url: string;
  title: string;
};

const mediaBackgrounds = [
  "from-[#26332c] to-[#171c19]",
  "from-[#28303a] to-[#181c21]",
  "from-[#3a2d28] to-[#1d1917]",
];

function isExerciseActive(exercise: Exercise) {
  return (
    exercise.active === true ||
    String(exercise.active).toLocaleLowerCase("pt-BR") === "true"
  );
}

export function AdminExercisesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ExerciseFilter>("ALL");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [mediaPreview, setMediaPreview] = useState<MediaPreview | null>(null);

  const {
    data: exercises = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["exercises"],
    queryFn: getExercises,
  });

  const deactivateExerciseMutation = useMutation<void, Error, Exercise>({
    mutationFn: (exercise) => deactivateExercise(exercise.id),
    onSuccess: (_, deactivatedExercise) => {
      setOpenMenuId(null);
      queryClient.setQueryData<Exercise[]>(["exercises"], (current = []) =>
        current.map((exercise) =>
          exercise.id === deactivatedExercise.id
            ? { ...exercise, active: false }
            : exercise,
        ),
      );
      setSuccessMessage("Exercício inativado com sucesso.");
    },
  });

  useEffect(() => {
    if (!successMessage) return;

    const timeout = window.setTimeout(() => setSuccessMessage(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [successMessage]);

  const visibleExercises = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");

    return exercises.filter((exercise) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        exercise.exerciseName
          .toLocaleLowerCase("pt-BR")
          .includes(normalizedSearch) ||
        exercise.muscleGroup
          .toLocaleLowerCase("pt-BR")
          .includes(normalizedSearch) ||
        exercise.equipmentName
          .toLocaleLowerCase("pt-BR")
          .includes(normalizedSearch);

      const matchesFilter =
        filter === "ALL" ||
        (filter === "ACTIVE" && isExerciseActive(exercise)) ||
        (filter === "INACTIVE" && !isExerciseActive(exercise));

      return matchesSearch && matchesFilter;
    });
  }, [exercises, filter, search]);

  const deactivateErrorMessage =
    isApiError(deactivateExerciseMutation.error) &&
    deactivateExerciseMutation.error.status === 403
      ? "Você não possui permissão para inativar exercícios."
      : "Não foi possível inativar o exercício. Tente novamente.";

  function openEditModal(exercise: Exercise) {
    setOpenMenuId(null);
    setSelectedExercise(exercise);
  }

  function openExerciseMedia(
    exercise: Exercise,
    preferredType?: MediaPreview["type"],
  ) {
    if (preferredType === "video" && exercise.videoUrl) {
      setMediaPreview({
        type: "video",
        url: exercise.videoUrl,
        title: exercise.exerciseName,
      });
      return;
    }

    if (exercise.imageUrl) {
      setMediaPreview({
        type: "image",
        url: exercise.imageUrl,
        title: exercise.exerciseName,
      });
      return;
    }

    if (exercise.videoUrl) {
      setMediaPreview({
        type: "video",
        url: exercise.videoUrl,
        title: exercise.exerciseName,
      });
    }
  }

  return (
    <div className="min-h-full bg-[#0d0f0e] text-[#f5f7f5]">
      {successMessage && (
        <div
          role="status"
          className="fixed right-4 top-4 z-[70] flex max-w-sm items-center gap-3 rounded-xl border border-[#315b40] bg-[#17271d] px-4 py-3 text-sm text-[#bdf7cf] shadow-2xl shadow-black/50"
        >
          <CheckCircle2
            size={19}
            className="shrink-0 text-[#70e39b]"
            aria-hidden="true"
          />
          <span className="flex-1 font-medium">{successMessage}</span>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="rounded-md p-1 text-[#8fb59b] transition hover:bg-white/5 hover:text-white"
            aria-label="Fechar mensagem"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}
      <div className="mx-auto w-full max-w-[1440px] space-y-12 px-4 pb-16 pt-2 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8da096]">
              Área do professor
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-[44px]">
              Exercícios
            </h1>
          </div>

          <div className="flex w-full gap-3 lg:w-auto">
            <label className="flex min-h-12 flex-1 items-center gap-3 rounded-xl border border-[#29302c] bg-[#141715] px-4 text-[#849087] transition focus-within:border-[#43644f] lg:w-60">
              <Search size={18} strokeWidth={1.8} aria-hidden="true" />
              <span className="sr-only">Pesquisar exercícios</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Pesquisar"
                className="min-w-0 flex-1 bg-transparent text-sm text-[#f5f7f5] outline-none placeholder:text-[#69736d]"
              />
            </label>

            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#70e39b] px-5 text-sm font-semibold text-[#07110b] transition hover:bg-[#83e9a8] active:scale-[0.98]"
            >
              <Plus size={18} aria-hidden="true" />
              Novo
            </button>
          </div>
        </header>

        <section className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex min-h-12 w-full items-center gap-3 rounded-xl border border-[#29302c] bg-[#141715] px-4 text-[#849087] transition focus-within:border-[#43644f] sm:max-w-sm">
              <Search size={18} strokeWidth={1.8} aria-hidden="true" />
              <span className="sr-only">Buscar exercício</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar exercício"
                className="min-w-0 flex-1 bg-transparent text-sm text-[#f5f7f5] outline-none placeholder:text-[#69736d]"
              />
            </label>

            <div
              className="grid grid-cols-3 rounded-xl border border-[#29302c] bg-[#111311] p-1"
              aria-label="Filtrar exercícios"
            >
              {(
                [
                  ["ALL", "Todos"],
                  ["ACTIVE", "Ativos"],
                  ["INACTIVE", "Inativos"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={[
                    "rounded-lg px-4 py-2 text-xs font-medium transition",
                    filter === value
                      ? "bg-[#252a27] text-[#70e39b]"
                      : "text-[#879189] hover:text-[#d7ddd9]",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {deactivateExerciseMutation.isError && (
            <div
              role="alert"
              className="rounded-xl border border-[#6d3838] bg-[#281818] px-4 py-3 text-sm text-[#ff8a8a]"
            >
              {deactivateErrorMessage}
            </div>
          )}

          {isLoading && (
            <div
              role="status"
              className="rounded-2xl border border-[#29302c] bg-[#171a18] p-8 text-sm text-[#9ca69f]"
            >
              Carregando exercícios cadastrados...
            </div>
          )}

          {isError && (
            <div
              role="alert"
              className="rounded-2xl border border-[#6d3838] bg-[#281818] p-6"
            >
              <p className="font-semibold text-[#ff9b9b]">
                Não foi possível carregar os exercícios.
              </p>
              <p className="mt-2 text-sm text-[#c98e8e]">
                {error instanceof Error
                  ? error.message
                  : "Erro inesperado ao comunicar com a API."}
              </p>
            </div>
          )}

          {!isLoading && !isError && visibleExercises.length === 0 && (
            <div className="rounded-2xl border border-[#29302c] bg-[#171a18] px-6 py-14 text-center">
              <p className="text-lg font-semibold">
                Nenhum exercício encontrado
              </p>
              <p className="mt-2 text-sm text-[#89958d]">
                Ajuste a busca, altere o filtro ou cadastre um novo exercício.
              </p>
            </div>
          )}

          {!isLoading && !isError && visibleExercises.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleExercises.map((exercise, index) => (
                <article
                  key={exercise.id}
                  className={[
                    "group relative overflow-visible rounded-2xl border border-[#29302c] bg-[#171a18] transition duration-200 hover:-translate-y-0.5 hover:border-[#3a4740]",
                    !isExerciseActive(exercise) ? "opacity-55" : "",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "relative h-40 overflow-hidden rounded-t-2xl border-b border-[#29302c] bg-gradient-to-br",
                      mediaBackgrounds[index % mediaBackgrounds.length],
                    ].join(" ")}
                  >
                    <div
                      className="absolute inset-0 opacity-[0.12]"
                      style={{
                        backgroundImage:
                          "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)",
                        backgroundSize: "32px 32px",
                      }}
                    />

                    {exercise.imageUrl && (
                      <img
                        src={exercise.imageUrl}
                        alt={`Imagem do exercício ${exercise.exerciseName}`}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    )}

                    {(exercise.imageUrl || exercise.videoUrl) && (
                      <button
                        type="button"
                        onClick={() => openExerciseMedia(exercise)}
                        className="absolute inset-0 z-[1] cursor-zoom-in outline-none ring-inset transition hover:bg-white/[0.035] focus-visible:ring-2 focus-visible:ring-[#70e39b]"
                        aria-label={`Abrir mídia de ${exercise.exerciseName}`}
                      />
                    )}

                    {exercise.videoUrl ? (
                      <button
                        type="button"
                        onClick={() => openExerciseMedia(exercise, "video")}
                        className="absolute bottom-3 left-3 z-[2] inline-flex items-center gap-1.5 rounded-lg border border-white/5 bg-[#090b0a]/90 px-3 py-2 text-xs font-medium transition hover:border-[#70e39b]/50 hover:bg-[#142019] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#70e39b]"
                        aria-label={`Reproduzir vídeo de ${exercise.exerciseName}`}
                      >
                        <>
                          <Play
                            size={14}
                            fill="currentColor"
                            aria-hidden="true"
                          />
                          Vídeo
                        </>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openExerciseMedia(exercise, "image")}
                        disabled={!exercise.imageUrl}
                        className="absolute bottom-3 left-3 z-[2] inline-flex items-center gap-1.5 rounded-lg border border-white/5 bg-[#090b0a]/90 px-3 py-2 text-xs font-medium transition enabled:hover:border-[#70e39b]/50 enabled:hover:bg-[#142019] disabled:cursor-default"
                      >
                        <>
                          <ImageIcon size={14} aria-hidden="true" />
                          Imagem
                        </>
                      </button>
                    )}

                    {!isExerciseActive(exercise) && (
                      <span className="absolute right-3 top-3 rounded-lg border border-[#303632] bg-[#101210]/90 px-3 py-2 text-xs text-[#a2aaa5]">
                        Inativo
                      </span>
                    )}
                  </div>

                  <div className="relative min-h-28 p-5 pr-16">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#70e39b]">
                      {exercise.muscleGroup}
                    </p>
                    <h2 className="mt-3 font-semibold text-[#f5f7f5]">
                      {exercise.exerciseName}
                    </h2>
                    <p className="mt-2 text-xs text-[#89958d]">
                      {exercise.equipmentName || "Sem equipamento"}
                    </p>

                    <button
                      type="button"
                      aria-label={`Ações de ${exercise.exerciseName}`}
                      aria-expanded={openMenuId === exercise.id}
                      onClick={() =>
                        setOpenMenuId((current) =>
                          current === exercise.id ? null : exercise.id,
                        )
                      }
                      className="absolute bottom-4 right-4 grid h-10 w-10 place-items-center rounded-xl border border-[#303632] text-[#909a93] transition hover:border-[#4a5750] hover:bg-[#202522] hover:text-white"
                    >
                      <Ellipsis size={20} aria-hidden="true" />
                    </button>

                    {openMenuId === exercise.id && (
                      <div className="absolute bottom-14 right-3 z-20 w-48 rounded-xl border border-[#3a423d] bg-[#202421] p-2 shadow-2xl shadow-black/40">
                        <button
                          type="button"
                          onClick={() => openEditModal(exercise)}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-[#2a302c]"
                        >
                          <Pencil size={16} aria-hidden="true" />
                          Editar exercício
                        </button>
                        {isExerciseActive(exercise) && (
                          <button
                            type="button"
                            onClick={() =>
                              deactivateExerciseMutation.mutate(exercise)
                            }
                            disabled={deactivateExerciseMutation.isPending}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-[#ff7878] transition hover:bg-[#3a2020] disabled:opacity-50"
                          >
                            <Trash2 size={16} aria-hidden="true" />
                            {deactivateExerciseMutation.isPending
                              ? "Inativando..."
                              : "Inativar"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {isCreateOpen && (
        <CreateExerciseForm
          onCancel={() => setIsCreateOpen(false)}
          onSuccess={() => {
            setIsCreateOpen(false);
            setSuccessMessage("Exercício criado com sucesso.");
          }}
        />
      )}

      {selectedExercise && (
        <EditExerciseForm
          exercise={selectedExercise}
          onCancel={() => setSelectedExercise(null)}
          onSuccess={() => {
            setSelectedExercise(null);
            setSuccessMessage("Exercício atualizado com sucesso.");
          }}
        />
      )}

      {mediaPreview && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="exercise-media-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setMediaPreview(null);
          }}
        >
          <div className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-[#343b37] bg-[#111412] p-3 shadow-2xl shadow-black/70">
            <div className="mb-3 flex items-center justify-between gap-4 px-2 pt-1">
              <h2
                id="exercise-media-title"
                className="truncate text-sm font-semibold text-[#f5f7f5]"
              >
                {mediaPreview.title}
              </h2>
              <button
                type="button"
                onClick={() => setMediaPreview(null)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#343b37] text-[#9aa49d] transition hover:bg-[#232825] hover:text-white"
                aria-label="Fechar visualização"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            {mediaPreview.type === "image" ? (
              <img
                src={mediaPreview.url}
                alt={`Imagem do exercício ${mediaPreview.title}`}
                className="max-h-[78vh] w-full rounded-xl object-contain"
              />
            ) : (
              <video
                src={mediaPreview.url}
                controls
                autoPlay
                playsInline
                className="max-h-[78vh] w-full rounded-xl bg-black"
              >
                Seu navegador não oferece suporte à reprodução deste vídeo.
              </video>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
