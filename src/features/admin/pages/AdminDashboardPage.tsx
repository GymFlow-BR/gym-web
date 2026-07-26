import { useQueries, useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Dumbbell,
  Search,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";

import { useAuthenticatedUser } from "../../auth/hooks/useAuthenticatedUser";
import { getExercises } from "../../exercises/services/exerciseService";
import { getStudentWorkouts } from "../../student-workout/services/studentWorkoutService";
import { getStudentsByOrganization } from "../../students/services/studentService";
import type { Student } from "../../students/types/student";
import { getWorkouts } from "../../workouts/services/workoutService";

type MetricCardProps = {
  label: string;
  value: number | null;
  to: string;
  icon: LucideIcon;
  isLoading: boolean;
};

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function formatCurrentDate() {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  })
    .format(new Date())
    .toUpperCase();
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getFirstName(name?: string) {
  return name?.trim().split(/\s+/)[0] || "professor";
}

function getCreatedAtTime(student: Student) {
  if (!student.createdAt) {
    return 0;
  }

  const timestamp = new Date(student.createdAt).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function MetricCard({
  label,
  value,
  to,
  icon: Icon,
  isLoading,
}: MetricCardProps) {
  return (
    <Link
      to={to}
      className="group flex min-h-[102px] items-center gap-4 rounded-[18px] border border-[#2b322e] bg-[#171a18] px-5 py-4 transition-colors hover:border-[#315640] hover:bg-[#1b201d] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#70e39b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0f0e]"
    >
      <span
        aria-hidden="true"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1d3628] text-[#70e39b]"
      >
        <Icon className="h-[22px] w-[22px]" strokeWidth={1.8} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[13px] text-[#929c96]">{label}</span>

        {isLoading ? (
          <span className="mt-2 block h-7 w-10 animate-pulse rounded-md bg-[#262d29]" />
        ) : (
          <span className="mt-1 block text-[23px] font-semibold leading-none tracking-[-0.04em] text-[#f5f7f5]">
            {String(value ?? 0).padStart(2, "0")}
          </span>
        )}
      </span>

      <ArrowRight
        aria-hidden="true"
        className="h-5 w-5 shrink-0 text-[#8d9891] transition-transform group-hover:translate-x-1 group-hover:text-[#70e39b]"
        strokeWidth={1.8}
      />
    </Link>
  );
}

function RecentStudentSkeleton() {
  return (
    <div className="flex min-h-[68px] items-center gap-3.5 px-5 py-3">
      <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-[#252c28]" />

      <div className="flex-1">
        <div className="h-4 w-32 animate-pulse rounded bg-[#252c28]" />
        <div className="mt-2 h-3 w-24 animate-pulse rounded bg-[#202622]" />
      </div>

      <div className="h-8 w-16 animate-pulse rounded-full bg-[#252c28]" />
    </div>
  );
}

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");

  const authenticatedUserQuery = useAuthenticatedUser();
  const organizationId = authenticatedUserQuery.data?.organizationId;

  const studentsQuery = useQuery({
    queryKey: ["students", organizationId],
    queryFn: () => getStudentsByOrganization(Number(organizationId)),
    enabled: Boolean(organizationId),
  });

  const workoutsQuery = useQuery({
    queryKey: ["workouts"],
    queryFn: getWorkouts,
  });

  const exercisesQuery = useQuery({
    queryKey: ["exercises"],
    queryFn: getExercises,
  });

  const activeStudents = useMemo(() => {
    return studentsQuery.data?.filter((student) => student.active) ?? [];
  }, [studentsQuery.data]);

  const activeWorkouts = useMemo(() => {
    return (
      workoutsQuery.data?.filter((workout) => workout.status === "ACTIVE") ?? []
    );
  }, [workoutsQuery.data]);

  const activeExercises = useMemo(() => {
    return exercisesQuery.data?.filter((exercise) => exercise.active) ?? [];
  }, [exercisesQuery.data]);

  const recentStudents = useMemo(() => {
    return [...activeStudents]
      .sort(
        (firstStudent, secondStudent) =>
          getCreatedAtTime(secondStudent) - getCreatedAtTime(firstStudent),
      )
      .slice(0, 3);
  }, [activeStudents]);

  const studentWorkoutQueries = useQueries({
    queries: recentStudents.map((student) => ({
      queryKey: ["student-workouts", student.id],
      queryFn: () => getStudentWorkouts(student.id),
      enabled: Boolean(student.id),
      retry: false,
    })),
  });

  const isMetricsLoading =
    authenticatedUserQuery.isLoading ||
    studentsQuery.isLoading ||
    workoutsQuery.isLoading ||
    exercisesQuery.isLoading;

  const hasDashboardError =
    authenticatedUserQuery.isError ||
    studentsQuery.isError ||
    workoutsQuery.isError ||
    exercisesQuery.isError;

  const firstName = getFirstName(authenticatedUserQuery.data?.name);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const searchTerm = normalizeSearch(searchValue);

    if (!searchTerm) {
      return;
    }

    if (searchTerm.includes("aluno") || searchTerm.includes("estudante")) {
      navigate("/admin/students");
      return;
    }

    if (searchTerm.includes("treino") || searchTerm.includes("workout")) {
      navigate("/admin/workouts");
      return;
    }

    if (searchTerm.includes("exercicio") || searchTerm.includes("atividade")) {
      navigate("/admin/exercises");
      return;
    }

    navigate("/admin/students");
  }

  return (
    <div>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <header>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7f8b84]">
            Área do professor
          </p>

          <h1 className="mt-4 text-[36px] font-semibold leading-none tracking-[-0.055em] text-[#f5f7f5] sm:text-[40px]">
            Visão geral
          </h1>
        </header>

        <form role="search" onSubmit={handleSearch} className="hidden sm:block">
          <label className="flex h-12 w-[240px] items-center gap-3 rounded-xl border border-[#2b322e] bg-[#141715] px-4 text-[#849088] transition-colors focus-within:border-[#41654d]">
            <Search
              aria-hidden="true"
              className="h-[18px] w-[18px] shrink-0"
              strokeWidth={1.8}
            />

            <input
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Pesquisar"
              aria-label="Pesquisar na área administrativa"
              className="min-w-0 flex-1 bg-transparent text-[13px] text-[#f2f5f3] outline-none placeholder:text-[#69736d]"
            />
          </label>
        </form>
      </div>

      {hasDashboardError && (
        <div
          role="alert"
          className="mt-8 rounded-2xl border border-[#633d3b] bg-[#251918] px-5 py-4 text-[14px] leading-6 text-[#ffaaa4]"
        >
          Não foi possível carregar todos os dados da Visão geral. Tente
          atualizar a página.
        </div>
      )}

      <section className="relative mt-12 overflow-hidden rounded-[24px] border border-[#284a36] bg-[linear-gradient(110deg,#171a18_0%,#181c19_58%,#1d2821_100%)] px-6 py-7 sm:px-10 sm:py-8 lg:px-12">
        <div className="relative z-10 max-w-[760px]">
          <span className="inline-flex rounded-full bg-[#24323a] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8cc5ff]">
            {formatCurrentDate()}
          </span>

          <h2 className="mt-6 text-[29px] font-semibold leading-tight tracking-[-0.045em] text-[#f5f7f5] sm:text-[36px]">
            Bom trabalho, {firstName}.
          </h2>

          <p className="mt-3 max-w-[620px] text-[14px] leading-6 text-[#98a29c]">
            Você tem{" "}
            <strong className="font-medium text-[#c8d0cb]">
              {studentsQuery.isLoading ? "—" : activeStudents.length} alunos
              ativos
            </strong>{" "}
            e{" "}
            <strong className="font-medium text-[#c8d0cb]">
              {workoutsQuery.isLoading ? "—" : activeWorkouts.length} treinos
              modelo
            </strong>{" "}
            prontos para atribuição.
          </p>
        </div>

        <div
          aria-hidden="true"
          className="absolute right-10 top-1/2 hidden h-[88px] w-[88px] -translate-y-1/2 rotate-[-7deg] items-center justify-center rounded-[28px] border border-[#355440] bg-[#223b2c] text-[#70e39b] lg:flex"
        >
          <Dumbbell className="h-8 w-8" strokeWidth={1.8} />
        </div>

        <div
          aria-hidden="true"
          className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#3d8c5b]/10 blur-3xl"
        />
      </section>

      <section
        aria-label="Indicadores da operação"
        className="mt-4 grid gap-4 md:grid-cols-3"
      >
        <MetricCard
          label="Alunos ativos"
          value={activeStudents.length}
          to="/admin/students"
          icon={Users}
          isLoading={isMetricsLoading}
        />

        <MetricCard
          label="Treinos modelo"
          value={activeWorkouts.length}
          to="/admin/workouts"
          icon={Dumbbell}
          isLoading={isMetricsLoading}
        />

        <MetricCard
          label="Exercícios"
          value={activeExercises.length}
          to="/admin/exercises"
          icon={Zap}
          isLoading={isMetricsLoading}
        />
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7f8b84]">
              Acesso rápido
            </p>

            <h2 className="mt-2.5 text-[25px] font-semibold tracking-[-0.045em] text-[#f5f7f5]">
              Alunos recentes
            </h2>
          </div>

          <Link
            to="/admin/students"
            className="group flex shrink-0 items-center gap-3 rounded-lg px-2 py-2 text-[14px] font-medium text-[#b9c2bc] transition-colors hover:text-[#70e39b] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#70e39b]"
          >
            Ver todos
            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              strokeWidth={1.8}
            />
          </Link>
        </div>

        <div className="mt-5 overflow-hidden rounded-[20px] border border-[#2b322e] bg-[#171a18]">
          {studentsQuery.isLoading ? (
            <>
              <RecentStudentSkeleton />

              <div className="border-t border-[#2b322e]">
                <RecentStudentSkeleton />
              </div>

              <div className="border-t border-[#2b322e]">
                <RecentStudentSkeleton />
              </div>
            </>
          ) : recentStudents.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-[15px] font-medium text-[#d7ddd9]">
                Nenhum aluno cadastrado
              </p>

              <p className="mt-2 text-[13px] text-[#87918b]">
                Os alunos cadastrados aparecerão aqui.
              </p>

              <Link
                to="/admin/students"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#70e39b] px-4 py-3 text-[13px] font-semibold text-[#0d120f] transition-colors hover:bg-[#82eba8]"
              >
                Ir para alunos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            recentStudents.map((student, index) => {
              const workoutQuery = studentWorkoutQueries[index];

              const activeStudentWorkout = workoutQuery.data?.find(
                (studentWorkout) => studentWorkout.status === "ACTIVE",
              );

              const hasActiveWorkout = Boolean(activeStudentWorkout);

              return (
                <Link
                  key={student.id}
                  to={`/admin/students/${student.id}`}
                  className={[
                    "group flex min-h-[68px] items-center gap-3.5 px-5 py-3 transition-colors hover:bg-[#1c201d] focus:outline-none focus-visible:bg-[#1c201d]",
                    index > 0 ? "border-t border-[#2b322e]" : "",
                  ].join(" ")}
                >
                  <span
                    aria-hidden="true"
                    className={[
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[12px] font-semibold uppercase",
                      index % 3 === 0
                        ? "bg-[#302d3b] text-[#c69bff]"
                        : index % 3 === 1
                          ? "bg-[#253038] text-[#82bfff]"
                          : "bg-[#352d26] text-[#ffad73]",
                    ].join(" ")}
                  >
                    {getInitials(student.name)}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-semibold text-[#f3f6f4]">
                      {student.name}
                    </span>

                    {workoutQuery.isLoading ? (
                      <span className="mt-2 block h-3 w-24 animate-pulse rounded bg-[#282f2b]" />
                    ) : (
                      <span className="mt-1 block truncate text-[12px] text-[#85918a]">
                        {activeStudentWorkout?.workoutName ?? "Sem treino"}
                      </span>
                    )}
                  </span>

                  {workoutQuery.isLoading ? (
                    <span className="h-8 w-[82px] shrink-0 animate-pulse rounded-full bg-[#252c28]" />
                  ) : (
                    <span
                      className={[
                        "inline-flex min-h-8 shrink-0 items-center justify-center rounded-full px-3.5 py-2 text-[11px] font-semibold uppercase leading-none tracking-[0.04em]",
                        hasActiveWorkout
                          ? "bg-[#1c3828] text-[#70e39b]"
                          : "bg-[#383321] text-[#ffd665]",
                      ].join(" ")}
                    >
                      {hasActiveWorkout ? "Ativo" : "Pendente"}
                    </span>
                  )}

                  <ArrowRight
                    aria-hidden="true"
                    className="hidden h-4 w-4 shrink-0 text-[#727d76] transition-transform group-hover:translate-x-1 group-hover:text-[#70e39b] sm:block"
                    strokeWidth={1.8}
                  />
                </Link>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
