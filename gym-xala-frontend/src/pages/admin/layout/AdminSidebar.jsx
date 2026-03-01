import { Link } from "react-router-dom";
import "./adminSidebar.css";

const AdminSidebar = () => {
  return (
    <div className="admin-sidebar">
      <h2 className="logo">GYM XALA</h2>

      <nav>
        <Link to="/admin/dashboard">Dashboard</Link>
        <Link to="/admin/members">Member Management</Link>
        <Link to="/admin/pts">PT Management</Link>
        <Link to="/admin/packages">Package Management</Link>
        <Link to="/admin/bookings">Booking Management</Link>
        <Link to="/admin/invoices">🧾 Invoice Management</Link>
      </nav>
    </div>
  );
};

export default AdminSidebar;
