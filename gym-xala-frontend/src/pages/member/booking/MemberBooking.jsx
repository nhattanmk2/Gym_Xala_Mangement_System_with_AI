import { useState, useEffect } from "react";
import { getAllLocations } from "../../../api/locationApi";
import { getAllPTs } from "../../../api/ptApi";
import { getAvailableSlots, bookSlot } from "../../../api/ptScheduleApi";
import "./member-booking.css";

const MemberBooking = () => {
  const [locations, setLocations] = useState([]);
  const [pts, setPts] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  // Selection state
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [selectedPtId, setSelectedPtId] = useState("");

  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (selectedLocationId) {
      fetchPTs(selectedLocationId);
      setSelectedPtId("");
      setAvailableSlots([]);
    }
  }, [selectedLocationId]);

  useEffect(() => {
    if (selectedPtId) {
      fetchSlots(selectedPtId);
    }
  }, [selectedPtId]);

  const fetchLocations = async () => {
    try {
      const data = await getAllLocations();
      setLocations(data);
      if (data.length > 0) setSelectedLocationId(data[0].id);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const fetchPTs = async (locationId) => {
    if (!locationId) return;
    try {
      setLoading(true);
      console.log("Checking PTs for location ID:", locationId);
      // Gọi API với tham số lọc branchId
      const data = await getAllPTs(locationId);
      console.log("PT List from API (filtered):", data);

      setPts(data);
    } catch (error) {
      console.error("Error fetching PTs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async (ptId) => {
    try {
      setLoading(true);
      const data = await getAvailableSlots(ptId);
      setAvailableSlots(data);
    } catch (error) {
      console.error("Error fetching slots:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (slotId) => {
    try {
      setBookingId(slotId);
      await bookSlot(slotId);
      alert("✨ Gửi yêu cầu đặt lịch thành công! Vui lòng chờ Admin duyệt.");
      fetchSlots(selectedPtId);
    } catch (error) {
      alert("❌ Lỗi: " + (error.response?.data || error.message));
    } finally {
      setBookingId(null);
    }
  };

  const formatDate = (isoStr) => {
    const d = new Date(isoStr);
    return d.toLocaleDateString("vi-VN", { weekday: 'short', day: '2-digit', month: '2-digit' });
  };

  const formatTime = (isoStr) => {
    const d = new Date(isoStr);
    return d.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="member-booking-container">
      <div className="booking-header">
        <h1>📅 Đặt lịch tập luyện</h1>
        <p>Khám phá PT chuyên nghiệp và chọn khung giờ phù hợp với bạn</p>
      </div>

      <div className="selection-grid">
        <div className="filter-group">
          <label>Chọn Chi nhánh</label>
          <select
            className="styled-select"
            value={selectedLocationId}
            onChange={(e) => setSelectedLocationId(e.target.value)}
          >
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Chọn Huấn luyện viên (PT)</label>
          <div className="pt-selection-list">
            {pts.length === 0 ? (
              <p className="empty-msg">Chưa có PT nào tại chi nhánh này.</p>
            ) : (
              pts.map(pt => (
                <div
                  key={pt.id}
                  className={`pt-mini-card ${selectedPtId === pt.id ? 'selected' : ''}`}
                  onClick={() => setSelectedPtId(pt.id)}
                >
                  <div className="pt-avatar-small">
                    {pt.name.charAt(0)}
                  </div>
                  <div className="pt-mini-info">
                    <h4>{pt.name}</h4>
                    <span>{pt.ptSpecialty || "Chuyên gia thể hình"}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="available-slots-section">
        <h2 className="section-title">Khung giờ rảnh đề xuất</h2>

        {loading ? (
          <div className="loading-state">Đang tìm kiếm lịch rảnh...</div>
        ) : availableSlots.length === 0 ? (
          <div className="empty-slots-msg">
            {selectedPtId ? "PT này hiện không có khung giờ rảnh nào được đăng ký." : "Vui lòng chọn PT để xem lịch rảnh."}
          </div>
        ) : (
          <div className="slots-grid">
            {availableSlots.map(slot => (
              <div key={slot.id} className="slot-card pulsate-in">
                <div className="slot-time">
                  <span className="date-text">{formatDate(slot.startTime)}</span>
                  <span className="time-text">{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span>
                </div>
                <button
                  className="btn-book"
                  onClick={() => handleBook(slot.id)}
                  disabled={bookingId === slot.id}
                >
                  {bookingId === slot.id ? "Đang xử lý..." : "Đặt lịch ngay"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberBooking;
