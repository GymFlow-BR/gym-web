import { CheckCircle2, Dumbbell, Sparkles } from "lucide-react";

type StudentWorkoutCompletionCardProps = {
  completedExercises: number;
  totalExercises: number;
  studentName?: string | null;
};

function getFirstName(name?: string | null) {
  const trimmedName = name?.trim();

  if (!trimmedName) {
    return null;
  }

  return trimmedName.split(" ")[0];
}

export function StudentWorkoutCompletionCard({
  completedExercises,
  totalExercises,
  studentName,
}: StudentWorkoutCompletionCardProps) {
  const firstName = getFirstName(studentName);

  const completionTitle = firstName
    ? `Treino finalizado, ${firstName}.`
    : "Treino finalizado.";

  return (
    <section className="mt-6 overflow-hidden rounded-[26px] border border-[#2f5b40] bg-[#111914] shadow-xl shadow-black/10">
      <div className="relative p-5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full border-[28px] border-[#1d3828]/45"
        />

        <div className="relative flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#70e39b] text-[#0d1b13]">
            <CheckCircle2 aria-hidden="true" className="h-6 w-6" />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#70e39b]">
              Finalizado
            </p>

            <h3 className="mt-2 text-[22px] font-semibold leading-tight tracking-[-0.045em] text-[#f5f7f5]">
              {completionTitle}
            </h3>

            <p className="mt-3 text-sm leading-6 text-[#aab5ae]">
              Ótimo trabalho. Você concluiu todos os exercícios planejados para
              hoje.
            </p>
          </div>
        </div>

        <div className="relative mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-[#26322b] bg-[#0d130f] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1d3828] text-[#70e39b]">
                <Dumbbell aria-hidden="true" className="h-4 w-4" />
              </span>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#77847d]">
                  Total
                </p>

                <p className="mt-0.5 text-sm font-semibold text-[#f5f7f5]">
                  {totalExercises} exercícios
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#26322b] bg-[#0d130f] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1d3828] text-[#70e39b]">
                <Sparkles aria-hidden="true" className="h-4 w-4" />
              </span>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#77847d]">
                  Concluídos
                </p>

                <p className="mt-0.5 text-sm font-semibold text-[#f5f7f5]">
                  {completedExercises}/{totalExercises}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
