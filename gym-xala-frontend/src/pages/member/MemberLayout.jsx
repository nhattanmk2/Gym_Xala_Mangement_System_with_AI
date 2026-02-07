import { Link, Outlet } from "react-router-dom";
import { logout } from "../../utils/auth";
import "./member-layout.css";

export default function MemberLayout() {
  return (
    <div className="member-layout">
      {/* SIDEBAR */}
      <aside className="member-sidebar">
        <h2 className="logo">GYM XALA</h2>

        <nav>
          <Link to="/member/dashboard">🏠 Trang chủ</Link>
          <Link to="/member/booking">📅 Đặt lịch</Link>
          <Link to="/member/packages">💳 Gói tập</Link>
          <Link to="/member/schedule">📝 Lịch của tôi</Link>
          <Link to="/member/profile">👤 Cá nhân</Link>
        </nav>

        <button className="logout-btn" onClick={logout}>
          Đăng xuất
        </button>
      </aside>

      {/* CONTENT */}
      <main className="member-content">
        <Outlet />
      </main>
    </div>
  );
}
