import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getActivePackages } from "../../../api/packageApi";
import { registerPackage } from "../../../api/membershipApi";

export default function PackageDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pkg, setPkg] = useState(null);
    const [loading, setLoading] = useState(true);

    // Registration State
    const [showModal, setShowModal] = useState(false);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchPackage = async () => {
            try {
                setLoading(true);
                const allPackages = await getActivePackages();
                const found = allPackages.find(p => p.id.toString() === id);
                if (found) {
                    setPkg(found);
                } else {
                    alert("Không tìm thấy thông tin gói tập.");
                    navigate("/member/packages");
                }
            } catch (error) {
                console.error("Error fetching package detail:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPackage();
    }, [id, navigate]);

    const handleRegister = async () => {
        if (!startDate) {
            alert("Vui lòng chọn ngày bắt đầu tập luyện");
            return;
        }

        try {
            setSubmitting(true);
            await registerPackage(pkg.id, startDate);
            alert("Đã gửi yêu cầu đăng ký! Vui lòng chờ Admin xác nhận thanh toán để kích hoạt thẻ tập.");
            setShowModal(false);
            navigate("/member/profile"); // Or dashboard
        } catch (error) {
            console.error("Error registering package:", error);
            alert(error.response?.data || "Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "#64748b" }}>
            <div className="loader">Đang tải chi tiết...</div>
        </div>
    );

    if (!pkg) return null;

    return (
        <div style={{ maxWidth: "1000px", margin: "40px auto", padding: "0 20px" }}>
            <button
                onClick={() => navigate(-1)}
                style={{
                    background: "none",
                    border: "none",
                    color: "#2563eb",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "20px"
                }}
            >
                ← Quay lại danh sách
            </button>

            <div style={{
                background: "white",
                borderRadius: "32px",
                overflow: "hidden",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: window.innerWidth < 800 ? "column" : "row",
                minHeight: "500px",
                border: "1px solid #f1f5f9"
            }}>
                {/* Left: Image */}
                <div style={{
                    flex: "1",
                    background: "#f8fafc",
                    position: "relative",
                    minHeight: "400px"
                }}>
                    {pkg.image ? (
                        <img
                            src={`data:image/png;base64,${pkg.image}`}
                            alt={pkg.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "5rem" }}>
                            🏋️
                        </div>
                    )}
                    <div style={{
                        position: "absolute",
                        top: "20px",
                        left: "20px",
                        background: "rgba(255,255,255,0.9)",
                        backdropFilter: "blur(4px)",
                        padding: "8px 20px",
                        borderRadius: "20px",
                        fontSize: "0.85rem",
                        fontWeight: "800",
                        color: "#2563eb",
                        boxShadow: "0 4px 6px rgba(0,0,0,0.05)"
                    }}>
                        {pkg.category}
                    </div>
                </div>

                {/* Right: Info */}
                <div style={{ flex: "1.2", padding: "50px", display: "flex", flexDirection: "column" }}>
                    <div style={{ marginBottom: "30px" }}>
                        <h1 style={{ fontSize: "2.5rem", fontWeight: "900", color: "#0f172a", marginBottom: "15px", lineHeight: "1.1" }}>{pkg.name}</h1>
                        <p style={{ fontSize: "1.1rem", color: "#64748b", lineHeight: "1.8" }}>{pkg.description}</p>
                    </div>

                    {pkg.promotion && (
                        <div style={{
                            background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
                            border: "2px solid #fcd34d",
                            borderRadius: "20px",
                            padding: "25px",
                            marginBottom: "35px",
                            position: "relative"
                        }}>
                            <div style={{
                                position: "absolute",
                                top: "-15px",
                                left: "20px",
                                background: "#f59e0b",
                                color: "white",
                                padding: "2px 15px",
                                borderRadius: "10px",
                                fontSize: "0.75rem",
                                fontWeight: "900"
                            }}>ƯU ĐÃI ĐẶC BIỆT</div>
                            <p style={{ margin: 0, color: "#92400e", fontWeight: "700", fontSize: "1.05rem", lineHeight: "1.6" }}>
                                ✨ {pkg.promotion}
                            </p>
                        </div>
                    )}

                    <div style={{ marginTop: "auto" }}>
                        <div style={{ marginBottom: "30px" }}>
                            <div style={{ color: "#94a3b8", fontSize: "0.95rem", fontWeight: "600", marginBottom: "5px" }}>Giá trọn gói</div>
                            <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                                <span style={{ fontSize: "3rem", fontWeight: "900", color: "#0f172a" }}>{pkg.price?.toLocaleString()}</span>
                                <span style={{ fontSize: "1.2rem", fontWeight: "700", color: "#64748b" }}>VNĐ / {pkg.durationInDays} ngày</span>
                            </div>
                        </div>

                        <button style={{
                            width: "100%",
                            padding: "20px",
                            borderRadius: "20px",
                            background: "#2563eb",
                            color: "white",
                            border: "none",
                            fontSize: "1.2rem",
                            fontWeight: "800",
                            cursor: "pointer",
                            transition: "all 0.3s",
                            boxShadow: "0 10px 15px -3px rgba(37,99,235,0.3)"
                        }}
                            onClick={() => setShowModal(true)}
                            onMouseOver={(e) => e.target.style.background = "#1d4ed8"}
                            onMouseOut={(e) => e.target.style.background = "#2563eb"}
                        >
                            Đăng ký tập ngay
                        </button>
                        <p style={{ textAlign: "center", marginTop: "15px", fontSize: "0.85rem", color: "#94a3b8" }}>
                            Hỗ trợ trả góp qua thẻ tín dụng từ 0% lãi suất.
                        </p>
                    </div>
                </div>
            </div>

            {/* Registration Modal */}
            {showModal && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0,0,0,0.8)",
                    backdropFilter: "blur(8px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000,
                    padding: "20px"
                }}>
                    <div style={{
                        background: "white",
                        width: "100%",
                        maxWidth: "500px",
                        borderRadius: "32px",
                        padding: "40px",
                        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
                        border: "1px solid rgba(255,255,255,0.1)"
                    }}>
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "900", color: "#0f172a", marginBottom: "10px" }}>🗓️ Bắt đầu luyện tập</h2>
                        <p style={{ color: "#64748b", marginBottom: "30px", lineHeight: "1.6" }}>
                            Sau khi bạn xác nhận, yêu cầu sẽ được gửi tới Admin ở trạng thái <b>Chờ duyệt</b>. Thẻ tập sẽ chính thức kích hoạt sau khi bạn hoàn tất thanh toán tại quầy.
                        </p>

                        <div style={{ marginBottom: "30px" }}>
                            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "700", color: "#475569", marginBottom: "10px" }}>
                                Ngày bắt đầu (Start Day)
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={(e) => setStartDate(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "15px",
                                    borderRadius: "15px",
                                    border: "2px solid #f1f5f9",
                                    background: "#f8fafc",
                                    fontSize: "1rem",
                                    color: "#1e293b",
                                    fontWeight: "600",
                                    outline: "none"
                                }}
                            />
                        </div>

                        <div style={{ display: "flex", gap: "15px" }}>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    flex: 1,
                                    padding: "16px",
                                    borderRadius: "16px",
                                    background: "#f1f5f9",
                                    color: "#475569",
                                    border: "none",
                                    fontWeight: "700",
                                    cursor: "pointer"
                                }}
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleRegister}
                                disabled={submitting}
                                style={{
                                    flex: 2,
                                    padding: "16px",
                                    borderRadius: "16px",
                                    background: "#0f172a",
                                    color: "white",
                                    border: "none",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                    opacity: submitting ? 0.7 : 1
                                }}
                            >
                                {submitting ? "Đang xử lý..." : "Xác nhận đăng ký"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
