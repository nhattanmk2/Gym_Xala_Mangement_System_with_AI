import { useState, useEffect } from "react";
import { getMemberSchedules } from "../../../api/ptScheduleApi";
import "./member-schedule.css";

const MemberSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  // View mode
  const [viewMode, setViewMode] = useState("LIST"); // 'LIST' or 'CALENDAR'

  // Filters for LIST view
  const [timeFilter, setTimeFilter] = useState("UPCOMING"); // 'TODAY', 'UPCOMING', 'PAST'
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Modal Detail State
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

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

  const handleCardClick = async (id) => {
    try {
      setLoadingDetail(true);
      setIsModalOpen(true);
      // We fetch the latest specific details to ensure data freshness
      const detailData = await import("../../../api/ptScheduleApi").then(m => m.getMemberScheduleById(id));
      setSelectedSchedule(detailData);
    } catch (error) {
      console.error("Error fetching schedule details:", error);
      alert("Lỗi khi tải chi tiết buổi tập.");
      setIsModalOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCancelBooking = async (id) => {
    const confirmCancel = window.confirm("Bạn có chắc chắn muốn hủy lịch này không? Lưu ý: Không thể hoàn tác và chỉ có thể hủy trước 24 giờ diễn ra buổi tập.");
    if (!confirmCancel) return;

    try {
      await import("../../../api/ptScheduleApi").then(m => m.cancelMemberSchedule(id));
      alert("Hủy lịch thành công!");
      closeModal();
      fetchSchedules(); // Refresh the list
    } catch (error) {
      console.error("Error cancelling schedule:", error);
      if (error.response && error.response.data) {
        alert(typeof error.response.data === 'string' ? error.response.data : error.response.data.message || "Không thể hủy lịch này.");
      } else {
        alert("Lỗi khi hủy lịch. Vui lòng thử lại sau.");
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedSchedule(null), 300); // Wait for transition
  };

  const handleGetDirections = (branchName) => {
    if (!branchName || branchName === "N/A") {
      alert("Không có thông tin địa điểm rõ ràng.");
      return;
    }
    // Encode the query so it's safely mapped in a URL form
    const query = encodeURIComponent(`Gym Xala ${branchName}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
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

  const formatDate = (isoStr) => {
    const d = new Date(isoStr);
    return d.toLocaleDateString("vi-VN", { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (isoStr) => {
    const d = new Date(isoStr);
    return d.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' });
  };

  // ----- LIST VIEW LOGIC -----
  const getFilteredListSchedules = () => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    return schedules.filter(s => {
      // 1. Status Filter
      if (statusFilter !== "ALL" && s.status !== statusFilter) return false;

      // 2. Time Filter
      const slotTime = new Date(s.startTime);
      if (timeFilter === "TODAY") {
        return slotTime >= todayStart && slotTime <= todayEnd;
      } else if (timeFilter === "UPCOMING") {
        return slotTime > todayEnd;
      } else if (timeFilter === "PAST") {
        return slotTime < todayStart;
      }
      return true;
    }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  };

  // ----- CALENDAR VIEW LOGIC -----
  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Convert to Monday=0, Sunday=6
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    let days = [];

    // Empty cells for days before the 1st
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of the month
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

      // Find slots for this day
      const daySlots = schedules.filter(s => {
        const slotDate = new Date(s.startTime);
        return slotDate.getFullYear() === year &&
          slotDate.getMonth() === month &&
          slotDate.getDate() === d;
      });

      const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();

      days.push(
        <div key={d} className={`calendar-day ${isToday ? 'today' : ''}`}>
          <div className="day-number">{d}</div>
          <div className="day-slots">
            {daySlots.map(slot => (
              <div
                key={slot.id}
                className={`calendar-slot-badge clickable-badge ${slot.status.toLowerCase()}`}
                title={`${formatTime(slot.startTime)} - PT: ${slot.ptName}`}
                onClick={(e) => { e.stopPropagation(); handleCardClick(slot.id); }}
              >
                {formatTime(slot.startTime)} - {slot.status === 'CONFIRMED' ? '✅' :
                  slot.status === 'PENDING' ? '⏳' :
                    slot.status === 'COMPLETED' ? '🏆' : '❌'}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  // ----- RENDER -----
  return (
    <div className="member-schedule-container fade-in">
      <div className="schedule-header">
        <div className="header-title-area">
          <h1>🗓️ Lịch tập của tôi</h1>
          <p>Theo dõi và quản lý các buổi tập với huấn luyện viên cá nhân</p>
        </div>
        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === 'LIST' ? 'active' : ''}`}
            onClick={() => setViewMode('LIST')}
          >
            📋 Danh sách
          </button>
          <button
            className={`toggle-btn ${viewMode === 'CALENDAR' ? 'active' : ''}`}
            onClick={() => setViewMode('CALENDAR')}
          >
            📅 Lịch
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : viewMode === 'LIST' ? (
        <div className="view-section list-view slide-up">
          <div className="filters-container">
            <div className="filter-group">
              <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} className="status-select">
                <option value="TODAY">Hôm nay</option>
                <option value="UPCOMING">Sắp tới</option>
                <option value="PAST">Đã qua</option>
              </select>
            </div>

            <div className="filter-group status-filters">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="status-select">
                <option value="ALL">Tất cả trạng thái</option>
                <option value="PENDING">Chờ duyệt</option>
                <option value="CONFIRMED">Đã xác nhận</option>
                <option value="COMPLETED">Hoàn thành</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </div>
          </div>

          {getFilteredListSchedules().length === 0 ? (
            <div className="empty-state">
              <i className="empty-icon">📂</i>
              <p>Không có lịch tập nào thoả mãn bộ lọc.</p>
            </div>
          ) : (
            <div className="schedule-list-grid">
              {getFilteredListSchedules().map((item) => (
                <div key={item.id} className="schedule-card pulsate-in clickable-card" onClick={() => handleCardClick(item.id)}>
                  <div className="card-top">
                    <div className="pt-details">
                      <h3>Huấn luyện viên: {item.ptName}</h3>
                      <div className="pt-meta">
                        <span className="branch-name">📍 {item.branchName}</span>
                        <span className="pt-specialty">🎓 {item.ptSpecialty}</span>
                      </div>
                    </div>
                    <span className={`status-badge ${item.status.toLowerCase()}`}>
                      {getStatusLabel(item.status)}
                    </span>
                  </div>

                  <div className="card-mid">
                    <div className="info-row date-row">
                      <span className="icon">📅</span>
                      <span className="text">{formatDate(item.startTime)}</span>
                    </div>
                    <div className="info-row time-row">
                      <span className="icon">⏰</span>
                      <span className="text">{formatTime(item.startTime)} - {formatTime(item.endTime)}</span>
                    </div>
                    {item.adminNotes && (
                      <div className="info-row note-row">
                        <span className="icon">📝</span>
                        <span className="text">Ghi chú: {item.adminNotes}</span>
                      </div>
                    )}
                  </div>

                  {item.status === "PENDING" && (
                    <div className="card-bottom">
                      <button className="btn-cancel" onClick={() => alert("Vui lòng liên hệ Admin để hủy lịch.")}>Hủy yêu cầu</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="view-section calendar-view slide-up">
          <div className="calendar-header">
            <button className="cal-nav-btn" onClick={prevMonth}>◀ Tháng trước</button>
            <h2 className="current-month">
              Tháng {currentMonth.getMonth() + 1}, {currentMonth.getFullYear()}
            </h2>
            <button className="cal-nav-btn" onClick={nextMonth}>Tháng sau ▶</button>
          </div>

          <div className="calendar-grid">
            {/* Headers */}
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => (
              <div key={day} className="calendar-day-header">{day}</div>
            ))}

            {/* Days */}
            {renderCalendar()}
          </div>
        </div>
      )}
      {/* --- MODAL DETAILED VIEW --- */}
      {isModalOpen && (
        <div className="detail-modal-overlay fade-in" onClick={closeModal}>
          <div className="detail-modal-content slide-up" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeModal}>✕</button>

            {loadingDetail ? (
              <div className="loading-state modal-loading">
                <div className="spinner"></div>
                <p>Đang tải thông tin chi tiết...</p>
              </div>
            ) : selectedSchedule ? (
              <>
                <h2 className="modal-title">Chi tiết buổi tập</h2>
                <div className="modal-body">
                  <div className="modal-info-group">
                    <label>Trạng thái</label>
                    <span className={`status-badge large ${selectedSchedule.status.toLowerCase()}`}>
                      {getStatusLabel(selectedSchedule.status)}
                    </span>
                  </div>

                  <div className="modal-info-group">
                    <label>Huấn luyện viên</label>
                    <div className="pt-info-box">
                      <div className="pt-avatar-placeholder">PT</div>
                      <div>
                        <h4>{selectedSchedule.ptName}</h4>
                        <span className="pt-specialty">🎓 {selectedSchedule.ptSpecialty}</span>
                        <span className="pt-phone">📞 {selectedSchedule.ptPhone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="modal-info-grid">
                    <div className="modal-info-box date-box">
                      <span className="icon">📅</span>
                      <div>
                        <label>Ngày tập</label>
                        <p>{formatDate(selectedSchedule.startTime)}</p>
                      </div>
                    </div>
                    <div className="modal-info-box time-box">
                      <span className="icon">⏰</span>
                      <div>
                        <label>Thời gian</label>
                        <p>{formatTime(selectedSchedule.startTime)} - {formatTime(selectedSchedule.endTime)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="modal-info-group branch-group">
                    <label>Địa điểm tập luyện</label>
                    <div className="branch-card">
                      <div className="branch-info">
                        <span className="icon">📍</span>
                        <p className="branch-name-large">Gym Xala - {selectedSchedule.branchName}</p>
                      </div>
                      <button
                        className="btn-directions"
                        onClick={() => handleGetDirections(selectedSchedule.branchName)}
                      >
                        🗺️ Mở bản đồ chỉ đường
                      </button>
                    </div>
                  </div>

                  {selectedSchedule.adminNotes && (
                    <div className="modal-info-group notes-group">
                      <label>Ghi chú từ quản trị viên</label>
                      <div className="notes-box">
                        <p>{selectedSchedule.adminNotes}</p>
                      </div>
                    </div>
                  )}

                  {(selectedSchedule.status === 'COMPLETED' || selectedSchedule.exercises || selectedSchedule.ptEvaluation) && (
                    <div className="modal-info-group pt-evaluation-group">
                      <label>Nội dung & Nhận xét từ PT</label>
                      <div className="pt-evaluation-box">
                        <div className="eval-section">
                          <h5>🏋️ Bài tập đã thực hiện:</h5>
                          <p>{selectedSchedule.exercises || "Chưa có thông tin"}</p>
                        </div>
                        <div className="eval-section">
                          <h5>🎯 Mục tiêu đạt được:</h5>
                          <p>{selectedSchedule.achievedGoals || "Chưa có thông tin"}</p>
                        </div>
                        <div className="eval-section">
                          <h5>📝 Đánh giá của PT:</h5>
                          <p>{selectedSchedule.ptEvaluation || "Chưa có nhận xét"}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {(selectedSchedule.status === 'PENDING' || selectedSchedule.status === 'CONFIRMED') && (
                    <div className="modal-action-group">
                      <button
                        className="btn-cancel-large"
                        onClick={() => handleCancelBooking(selectedSchedule.id)}
                      >
                        ⚠️ Hủy lịch tập
                      </button>
                      <p className="cancel-note">* Chỉ có thể hủy trước 24h diễn ra buổi tập</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <p>Không tìm thấy thông tin chi tiết.</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default MemberSchedule;
