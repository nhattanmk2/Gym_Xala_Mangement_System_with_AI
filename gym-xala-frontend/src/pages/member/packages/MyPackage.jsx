import React, { useEffect, useState } from "react";
import { getCurrentCard, getMyCardList, cancelPackage, assignPt, pausePackage, resumePackage } from "../../../api/membershipApi";
import { getAvailableSlots } from "../../../api/ptScheduleApi";
import "./my-package.css";

export default function MyPackage() {
    const [currentCard, setCurrentCard] = useState(null);
    const [allCards, setAllCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [availablePts, setAvailablePts] = useState([]);
    const [showPtModal, setShowPtModal] = useState(false);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [processingPt, setProcessingPt] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        console.info("Bắt đầu lấy dữ liệu gói tập...");

        try {
            // Lấy danh sách tất cả các card trước
            const list = await getMyCardList();
            console.info("Danh sách gói tập:", list);
            setAllCards(Array.isArray(list) ? list : []);

            // Lấy card hiện tại sau
            try {
                const current = await getCurrentCard();
                console.info("Gói tập hiện tại:", current);
                setCurrentCard(current);

                // Sử dụng danh sách PT từ gói tập
                if (current && !current.assignedPtId) {
                    setAvailablePts(current.availablePts || []);
                }
            } catch (currErr) {
                console.error("Lỗi lấy gói tập hiện tại:", currErr);
            }

        } catch (error) {
            console.error("Lỗi lấy danh sách gói tập:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCancel = async (cardId) => {
        if (window.confirm("Bạn có chắc chắn muốn hủy gói tập này không?")) {
            try {
                await cancelPackage(cardId);
                alert("✅ Đã hủy gói tập thành công.");
                fetchData();
            } catch (error) {
                console.error("Lỗi khi hủy gói:", error);
                let msg = "Không thể hủy gói tập.";
                if (error.response?.data) {
                    msg = typeof error.response.data === "string" ? error.response.data : (error.response.data.message || msg);
                }
                alert("❌ Lỗi: " + msg);
            }
        }
    };

    const handlePause = async (cardId) => {
        const reason = window.prompt("Vui lòng nhập lý do bảo lưu gói tập (Ví dụ: Đi công tác, Lý do sức khỏe...):");
        if (reason !== null) {
            try {
                await pausePackage(cardId, reason);
                alert("✅ Đã bảo lưu gói tập thành công.");
                fetchData();
            } catch (error) {
                console.error("Lỗi khi bảo lưu:", error);
                alert("❌ Lỗi: " + (error.response?.data?.message || error.response?.data || "Không thể bảo lưu gói tập."));
            }
        }
    };

    const handleResume = async (cardId) => {
        if (window.confirm("Bạn có chắc chắn muốn kích hoạt lại gói tập này không?")) {
            try {
                await resumePackage(cardId);
                alert("✅ Đã kích hoạt lại gói tập thành công.");
                fetchData();
            } catch (error) {
                console.error("Lỗi khi kích hoạt lại:", error);
                alert("❌ Lỗi: " + (error.response?.data?.message || error.response?.data || "Không thể kích hoạt lại gói tập."));
            }
        }
    };

    const handleSelectPt = async (ptId) => {
        if (!currentCard) return;
        setProcessingPt(true);
        try {
            await assignPt(currentCard.id, ptId);
            alert("✅ Đã chọn Huấn luyện viên thành công!");
            setShowPtModal(false);
            fetchData();
        } catch (error) {
            console.error("Lỗi khi chọn PT:", error);
            alert("❌ Lỗi: " + (error.response?.data?.message || "Không thể chọn PT."));
        } finally {
            setProcessingPt(false);
        }
    };

    const handleOpenBooking = async () => {
        if (!currentCard || !currentCard.assignedPtId) return;
        try {
            const slots = await getAvailableSlots(currentCard.assignedPtId);
            setAvailableSlots(slots);
            // setShowBookingModal(true); // Temporarily commented out as requested to remove the UI
        } catch (error) {
            console.error("Lỗi lấy lịch trống:", error);
            alert("❌ Không thể lấy lịch của PT lúc này.");
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

    if (loading) {
        return (
            <div className="mypkg-loading">
                <div className="loader"></div>
                <p>Đang tải thông tin gói tập...</p>
            </div>
        );
    }

    return (
        <div className="mypkg-container">
            <div className="mypkg-header">
                <h1>📦 Gói tập của tôi</h1>
                <p>Theo dõi thời hạn và lịch sử đăng ký các gói tập tại Gym Xala.</p>
            </div>

            {/* CURRENT ACTIVE PACKAGE */}
            <section className="mypkg-section">
                <h2 className="section-title">Gói tập hiện tại</h2>
                {currentCard ? (
                    <div className="current-pkg-card">
                        <div className="pkg-glow"></div>
                        <div className="pkg-content">
                            <div className="pkg-info">
                                <span className={`pkg-badge ${currentCard.status === 'PAUSED' ? 'paused-badge' : ''}`} style={currentCard.status === 'PAUSED' ? {backgroundColor: '#ffc107', color: '#000'} : {}}>{currentCard.status === 'PAUSED' ? 'BẢO LƯU' : 'ĐANG HOẠT ĐỘNG'}</span>
                                <h3 className="pkg-name">{currentCard.packageName}</h3>
                                <p className="pkg-cat">{currentCard.category}</p>

                                <div className="assigned-pt-section">
                                    {currentCard.assignedPtName ? (
                                        <div className="pt-display">
                                            <span>Huấn luyện viên phụ trách</span>
                                            <div className="pt-name-badge">
                                                <i className="pt-icon">👤</i>
                                                <strong>{currentCard.assignedPtName}</strong>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="pt-unassigned">
                                            <p className="pt-hint">Gói này có huấn luyện viên đi kèm. Hãy chọn người đồng hành cùng bạn!</p>
                                            <button 
                                                className="btn-select-pt"
                                                onClick={() => setShowPtModal(true)}
                                            >
                                                ✨ Chọn Huấn luyện viên
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="pkg-dates">
                                    <div className="date-item">
                                        <span>Ngày bắt đầu</span>
                                        <strong>{new Date(currentCard.startDate).toLocaleDateString("vi-VN")}</strong>
                                    </div>
                                    <div className="date-divider"></div>
                                    <div className="date-item">
                                        <span>Ngày hết hạn</span>
                                        <strong className="expiry-date">{new Date(currentCard.endDate).toLocaleDateString("vi-VN")}</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="pkg-visual">
                                <div className="days-left">
                                    <span>Hết hạn trong</span>
                                    {currentCard.status === 'PAUSED' ? (
                                        <div className="days-count" style={{color: '#ffc107', fontSize: '1.5rem', whiteSpace: 'nowrap'}}>
                                            BẢO LƯU
                                        </div>
                                    ) : (
                                        <div className="days-count">
                                            {Math.ceil((new Date(currentCard.endDate) - new Date()) / (1000 * 60 * 60 * 24))}
                                        </div>
                                    )}
                                    {currentCard.status !== 'PAUSED' && <span>ngày</span>}
                                </div>
                                <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px'}}>
                                    {currentCard.status === 'ACTIVE' && (
                                        <button className="btn-cancel-top" style={{backgroundColor: '#ff9800', border: '1px solid #ff9800'}} onClick={() => handlePause(currentCard.id)}>
                                            Bảo lưu gói tập
                                        </button>
                                    )}
                                    {currentCard.status === 'PAUSED' && (
                                        <button className="btn-cancel-top" style={{backgroundColor: '#4caf50', border: '1px solid #4caf50'}} onClick={() => handleResume(currentCard.id)}>
                                            Tiếp tục tập
                                        </button>
                                    )}
                                    <button className="btn-cancel-top" onClick={() => handleCancel(currentCard.id)}>
                                        Hủy gói tập
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="no-pkg-alert">
                        <p>Bạn hiện không có gói tập nào đang hoạt động.</p>
                        <button className="btn-primary" onClick={() => window.location.href = '/member/packages'}>
                            Đăng ký ngay
                        </button>
                    </div>
                )}
            </section>

            {/* HISTORY */}
            <section className="mypkg-section">
                <h2 className="section-title">Lịch sử đăng ký</h2>
                <div className="pkg-history-list">
                    {allCards.length > 0 ? (
                        <table className="history-table">
                            <thead>
                                <tr>
                                    <th>Tên gói</th>
                                    <th>PT phụ trách</th>
                                    <th>Bắt đầu</th>
                                    <th>Kết thúc</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allCards.map((card) => (
                                    <tr key={card.id}>
                                        <td><strong>{card.packageName}</strong></td>
                                        <td>{card.assignedPtName || <span className="text-muted italic">---</span>}</td>
                                        <td>{card.startDate ? new Date(card.startDate).toLocaleDateString("vi-VN") : "---"}</td>
                                        <td>{card.endDate ? new Date(card.endDate).toLocaleDateString("vi-VN") : "---"}</td>
                                        <td>
                                            <div className="status-action-group">
                                                <span className={`status-pill ${card.status.toLowerCase()}`}>
                                                    {card.status === "ACTIVE" ? "Đang hoạt động" :
                                                        card.status === "PAUSED" ? "Đã bảo lưu" :
                                                        card.status === "PENDING" ? "Đang chờ duyệt" :
                                                            card.status === "CANCELLED" || card.status === "CANCELED" ? "Đã hủy" :
                                                                card.status}
                                                </span>
                                                {card.status === "PENDING" && (
                                                    <button className="btn-cancel-mini" onClick={() => handleCancel(card.id)}>
                                                        Hủy yêu cầu
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="empty-history">Chưa có dữ liệu lịch sử.</p>
                    )}
                </div>
            </section>

            {/* PT SELECTION MODAL */}
            {showPtModal && (
                <div className="pt-modal-overlay">
                    <div className="pt-modal-content">
                        <div className="modal-header">
                            <h2>Chọn Huấn luyện viên (PT)</h2>
                            <button className="modal-close" onClick={() => setShowPtModal(false)}>&times;</button>
                        </div>
                        <p className="modal-intro">Vui lòng chọn một huấn luyện viên để đồng hành cùng bạn trong hành trình này.</p>
                        
                        <div className="pt-grid">
                            {availablePts.length > 0 ? (
                                availablePts.map(pt => (
                                    <div key={pt.id} className="pt-card-ui">
                                        <div className="pt-card-top">
                                            <div className="pt-avatar">
                                                {pt.avatar ? (
                                                    <img src={`data:image/jpeg;base64,${pt.avatar}`} alt={pt.name} />
                                                ) : (
                                                    <div className="avatar-placeholder">{pt.name?.charAt(0)}</div>
                                                )}
                                            </div>
                                            <div className="pt-card-info">
                                                <h3>{pt.name}</h3>
                                                <span className="pt-label">{pt.ptSpecialty || "PT Chuyên nghiệp"}</span>
                                                <div className="pt-rating">⭐ {pt.ptRating?.toFixed(1) || "5.0"}</div>
                                            </div>
                                        </div>
                                        <button 
                                            className="btn-confirm-pt"
                                            disabled={processingPt}
                                            onClick={() => handleSelectPt(pt.id)}
                                        >
                                            {processingPt ? "Đang xử lý..." : "Chọn huấn luyện viên"}
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="no-pt-available">
                                    <p>Hiện tại không có huấn luyện viên nào khả dụng cho gói tập này. Vui lòng liên hệ lễ tân để được hỗ trợ.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
