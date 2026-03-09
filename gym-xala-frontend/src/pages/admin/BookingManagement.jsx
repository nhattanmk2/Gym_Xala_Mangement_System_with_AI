import { useState, useEffect } from "react";
import AdminLayout from "./layout/AdminLayout";
import { getPendingBookings } from "../../api/adminBookingApi";
import "./bookingManagement.css";

const BookingManagement = () => {
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getPendingBookings();
      setPendingBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AdminLayout>
      <div className="admin-bookings-container">
        <div className="page-header">
          <h2>Quản lý Đặt lịch</h2>
          <p>Duyệt các yêu cầu tập luyện từ học viên và PT</p>
        </div>

        {loading ? (
          <div className="loading-state">Đang tải dữ liệu...</div>
        ) : (
          <div className="booking-list-grid">
            {pendingBookings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📂</div>
                <p>Không có yêu cầu đặt lịch nào đang chờ duyệt.</p>
              </div>
            ) : (
              pendingBookings.map((booking) => (
                <div key={booking.id} className="booking-card pulsate-in">
                  <div className="booking-card-header">
                    <div className="pt-info">
                      <span className="label">Personal Trainer</span>
                      <span className="value">{booking.ptName}</span>
                      <span className="branch-tag">{booking.branchName}</span>
                    </div>
                    <div className="status-badge pending">Đang chờ</div>
                  </div>

                  <div className="booking-card-body">
                    <div className="member-info">
                      <span className="label">Học viên</span>
                      <span className="value">{booking.memberName}</span>
                    </div>
                    <div className="time-info">
                      <div className="time-item">
                        <span className="label">Ngày tập</span>
                        <span className="value">{formatDate(booking.startTime)}</span>
                      </div>
                      <div className="time-item">
                        <span className="label">Khung giờ</span>
                        <span className="value">{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="booking-card-actions">
                    <span className="wait-pt-note" style={{ fontStyle: 'italic', color: '#666', fontSize: '0.9rem' }}>Chờ PT phê duyệt</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default BookingManagement;
