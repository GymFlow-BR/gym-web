type RestTimerProps = {
  restTimeSeconds: number;
  remainingRestSeconds: number | null;
  isActive: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
};

function formatRestTime(seconds: number | null) {
  if (seconds === null) {
    return "Não informado";
  }

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (remainingSeconds === 0) {
    return `${minutes}min`;
  }

  return `${minutes}min ${remainingSeconds}s`;
}

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

export function RestTimer({
  restTimeSeconds,
  remainingRestSeconds,
  isActive,
  isPaused,
  onStart,
  onPause,
  onResume,
  onCancel,
}: RestTimerProps) {
  if (restTimeSeconds <= 0) {
    return null;
  }

  return (
    <div className="mt-4">
      {isActive && remainingRestSeconds !== null ? (
        <div className="rounded-2xl border border-white/10 bg-[#111713] p-3">
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#9FC5AE]/20 bg-[#16221B] p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#9CA89F]">
                {isPaused ? "Descanso pausado" : "Descanso em andamento"}
              </p>

              <p className="mt-2 text-4xl font-bold tracking-tight text-[#F6F4EF]">
                {formatTimer(remainingRestSeconds)}
              </p>

              <p className="mt-1 text-xs text-[#C9C3B8]">
                {isPaused
                  ? "Retome quando estiver pronto para continuar a contagem."
                  : "Use esse tempo para se preparar para a próxima série."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {isPaused ? (
                <button
                  type="button"
                  onClick={onResume}
                  className="rounded-full border border-[#9FC5AE]/30 bg-[#9FC5AE]/15 px-3 py-2 text-xs font-semibold text-[#D8F3E0] transition hover:bg-[#9FC5AE]/20"
                >
                  Retomar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onPause}
                  className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-[#F6F4EF] transition hover:bg-white/15"
                >
                  Pausar
                </button>
              )}

              <button
                type="button"
                onClick={onCancel}
                className="rounded-full border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/15"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-4">
          <div>
            <p className="text-xs font-semibold text-[#9CA89F]">
              Descanso recomendado
            </p>

            <p className="mt-1 text-sm font-semibold text-[#F6F4EF]">
              {formatRestTime(restTimeSeconds)}
            </p>
          </div>

          <button
            type="button"
            onClick={onStart}
            className="rounded-full border border-[#9FC5AE]/30 bg-[#9FC5AE]/10 px-3 py-2 text-xs font-semibold text-[#D8F3E0] transition hover:bg-[#9FC5AE]/15"
          >
            Iniciar descanso
          </button>
        </div>
      )}
    </div>
  );
}
