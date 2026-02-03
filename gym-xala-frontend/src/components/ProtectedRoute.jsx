import { Navigate } from "react-router-dom";
import { getToken, getRole } from "../utils/auth";

const ProtectedRoute = ({ children, allowRoles }) => {
  const token = getToken();
  const role = getRole();

  // ❌ Chưa đăng nhập
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Sai role
  if (allowRoles && !allowRoles.includes(role)) {
    return <h2 style={{ textAlign: "center" }}>403 - Không có quyền truy cập</h2>;
  }

  // ✅ OK
  return children;
};

export default ProtectedRoute;

