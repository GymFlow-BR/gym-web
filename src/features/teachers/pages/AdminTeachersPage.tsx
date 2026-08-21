import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useAuthenticatedUser } from "../../auth/hooks/useAuthenticatedUser";
import { CreateTeacherForm } from "../components/CreateTeacherForm";
import { TeachersList } from "../components/TeachersList";
import { getTeachersByOrganization } from "../services/teacherService";

export function AdminTeachersPage() {
  const authenticatedUserQuery = useAuthenticatedUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isCreateTeacherModalOpen, setIsCreateTeacherModalOpen] =
    useState(false);

  const organizationId = authenticatedUserQuery.data?.organizationId;

  const teachersQuery = useQuery({
    queryKey: ["teachers", organizationId],
    queryFn: () => getTeachersByOrganization(Number(organizationId)),
    enabled: Boolean(organizationId),
  });

  const teachers = teachersQuery.data ?? [];

  const filteredTeachers = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLocaleLowerCase("pt-BR");

    if (!normalizedSearchTerm) {
      return teachers;
    }

    return teachers.filter((teacher) => {
      return (
        teacher.name
          .toLocaleLowerCase("pt-BR")
          .includes(normalizedSearchTerm) ||
        teacher.email.toLocaleLowerCase("pt-BR").includes(normalizedSearchTerm)
      );
    });
  }, [searchTerm, teachers]);

  const isLoading = authenticatedUserQuery.isLoading || teachersQuery.isLoading;

  const hasLoadError = authenticatedUserQuery.isError || teachersQuery.isError;

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [successMessage]);

  return (
    <>
      <div className="mx-auto w-full max-w-[1435px]">
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#89968f]">
            Área administrativa
          </p>

          <h1 className="text-[36px] font-semibold leading-none tracking-[-0.045em] text-[#f5f7f5] sm:text-[42px]">
            Professores
          </h1>

          <p className="max-w-2xl text-sm leading-6 text-[#89948e]">
            Gerencie os profissionais que podem acessar a área de gestão da sua
            organização.
          </p>
        </div>

        <div className="mt-12 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full lg:max-w-[360px]">
            <span className="sr-only">Buscar professor por nome ou e-mail</span>

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
              onClick={() => {
                setSuccessMessage(null);
                setIsCreateTeacherModalOpen(true);
              }}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#70e39b] px-5 text-sm font-semibold text-[#0d1b13] transition hover:bg-[#83e8a8] focus:outline-none focus:ring-2 focus:ring-[#70e39b] focus:ring-offset-2 focus:ring-offset-[#0d0f0e] sm:flex-none"
            >
              <Plus aria-hidden="true" className="h-[18px] w-[18px]" />
              Adicionar professor
            </button>
          </div>
        </div>

        {successMessage && (
          <div
            role="status"
            className="mt-6 rounded-2xl border border-[#2f5b40] bg-[#20382a] px-5 py-4"
          >
            <p className="text-sm font-semibold text-[#70e39b]">
              {successMessage}
            </p>
          </div>
        )}

        <div className="mt-6">
          <TeachersList
            teachers={filteredTeachers}
            isLoading={isLoading}
            hasLoadError={hasLoadError}
            hasSearchTerm={Boolean(searchTerm.trim())}
            onSuccessMessage={setSuccessMessage}
          />
        </div>
      </div>

      {isCreateTeacherModalOpen && (
        <CreateTeacherForm
          organizationId={organizationId}
          onClose={() => setIsCreateTeacherModalOpen(false)}
          onSuccess={setSuccessMessage}
        />
      )}
    </>
  );
}
