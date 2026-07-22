import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router";

import { PageHeader } from "../../../components/layout/PageHeader";
import { Card } from "../../../components/ui/Card";
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

export function StudentDetailsPage() {
  const params = useParams();
  const authenticatedUserQuery = useAuthenticatedUser();

  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [studentSuccessMessage, setStudentSuccessMessage] = useState<
    string | null
  >(null);

  const [isAssigningWorkout, setIsAssigningWorkout] = useState(false);
  const [workoutSuccessMessage, setWorkoutSuccessMessage] = useState<
    string | null
  >(null);

  const studentId = Number(params.studentId);
  const organizationId = authenticatedUserQuery.data?.organizationId;

  const studentsQuery = useQuery({
    queryKey: ["students", organizationId],
    queryFn: () => getStudentsByOrganization(Number(organizationId)),
    enabled: Boolean(organizationId),
  });

  const currentWorkoutQuery = useQuery({
    queryKey: ["student-current-workout", studentId],
    queryFn: () => getStudentCurrentWorkout(studentId),
    enabled: Number.isFinite(studentId) && studentId > 0,
    retry: false,
  });

  const studentWorkoutsQuery = useQuery({
    queryKey: ["student-workouts", studentId],
    queryFn: () => getStudentWorkouts(studentId),
    enabled: Number.isFinite(studentId) && studentId > 0,
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

  const activeWorkouts =
    workoutsQuery.data?.filter((workout) => workout.status === "ACTIVE") ?? [];

  const isLoading = studentsQuery.isLoading || currentWorkoutQuery.isLoading;
  const hasInvalidStudentId = !Number.isFinite(studentId) || studentId <= 0;

  function handleStartEditingStudent() {
    setStudentSuccessMessage(null);
    setWorkoutSuccessMessage(null);
    setIsAssigningWorkout(false);
    setIsEditingStudent(true);
  }

  function handleCancelEditingStudent() {
    setStudentSuccessMessage(null);
    setIsEditingStudent(false);
  }

  function handleStartAssigningWorkout() {
    setStudentSuccessMessage(null);
    setWorkoutSuccessMessage(null);
    setIsEditingStudent(false);
    setIsAssigningWorkout(true);
  }

  function handleCancelAssigningWorkout() {
    setWorkoutSuccessMessage(null);
    setIsAssigningWorkout(false);
  }

  if (hasInvalidStudentId) {
    return (
      <>
        <PageHeader
          title="Aluno não encontrado"
          description="O identificador informado na URL não é válido."
        />

        <Card>
          <Link
            to="/admin/students"
            className="text-sm font-semibold text-[#2F4F3E] hover:underline"
          >
            Voltar para alunos
          </Link>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={student?.name ?? "Detalhes do aluno"}
        description="Centralize os dados do aluno, acompanhe o treino atual e gerencie informações básicas."
      />

      <div className="mb-6">
        <Link
          to="/admin/students"
          className="text-sm font-semibold text-[#2F4F3E] hover:underline"
        >
          ← Voltar para alunos
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)] xl:items-start">
        <div className="space-y-6">
          <StudentProfileCard
            student={student}
            isLoading={studentsQuery.isLoading}
            isError={studentsQuery.isError}
            isEditing={isEditingStudent}
            successMessage={studentSuccessMessage}
            onStartEditing={handleStartEditingStudent}
            onCancelEditing={handleCancelEditingStudent}
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

        <div className="space-y-6">
          <StudentCurrentWorkoutCard
            studentId={studentId}
            currentWorkout={currentWorkout}
            isLoading={isLoading}
            isError={currentWorkoutQuery.isError}
            error={currentWorkoutQuery.error}
            isAssigningWorkout={isAssigningWorkout}
            workoutSuccessMessage={workoutSuccessMessage}
            activeWorkouts={activeWorkouts}
            isWorkoutsLoading={workoutsQuery.isLoading}
            onStartAssigningWorkout={handleStartAssigningWorkout}
            onCancelAssigningWorkout={handleCancelAssigningWorkout}
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
            studentWorkouts={studentWorkoutHistory}
            isLoading={studentWorkoutsQuery.isLoading}
            isError={studentWorkoutsQuery.isError}
          />
        </div>
      </div>
    </>
  );
}
