import {
  CheckCircle2,
  ChevronDown,
  Clock3,
  ImageIcon,
  PlayCircle,
} from "lucide-react";

import type {
  StudentCurrentWorkoutExercise,
  StudentCurrentWorkoutExerciseProgress,
} from "../types/studentWorkout";
import { RestTimer } from "./RestTimer";

type ExerciseSequenceTag = "START" | "NEXT" | "COMPLETED" | null;

type StudentWorkoutExerciseCardProps = {
  exercise: StudentCurrentWorkoutExercise;
  exerciseProgress?: StudentCurrentWorkoutExerciseProgress;
  exerciseSequenceTag: ExerciseSequenceTag;
  isExpanded: boolean;
  isUpdating: boolean;
  isCurrentWorkoutProgressError: boolean;
  activeRestWorkoutExerciseId: number | null;
  remainingRestSeconds: number | null;
  isRestTimerPaused: boolean;
  onToggleCompletion: (workoutExerciseId: number, completed: boolean) => void;
  onToggleDetails: (workoutExerciseId: number) => void;
  onStartRestTimer: (
    workoutExerciseId: number,
    restTimeSeconds: number,
  ) => void;
  onPauseRestTimer: () => void;
  onResumeRestTimer: () => void;
  onCancelRestTimer: () => void;
};

function formatRestTime(seconds: number | null) {
  if (seconds === null) {
    return "Não informado";
  }

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (remainingSeconds === 0) {
    return `${minutes}min`;
  }

  return `${minutes}min ${remainingSeconds}s`;
}

function formatRecommendedLoad(value: number | null) {
  if (value === null) {
    return "Não informado";
  }

  return `${value} kg`;
}

function getTagLabel(tag: ExerciseSequenceTag) {
  if (tag === "START") {
    return "Começar";
  }

  if (tag === "NEXT") {
    return "Próximo";
  }

  if (tag === "COMPLETED") {
    return "Concluído";
  }

  return null;
}

function getTagClassName(tag: ExerciseSequenceTag) {
  if (tag === "START") {
    return "bg-[#70e39b] text-[#0d1b13]";
  }

  if (tag === "NEXT") {
    return "bg-[#1d3828] text-[#70e39b]";
  }

  if (tag === "COMPLETED") {
    return "bg-[#16251b] text-[#70e39b]";
  }

  return "";
}

function getExerciseRows(exercise: StudentCurrentWorkoutExercise) {
  const totalSets = Math.max(exercise.sets, 1);

  return Array.from({ length: totalSets }, (_, index) => ({
    setNumber: index + 1,
    reps: exercise.reps,
    load: formatRecommendedLoad(exercise.recommendedLoad),
  }));
}

export function StudentWorkoutExerciseCard({
  exercise,
  exerciseProgress,
  exerciseSequenceTag,
  isExpanded,
  isUpdating,
  isCurrentWorkoutProgressError,
  activeRestWorkoutExerciseId,
  remainingRestSeconds,
  isRestTimerPaused,
  onToggleCompletion,
  onToggleDetails,
  onStartRestTimer,
  onPauseRestTimer,
  onResumeRestTimer,
  onCancelRestTimer,
}: StudentWorkoutExerciseCardProps) {
  const isCompleted = exerciseProgress?.completed ?? false;
  const tagLabel = getTagLabel(exerciseSequenceTag);
  const exerciseRows = getExerciseRows(exercise);

  const isRestActiveForThisExercise =
    activeRestWorkoutExerciseId === exercise.workoutExerciseId &&
    remainingRestSeconds !== null;

  return (
    <article
      className={[
        "overflow-hidden rounded-[24px] border shadow-xl shadow-black/10 transition",
        isCompleted
          ? "border-[#253128] bg-[#101410]"
          : exerciseSequenceTag === "START"
            ? "border-[#2d4736] bg-[#111411] ring-1 ring-[#70e39b]/15"
            : "border-[#253128] bg-[#111411]",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={() => onToggleDetails(exercise.workoutExerciseId)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
        aria-expanded={isExpanded}
      >
        <span className="flex min-w-0 flex-1 items-center gap-3">
          <span
            className={[
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-bold",
              isCompleted
                ? "bg-[#1d3828] text-[#70e39b]"
                : exerciseSequenceTag === "START"
                  ? "bg-[#70e39b] text-[#0d1b13]"
                  : "bg-[#1b211d] text-[#9aa39d]",
            ].join(" ")}
          >
            {isCompleted ? (
              <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
            ) : (
              exercise.exerciseOrder
            )}
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate text-base font-semibold tracking-[-0.025em] text-[#f5f7f5]">
              {exercise.exerciseName}
            </span>

            <span className="mt-1 block truncate text-xs leading-5 text-[#8f9b94]">
              {exercise.muscleGroup || "Grupo muscular não informado"}
              {exercise.equipmentName
                ? ` • ${exercise.equipmentName}`
                : " • Sem equipamento"}
            </span>
          </span>
        </span>

        <span className="flex shrink-0 items-center gap-2">
          {tagLabel && (
            <span
              className={[
                "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em]",
                getTagClassName(exerciseSequenceTag),
              ].join(" ")}
            >
              {tagLabel}
            </span>
          )}

          <ChevronDown
            aria-hidden="true"
            className={[
              "h-5 w-5 shrink-0 text-[#8f9b94] transition-transform",
              isExpanded ? "rotate-180" : "rotate-0",
            ].join(" ")}
          />
        </span>
      </button>

      {isExpanded && (
        <div className="border-t border-[#253128] px-3 pb-4">
          {exercise.videoUrl && (
            <a
              href={exercise.videoUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 block overflow-hidden rounded-[20px] border border-[#2b4535] bg-[#0d130f] transition hover:border-[#70e39b]/45"
            >
              <span className="relative flex h-36 items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,_#1d3828_0%,_#101812_48%,_#0d130f_100%)]">
                <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,_rgba(255,255,255,0.03)_1px,_transparent_1px),linear-gradient(rgba(255,255,255,0.03)_1px,_transparent_1px)] bg-[size:28px_28px]" />

                <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#70e39b] text-[#0d1b13] shadow-2xl shadow-[#70e39b]/20">
                  <PlayCircle aria-hidden="true" className="h-8 w-8" />
                </span>

                <span className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-xl bg-black/55 px-3 py-2 text-xs font-semibold text-[#f5f7f5]">
                  <PlayCircle aria-hidden="true" className="h-4 w-4" />
                  Vídeo de execução
                </span>
              </span>
            </a>
          )}

          <div className="mt-3 overflow-hidden rounded-[18px] border border-[#253128] bg-[#0d130f]">
            <div className="grid grid-cols-[72px_1fr_1fr] border-b border-[#253128] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#737c76]">
              <span>Série</span>
              <span>Repetições</span>
              <span>Carga</span>
            </div>

            <div className="divide-y divide-[#253128]">
              {exerciseRows.map((row) => (
                <div
                  key={row.setNumber}
                  className="grid grid-cols-[72px_1fr_1fr] px-4 py-3 text-sm"
                >
                  <span className="text-[#8f9b94]">{row.setNumber}</span>
                  <span className="font-semibold text-[#f5f7f5]">
                    {row.reps}
                  </span>
                  <span className="font-semibold text-[#f5f7f5]">
                    {row.load}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {exercise.notes && (
            <div className="mt-3 rounded-2xl border border-[#244b34] bg-[#17281d] px-4 py-3">
              <p className="text-sm leading-6 text-[#cfd6d2]">
                {exercise.notes}
              </p>
            </div>
          )}

          {exercise.description && (
            <div className="mt-3 rounded-2xl border border-[#253128] bg-[#0d130f] px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#737c76]">
                Orientação
              </p>
              <p className="mt-2 text-sm leading-6 text-[#d9dedb]">
                {exercise.description}
              </p>
            </div>
          )}

          {exercise.imageUrl && (
            <a
              href={exercise.imageUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 flex items-center gap-3 rounded-2xl border border-[#253128] bg-[#0d130f] px-4 py-3 text-sm font-semibold text-[#f5f7f5] transition hover:border-[#70e39b]/35"
            >
              <ImageIcon aria-hidden="true" className="h-5 w-5" />
              Ver imagem do exercício
            </a>
          )}

          {exercise.restTimeSeconds !== null &&
            exercise.restTimeSeconds > 0 && (
              <div className="mt-3 flex items-center gap-2 text-sm text-[#9aa39d]">
                <Clock3 aria-hidden="true" className="h-4 w-4 text-[#70e39b]" />
                {formatRestTime(exercise.restTimeSeconds)} de descanso
              </div>
            )}

          {exercise.restTimeSeconds !== null &&
            exercise.restTimeSeconds > 0 && (
              <RestTimer
                restTimeSeconds={exercise.restTimeSeconds}
                remainingRestSeconds={remainingRestSeconds}
                isActive={isRestActiveForThisExercise}
                isPaused={isRestTimerPaused}
                onStart={() =>
                  onStartRestTimer(
                    exercise.workoutExerciseId,
                    exercise.restTimeSeconds!,
                  )
                }
                onPause={onPauseRestTimer}
                onResume={onResumeRestTimer}
                onCancel={onCancelRestTimer}
              />
            )}

          <button
            type="button"
            onClick={() =>
              onToggleCompletion(exercise.workoutExerciseId, isCompleted)
            }
            disabled={isUpdating || isCurrentWorkoutProgressError}
            className={[
              "mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60",
              isCompleted
                ? "border border-[#303832] bg-[#0d130f] text-[#d9dedb] hover:border-[#4a554d]"
                : "bg-[#70e39b] text-[#0d1b13] hover:bg-[#83e8a8]",
            ].join(" ")}
          >
            {isUpdating
              ? "Salvando..."
              : isCompleted
                ? "Reabrir exercício"
                : "Concluir exercício"}
            {!isUpdating && !isCompleted && (
              <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
            )}
          </button>
        </div>
      )}
    </article>
  );
}
