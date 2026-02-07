import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import "./adminLayout.css";

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-container">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main */}
      <div className="admin-main">
        <AdminHeader />
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
