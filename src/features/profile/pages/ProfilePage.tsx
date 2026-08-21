import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronRight,
  LogOut,
  Mail,
  Settings,
  UserCircle,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { useAuthenticatedUser } from "../../auth/hooks/useAuthenticatedUser";
import { logout } from "../../auth/services/authService";
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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user, isLoading, isError } = useAuthenticatedUser();

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["authenticated-user"] });
      navigate("/login", { replace: true });
    },
  });

  useEffect(() => {
    if (!isPasswordModalOpen && !isLogoutConfirmOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      setIsPasswordModalOpen(false);

      if (!logoutMutation.isPending) {
        setIsLogoutConfirmOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLogoutConfirmOpen, isPasswordModalOpen, logoutMutation.isPending]);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage(null);
    }, 10_000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [successMessage]);

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
      <div className="mx-auto w-full max-w-[520px] space-y-5">
        <header className="pt-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8d958f]">
            Seu perfil
          </p>

          <h1 className="mt-3 text-[32px] font-semibold leading-none tracking-[-0.055em] text-[#f5f7f5]">
            {user?.name ?? "Perfil"}
          </h1>

          <p className="mt-4 max-w-[420px] text-sm leading-6 text-[#9aa39d]">
            Veja suas informações de acesso e mantenha sua conta segura.
          </p>
        </header>

        {successMessage && (
          <div
            role="status"
            className="rounded-[20px] border border-[#70e39b]/25 bg-[#1d3828] px-5 py-4 shadow-xl shadow-black/10"
          >
            <p className="text-sm font-semibold text-[#70e39b]">
              {successMessage}
            </p>
          </div>
        )}

        {isLoading && (
          <div
            role="status"
            className="rounded-[24px] border border-[#252b27] bg-[#111411] p-5 shadow-xl shadow-black/10"
          >
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-[18px] bg-[#1b211d]" />

              <div className="flex-1 space-y-3">
                <div className="h-4 w-2/3 rounded-full bg-[#1b211d]" />
                <div className="h-3 w-full rounded-full bg-[#1b211d]" />
              </div>
            </div>
          </div>
        )}

        {isError && (
          <div
            role="alert"
            className="rounded-[24px] border border-red-400/20 bg-red-500/10 p-5 shadow-xl shadow-black/10"
          >
            <p className="text-sm font-semibold text-red-200">
              Não foi possível carregar seus dados.
            </p>

            <p className="mt-2 text-sm leading-6 text-red-100/80">
              Recarregue a página ou faça login novamente.
            </p>
          </div>
        )}

        {user && (
          <>
            <section className="rounded-[24px] border border-[#252b27] bg-[#111411] p-5 shadow-xl shadow-black/10">
              <div className="flex items-center gap-4">
                <span
                  aria-hidden="true"
                  className="grid h-14 w-14 shrink-0 place-items-center rounded-[18px] bg-[#1b3426] text-sm font-bold text-[#70e39b]"
                >
                  {getInitials(user.name)}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold tracking-[-0.025em] text-[#f5f7f5]">
                    {user.name}
                  </p>

                  <p className="mt-1 truncate text-xs text-[#8d958f]">
                    {user.email}
                  </p>
                </div>
              </div>

              <dl className="mt-5 grid gap-3 border-t border-[#252b27] pt-5">
                <div className="rounded-2xl border border-[#252b27] bg-[#090d0a] p-4">
                  <dt className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#737c76]">
                    <UserCircle aria-hidden="true" className="h-4 w-4" />
                    Perfil de acesso
                  </dt>

                  <dd className="mt-2 text-sm font-medium text-[#d9dedb]">
                    {roleLabels[user.role]}
                  </dd>
                </div>

                <div className="rounded-2xl border border-[#252b27] bg-[#090d0a] p-4">
                  <dt className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#737c76]">
                    <Mail aria-hidden="true" className="h-4 w-4" />
                    E-mail
                  </dt>

                  <dd className="mt-2 truncate text-sm font-medium text-[#d9dedb]">
                    {user.email}
                  </dd>
                </div>
              </dl>
            </section>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className="flex min-h-[58px] w-full items-center justify-between gap-4 rounded-[20px] border border-[#252b27] bg-[#111411] px-5 text-left shadow-xl shadow-black/10 transition hover:border-[#70e39b]/30 hover:bg-[#141814]"
              >
                <span className="flex items-center gap-3">
                  <Settings
                    aria-hidden="true"
                    className="h-5 w-5 text-[#969f99]"
                  />

                  <span className="block text-base font-medium text-[#cfd6d2]">
                    Preferências
                  </span>
                </span>

                <ChevronRight
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0 text-[#969f99]"
                />
              </button>

              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(true)}
                disabled={logoutMutation.isPending}
                className="flex min-h-[58px] w-full items-center justify-between gap-4 rounded-[20px] border border-[#252b27] bg-[#111411] px-5 text-left shadow-xl shadow-black/10 transition hover:border-red-400/25 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="flex items-center gap-3">
                  <LogOut
                    aria-hidden="true"
                    className="h-5 w-5 text-[#969f99]"
                  />

                  <span className="text-base font-medium text-[#cfd6d2]">
                    Sair da conta
                  </span>
                </span>

                <ChevronRight
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0 text-[#969f99]"
                />
              </button>
            </div>
          </>
        )}
      </div>

      {isPasswordModalOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="change-password-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsPasswordModalOpen(false);
            }
          }}
        >
          <div className="w-full max-w-[390px] overflow-hidden rounded-[26px] border border-[#252b27] bg-[#111411] shadow-2xl shadow-black/60">
            <div className="flex items-start justify-between gap-4 border-b border-[#252b27] px-5 py-5">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1d3828] text-[#70e39b]">
                  <Settings aria-hidden="true" className="h-5 w-5" />
                </span>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#70e39b]">
                    Preferências
                  </p>

                  <h2
                    id="change-password-title"
                    className="mt-1 text-lg font-semibold tracking-[-0.035em] text-[#f5f7f5]"
                  >
                    Alterar senha
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[#9aa39d]">
                    Confirme sua senha atual antes de definir uma nova.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#252b27] bg-[#090d0a] text-[#969f99] transition hover:border-[#70e39b]/35 hover:text-[#f5f7f5]"
                aria-label="Fechar alteração de senha"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[72vh] overflow-y-auto p-5">
              <ChangePasswordForm
                variant="plain"
                onSuccess={() => {
                  setIsPasswordModalOpen(false);
                  setSuccessMessage("Senha alterada com sucesso.");
                }}
              />
            </div>
          </div>
        </div>
      )}

      {isLogoutConfirmOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-confirm-title"
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
                  id="logout-confirm-title"
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
