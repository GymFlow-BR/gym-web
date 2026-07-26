import { EditStudentForm } from "./EditStudentForm";
import type { Student } from "../types/student";

type StudentProfileCardProps = {
  student?: Student;
  isLoading: boolean;
  isError: boolean;
  isEditing: boolean;
  successMessage: string | null;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onEditSuccess: () => void;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function StudentProfileCard({
  student,
  isLoading,
  isError,
  isEditing,
  successMessage,
  onStartEditing,
  onCancelEditing,
  onEditSuccess,
}: StudentProfileCardProps) {
  return (
    <section className="rounded-2xl border border-[#29302c] bg-[#171a18] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#89968f]">
            Informações principais
          </p>
          <h2 className="mt-3 text-xl font-semibold tracking-[-0.025em] text-[#f5f7f5]">
            Perfil do aluno
          </h2>
        </div>

        {student && !isEditing && (
          <button
            type="button"
            onClick={onStartEditing}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-[#39413c] px-4 text-sm font-semibold text-[#f5f7f5] transition hover:border-[#536058] hover:bg-[#1d211e]"
          >
            Editar
          </button>
        )}
      </div>

      {successMessage && !isEditing && (
        <div className="mt-5 rounded-xl border border-[#2f5b40] bg-[#20382a] px-4 py-3 text-sm text-[#70e39b]">
          {successMessage}
        </div>
      )}

      {isLoading && (
        <p role="status" className="mt-6 text-sm text-[#89948e]">
          Carregando dados do aluno...
        </p>
      )}

      {isError && (
        <p role="alert" className="mt-6 text-sm text-[#ff8c87]">
          Não foi possível carregar os dados do aluno.
        </p>
      )}

      {!isLoading && !isError && !student && (
        <p className="mt-6 text-sm text-[#89948e]">
          Aluno não encontrado nesta organização.
        </p>
      )}

      {student && isEditing && (
        <div className="mt-6">
          <EditStudentForm
            student={student}
            onCancel={onCancelEditing}
            onSuccess={onEditSuccess}
          />
        </div>
      )}

      {student && !isEditing && (
        <>
          <div className="mt-7 flex items-center gap-4 rounded-2xl border border-[#303733] bg-[#1c201d] p-4">
            <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-2xl bg-[#302d3b] text-sm font-semibold text-[#caa5ff]">
              {getInitials(student.name)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-[#f5f7f5]">
                {student.name}
              </p>
              <p className="mt-1 truncate text-xs text-[#89948e]">
                {student.email}
              </p>
            </div>
          </div>

          <dl className="mt-7 space-y-6">
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#77827b]">
                Nome completo
              </dt>
              <dd className="mt-2 text-sm text-[#f5f7f5]">{student.name}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#77827b]">
                E-mail
              </dt>
              <dd className="mt-2 break-all text-sm text-[#f5f7f5]">
                {student.email}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#77827b]">
                Organização
              </dt>
              <dd className="mt-2 text-sm text-[#f5f7f5]">
                {student.organizationName}
              </dd>
            </div>
          </dl>
        </>
      )}
    </section>
  );
}
