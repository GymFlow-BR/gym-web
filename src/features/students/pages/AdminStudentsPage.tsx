import { useQuery } from "@tanstack/react-query";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

import { useAuthenticatedUser } from "../../auth/hooks/useAuthenticatedUser";
import { CreateStudentForm } from "../components/CreateStudentForm";
import { StudentsList } from "../components/StudentsList";
import { getStudentsByOrganization } from "../services/studentService";

export function AdminStudentsPage() {
  const authenticatedUserQuery = useAuthenticatedUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateStudentModalOpen, setIsCreateStudentModalOpen] =
    useState(false);

  const organizationId = authenticatedUserQuery.data?.organizationId;

  const studentsQuery = useQuery({
    queryKey: ["students", organizationId],
    queryFn: () => getStudentsByOrganization(Number(organizationId)),
    enabled: Boolean(organizationId),
  });

  const students = studentsQuery.data ?? [];

  const filteredStudents = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLocaleLowerCase("pt-BR");

    if (!normalizedSearchTerm) {
      return students;
    }

    return students.filter((student) => {
      return (
        student.name
          .toLocaleLowerCase("pt-BR")
          .includes(normalizedSearchTerm) ||
        student.email.toLocaleLowerCase("pt-BR").includes(normalizedSearchTerm)
      );
    });
  }, [searchTerm, students]);

  const isLoading = authenticatedUserQuery.isLoading || studentsQuery.isLoading;

  const hasLoadError = authenticatedUserQuery.isError || studentsQuery.isError;

  return (
    <>
      <div className="mx-auto w-full max-w-[1435px]">
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#89968f]">
            Área do professor
          </p>

          <h1 className="text-[36px] font-semibold leading-none tracking-[-0.045em] text-[#f5f7f5] sm:text-[42px]">
            Alunos
          </h1>
        </div>

        <div className="mt-12 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full lg:max-w-[360px]">
            <span className="sr-only">Buscar aluno por nome ou e-mail</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#7f8a84]"
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por nome"
              className="h-12 w-full rounded-xl border border-[#29302c] bg-[#151816] pl-12 pr-4 text-sm text-[#f5f7f5] outline-none transition placeholder:text-[#77817c] focus:border-[#47755a] focus:ring-2 focus:ring-[#70e39b]/10"
            />
          </label>

          <div className="flex w-full gap-3 sm:w-auto">
            <button
              type="button"
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-[#303733] bg-[#151816] px-5 text-sm font-semibold text-[#f5f7f5] transition hover:border-[#465049] hover:bg-[#1a1e1b] sm:flex-none"
            >
              <SlidersHorizontal
                aria-hidden="true"
                className="h-[18px] w-[18px]"
              />
              Filtrar
            </button>

            <button
              type="button"
              onClick={() => setIsCreateStudentModalOpen(true)}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#70e39b] px-5 text-sm font-semibold text-[#0d1b13] transition hover:bg-[#83e8a8] focus:outline-none focus:ring-2 focus:ring-[#70e39b] focus:ring-offset-2 focus:ring-offset-[#0d0f0e] sm:flex-none"
            >
              <Plus aria-hidden="true" className="h-[18px] w-[18px]" />
              Adicionar aluno
            </button>
          </div>
        </div>

        <div className="mt-6">
          <StudentsList
            students={filteredStudents}
            isLoading={isLoading}
            hasLoadError={hasLoadError}
            hasSearchTerm={Boolean(searchTerm.trim())}
          />
        </div>
      </div>

      {isCreateStudentModalOpen && (
        <CreateStudentForm
          organizationId={organizationId}
          onClose={() => setIsCreateStudentModalOpen(false)}
        />
      )}
    </>
  );
}
