import "@fontsource-variable/geist";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GymFlowLogo } from "../brand/GymFlowLogo";
import {
  Dumbbell,
  LayoutGrid,
  LogOut,
  MoreHorizontal,
  UserCog,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router";

import { useAuthenticatedUser } from "../../features/auth/hooks/useAuthenticatedUser";
import { logout } from "../../features/auth/services/authService";
import type { UserRole } from "../../features/auth/types/auth";
import { SkipLink } from "./SkipLink";

type AdminLayoutProps = {
  children: ReactNode;
};

type NavigationItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  allowedRoles?: UserRole[];
};

const navigationItems: NavigationItem[] = [
  {
    label: "Visão geral",
    to: "/admin",
    icon: LayoutGrid,
    allowedRoles: ["ADMIN", "TEACHER"],
  },
  {
    label: "Alunos",
    to: "/admin/students",
    icon: Users,
    allowedRoles: ["ADMIN", "TEACHER"],
  },
  {
    label: "Professores",
    to: "/admin/teachers",
    icon: UserCog,
    allowedRoles: ["ADMIN"],
  },
  {
    label: "Exercícios",
    to: "/admin/exercises",
    icon: Zap,
    allowedRoles: ["ADMIN", "TEACHER"],
  },
  {
    label: "Treinos",
    to: "/admin/workouts",
    icon: Dumbbell,
    allowedRoles: ["ADMIN", "TEACHER"],
  },
];

const roleLabels: Record<UserRole, string> = {
  ADMIN: "Administrador",
  TEACHER: "Personal trainer",
  STUDENT: "Aluno",
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function Brand() {
  return (
    <GymFlowLogo
      markClassName="h-10 w-10"
      textClassName="text-[21px] font-semibold tracking-[-0.04em] text-[#f4f7f4]"
    />
  );
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user } = useAuthenticatedUser();

  const visibleNavigationItems = navigationItems.filter((item) => {
    if (!item.allowedRoles || item.allowedRoles.length === 0) {
      return true;
    }

    if (!user) {
      return false;
    }

    return item.allowedRoles.includes(user.role);
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: ["authenticated-user"],
      });

      navigate("/login", { replace: true });
    },
  });

  function handleLogout() {
    logoutMutation.mutate();
  }

  return (
    <div
      className="min-h-dvh font-['Geist_Variable',Arial,sans-serif] text-[#f4f7f4]"
      style={{
        background:
          "radial-gradient(circle at 50% 0%, rgba(112, 227, 155, 0.04), transparent 34rem), #0d0f0e",
      }}
    >
      <SkipLink />

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[240px] flex-col border-r border-[#242b27] bg-[#101311] px-5 py-8 lg:flex">
        <div className="px-2">
          <Brand />
        </div>

        <p className="mb-4 mt-14 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7f8b84]">
          Gestão
        </p>

        <nav
          aria-label="Navegação principal"
          className="flex flex-1 flex-col gap-2"
        >
          {visibleNavigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/admin"}
                className={({ isActive }) =>
                  [
                    "flex min-h-11 items-center gap-3.5 rounded-xl border px-4 text-[14px] font-medium transition-colors",
                    isActive
                      ? "border-[#294536] bg-[#1b2e23] text-[#6ee59a]"
                      : "border-transparent text-[#9aa49e] hover:bg-[#171a18] hover:text-[#f4f7f4]",
                  ].join(" ")
                }
              >
                <Icon
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0"
                  strokeWidth={1.8}
                />

                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-[#29302c] pt-5">
          <div className="flex items-center gap-3 px-2">
            <span
              aria-hidden="true"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#14291e] text-[12px] font-semibold uppercase tracking-[0.04em] text-[#87a693]"
            >
              {user ? getInitials(user.name) : "..."}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-[#f4f7f4]">
                {user?.name ?? "Carregando..."}
              </p>

              <p className="mt-1 truncate text-[12px] text-[#87918b]">
                {user ? roleLabels[user.role] : ""}
              </p>
            </div>

            <details className="group relative">
              <summary
                aria-label="Abrir opções do usuário"
                className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-lg text-[#8b958f] transition-colors hover:bg-[#19201c] hover:text-[#f4f7f4] [&::-webkit-details-marker]:hidden"
              >
                <MoreHorizontal
                  aria-hidden="true"
                  className="h-5 w-5"
                  strokeWidth={1.8}
                />
              </summary>

              <div className="absolute bottom-11 right-0 z-40 w-40 rounded-xl border border-[#29302c] bg-[#171a18] p-1.5 shadow-2xl shadow-black/30">
                <NavLink
                  to="/admin/profile"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium text-[#c7cec9] transition-colors hover:bg-[#202721] hover:text-white"
                >
                  <UserCog
                    aria-hidden="true"
                    className="h-4 w-4"
                    strokeWidth={1.8}
                  />
                  Perfil
                </NavLink>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  aria-busy={logoutMutation.isPending}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium text-[#c7cec9] transition-colors hover:bg-[#202721] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <LogOut
                    aria-hidden="true"
                    className="h-4 w-4"
                    strokeWidth={1.8}
                  />

                  {logoutMutation.isPending ? "Saindo..." : "Sair"}
                </button>
              </div>
            </details>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[240px]">
        <header className="border-b border-[#242b27] bg-[#101311] lg:hidden">
          <div className="flex items-center justify-between gap-4 px-4 py-4">
            <Brand />

            <button
              type="button"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              aria-busy={logoutMutation.isPending}
              aria-label={logoutMutation.isPending ? "Saindo" : "Sair"}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#29302c] text-[#9aa49e] transition-colors hover:bg-[#171a18] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut
                aria-hidden="true"
                className="h-[18px] w-[18px]"
                strokeWidth={1.8}
              />
            </button>
          </div>

          <nav
            aria-label="Navegação principal"
            className="flex gap-1 overflow-x-auto px-4 pb-4"
          >
            {visibleNavigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/admin"}
                className={({ isActive }) =>
                  [
                    "shrink-0 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors",
                    isActive
                      ? "bg-[#1b2e23] text-[#6ee59a]"
                      : "text-[#929c96] hover:bg-[#171a18] hover:text-white",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="min-h-dvh px-4 py-8 focus:outline-none sm:px-6 lg:px-12 lg:py-12 xl:px-16"
        >
          <div className="mx-auto w-full max-w-[1435px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
