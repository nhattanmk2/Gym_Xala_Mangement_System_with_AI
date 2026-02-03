import { BrowserRouter, Routes, Route } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";

import AdminDashboard from "./pages/admin/AdminDashboard";
import PTDashboard from "./pages/pt/PTDashboard";
import MemberDashboard from "./pages/member/MemberDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* ADMIN */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowRoles={["ROLE_ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* PT */}
        <Route
          path="/pt/dashboard"
          element={
            <ProtectedRoute allowRoles={["ROLE_PT"]}>
              <PTDashboard />
            </ProtectedRoute>
          }
        />

        {/* MEMBER */}
        <Route
          path="/member/dashboard"
          element={
            <ProtectedRoute allowRoles={["ROLE_MEMBER"]}>
              <MemberDashboard />
            </ProtectedRoute>
          }
        />

        {/* DEFAULT */}
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
