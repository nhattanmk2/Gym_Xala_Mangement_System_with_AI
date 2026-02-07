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

import MemberLayout from "./pages/member/MemberLayout";
import MemberBooking from "./pages/member/booking/MemberBooking";
import MemberPackages from "./pages/member/packages/MemberPackages";
import MemberProfile from "./pages/member/profile/MemberProfile";
import MemberSchedule from "./pages/member/schedule/MemberSchedule";


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
          path="/member"
          element={
            <ProtectedRoute allowRoles={["ROLE_MEMBER"]}>
              <MemberLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<MemberDashboard />} />
          <Route path="booking" element={<MemberBooking />} />
          <Route path="packages" element={<MemberPackages />} />
          <Route path="profile" element={<MemberProfile />} />
          <Route path="schedule" element={<MemberSchedule />} />
        </Route>

        {/* DEFAULT */}
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
