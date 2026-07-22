import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { PageHeader } from "../../../components/layout/PageHeader";
import { useAuthenticatedUser } from "../../auth/hooks/useAuthenticatedUser";
import { getWorkouts } from "../../workouts/services/workoutService";
import { AssignWorkoutForm } from "../components/AssignWorkoutForm";
import { CreateStudentForm } from "../components/CreateStudentForm";
import { StudentsList } from "../components/StudentsList";
import { getStudentsByOrganization } from "../services/studentService";

export function AdminStudentsPage() {
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

  const activeWorkouts = useMemo(() => {
    return (
      workoutsQuery.data?.filter((workout) => workout.status === "ACTIVE") ?? []
    );
  }, [workoutsQuery.data]);

  const isLoading =
    authenticatedUserQuery.isLoading ||
    studentsQuery.isLoading ||
    workoutsQuery.isLoading;

  const hasLoadError =
    authenticatedUserQuery.isError ||
    studentsQuery.isError ||
    workoutsQuery.isError;

  const students = studentsQuery.data ?? [];

  return (
    <>
      <PageHeader
        title="Alunos"
        description="Gerencie os alunos vinculados à sua academia ou assessoria."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
        <div className="space-y-6">
          <CreateStudentForm organizationId={organizationId} />

          <StudentsList
            students={students}
            isLoading={isLoading}
            hasLoadError={hasLoadError}
          />
        </div>

        <AssignWorkoutForm
          students={students}
          activeWorkouts={activeWorkouts}
          isLoading={isLoading}
        />
      </div>
    </>
  );
}
