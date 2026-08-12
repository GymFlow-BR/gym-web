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
      title: "Atribuir treino",
      description: "Vincule um treino a um dia da semana.",
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

      <div className="mt-5 space-y-2 border-t border-[#29302c] pt-4">
        {actions.map((action) => (
          <button
            key={action.title}
            type="button"
            onClick={action.disabled ? undefined : action.onClick}
            disabled={action.disabled}
            className={[
              "group flex w-full items-center justify-between gap-4 rounded-xl px-4 py-4 text-left transition duration-200",
              action.disabled
                ? "cursor-not-allowed opacity-45"
                : "hover:-translate-y-0.5 hover:bg-[#202720] hover:shadow-lg hover:shadow-black/10",
            ].join(" ")}
          >
            <span>
              <span className="block text-sm font-semibold text-[#f5f7f5] transition group-hover:text-[#ffffff]">
                {action.title}
              </span>

              <span className="mt-2 block text-xs leading-5 text-[#7f8a84] transition group-hover:text-[#a4aea8]">
                {action.disabled
                  ? "Reative o aluno antes de atribuir treino."
                  : action.description}
              </span>
            </span>

            <ChevronRight
              aria-hidden="true"
              className={[
                "h-[18px] w-[18px] shrink-0 transition duration-200",
                action.disabled
                  ? "text-[#58625c]"
                  : "text-[#89948e] group-hover:translate-x-1 group-hover:text-[#70e39b]",
              ].join(" ")}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
