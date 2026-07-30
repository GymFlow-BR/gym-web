import { useAuthenticatedUser } from "../../auth/hooks/useAuthenticatedUser";
import type { UserRole } from "../../auth/types/auth";
import { ChangePasswordForm } from "../components/ChangePasswordForm";

const roleLabels: Record<UserRole, string> = {
  ADMIN: "Administrador",
  TEACHER: "Professor",
  STUDENT: "Aluno",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function ProfilePage() {
  const { data: user, isLoading, isError } = useAuthenticatedUser();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-[28px] font-semibold tracking-[-0.04em] text-[#F4F7F5]">
          Perfil
        </h1>

        <p className="mt-2 text-[14px] text-[#8D9791]">
          Consulte seus dados de acesso e mantenha sua senha segura.
        </p>
      </header>

      {isLoading && (
        <p
          role="status"
          className="rounded-[22px] border border-[#2A302C] bg-[#171A18] p-6 text-[14px] text-[#8D9791]"
        >
          Carregando seus dados...
        </p>
      )}

      {isError && (
        <div
          role="alert"
          className="rounded-[22px] border border-[#6A3434] bg-[#2B1919] p-6"
        >
          <p className="text-[13px] font-semibold text-[#FF8A8A]">
            Não foi possível carregar seus dados.
          </p>

          <p className="mt-1 text-[13px] text-[#FFB0B0]">
            Recarregue a página ou faça login novamente.
          </p>
        </div>
      )}

      {user && (
        <section className="rounded-[22px] border border-[#2A302C] bg-[#171A18] p-6 text-[#F4F7F5] sm:p-7">
          <div className="flex items-center gap-4">
            <span
              aria-hidden="true"
              className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#1D3B2A] text-[16px] font-semibold text-[#70E39B]"
            >
              {getInitials(user.name)}
            </span>

            <div className="min-w-0">
              <p className="truncate text-[18px] font-semibold tracking-[-0.02em]">
                {user.name}
              </p>

              <p className="truncate text-[14px] text-[#8D9791]">
                {user.email}
              </p>
            </div>
          </div>

          <dl className="mt-6 grid gap-4 border-t border-[#2A302C] pt-6 sm:grid-cols-2">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#68736C]">
                Perfil de acesso
              </dt>
              <dd className="mt-2 text-[14px] text-[#C9D0CC]">
                {roleLabels[user.role]}
              </dd>
            </div>

            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#68736C]">
                E-mail
              </dt>
              <dd className="mt-2 truncate text-[14px] text-[#C9D0CC]">
                {user.email}
              </dd>
            </div>
          </dl>
        </section>
      )}

      <ChangePasswordForm />
    </div>
  );
}
