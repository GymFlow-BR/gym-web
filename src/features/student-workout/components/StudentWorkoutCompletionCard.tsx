import { CheckCircle2, Sparkles } from "lucide-react";

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
    ? `Treino concluído, ${firstName}.`
    : "Treino concluído.";

  return (
    <section className="mt-6 overflow-hidden rounded-[26px] border border-[#70e39b]/35 bg-[#142019] shadow-2xl shadow-black/20">
      <div className="border-b border-[#26322b] bg-[#172a1f] px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#70e39b] text-[#0d1b13]">
            <CheckCircle2 aria-hidden="true" className="h-6 w-6" />
          </span>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#70e39b]">
              Finalizado
            </p>
            <h3 className="mt-1 text-xl font-semibold tracking-[-0.04em] text-[#f5f7f5]">
              {completionTitle}
            </h3>
          </div>
        </div>
      </div>

      <div className="p-5">
        <p className="text-sm leading-6 text-[#aab5ae]">
          Você completou todos os exercícios planejados para hoje. Continue
          mantendo consistência para evoluir com segurança.
        </p>

        <div className="mt-5 rounded-2xl border border-[#26322b] bg-[#0d130f] p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#1d3828] text-[#70e39b]">
              <Sparkles aria-hidden="true" className="h-4 w-4" />
            </span>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#77847d]">
                Resumo do treino
              </p>
              <p className="mt-1 text-sm font-semibold text-[#f5f7f5]">
                {completedExercises} de {totalExercises} exercícios concluídos
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
