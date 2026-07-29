import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { useAuthenticatedUser } from "../../auth/hooks/useAuthenticatedUser";
import { CreateStudentForm } from "../components/CreateStudentForm";
import { StudentsList } from "../components/StudentsList";
import { getStudentsByOrganization } from "../services/studentService";

type StudentStatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

const statusFilters: Array<{
  label: string;
  value: StudentStatusFilter;
}> = [
  { label: "Todos", value: "ALL" },
  { label: "Ativos", value: "ACTIVE" },
  { label: "Inativos", value: "INACTIVE" },
];

export function AdminStudentsPage() {
  const authenticatedUserQuery = useAuthenticatedUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StudentStatusFilter>("ALL");
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

    return students.filter((student) => {
      const matchesSearch =
        !normalizedSearchTerm ||
        student.name
          .toLocaleLowerCase("pt-BR")
          .includes(normalizedSearchTerm) ||
        student.email.toLocaleLowerCase("pt-BR").includes(normalizedSearchTerm);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && student.active) ||
        (statusFilter === "INACTIVE" && !student.active);

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, students]);

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

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex rounded-xl border border-[#303733] bg-[#151816] p-1">
              {statusFilters.map((filter) => {
                const isSelected = statusFilter === filter.value;

                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setStatusFilter(filter.value)}
                    className={[
                      "h-10 rounded-lg px-4 text-xs font-semibold transition",
                      isSelected
                        ? "bg-[#70e39b] text-[#0d1b13]"
                        : "text-[#a4ada8] hover:bg-[#1d211f] hover:text-[#f5f7f5]",
                    ].join(" ")}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setIsCreateStudentModalOpen(true)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#70e39b] px-5 text-sm font-semibold text-[#0d1b13] transition hover:bg-[#83e8a8] focus:outline-none focus:ring-2 focus:ring-[#70e39b] focus:ring-offset-2 focus:ring-offset-[#0d0f0e]"
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
