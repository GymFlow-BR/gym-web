import { Navigate, Route, Routes } from 'react-router'

import { AdminLayout } from '../components/layout/AdminLayout'
import { StudentLayout } from '../components/layout/StudentLayout'
import { AdminDashboardPage } from '../features/admin/pages/AdminDashboardPage'
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute'
import { PublicOnlyRoute } from '../features/auth/components/PublicOnlyRoute'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { AdminExercisesPage } from '../features/exercises/pages/AdminExercisesPage'
import { NotFoundPage } from '../features/not-found/pages/NotFoundPage'
import { AdminStudentsPage } from '../features/students/pages/AdminStudentsPage'
import { StudentCurrentWorkoutPage } from '../features/student-workout/pages/StudentCurrentWorkoutPage'
import { AdminWorkoutsPage } from '../features/workouts/pages/AdminWorkoutsPage'
import { WorkoutDetailsPage } from '../features/workouts/pages/WorkoutDetailsPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
            <AdminLayout>
              <AdminDashboardPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/workouts"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
            <AdminLayout>
              <AdminWorkoutsPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/workouts/:workoutId"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
            <AdminLayout>
              <WorkoutDetailsPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/exercises"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
            <AdminLayout>
              <AdminExercisesPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/students"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
            <AdminLayout>
              <AdminStudentsPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/current-workout"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentLayout>
              <StudentCurrentWorkoutPage />
            </StudentLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}