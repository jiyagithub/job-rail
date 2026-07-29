import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Organizations from "../pages/Organizations";
import Projects from "../pages/Projects";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ProtectedRoute from "./ProtectedRoute";
import Jobs from "../pages/Jobs";
import Queues from "../pages/Queues";
import Workers from "../pages/Workers";
import JobLogs from "../pages/JobLogs";
import ExecutionHistory from "../pages/ExecutionHistory";
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
        path="/projects"
        element={
          <ProtectedRoute>
            <Projects />
          </ProtectedRoute>
        }
      />

      <Route
  path="/queues"
  element={
    <ProtectedRoute>
      <Queues />
    </ProtectedRoute>
  }
/>

<Route
  path="/jobs"
  element={
    <ProtectedRoute>
      <Jobs />
    </ProtectedRoute>
  }
/>

<Route
  path="/workers"
  element={
    <ProtectedRoute>
      <Workers />
    </ProtectedRoute>
  }
/>

<Route path="/logs" element={<ProtectedRoute><JobLogs /></ProtectedRoute>} />
<Route path="/executions" element={<ProtectedRoute><ExecutionHistory /></ProtectedRoute>} />
<Route path="/dead-letter" element={<ProtectedRoute><DeadLetterQueue /></ProtectedRoute>} />
<Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
<Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

    </Routes>
  );
}

export default AppRoutes;