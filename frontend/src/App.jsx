import {Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/dashboard";
import Auth from "./components/auth.jsx";

const isAuthenticated = () => {
  return !!localStorage.getItem("accessToken");
};

const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

function App() {
  return (
      <Routes>
        <Route path="/auth" element={<Auth />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
  );
}

export default App;
