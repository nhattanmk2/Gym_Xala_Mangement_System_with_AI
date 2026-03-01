import { useState, useEffect } from "react";
import { getMemberSchedules } from "../../../api/ptScheduleApi";
import "./member-schedule.css";

const MemberSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const data = await getMemberSchedules();
      setSchedules(data);
    } catch (error) {
      console.error("Error fetching member schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSchedules = schedules.filter(s => {
    if (filter === "ALL") return true;
    return s.status === filter;
  });

  const formatDate = (isoStr) => {
    const d = new Date(isoStr);
    return d.toLocaleDateString("vi-VN", { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (isoStr) => {
    const d = new Date(isoStr);
    return d.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "PENDING": return "Chờ duyệt";
      case "CONFIRMED": return "Đã xác nhận";
      case "CANCELLED": return "Đã hủy";
      case "COMPLETED": return "Hoàn thành";
      default: return status;
    }
  };

  return (
    <div className="member-schedule-container">
      <div className="schedule-header">
        <h1>🗓️ Lịch tập của tôi</h1>
        <p>Theo dõi và quản lý các buổi tập với huấn luyện viên</p>
      </div>

      <div className="filter-tabs">
        <button className={`tab-btn ${filter === "ALL" ? "active" : ""}`} onClick={() => setFilter("ALL")}>Tất cả</button>
        <button className={`tab-btn ${filter === "PENDING" ? "active" : ""}`} onClick={() => setFilter("PENDING")}>Đang chờ</button>
        <button className={`tab-btn ${filter === "CONFIRMED" ? "active" : ""}`} onClick={() => setFilter("CONFIRMED")}>Đã xác nhận</button>
        <button className={`tab-btn ${filter === "COMPLETED" ? "active" : ""}`} onClick={() => setFilter("COMPLETED")}>Hoàn thành</button>
      </div>

      {loading ? (
        <div className="loading-state">Đang tải lịch tập...</div>
      ) : filteredSchedules.length === 0 ? (
        <div className="empty-state">
          <p>Bạn chưa có lịch tập nào trong mục này.</p>
        </div>
      ) : (
        <div className="schedule-list-grid">
          {filteredSchedules.map((item) => (
            <div key={item.id} className="schedule-card pulsate-in">
              <div className="card-top">
                <div className="pt-details">
                  <h3>PT: {item.ptName}</h3>
                  <span className="branch-name">📍 {item.branchName}</span>
                </div>
                <span className={`status-badge ${item.status.toLowerCase()}`}>
                  {getStatusLabel(item.status)}
                </span>
              </div>

              <div className="card-mid">
                <div className="info-row">
                  <span>📅 {formatDate(item.startTime)}</span>
                </div>
                <div className="info-row">
                  <span>⏰ {formatTime(item.startTime)} - {formatTime(item.endTime)}</span>
                </div>
              </div>

              <div className="card-bottom">
                {item.status === "PENDING" && (
                  <button className="btn-cancel" onClick={() => alert("Chức năng hủy đang được phát triển")}>Hủy yêu cầu</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemberSchedule;
