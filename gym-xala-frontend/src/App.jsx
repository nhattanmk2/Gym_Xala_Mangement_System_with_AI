import { BrowserRouter, Routes, Route } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import VerifyAccount from "./pages/VerifyAccount";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";

import AdminDashboard from "./pages/admin/AdminDashboard";
import PTDashboard from "./pages/pt/PTDashboard";
import MemberDashboard from "./pages/member/MemberDashboard";

import AdminMemberManagement from "./pages/admin/MemberManagement";
import AdminPackageManagement from "./pages/admin/PackageManagement";
import AdminBookingManagement from "./pages/admin/BookingManagement";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify" element={<VerifyAccount />} />
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

        <Route
          path="/admin/members"
          element={
            <ProtectedRoute allowRoles={["ROLE_ADMIN"]}>
              <AdminMemberManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/packages"
          element={
            <ProtectedRoute allowRoles={["ROLE_ADMIN"]}>
              <AdminPackageManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute allowRoles={["ROLE_ADMIN"]}>
              <AdminBookingManagement />
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
