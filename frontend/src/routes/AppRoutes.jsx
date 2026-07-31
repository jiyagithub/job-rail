import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Organizations from "../pages/Organizations";
import OrganizationDetail from "../pages/OrganizationDetail";
import ProjectDetail from "../pages/ProjectDetail";
import QueueDetail from "../pages/QueueDetail";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ProtectedRoute from "./ProtectedRoute";
import DeadLetterQueue from "../pages/DeadLetterQueue";
import Analytics from "../pages/Analytics";
import Profile from "../pages/Profile";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/organizations"
        element={
          <ProtectedRoute>
            <Organizations />
          </ProtectedRoute>
        }
      />

      <Route
        path="/organizations/:orgId"
        element={
          <ProtectedRoute>
            <OrganizationDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/organizations/:orgId/projects/:projectId"
        element={
          <ProtectedRoute>
            <ProjectDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/organizations/:orgId/projects/:projectId/queues/:queueId"
        element={
          <ProtectedRoute>
            <QueueDetail />
          </ProtectedRoute>
        }
      />

      <Route path="/dead-letter" element={<ProtectedRoute><DeadLetterQueue /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    </Routes>
  );
}

export default AppRoutes;