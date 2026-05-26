import { NavLink, Link } from "react-router-dom";
import "./ptSidebar.css";

const PTSidebar = () => {
  return (
    <div className="pt-sidebar">
      <h2 className="logo">
        <Link to="/pt/dashboard" style={{ color: 'inherit', textDecoration: 'none' }}>GYM XALA</Link>
      </h2>

      <nav className="sidebar-nav">
        <NavLink to="/pt/dashboard" className={({ isActive }) => isActive ? "active" : ""}>
          Dashboard
        </NavLink>
        <NavLink to="/pt/clients" className={({ isActive }) => isActive ? "active" : ""}>
          Học viên của tôi
        </NavLink>
        <NavLink to="/pt/schedule" className={({ isActive }) => isActive ? "active" : ""}>
          Lịch dạy học
        </NavLink>
        <NavLink to="/pt/personal-schedule" className={({ isActive }) => isActive ? "active" : ""}>
          Lịch bận cá nhân
        </NavLink>
        <div className="nav-divider"></div>
        <NavLink to="/pt/profile" className={({ isActive }) => isActive ? "active" : ""}>
          Hồ sơ của tôi
        </NavLink>
      </nav>
    </div>
  );
};

export default PTSidebar;

