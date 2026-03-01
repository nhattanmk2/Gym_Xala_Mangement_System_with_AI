import React, { useEffect, useState } from "react";
import { getCurrentCard, getMyCardList, cancelPackage } from "../../../api/membershipApi";
import "./my-package.css";

export default function MyPackage() {
    const [currentCard, setCurrentCard] = useState(null);
    const [allCards, setAllCards] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            console.info("Bắt đầu lấy dữ liệu gói tập...");

            try {
                // Lấy danh sách tất cả các card trước
                const list = await getMyCardList();
                console.info("Danh sách gói tập:", list);
                setAllCards(Array.isArray(list) ? list : []);

                // Lấy card hiện tại sau (tách riêng để nếu lỗi không làm hỏng cả trang)
                try {
                    const current = await getCurrentCard();
                    console.info("Gói tập hiện tại:", current);
                    setCurrentCard(current);
                } catch (currErr) {
                    console.error("Lỗi lấy gói tập hiện tại:", currErr);
                }

            } catch (error) {
                console.error("Lỗi lấy danh sách gói tập:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCancel = async (cardId) => {
        if (window.confirm("Bạn có chắc chắn muốn hủy gói tập này không?")) {
            try {
                await cancelPackage(cardId);
                alert("✅ Đã hủy gói tập thành công.");

                // Reload dữ liệu
                const [current, list] = await Promise.all([
                    getCurrentCard(),
                    getMyCardList()
                ]);
                setCurrentCard(current);
                setAllCards(Array.isArray(list) ? list : []);
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
                                <span className="pkg-badge">ĐANG HOẠT ĐỘNG</span>
                                <h3 className="pkg-name">{currentCard.packageName}</h3>
                                <p className="pkg-cat">{currentCard.category}</p>

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
                                    <div className="days-count">
                                        {Math.ceil((new Date(currentCard.endDate) - new Date()) / (1000 * 60 * 60 * 24))}
                                    </div>
                                    <span>ngày</span>
                                </div>
                                <button className="btn-cancel-top" onClick={() => handleCancel(currentCard.id)}>
                                    Hủy gói tập
                                </button>
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
                                    <th>Loại</th>
                                    <th>Bắt đầu</th>
                                    <th>Kết thúc</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allCards.map((card) => (
                                    <tr key={card.id}>
                                        <td><strong>{card.packageName}</strong></td>
                                        <td>{card.category}</td>
                                        <td>{card.startDate ? new Date(card.startDate).toLocaleDateString("vi-VN") : "---"}</td>
                                        <td>{card.endDate ? new Date(card.endDate).toLocaleDateString("vi-VN") : "---"}</td>
                                        <td>
                                            <div className="status-action-group">
                                                <span className={`status-pill ${card.status.toLowerCase()}`}>
                                                    {card.status === "ACTIVE" ? "Đang hoạt động" :
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
        </div>
    );
}
