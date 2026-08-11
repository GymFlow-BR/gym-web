import { Dumbbell, Home, LogOut, UserCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router";

import { logout } from "../../features/auth/services/authService";
import { SkipLink } from "./SkipLink";

type StudentLayoutProps = {
  children: ReactNode;
};

const navItems = [
  {
    label: "Hoje",
    to: "/student/current-workout",
    icon: Home,
  },
  {
    label: "Treinos",
    to: "/student/workouts",
    icon: Dumbbell,
  },
  {
    label: "Perfil",
    to: "/student/profile",
    icon: UserCircle,
  },
];

export function StudentLayout({ children }: StudentLayoutProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["authenticated-user"] });
      navigate("/login", { replace: true });
    },
  });

  useEffect(() => {
    if (!isLogoutConfirmOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !logoutMutation.isPending) {
        setIsLogoutConfirmOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLogoutConfirmOpen, logoutMutation.isPending]);

  function handleConfirmLogout() {
    logoutMutation.mutate();
  }

  function handleCancelLogout() {
    if (logoutMutation.isPending) {
      return;
    }

    setIsLogoutConfirmOpen(false);
  }

  return (
    <>
      <div className="min-h-screen bg-[#151515] text-[#f5f7f5]">
        <SkipLink />

        <div className="mx-auto min-h-screen w-full max-w-[430px] border-x border-[#242824] bg-[#060907] pb-[104px] shadow-2xl shadow-black/40">
          <header className="sticky top-0 z-30 border-b border-[#202620] bg-[#080b09]/95 px-5 py-4 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#70e39b] text-[#0b130e]">
                  <Dumbbell aria-hidden="true" className="h-5 w-5" />
                </div>

                <p className="truncate text-lg font-bold tracking-[-0.035em] text-[#f5f7f5]">
                  GymFlow
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(true)}
                disabled={logoutMutation.isPending}
                aria-label="Sair da conta"
                aria-busy={logoutMutation.isPending}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#253128] bg-[#0d130f] text-[#aab5ae] transition hover:border-[#70e39b]/40 hover:text-[#70e39b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogOut aria-hidden="true" className="h-[18px] w-[18px]" />
              </button>
            </div>
          </header>

          <main
            id="main-content"
            tabIndex={-1}
            className="px-5 py-6 focus:outline-none"
          >
            {children}
          </main>

          <nav
            aria-label="Navegação principal"
            className="fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 border-x border-t border-[#252a27] bg-[#070b08]/95 px-4 pb-4 pt-3 backdrop-blur-xl"
          >
            <div className="grid grid-cols-3 gap-2 rounded-[26px] border border-[#252e28] bg-[#101511] p-2 shadow-2xl shadow-black/35">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      [
                        "relative flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-semibold transition",
                        isActive
                          ? "bg-[#1d3828] text-[#70e39b]"
                          : "text-[#8f9b94] hover:bg-[#19211b] hover:text-[#f5f7f5]",
                      ].join(" ")
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span
                            aria-hidden="true"
                            className="absolute -top-3 h-[2px] w-7 rounded-full bg-[#70e39b]"
                          />
                        )}

                        <Icon
                          aria-hidden="true"
                          className="h-[19px] w-[19px]"
                        />
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      {isLogoutConfirmOpen && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="student-layout-logout-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCancelLogout();
            }
          }}
        >
          <div className="w-full max-w-[390px] rounded-[26px] border border-[#252b27] bg-[#111411] p-5 shadow-2xl shadow-black/60">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-200">
                <LogOut aria-hidden="true" className="h-5 w-5" />
              </span>

              <div>
                <h2
                  id="student-layout-logout-title"
                  className="text-lg font-semibold tracking-[-0.035em] text-[#f5f7f5]"
                >
                  Sair da conta?
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#9aa39d]">
                  Você precisará fazer login novamente para acessar seus
                  treinos.
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleCancelLogout}
                disabled={logoutMutation.isPending}
                className="h-12 rounded-2xl border border-[#303832] bg-[#090d0a] text-sm font-bold text-[#d9dedb] transition hover:border-[#4a554d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirmLogout}
                disabled={logoutMutation.isPending}
                aria-busy={logoutMutation.isPending}
                className="h-12 rounded-2xl bg-red-500/90 text-sm font-bold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {logoutMutation.isPending ? "Saindo..." : "Sair"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
