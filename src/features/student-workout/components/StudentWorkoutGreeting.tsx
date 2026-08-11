type StudentWorkoutGreetingProps = {
  studentName?: string | null;
};

function getGreeting() {
  const currentHour = new Date().getHours();

  if (currentHour < 12) {
    return "Bom dia";
  }

  if (currentHour < 18) {
    return "Boa tarde";
  }

  return "Boa noite";
}

function formatCurrentDate() {
  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(new Date());

  return formattedDate.toLocaleUpperCase("pt-BR");
}

function getFirstName(name?: string | null) {
  const trimmedName = name?.trim();

  if (!trimmedName) {
    return "Aluno";
  }

  return trimmedName.split(" ")[0];
}

export function StudentWorkoutGreeting({
  studentName,
}: StudentWorkoutGreetingProps) {
  const firstName = getFirstName(studentName);

  return (
    <section className="pt-1">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8fa098]">
        {formatCurrentDate()}
      </p>

      <h1 className="mt-3 text-[32px] font-semibold leading-[0.98] tracking-[-0.055em] text-[#f5f7f5]">
        {getGreeting()}, {firstName}.
      </h1>

      <p className="mt-4 max-w-[320px] text-sm leading-6 text-[#9ca8a1]">
        Seu treino está pronto. Siga no seu ritmo, uma série de cada vez.
      </p>
    </section>
  );
}
