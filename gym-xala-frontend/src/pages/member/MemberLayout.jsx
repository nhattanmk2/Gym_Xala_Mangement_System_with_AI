import { NavLink, Outlet } from "react-router-dom";
import { logout } from "../../utils/auth";
import { useEffect, useState, useRef } from "react";
import { getMyNotifications, getUnreadCount, markAsRead, markAllAsRead } from "../../api/notificationApi";
import FloatingChatbot from "../../components/chatbot/FloatingChatbot";
import "./member-layout.css";

export default function MemberLayout() {
  const username = localStorage.getItem("username") || "Học viên";

  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotiDropdown, setShowNotiDropdown] = useState(false);
  const notiRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Polling mỗi 30s
    return () => clearInterval(interval);
  }, []);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notiRef.current && !notiRef.current.contains(event.target)) {
        setShowNotiDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const [list, count] = await Promise.all([
        getMyNotifications(),
        getUnreadCount()
      ]);
      setNotifications(list);
      setUnreadCount(count);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const formatTime = (isoStr) => {
    const date = new Date(isoStr);
    return date.toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
  };

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
            to="/member/roadmap"
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
          >
            <span className="nav-icon">📈</span>
            <span className="nav-text">Tiến độ tập luyện</span>
          </NavLink>
          <NavLink
            to="/member/ai-consultation"
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
            style={{
              background: 'linear-gradient(90deg, rgba(208, 253, 62, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
              borderLeftColor: '#10b981'
            }}
          >
            <span className="nav-icon">✨</span>
            <span className="nav-text" style={{ color: '#d0fd3e', fontWeight: 'bold' }}>Tư Vấn Thể Trạng AI</span>
          </NavLink>
          <NavLink
            to="/member/suggest-pt"
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
            style={{
              background: 'linear-gradient(90deg, rgba(0, 229, 255, 0.1) 0%, rgba(0, 119, 255, 0.1) 100%)',
              borderLeftColor: '#00e5ff'
            }}
          >
            <span className="nav-icon">🤖</span>
            <span className="nav-text" style={{ color: '#00e5ff', fontWeight: 'bold' }}>Tìm kiếm PT theo lịch rảnh</span>
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
        {/* MEMBER HEADER FOR NOTIFICATIONS */}
        <header className="member-header">
          <div className="header-left">
            <h3>Hệ thống hội viên Gym Xala</h3>
          </div>
          <div className="header-right">
            {/* Notification Bell */}
            <div className="notification-bell-container" ref={notiRef}>
              <div className="bell-icon" onClick={() => setShowNotiDropdown(!showNotiDropdown)}>
                🔔
                {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
              </div>

              {showNotiDropdown && (
                <div className="notification-dropdown">
                  <div className="noti-header">
                    <h4>Thông báo</h4>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead}>
                        Đánh dấu tất cả đã đọc
                      </button>
                    )}
                  </div>
                  <div className="noti-list">
                    {notifications.length === 0 ? (
                      <div className="noti-empty">Không có thông báo nào</div>
                    ) : (
                      notifications.map((noti) => (
                        <div
                          key={noti.id}
                          className={`noti-item ${noti.isRead ? "read" : "unread"}`}
                          onClick={() => !noti.isRead && handleMarkAsRead(noti.id)}
                        >
                          <div className="noti-content">
                            <p>{noti.message}</p>
                            <span className="noti-time">{formatTime(noti.createdAt)}</span>
                          </div>
                          {!noti.isRead && <div className="unread-dot"></div>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="user-greeting">
              Xin chào, <b>{username}</b>
            </div>
          </div>
        </header>

        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>

      {/* Tích hợp Bot tư vấn Floating */}
      <FloatingChatbot />
    </div>
  );
}
