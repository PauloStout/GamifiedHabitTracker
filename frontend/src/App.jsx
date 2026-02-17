import { Routes, Route } from "react-router-dom";
import Dashboard from "./components/dashboard";
import Progress from "./components/Progress";
import Social from "./components/Social";
import Settings from "./components/Settings";
import Auth from "./components/auth.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/MainLayout";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Auth />} />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/social" element={<Social />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;