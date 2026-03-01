import { useEffect, useState, useRef } from "react";
import "./ptHeader.css";
import { getMyProfile } from "../../../api/ptApi";
import { getMyNotifications, getUnreadCount, markAsRead, markAllAsRead } from "../../../api/notificationApi";

const PTHeader = () => {
  const username = localStorage.getItem("username");
  const [profile, setProfile] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotiDropdown, setShowNotiDropdown] = useState(false);
  const notiRef = useRef(null);

  useEffect(() => {
    fetchProfile();
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

  const fetchProfile = async () => {
    try {
      const data = await getMyProfile();
      setProfile(data);
    } catch (error) {
      console.error("Error fetching PT profile:", error);
    }
  };

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

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const formatTime = (isoStr) => {
    const date = new Date(isoStr);
    return date.toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
  };

  return (
    <div className="pt-header">
      <div className="pt-header-left">
        <h3>PT Panel</h3>
      </div>

      <div className="pt-header-right">
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
                {unreadCount > 0 && <button onClick={handleMarkAllRead}>Đánh dấu tất cả đã đọc</button>}
              </div>
              <div className="noti-list">
                {notifications.length === 0 ? (
                  <div className="noti-empty">Không có thông báo nào</div>
                ) : (
                  notifications.map(noti => (
                    <div
                      key={noti.id}
                      className={`noti-item ${noti.isRead ? 'read' : 'unread'}`}
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

        <span className="welcome-text">
          Xin chào, <b>{username}</b>
        </span>

        <div className="avatar-dropdown-container">
          <div className="avatar-circle" onClick={() => setShowDropdown(!showDropdown)}>
            {profile?.avatar ? (
              <img src={`data:image/png;base64,${profile.avatar}`} alt="Avatar" />
            ) : (
              <div className="avatar-placeholder">{username?.charAt(0).toUpperCase()}</div>
            )}
          </div>

          {showDropdown && (
            <div className="dropdown-menu">
              <div className="dropdown-item" onClick={() => window.location.href = "/pt/profile"}>
                👤 Hồ sơ của tôi
              </div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-item logout" onClick={handleLogout}>
                🚪 Đăng xuất
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PTHeader;
