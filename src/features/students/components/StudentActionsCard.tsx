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

      <div className="mt-2 space-y-2 border-t border-[#29302c] pt-2">
        {actions.map((action) => (
          <button
            key={action.title}
            type="button"
            onClick={action.onClick}
            className="group flex w-full items-center justify-between gap-4 rounded-xl border border-transparent px-4 py-4 text-left transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[#315b41] hover:bg-[#20382a] hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)] focus-visible:-translate-y-0.5 focus-visible:border-[#315b41] focus-visible:bg-[#20382a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#70e39b]/40"
          >
            <span>
              <span className="block text-sm font-semibold text-[#f5f7f5] transition-colors duration-200 group-hover:text-[#70e39b] group-focus-visible:text-[#70e39b]">
                {action.title}
              </span>
              <span className="mt-2 block text-xs text-[#7f8a84] transition-colors duration-200 group-hover:text-[#a8b5ae] group-focus-visible:text-[#a8b5ae]">
                {action.description}
              </span>
            </span>
            <ChevronRight
              aria-hidden="true"
              className="h-[18px] w-[18px] shrink-0 text-[#89948e] transition-all duration-200 group-hover:translate-x-1 group-hover:text-[#70e39b] group-focus-visible:translate-x-1 group-focus-visible:text-[#70e39b]"
            />
          </button>
        ))}
      </div>
    </section>
  );
}
