import { useState } from "react";
import { getPtMatches } from "../../../api/ptMatchingApi";
import { bookSlot } from "../../../api/ptScheduleApi";
import "./suggest-pt.css";

const SuggestPT = () => {
    const [formData, setFormData] = useState({
        preferredDate: "",
        startTime: "",
        endTime: ""
    });

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [bookingId, setBookingId] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.preferredDate || !formData.startTime || !formData.endTime) {
            alert("Vui lòng điền đầy đủ Ngày và Giờ để AI có thể gợi ý chính xác nhất!");
            return;
        }

        try {
            setLoading(true);

            const startDateTime = `${formData.preferredDate}T${formData.startTime}:00`;
            const endDateTime = `${formData.preferredDate}T${formData.endTime}:00`;

            const requestPayload = {
                preferredStartTime: startDateTime,
                preferredEndTime: endDateTime
            };

            const data = await getPtMatches(requestPayload);
            setResults(data);

        } catch (error) {
            console.error("Error fetching PT matches:", error);
            alert("Đã có lỗi xảy ra khi tìm kiếm PT. Vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async (slotId) => {
        try {
            setBookingId(slotId);
            await bookSlot(slotId);
            alert("✨ Yêu cầu đặt lịch thành công! Vui lòng chờ Admin duyệt.");
            // Optional: Remove the booked slot from results or refresh
            setResults(prev => prev.filter(pt => pt.availableSlotId !== slotId));
        } catch (error) {
            alert("❌ Lỗi: " + (error.response?.data || error.message));
        } finally {
            setBookingId(null);
        }
    };

    const getMatchColor = (percentage) => {
        if (percentage >= 80) return "#4caf50"; // Green
        if (percentage >= 50) return "#ff9800"; // Orange
        return "#f44336"; // Red
    };

    const formatTime = (isoString) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (isoString) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <div className="suggest-pt-container">
            <div className="suggest-header">
                <h1>🔍 Tím kiếm PT theo lịch rảnh</h1>
                <p>Cho chúng tôi biết thời gian bạn rảnh, chúng tôi sẽ phân tích và tìm ra Huấn Luyện Viên có lịch trống và phù hợp nhất với bạn!</p>
            </div>

            <div className="search-section">
                <form className="search-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Ngày tập mong muốn</label>
                        <input
                            type="date"
                            name="preferredDate"
                            value={formData.preferredDate}
                            onChange={handleChange}
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                    <div className="form-group">
                        <label>Từ giờ</label>
                        <input
                            type="time"
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Đến giờ</label>
                        <input
                            type="time"
                            name="endTime"
                            value={formData.endTime}
                            onChange={handleChange}
                        />
                    </div>
                    <button type="submit" className="search-btn" disabled={loading}>
                        {loading ? "Đang quét dữ liệu..." : "Tìm PT Ngay 🚀"}
                    </button>
                </form>
            </div>

            <div className="results-section">
                {loading && (
                    <div className="ai-scanning">
                        <div className="scanner-line"></div>
                        <p>AI đang phân tích hàng chục PT để tìm ra người phù hợp nhất với khung giờ của bạn...</p>
                    </div>
                )}

                {!loading && results.length > 0 && (
                    <>
                        <h2 className="results-title">Danh sách PT Phù Hợp Được Đề Xuất</h2>
                        <div className="pt-grid">
                            {results.map((pt, index) => (
                                <div key={pt.ptId} className={`pt-card ${index === 0 ? 'top-match' : ''}`}>
                                    {index === 0 && <div className="top-badge">🌟 Lựa Chọn Hàng Đầu</div>}

                                    <div className="pt-card-header">
                                        <div className="pt-avatar-large">
                                            {pt.ptName.charAt(0)}
                                        </div>
                                        <div className="pt-match-circle" style={{ borderColor: getMatchColor(pt.matchPercentage) }}>
                                            <span className="match-value" style={{ color: getMatchColor(pt.matchPercentage) }}>
                                                {pt.matchPercentage}%
                                            </span>
                                            <span className="match-label">Phù hợp</span>
                                        </div>
                                    </div>

                                    <div className="pt-info">
                                        <h3>{pt.ptName}</h3>
                                        <div className="pt-rating">⭐ {pt.ptRating.toFixed(1)} / 5.0</div>
                                        <p className="pt-specialty">{pt.ptSpecialty || "Chuyên gia thể hình"}</p>
                                        {pt.ptExperience && <p className="pt-exp">🕒 {pt.ptExperience}</p>}
                                    </div>

                                    <div className="pt-slot-info">
                                        <h4>Khung giờ rảnh phù hợp nhất:</h4>
                                        <div className="slot-timeframe">
                                            <span className="date-badge">{formatDate(pt.availableStartTime)}</span>
                                            <span className="time-badge">{formatTime(pt.availableStartTime)} - {formatTime(pt.availableEndTime)}</span>
                                        </div>
                                    </div>

                                    <div className="pt-actions">
                                        <button
                                            className="book-now-btn"
                                            onClick={() => handleBook(pt.availableSlotId)}
                                            disabled={bookingId === pt.availableSlotId || !pt.availableSlotId}
                                        >
                                            {bookingId === pt.availableSlotId ? "Đang xử lý..." : "Đặt Lịch Ngay ⚡"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {!loading && results.length === 0 && formData.preferredDate && (
                    <div className="no-results">
                        <h3>Rất tiếc 😢</h3>
                        <p>Không tìm thấy Huấn Luyện Viên nào trống lịch vào khung giờ này. Vui lòng thử một khoảng thời gian khác!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuggestPT;
