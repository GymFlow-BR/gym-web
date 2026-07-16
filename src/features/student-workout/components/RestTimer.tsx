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
    <div className="mt-4 rounded-2xl border border-[#E4DFD6] bg-[#FAF9F6] p-3">
      {isActive && remainingRestSeconds !== null ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#2F4F3E]/15 bg-[#FFFEFB] p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8378]">
              {isPaused ? "Descanso pausado" : "Descanso em andamento"}
            </p>

            <p className="mt-2 text-4xl font-bold tracking-tight text-[#2F4F3E]">
              {formatTimer(remainingRestSeconds)}
            </p>

            <p className="mt-1 text-xs text-[#6F6A62]">
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
                className="rounded-full border border-[#2F4F3E]/20 bg-[#2F4F3E]/10 px-3 py-2 text-xs font-semibold text-[#2F4F3E] transition hover:bg-[#2F4F3E]/15"
              >
                Retomar
              </button>
            ) : (
              <button
                type="button"
                onClick={onPause}
                className="rounded-full border border-[#E4DFD6] bg-[#FFFEFB] px-3 py-2 text-xs font-semibold text-[#2F4F3E] transition hover:bg-[#F3F0E8]"
              >
                Pausar
              </button>
            )}

            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-[#8A8378]">
              Descanso recomendado
            </p>

            <p className="mt-1 text-sm font-semibold text-[#1F1F1F]">
              {formatRestTime(restTimeSeconds)}
            </p>
          </div>

          <button
            type="button"
            onClick={onStart}
            className="rounded-full border border-[#2F4F3E]/20 bg-[#2F4F3E]/10 px-3 py-2 text-xs font-semibold text-[#2F4F3E] transition hover:bg-[#2F4F3E]/15"
          >
            Iniciar descanso
          </button>
        </div>
      )}
    </div>
  );
}
