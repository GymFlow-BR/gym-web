import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router";

import { logout } from "../../features/auth/services/authService";
import { SkipLink } from "./SkipLink";

type StudentLayoutProps = {
  children: ReactNode;
};

const navItems = [
  { label: "Treino", to: "/student/current-workout" },
  { label: "Exercícios", to: "/student/exercises" },
  { label: "Perfil", to: "/student/profile" },
];

export function StudentLayout({ children }: StudentLayoutProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["authenticated-user"] });
      navigate("/login", { replace: true });
    },
  });

  function handleLogout() {
    logoutMutation.mutate();
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#1F3A2D_0%,_#111713_42%,_#0D100E_100%)] pb-24 text-[#F6F4EF]">
      <SkipLink />

      <header className="border-b border-white/10 bg-[#111713]/85 px-5 py-5 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#F6F4EF]">
              GymFlow
            </h1>

            <p className="text-sm font-medium text-[#9FC5AE]">Área do aluno</p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            aria-busy={logoutMutation.isPending}
            className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-[#E8E4D8] transition hover:border-[#9FC5AE] hover:text-[#9FC5AE] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {logoutMutation.isPending ? "Saindo..." : "Sair"}
          </button>
        </div>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto max-w-3xl px-5 py-6 focus:outline-none"
      >
        {children}
      </main>

      <nav
        aria-label="Navegação principal"
        className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-[#111713]/95 px-4 py-3 backdrop-blur"
      >
        <div className="mx-auto grid max-w-3xl grid-cols-3 gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "rounded-2xl px-3 py-3 text-center text-sm font-medium transition",
                  isActive
                    ? "bg-[#F6F4EF] text-[#1F1F1F]"
                    : "text-[#C9C3B8] hover:bg-white/10 hover:text-[#F6F4EF]",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
