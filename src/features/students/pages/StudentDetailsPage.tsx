import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router";

import { useAuthenticatedUser } from "../../auth/hooks/useAuthenticatedUser";
import {
  getStudentCurrentWorkout,
  getStudentWorkouts,
} from "../../student-workout/services/studentWorkoutService";
import { getWorkouts } from "../../workouts/services/workoutService";
import { StudentActionsCard } from "../components/StudentActionsCard";
import { StudentAssignedWorkoutsCard } from "../components/StudentAssignedWorkoutsCard";
import { StudentCurrentWorkoutCard } from "../components/StudentCurrentWorkoutCard";
import { StudentProfileCard } from "../components/StudentProfileCard";
import { getStudentsByOrganization } from "../services/studentService";

type StudentDetailsLocationState = {
  startEditing?: boolean;
};

export function StudentDetailsPage() {
  const params = useParams();
  const location = useLocation();
  const authenticatedUserQuery = useAuthenticatedUser();
  const locationState = location.state as StudentDetailsLocationState | null;

  const [isEditingStudent, setIsEditingStudent] = useState(
    Boolean(locationState?.startEditing),
  );
  const [studentSuccessMessage, setStudentSuccessMessage] = useState<
    string | null
  >(null);
  const [isAssigningWorkout, setIsAssigningWorkout] = useState(false);
  const [workoutSuccessMessage, setWorkoutSuccessMessage] = useState<
    string | null
  >(null);

  const studentId = Number(params.studentId);
  const organizationId = authenticatedUserQuery.data?.organizationId;
  const hasInvalidStudentId = !Number.isFinite(studentId) || studentId <= 0;

  const studentsQuery = useQuery({
    queryKey: ["students", organizationId],
    queryFn: () => getStudentsByOrganization(Number(organizationId)),
    enabled: Boolean(organizationId),
  });

  const currentWorkoutQuery = useQuery({
    queryKey: ["student-current-workout", studentId],
    queryFn: () => getStudentCurrentWorkout(studentId),
    enabled: !hasInvalidStudentId,
    retry: false,
  });

  const studentWorkoutsQuery = useQuery({
    queryKey: ["student-workouts", studentId],
    queryFn: () => getStudentWorkouts(studentId),
    enabled: !hasInvalidStudentId,
  });

  const workoutsQuery = useQuery({
    queryKey: ["workouts"],
    queryFn: getWorkouts,
    enabled: isAssigningWorkout,
  });

  const student = studentsQuery.data?.find((item) => item.id === studentId);
  const currentWorkout = currentWorkoutQuery.data;

  const studentWorkoutHistory =
    studentWorkoutsQuery.data
      ?.slice()
      .sort(
        (firstWorkout, secondWorkout) =>
          new Date(secondWorkout.assignedAt).getTime() -
          new Date(firstWorkout.assignedAt).getTime(),
      ) ?? [];

  const hasActiveAssignedWorkouts = studentWorkoutHistory.some(
    (workout) => workout.status === "ACTIVE",
  );

  const activeWorkouts =
    workoutsQuery.data?.filter((workout) => workout.status === "ACTIVE") ?? [];

  useEffect(() => {
    if (locationState?.startEditing) {
      window.history.replaceState({}, document.title);
    }
  }, [locationState?.startEditing]);

  function handleStartEditingStudent() {
    setStudentSuccessMessage(null);
    setWorkoutSuccessMessage(null);
    setIsAssigningWorkout(false);
    setIsEditingStudent(true);
  }

  function handleStartAssigningWorkout() {
    setStudentSuccessMessage(null);
    setWorkoutSuccessMessage(null);
    setIsEditingStudent(false);
    setIsAssigningWorkout(true);
  }

  if (hasInvalidStudentId) {
    return (
      <div className="mx-auto w-full max-w-[1435px]">
        <p className="text-3xl font-semibold text-[#f5f7f5]">
          Aluno não encontrado
        </p>
        <Link
          to="/admin/students"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#9ca7a1] hover:text-[#70e39b]"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para alunos
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1435px]">
      <Link
        to="/admin/students"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#89948e] transition hover:text-[#70e39b]"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Voltar para alunos
      </Link>

      <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#89968f]">
            Perfil do aluno
          </p>
          <h1 className="mt-4 text-[36px] font-semibold leading-none tracking-[-0.045em] text-[#f5f7f5] sm:text-[42px]">
            {student?.name ?? "Detalhes do aluno"}
          </h1>
          <p className="mt-4 text-sm text-[#89948e]">
            Dados, treino atual e histórico de atribuições em um só lugar.
          </p>
        </div>

        {student && (
          <span
            className={[
              "inline-flex min-h-7 w-fit items-center rounded-full px-3 text-[10px] font-semibold uppercase tracking-[0.04em]",
              student.active
                ? "bg-[#183725] text-[#70e39b]"
                : "bg-[#292c2a] text-[#9aa29d]",
            ].join(" ")}
          >
            {student.active ? "Ativo" : "Inativo"}
          </span>
        )}
      </div>

      <div className="mt-9 grid gap-4 xl:grid-cols-[430px_minmax(0,1fr)] xl:items-start">
        <div className="space-y-4">
          <StudentProfileCard
            student={student}
            isLoading={studentsQuery.isLoading}
            isError={studentsQuery.isError}
            isEditing={isEditingStudent}
            successMessage={studentSuccessMessage}
            onStartEditing={handleStartEditingStudent}
            onCancelEditing={() => {
              setStudentSuccessMessage(null);
              setIsEditingStudent(false);
            }}
            onEditSuccess={() => {
              setIsEditingStudent(false);
              setStudentSuccessMessage("Aluno atualizado com sucesso.");
            }}
          />

          <StudentActionsCard
            student={student}
            currentWorkout={currentWorkout}
            isEditingStudent={isEditingStudent}
            onStartEditing={handleStartEditingStudent}
            onStartAssigningWorkout={handleStartAssigningWorkout}
          />
        </div>

        <div className="space-y-4">
          <StudentCurrentWorkoutCard
            studentId={studentId}
            isStudentActive={student?.active ?? false}
            currentWorkout={currentWorkout}
            hasActiveAssignedWorkouts={hasActiveAssignedWorkouts}
            assignedWorkouts={studentWorkoutHistory}
            isLoading={studentsQuery.isLoading || currentWorkoutQuery.isLoading}
            isError={currentWorkoutQuery.isError}
            error={currentWorkoutQuery.error}
            isAssigningWorkout={isAssigningWorkout}
            workoutSuccessMessage={workoutSuccessMessage}
            activeWorkouts={activeWorkouts}
            isWorkoutsLoading={workoutsQuery.isLoading}
            onStartAssigningWorkout={handleStartAssigningWorkout}
            onCancelAssigningWorkout={() => {
              setWorkoutSuccessMessage(null);
              setIsAssigningWorkout(false);
            }}
            onAssignWorkoutSuccess={async () => {
              await currentWorkoutQuery.refetch();
              await studentWorkoutsQuery.refetch();
              setIsAssigningWorkout(false);
              setWorkoutSuccessMessage(
                currentWorkout
                  ? "Treino atualizado com sucesso."
                  : "Treino atribuído com sucesso.",
              );
            }}
          />

          <StudentAssignedWorkoutsCard
            studentId={studentId}
            studentWorkouts={studentWorkoutHistory}
            isLoading={studentWorkoutsQuery.isLoading}
            isError={studentWorkoutsQuery.isError}
            onDeactivateSuccess={async () => {
              await currentWorkoutQuery.refetch();
              await studentWorkoutsQuery.refetch();
            }}
          />
        </div>
      </div>
    </div>
  );
}
