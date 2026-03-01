import { NavLink, Outlet } from "react-router-dom";
import { logout } from "../../utils/auth";
import "./member-layout.css";

export default function MemberLayout() {
  return (
    <div className="member-layout">
      {/* SIDEBAR */}
      <aside className="member-sidebar">
        <h2 className="logo">GYM XALA</h2>

        <nav className="member-nav">
          <NavLink
            to="/member/dashboard"
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
          >
            <span className="nav-icon">🏠</span>
            <span className="nav-text">Trang chủ</span>
          </NavLink>
          <NavLink
            to="/member/booking"
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
          >
            <span className="nav-icon">📅</span>
            <span className="nav-text">Đặt lịch</span>
          </NavLink>
          <NavLink
            to="/member/packages"
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
          >
            <span className="nav-icon">💳</span>
            <span className="nav-text">Gói tập</span>
          </NavLink>
          <NavLink
            to="/member/my-package"
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
          >
            <span className="nav-icon">📦</span>
            <span className="nav-text">Gói tập của tôi</span>
          </NavLink>
          <NavLink
            to="/member/schedule"
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
          >
            <span className="nav-icon">📝</span>
            <span className="nav-text">Lịch của tôi</span>
          </NavLink>
          <NavLink
            to="/member/profile"
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
          >
            <span className="nav-icon">👤</span>
            <span className="nav-text">Cá nhân</span>
          </NavLink>
        </nav>

        <button className="logout-btn" onClick={logout}>
          <span className="nav-icon">🚪</span>
          <span className="nav-text">Đăng xuất</span>
        </button>
      </aside>

      {/* CONTENT */}
      <main className="member-content">
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
