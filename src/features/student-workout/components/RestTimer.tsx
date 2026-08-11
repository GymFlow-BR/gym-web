import { Clock3, Pause, Play, RotateCcw, X } from "lucide-react";

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

  if (isActive && remainingRestSeconds !== null) {
    return (
      <section className="mt-4 overflow-hidden rounded-[22px] border border-[#2f5b40] bg-[#0d130f]">
        <div className="border-b border-[#26322b] bg-[#122018] px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#1d3828] text-[#70e39b]">
                <Clock3 aria-hidden="true" className="h-4 w-4" />
              </span>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#70e39b]">
                  {isPaused ? "Descanso pausado" : "Descanso em andamento"}
                </p>
                <p className="mt-0.5 text-xs text-[#8fa098]">
                  Prepare-se para a próxima série.
                </p>
              </div>
            </div>

            <p className="text-[28px] font-bold tracking-[-0.06em] text-[#f5f7f5]">
              {formatTimer(remainingRestSeconds)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 p-3">
          {isPaused ? (
            <button
              type="button"
              onClick={onResume}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[#70e39b]/25 bg-[#1d3828] text-sm font-bold text-[#70e39b] transition hover:bg-[#254432]"
            >
              <Play aria-hidden="true" className="h-4 w-4" />
              Retomar
            </button>
          ) : (
            <button
              type="button"
              onClick={onPause}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[#354239] bg-[#151e18] text-sm font-bold text-[#d8dedb] transition hover:border-[#4a5b4f]"
            >
              <Pause aria-hidden="true" className="h-4 w-4" />
              Pausar
            </button>
          )}

          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 text-sm font-bold text-red-200 transition hover:bg-red-500/15"
          >
            <X aria-hidden="true" className="h-4 w-4" />
            Cancelar
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="mt-4 flex items-center justify-between gap-3 rounded-[20px] border border-[#26322b] bg-[#0d130f] px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#17221b] text-[#70e39b]">
          <Clock3 aria-hidden="true" className="h-4 w-4" />
        </span>

        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#77847d]">
            Descanso recomendado
          </p>
          <p className="mt-0.5 text-sm font-semibold text-[#f5f7f5]">
            {formatRestTime(restTimeSeconds)}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onStart}
        className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-2xl border border-[#70e39b]/25 bg-[#1d3828] px-3 text-xs font-bold text-[#70e39b] transition hover:bg-[#254432]"
      >
        <RotateCcw aria-hidden="true" className="h-4 w-4" />
        Iniciar
      </button>
    </div>
  );
}
