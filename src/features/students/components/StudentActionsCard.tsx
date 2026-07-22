import { Card } from "../../../components/ui/Card";
import type { Student } from "../types/student";
import type { StudentCurrentWorkout } from "../../student-workout/types/studentWorkout";

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

  return (
    <Card>
      <div className="mb-4 flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
          Ações do aluno
        </p>

        <h2 className="text-lg font-semibold text-[#1F1F1F]">Gerenciamento</h2>

        <p className="text-sm text-[#6F6A62]">
          Gerencie dados básicos e vínculo de treino deste aluno.
        </p>
      </div>

      <button
        type="button"
        onClick={onStartEditing}
        className="flex w-full items-center justify-between rounded-2xl border border-[#E4DFD6] bg-[#FAF9F6] px-4 py-3 text-left transition hover:border-[#2F4F3E] hover:bg-[#F3F0E8]"
      >
        <span>
          <span className="block text-sm font-semibold text-[#1F1F1F]">
            Editar dados básicos
          </span>
          <span className="mt-1 block text-sm text-[#6F6A62]">
            Atualize nome e email do aluno.
          </span>
        </span>

        <span className="text-sm font-semibold text-[#2F4F3E]">Editar</span>
      </button>

      <button
        type="button"
        onClick={onStartAssigningWorkout}
        className="mt-3 flex w-full items-center justify-between rounded-2xl border border-[#E4DFD6] bg-[#FAF9F6] px-4 py-3 text-left transition hover:border-[#2F4F3E] hover:bg-[#F3F0E8]"
      >
        <span>
          <span className="block text-sm font-semibold text-[#1F1F1F]">
            {currentWorkout ? "Trocar treino" : "Atribuir treino"}
          </span>
          <span className="mt-1 block text-sm text-[#6F6A62]">
            {currentWorkout
              ? "Substitua o treino ativo por outro treino disponível."
              : "Vincule um treino ativo a este aluno."}
          </span>
        </span>

        <span className="text-sm font-semibold text-[#2F4F3E]">
          {currentWorkout ? "Trocar" : "Atribuir"}
        </span>
      </button>
    </Card>
  );
}
