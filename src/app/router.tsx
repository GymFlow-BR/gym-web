import { Navigate, Route, Routes } from 'react-router'

import { AdminLayout } from '../components/layout/AdminLayout'
import { StudentLayout } from '../components/layout/StudentLayout'
import { AdminDashboardPage } from '../features/admin/pages/AdminDashboardPage'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { AdminExercisesPage } from '../features/exercises/pages/AdminExercisesPage'
import { NotFoundPage } from '../features/not-found/pages/NotFoundPage'
import { AdminStudentsPage } from '../features/students/pages/AdminStudentsPage'
import { StudentCurrentWorkoutPage } from '../features/student-workout/pages/StudentCurrentWorkoutPage'
import { AdminWorkoutsPage } from '../features/workouts/pages/AdminWorkoutsPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/admin"
        element={
          <AdminLayout>
            <AdminDashboardPage />
          </AdminLayout>
        }
      />

      <Route
        path="/admin/workouts"
        element={
          <AdminLayout>
            <AdminWorkoutsPage />
          </AdminLayout>
        }
      />

      <Route
        path="/admin/exercises"
        element={
          <AdminLayout>
            <AdminExercisesPage />
          </AdminLayout>
        }
      />

      <Route
        path="/admin/students"
        element={
          <AdminLayout>
            <AdminStudentsPage />
          </AdminLayout>
        }
      />

      <Route
        path="/student/current-workout"
        element={
          <StudentLayout>
            <StudentCurrentWorkoutPage />
          </StudentLayout>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}