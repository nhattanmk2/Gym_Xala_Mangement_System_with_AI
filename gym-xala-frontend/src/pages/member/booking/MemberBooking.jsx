import { useState, useEffect } from "react";
import { getAllLocations } from "../../../api/locationApi";
import { getAvailablePtsForMember } from "../../../api/ptApi";
import { getAvailableSlots, bookSlot } from "../../../api/ptScheduleApi";
import { getCurrentCard } from "../../../api/membershipApi";
import { useNavigate } from "react-router-dom";
import "./member-booking.css";

const MemberBooking = () => {
  const [availableSlots, setAvailableSlots] = useState([]);

  // Selection state
  const [selectedPtId, setSelectedPtId] = useState("");

  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [assignedPt, setAssignedPt] = useState(null);
  const [hasPackage, setHasPackage] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAssignedPT();
  }, []);

  const checkAssignedPT = async () => {
    try {
      setLoading(true);
      const card = await getCurrentCard();
      if (!card) {
        setHasPackage(false);
      } else if (card.assignedPtId) {
        setAssignedPt({
          userId: card.assignedPtId,
          name: card.assignedPtName,
          locationName: card.assignedPtLocationName
        });
        setSelectedPtId(card.assignedPtId);
      }
    } catch (error) {
      console.error("Error checking assigned PT:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPtId) {
      fetchSlots(selectedPtId);
    }
  }, [selectedPtId]);

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
      alert("✨ Gửi yêu cầu đặt lịch thành công! Vui lòng chờ PT duyệt.");
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

      {!hasPackage ? (
        <div className="no-pt-warning">
          <div className="warning-bg" style={{ background: 'linear-gradient(90deg, #ef4444, #f87171)' }}></div>
          <div className="warning-content">
            <span className="warning-icon">🎟️</span>
            <h2>Bạn chưa có gói tập tập luyện</h2>
            <p>Để bắt đầu hành trình cải thiện vóc dáng, hãy chọn một gói tập phù hợp với nhu cầu của bạn ngay nhé!</p>
            <button className="btn-redirect" onClick={() => navigate("/member/packages")}>
              🚀 Khám phá các gói tập
            </button>
          </div>
        </div>
      ) : !assignedPt ? (
        <div className="no-pt-warning">
          <div className="warning-bg"></div>
          <div className="warning-content">
            <span className="warning-icon">🏋️‍♂️</span>
            <h2>Bạn chưa chọn Huấn luyện viên</h2>
            <p>Gói tập của bạn cần có Huấn luyện viên (PT) đồng hành. Hãy chọn người hướng dẫn cho mình tại mục quản lý gói tập nhé!</p>
            <button className="btn-redirect" onClick={() => navigate("/member/my-package")}>
              👉 Đi đến mục chọn PT
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="selection-grid">
            <div className="filter-group">
              <label>Bạn đang đặt lịch với</label>
              <div className="pt-assigned-info">
                <div className="pt-avatar-small">{assignedPt.name.charAt(0)}</div>
                <div className="pt-mini-info">
                  <h4>{assignedPt.name}</h4>
                  <span>Huấn luyện viên của bạn</span>
                </div>
              </div>
            </div>

            <div className="filter-group">
              <label>Chi nhánh tập luyện</label>
              <div className="location-info-static">
                <span className="location-icon">📍</span>
                <span className="location-name">{assignedPt.locationName || "Hệ thống Gym Xala"}</span>
              </div>
            </div>
          </div>

          <div className="available-slots-section">
            <h2 className="section-title">Khung giờ rảnh đề xuất</h2>

            {loading ? (
              <div className="loading-state">Đang tìm kiếm lịch rảnh...</div>
            ) : availableSlots.length === 0 ? (
              <div className="empty-slots-msg">
                PT hiện không có khung giờ rảnh nào được đăng ký.
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
        </>
      )}
    </div>
  );
};

export default MemberBooking;
