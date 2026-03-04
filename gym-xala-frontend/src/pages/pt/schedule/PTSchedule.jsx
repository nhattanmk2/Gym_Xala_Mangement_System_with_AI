import { useState, useEffect } from "react";
import { getMySchedule, addBatchScheduleSlots, deleteScheduleSlot, saveSessionContent, markSessionCompleted } from "../../../api/ptScheduleApi";
import "./pt-schedule.css";

const PTSchedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  // Form state
  const [selectedDates, setSelectedDates] = useState([]);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");
  const [upcomingDates, setUpcomingDates] = useState([]);

  // Session content form state
  const [contentModalOpen, setContentModalOpen] = useState(false);
  const [selectedSessionForContent, setSelectedSessionForContent] = useState(null);
  const [contentForm, setContentForm] = useState({ exercises: "", achievedGoals: "", ptEvaluation: "" });
  const [savingContent, setSavingContent] = useState(false);

  useEffect(() => {
    loadSchedule();
    generateUpcomingDates();
  }, []);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const data = await getMySchedule();
      setSchedule(data);
    } catch (error) {
      console.error("Error loading schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateUpcomingDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const nextDay = new Date(today);
      nextDay.setDate(today.getDate() + i);
      dates.push(nextDay.toISOString().split("T")[0]);
    }
    setUpcomingDates(dates);
  };

  const toggleDate = (date) => {
    if (selectedDates.includes(date)) {
      setSelectedDates(selectedDates.filter(d => d !== date));
    } else {
      setSelectedDates([...selectedDates, date].sort());
    }
  };

  const handleBatchAdd = async (e) => {
    e.preventDefault();
    if (selectedDates.length === 0) {
      alert("Vui chọn ít nhất một ngày làm việc!");
      return;
    }

    try {
      setAdding(true);
      console.log("Adding slots for dates:", selectedDates);
      const slots = selectedDates.map(date => ({
        startTime: `${date}T${startTime}:00`,
        endTime: `${date}T${endTime}:00`
      }));

      console.log("Payload:", slots);
      await addBatchScheduleSlots(slots);

      setSelectedDates([]);
      await loadSchedule();
      setTimeout(() => alert(`✅ Đã thêm khung giờ rảnh cho ${selectedDates.length} ngày thành công!`), 100);
    } catch (error) {
      console.error("Error adding slots:", error);
      const msg = error.response?.data || "Lỗi khi thêm khung giờ rảnh. Có thể bị trùng lịch?";
      alert(`❌ ${msg}`);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khung giờ này?")) return;

    try {
      await deleteScheduleSlot(id);
      await loadSchedule();
      setTimeout(() => alert("✅ Đã xóa khung giờ."), 100);
    } catch (error) {
      console.error("Error deleting slot:", error);
      alert("❌ Lỗi khi xóa. Khung giờ này có thể đã có người đặt.");
    }
  };

  const handleMarkCompleted = async (id) => {
    if (!window.confirm("Bạn có chắc chắn xác nhận Học viên đã HOÀN THÀNH thao tác cho buổi tập này chưa?")) return;

    try {
      await markSessionCompleted(id);
      await loadSchedule();
      setTimeout(() => alert("✅ Đã xác nhận hoàn thành buổi tập."), 100);
    } catch (error) {
      console.error("Error marking slot completed:", error);
      alert("❌ Lỗi khi xác nhận hoàn thành.");
    }
  };

  const openContentModal = (slot) => {
    setSelectedSessionForContent(slot);
    setContentForm({
      exercises: slot.exercises || "",
      achievedGoals: slot.achievedGoals || "",
      ptEvaluation: slot.ptEvaluation || ""
    });
    setContentModalOpen(true);
  };

  const closeContentModal = () => {
    setContentModalOpen(false);
    setSelectedSessionForContent(null);
  };

  const handleSaveContent = async (e) => {
    e.preventDefault();
    if (!selectedSessionForContent) return;

    try {
      setSavingContent(true);
      await saveSessionContent(selectedSessionForContent.id, contentForm);
      alert("✅ Lưu nội dung thành công!");
      closeContentModal();
      await loadSchedule();
    } catch (error) {
      console.error("Error saving content:", error);
      alert("❌ Lỗi khi lưu nội dung.");
    } finally {
      setSavingContent(false);
    }
  };

  const formatDateTime = (isoStr) => {
    const d = new Date(isoStr);
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDateShort = (isoStr) => {
    const d = new Date(isoStr);
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  };

  const getDayName = (isoStr) => {
    const d = new Date(isoStr);
    return d.toLocaleDateString("vi-VN", { weekday: "short" });
  };

  const getDayNumber = (isoStr) => {
    const d = new Date(isoStr);
    return d.getDate();
  };

  // Group schedule by week
  const groupScheduleByWeek = () => {
    const weeks = {};
    schedule.filter(slot => slot.status !== "BUSY").forEach(slot => {
      const date = new Date(slot.startTime);
      const startOfWeek = new Date(date);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);

      const weekKey = startOfWeek.toISOString().split("T")[0];
      if (!weeks[weekKey]) weeks[weekKey] = [];
      weeks[weekKey].push(slot);
    });
    return Object.keys(weeks).sort().reverse().map(key => ({
      weekStart: key,
      slots: weeks[key].sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    }));
  };

  const weeklySchedule = groupScheduleByWeek();

  return (
    <div className="pt-schedule-wrapper">
      {/* Modal Nhập Nội dung Buổi tập */}
      {contentModalOpen && selectedSessionForContent && (
        <div className="modal-overlay">
          <div className="modal-content session-content-modal">
            <h2>Nội dung buổi tập</h2>
            <p>Học viên: <strong>{selectedSessionForContent.memberName}</strong></p>
            <p>Thời gian: {formatDateTime(selectedSessionForContent.startTime)} - {formatDateShort(selectedSessionForContent.startTime)}</p>

            <form onSubmit={handleSaveContent}>
              <div className="form-group">
                <label>Bài tập (Exercises)</label>
                <textarea
                  rows="3"
                  value={contentForm.exercises}
                  onChange={(e) => setContentForm({ ...contentForm, exercises: e.target.value })}
                  placeholder="Kê khai các bài tập đã thực hiện..."
                ></textarea>
              </div>
              <div className="form-group">
                <label>Mục tiêu đạt được</label>
                <textarea
                  rows="2"
                  value={contentForm.achievedGoals}
                  onChange={(e) => setContentForm({ ...contentForm, achievedGoals: e.target.value })}
                  placeholder="Học viên đã đạt được những gì?"
                ></textarea>
              </div>
              <div className="form-group">
                <label>Đánh giá kết quả</label>
                <textarea
                  rows="3"
                  value={contentForm.ptEvaluation}
                  onChange={(e) => setContentForm({ ...contentForm, ptEvaluation: e.target.value })}
                  placeholder="Nhận xét Form tập, thể lực..."
                ></textarea>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeContentModal}>Hủy</button>
                <button type="submit" className="btn-submit" disabled={savingContent}>
                  {savingContent ? "Đang lưu..." : "Lưu Nội dung"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <header className="pt-schedule-header">
        <h1>Lịch biểu Thông minh</h1>
        <p>PT nhấn chọn các ngày để đăng ký khung giờ rảnh hàng loạt.</p>
      </header>

      <div className="pt-schedule-grid">
        {/* Panel Thêm mới */}
        <aside className="schedule-form-card">
          <div className="card-header">
            <h3>➕ Đăng ký giờ rảnh</h3>
            <span className="selected-count">{selectedDates.length} ngày đã chọn</span>
          </div>

          <div className="form-group">
            <label>Chọn nhanh các ngày (2 tuần tới)</label>
            <div className="quick-date-grid">
              {upcomingDates.map(date => {
                const isSelected = selectedDates.includes(date);
                return (
                  <div
                    key={date}
                    className={`date-chip ${isSelected ? 'active' : ''}`}
                    onClick={() => toggleDate(date)}
                  >
                    <span className="chip-day">{getDayName(date)}</span>
                    <span className="chip-num">{getDayNumber(date)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleBatchAdd}>
            <div className="time-inputs-row">
              <div className="form-group">
                <label>Bắt đầu</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Kết thúc</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn-add-slot-main" disabled={adding || selectedDates.length === 0}>
              {adding ? "Đang lưu..." : `Xác nhận ${selectedDates.length} ngày`}
            </button>
          </form>

          <div className="schedule-helper">
            <p>💡 Nhấn vào ô ngày để chọn/hủy chọn.</p>
            <p>⚠️ Bạn có thể chọn nhiều ngày cùng lúc để đăng ký nhanh.</p>
          </div>
        </aside>

        {/* Danh sách lịch theo tuần */}
        <main className="schedule-list-card">
          <h3>📅 Lịch làm việc hàng tuần</h3>
          {loading ? (
            <div className="loading-container">Đang tải lịch biểu...</div>
          ) : weeklySchedule.length === 0 ? (
            <div className="empty-container">
              <p>Chưa có lịch làm việc nào được thiết lập.</p>
            </div>
          ) : (
            <div className="weeks-container">
              {weeklySchedule.map(week => (
                <div key={week.weekStart} className="week-section">
                  <h4 className="week-title">Tuần từ {new Date(week.weekStart).toLocaleDateString("vi-VN")}</h4>
                  <div className="slots-grid">
                    {week.slots.map(slot => (
                      <div key={slot.id} className={`slot-item-mini status-${slot.status.toLowerCase()}`}>
                        <div className="slot-info">
                          <span className="day-name">{getDayName(slot.startTime)}</span>
                          <span className="date-short">{formatDateShort(slot.startTime)}</span>
                          <span className="time-range">{formatDateTime(slot.startTime)} - {formatDateTime(slot.endTime)}</span>
                        </div>
                        <div className="slot-actions">
                          <span className="status-indicator">{slot.status === "AVAILABLE" ? "Rảnh" : slot.status === "CONFIRMED" ? "Đã đặt" : slot.status === "COMPLETED" ? "Đã tập" : "Bận"}</span>
                          {slot.status === "CONFIRMED" && (
                            <button onClick={() => handleMarkCompleted(slot.id)} className="btn-action-mini btn-complete">
                              Hoàn thành
                            </button>
                          )}
                          {(slot.status === "CONFIRMED" || slot.status === "COMPLETED") && (
                            <button onClick={() => openContentModal(slot)} className="btn-action-mini btn-content">
                              Nhập ND
                            </button>
                          )}
                          {slot.status === "AVAILABLE" && (
                            <button onClick={() => handleDelete(slot.id)} className="btn-del-mini" title="Xóa">×</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PTSchedule;
