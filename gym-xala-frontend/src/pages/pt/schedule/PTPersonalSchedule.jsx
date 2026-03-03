import { useState, useEffect } from "react";
import { getMySchedule, addBatchScheduleSlots, deleteScheduleSlot } from "../../../api/ptScheduleApi";
import "./pt-schedule.css";

const PTPersonalSchedule = () => {
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);

    const [selectedDates, setSelectedDates] = useState([]);
    const [startTime, setStartTime] = useState("08:00");
    const [endTime, setEndTime] = useState("09:00");
    const [upcomingDates, setUpcomingDates] = useState([]);

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

    const handleBatchAddBusy = async (e) => {
        e.preventDefault();
        if (selectedDates.length === 0) {
            alert("Vui lòng chọn ít nhất một ngày!");
            return;
        }

        try {
            setAdding(true);
            const slots = selectedDates.map(date => ({
                startTime: `${date}T${startTime}:00`,
                endTime: `${date}T${endTime}:00`,
                status: "BUSY"
            }));

            await addBatchScheduleSlots(slots);
            setSelectedDates([]);
            await loadSchedule();
            setTimeout(() => alert(`✅ Đã đánh dấu lịch bận cho ${selectedDates.length} ngày!`), 100);
        } catch (error) {
            console.error("Error adding busy slots:", error);
            const msg = error.response?.data || "Lỗi khi lưu lịch bận. Khung giờ này có thể đã có lịch dạy.";
            alert(`❌ ${msg}`);
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa lịch bận này?")) return;
        try {
            await deleteScheduleSlot(id);
            await loadSchedule();
            setTimeout(() => alert("✅ Đã xóa lịch bận."), 100);
        } catch (error) {
            alert("❌ Không thể xóa.");
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

    const busySlots = schedule.filter(s => s.status === "BUSY").sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    return (
        <div className="pt-schedule-wrapper busy-theme">
            <header className="pt-schedule-header">
                <h1>📑 Quản lý Lịch bận (Cá nhân)</h1>
                <p>Đánh dấu các khoảng thời gian bạn bận việc riêng để hệ thống không xếp lịch dạy.</p>
            </header>

            <div className="pt-schedule-grid">
                <aside className="schedule-form-card">
                    <div className="card-header">
                        <h3>🚫 Đăng ký lịch bận mới</h3>
                        <span className="selected-count">{selectedDates.length} ngày</span>
                    </div>

                    <div className="form-group">
                        <label>Chọn các ngày</label>
                        <div className="quick-date-grid">
                            {upcomingDates.map(date => (
                                <div
                                    key={date}
                                    className={`date-chip ${selectedDates.includes(date) ? 'active' : ''}`}
                                    onClick={() => toggleDate(date)}
                                >
                                    <span className="chip-day">{getDayName(date)}</span>
                                    <span className="chip-num">{getDayNumber(date)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={handleBatchAddBusy}>
                        <div className="time-inputs-row">
                            <div className="form-group">
                                <label>Từ</label>
                                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Đến</label>
                                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                            </div>
                        </div>
                        <button type="submit" className="btn-add-slot-main btn-busy" disabled={adding || selectedDates.length === 0}>
                            {adding ? "Đang lưu..." : "Xác nhận Lịch bận"}
                        </button>
                    </form>
                </aside>

                <main className="schedule-list-card">
                    <h3>📋 Danh sách lịch bận đã đăng ký</h3>
                    {loading ? (
                        <div className="loading-container">Đang tải...</div>
                    ) : busySlots.length === 0 ? (
                        <div className="empty-container">Bạn chưa có lịch bận cá nhân nào.</div>
                    ) : (
                        <div className="slots-grid">
                            {busySlots.map(slot => (
                                <div key={slot.id} className="slot-item-mini busy-style">
                                    <div className="slot-info">
                                        <span className="day-name">{getDayName(slot.startTime)}</span>
                                        <span className="date-short">{formatDateShort(slot.startTime)}</span>
                                        <span className="time-range">{formatDateTime(slot.startTime)} - {formatDateTime(slot.endTime)}</span>
                                    </div>
                                    <button onClick={() => handleDelete(slot.id)} className="btn-del-mini">×</button>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default PTPersonalSchedule;
