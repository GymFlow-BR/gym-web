import { ChevronRight } from "lucide-react";

import type { StudentCurrentWorkout } from "../../student-workout/types/studentWorkout";
import type { Student } from "../types/student";

type StudentActionsCardProps = {
  student?: Student;
  currentWorkout?: StudentCurrentWorkout;
  isEditingStudent: boolean;
  onStartEditing: () => void;
  onStartAssigningWorkout: () => void;
};

export function StudentActionsCard({
  student,
  currentWorkout,
  isEditingStudent,
  onStartEditing,
  onStartAssigningWorkout,
}: StudentActionsCardProps) {
  if (!student || isEditingStudent) {
    return null;
  }

  const actions = [
    {
      title: "Editar dados básicos",
      description: "Atualize nome e e-mail.",
      onClick: onStartEditing,
    },
    {
      title: currentWorkout ? "Trocar treino" : "Atribuir treino",
      description: currentWorkout
        ? "Substitua o treino ativo."
        : "Vincule um treino ativo.",
      onClick: onStartAssigningWorkout,
    },
  ];

  return (
    <section className="rounded-2xl border border-[#29302c] bg-[#171a18] p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#89968f]">
        Gerenciamento
      </p>

      <div className="mt-2 divide-y divide-[#29302c] border-t border-[#29302c]">
        {actions.map((action) => (
          <button
            key={action.title}
            type="button"
            onClick={action.onClick}
            className="flex w-full items-center justify-between gap-4 py-5 text-left transition hover:text-[#70e39b]"
          >
            <span>
              <span className="block text-sm font-semibold text-[#f5f7f5]">
                {action.title}
              </span>
              <span className="mt-2 block text-xs text-[#7f8a84]">
                {action.description}
              </span>
            </span>
            <ChevronRight
              aria-hidden="true"
              className="h-[18px] w-[18px] shrink-0 text-[#89948e]"
            />
          </button>
        ))}
      </div>
    </section>
  );
}
