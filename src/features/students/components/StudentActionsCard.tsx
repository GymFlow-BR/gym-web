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

  const isStudentActive = student.active;

  const actions = [
    {
      title: "Editar dados básicos",
      description: "Atualize nome e e-mail.",
      onClick: onStartEditing,
      disabled: false,
    },
    {
      title: currentWorkout ? "Trocar treino" : "Atribuir treino",
      description: currentWorkout
        ? "Substitua o treino ativo."
        : "Vincule um treino ativo.",
      onClick: onStartAssigningWorkout,
      disabled: !isStudentActive,
    },
  ];

  return (
    <section className="rounded-2xl border border-[#29302c] bg-[#171a18] p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#89968f]">
        Gerenciamento
      </p>

      {!isStudentActive && (
        <div className="mt-5 rounded-xl border border-[#453b25] bg-[#211d14] px-4 py-3">
          <p className="text-xs font-semibold text-[#f2c97d]">Aluno inativo</p>
          <p className="mt-1 text-xs leading-5 text-[#b9a57d]">
            Este aluno pode ser consultado e editado, mas não deve receber novos
            treinos enquanto estiver inativo.
          </p>
        </div>
      )}

      <div className="mt-5 divide-y divide-[#29302c] border-t border-[#29302c]">
        {actions.map((action) => (
          <button
            key={action.title}
            type="button"
            onClick={action.disabled ? undefined : action.onClick}
            disabled={action.disabled}
            className={[
              "flex w-full items-center justify-between gap-4 py-5 text-left transition",
              action.disabled
                ? "cursor-not-allowed opacity-45"
                : "hover:text-[#70e39b]",
            ].join(" ")}
          >
            <span>
              <span className="block text-sm font-semibold text-[#f5f7f5]">
                {action.title}
              </span>
              <span className="mt-2 block text-xs text-[#7f8a84]">
                {action.disabled
                  ? "Reative o aluno antes de atribuir ou trocar treino."
                  : action.description}
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
