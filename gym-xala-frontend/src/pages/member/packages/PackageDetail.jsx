import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPackageById } from "../../../api/packageApi";
import { registerPackage, getCurrentCard } from "../../../api/membershipApi";

export default function PackageDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pkg, setPkg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userActiveCard, setUserActiveCard] = useState(null);

    // Registration State
    const [showModal, setShowModal] = useState(false);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [packageData, cardData] = await Promise.all([
                    getPackageById(id),
                    getCurrentCard()
                ]);
                setPkg(packageData);
                setUserActiveCard(cardData);
            } catch (error) {
                console.error("Error fetching data:", error);
                alert("Không tìm thấy thông tin gói tập.");
                navigate("/member/packages");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
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
            navigate("/member/profile"); 
        } catch (error) {
            console.error("Error registering package:", error);
            alert(error.response?.data || "Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh", color: "#64748b" }}>
            <div className="loader">Đang tải chi tiết...</div>
        </div>
    );

    if (!pkg) return null;

    return (
        <div style={{ maxWidth: "1200px", margin: "40px auto", padding: "0 20px", color: "#e2e8f0" }}>
            <button
                onClick={() => navigate(-1)}
                style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid #27272a",
                    color: "#d0fd3e",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "30px",
                    padding: "10px 20px",
                    borderRadius: "12px",
                    transition: "all 0.2s"
                }}
                onMouseOver={(e) => e.target.style.background = "rgba(208, 253, 62, 0.1)"}
                onMouseOut={(e) => e.target.style.background = "rgba(255,255,255,0.05)"}
            >
                ← Quay lại danh sách
            </button>

            <div style={{
                background: "#18181b",
                borderRadius: "32px",
                overflow: "hidden",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
                display: "flex",
                flexDirection: "column",
                border: "1px solid #27272a",
                marginBottom: "40px"
            }}>
                <div style={{
                    display: "flex",
                    flexDirection: window.innerWidth < 900 ? "column" : "row",
                }}>
                    {/* Left: Image */}
                    <div style={{
                        flex: "1",
                        background: "#09090b",
                        position: "relative",
                        minHeight: "450px"
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
                            background: "rgba(208, 253, 62, 0.9)",
                            padding: "8px 20px",
                            borderRadius: "12px",
                            fontSize: "0.85rem",
                            fontWeight: "800",
                            color: "#000",
                            boxShadow: "0 4px 15px rgba(208, 253, 62, 0.3)"
                        }}>
                            {pkg.category}
                        </div>
                    </div>

                    {/* Right: Info */}
                    <div style={{ flex: "1.2", padding: "50px", display: "flex", flexDirection: "column" }}>
                        <div style={{ marginBottom: "30px" }}>
                            <h1 style={{ fontSize: "2.8rem", fontWeight: "900", color: "#fff", marginBottom: "15px", lineHeight: "1.1" }}>{pkg.name}</h1>
                            <p style={{ fontSize: "1.1rem", color: "#a1a1aa", lineHeight: "1.8" }}>{pkg.description}</p>
                        </div>

                        {pkg.promotion && (
                            <div style={{
                                background: "linear-gradient(135deg, rgba(208, 253, 62, 0.1) 0%, rgba(208, 253, 62, 0.05) 100%)",
                                border: "1px dashed #d0fd3e",
                                borderRadius: "20px",
                                padding: "25px",
                                marginBottom: "35px",
                                position: "relative"
                            }}>
                                <div style={{
                                    position: "absolute",
                                    top: "-12px",
                                    left: "20px",
                                    background: "#d0fd3e",
                                    color: "#000",
                                    padding: "2px 12px",
                                    borderRadius: "8px",
                                    fontSize: "0.7rem",
                                    fontWeight: "900"
                                }}>ƯU ĐÃI ĐẶC BIỆT</div>
                                <p style={{ margin: 0, color: "#d0fd3e", fontWeight: "700", fontSize: "1.05rem", lineHeight: "1.6" }}>
                                    ✨ {pkg.promotion}
                                </p>
                            </div>
                        )}

                        <div style={{ marginTop: "auto" }}>
                            <div style={{ marginBottom: "30px", padding: "20px", background: "#27272a", borderRadius: "24px" }}>
                                <div style={{ color: "#a1a1aa", fontSize: "0.95rem", fontWeight: "600", marginBottom: "5px" }}>Giá trọn gói</div>
                                <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                                    <span style={{ fontSize: "3rem", fontWeight: "900", color: "#d0fd3e" }}>{pkg.price?.toLocaleString()}</span>
                                    <span style={{ fontSize: "1.2rem", fontWeight: "700", color: "#a1a1aa" }}>VNĐ / {pkg.durationInDays} ngày</span>
                                </div>
                            </div>

                            <button style={{
                                width: "100%",
                                padding: "20px",
                                borderRadius: "20px",
                                background: userActiveCard ? "#27272a" : "linear-gradient(90deg, #d0fd3e 0%, #b5e625 100%)",
                                color: userActiveCard ? "#a1a1aa" : "#000",
                                border: "none",
                                fontSize: "1.2rem",
                                fontWeight: "800",
                                cursor: userActiveCard ? "not-allowed" : "pointer",
                                transition: "all 0.3s",
                                boxShadow: userActiveCard ? "none" : "0 10px 20px rgba(208, 253, 62, 0.2)"
                            }}
                                onClick={() => !userActiveCard && setShowModal(true)}
                                onMouseOver={(e) => !userActiveCard && (e.target.style.transform = "translateY(-4px)")}
                                onMouseOut={(e) => !userActiveCard && (e.target.style.transform = "translateY(0)")}
                            >
                                {userActiveCard 
                                    ? `Đã có gói tập (${userActiveCard.status === 'PENDING' ? 'Chờ duyệt' : 'Đang hoạt động'})` 
                                    : "Đăng ký tập ngay"}
                            </button>
                            {userActiveCard && (
                                <p style={{ color: "#71717a", fontSize: "0.85rem", textAlign: "center", marginTop: "15px", fontWeight: "600" }}>
                                    Hệ thống chỉ cho phép đăng ký tối đa 1 gói tập tại cùng thời điểm.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ROADMAPS SECTION */}
            <div style={{ marginBottom: "60px" }}>
                <h2 style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "30px", borderLeft: "6px solid #d0fd3e", paddingLeft: "15px" }}>Lộ trình tập luyện chi tiết</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "25px" }}>
                    {pkg.roadmaps && pkg.roadmaps.length > 0 ? (
                        pkg.roadmaps.map((rm, index) => (
                            <div key={rm.id} style={{ 
                                background: "#18181b", 
                                border: "1px solid #27272a", 
                                borderRadius: "24px", 
                                padding: "30px",
                                position: "relative",
                                overflow: "hidden"
                            }}>
                                <div style={{ 
                                    position: "absolute", 
                                    top: "0", 
                                    right: "0", 
                                    background: "#27272a", 
                                    padding: "10px 20px", 
                                    borderBottomLeftRadius: "20px",
                                    fontSize: "1.5rem",
                                    fontWeight: "900",
                                    color: "#3f3f46"
                                }}>0{index + 1}</div>
                                <h3 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#fff", marginBottom: "15px" }}>{rm.name}</h3>
                                <p style={{ color: "#a1a1aa", lineHeight: "1.7", fontSize: "0.95rem", marginBottom: "20px" }}>
                                    {rm.description || "Chưa có mô tả chi tiết cho lộ trình này."}
                                </p>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <span style={{ padding: "6px 12px", background: "rgba(208, 253, 62, 0.1)", color: "#d0fd3e", borderRadius: "8px", fontSize: "0.8rem", fontWeight: "700" }}>
                                        {rm.sessionCount} buổi tập
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ gridColumn: "1/-1", padding: "40px", background: "#18181b", borderRadius: "20px", textAlign: "center", color: "#71717a" }}>
                            Thông tin lộ trình đang được cập nhật...
                        </div>
                    )}
                </div>
            </div>

            {/* PT SECTION */}
            <div style={{ marginBottom: "60px" }}>
                <h2 style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "30px", borderLeft: "6px solid #d0fd3e", paddingLeft: "15px" }}>Đội ngũ Huấn luyện viên (PT)</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "30px" }}>
                    {pkg.personalTrainers && pkg.personalTrainers.length > 0 ? (
                        pkg.personalTrainers.map((pt) => (
                            <div key={pt.id} style={{ 
                                background: "#18181b", 
                                border: "1px solid #27272a", 
                                borderRadius: "24px", 
                                padding: "25px",
                                textAlign: "center",
                                transition: "all 0.3s"
                            }}
                            onMouseOver={(e) => e.currentTarget.style.borderColor = "#d0fd3e"}
                            onMouseOut={(e) => e.currentTarget.style.borderColor = "#27272a"}
                            >
                                <div style={{ 
                                    width: "120px", 
                                    height: "120px", 
                                    borderRadius: "50%", 
                                    margin: "0 auto 20px", 
                                    border: "3px solid #d0fd3e",
                                    overflow: "hidden",
                                    padding: "5px",
                                    background: "#000"
                                }}>
                                    {pt.avatar ? (
                                        <img 
                                            src={`data:image/png;base64,${pt.avatar}`} 
                                            style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                                            alt={pt.name}
                                        />
                                    ) : (
                                        <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#27272a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>👤</div>
                                    )}
                                </div>
                                <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#fff", marginBottom: "8px" }}>{pt.name}</h3>
                                <div style={{ color: "#d0fd3e", fontSize: "0.85rem", fontWeight: "700", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
                                    {pt.ptSpecialty || "Chuyên gia thể hình"}
                                </div>
                                <p style={{ color: "#a1a1aa", fontSize: "0.85rem", lineHeight: "1.6", marginBottom: "15px" }}>
                                    {pt.ptBio ? (pt.ptBio.length > 80 ? pt.ptBio.substring(0, 80) + "..." : pt.ptBio) : "PT giàu kinh nghiệm, tận tâm hướng dẫn học viên."}
                                </p>
                                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "5px", color: "#fbbf24" }}>
                                    {"★".repeat(Math.round(pt.ptRating || 5))}
                                    <span style={{ color: "#71717a", fontSize: "0.8rem", marginLeft: "5px" }}>({pt.ptRating || "5.0"})</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ gridColumn: "1/-1", padding: "40px", background: "#18181b", borderRadius: "20px", textAlign: "center", color: "#71717a" }}>
                            Đang sắp xếp huấn luyện viên cho gói tập này...
                        </div>
                    )}
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
                    background: "rgba(0,0,0,0.9)",
                    backdropFilter: "blur(10px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000,
                    padding: "20px"
                }}>
                    <div style={{
                        background: "#18181b",
                        width: "100%",
                        maxWidth: "500px",
                        borderRadius: "32px",
                        padding: "40px",
                        boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
                        border: "1px solid #27272a"
                    }}>
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "900", color: "#fff", marginBottom: "15px" }}>🗓️ Bắt đầu luyện tập</h2>
                        <p style={{ color: "#a1a1aa", marginBottom: "30px", lineHeight: "1.6" }}>
                            Sau khi bạn xác nhận, yêu cầu sẽ được gửi tới Admin. Thẻ tập sẽ có thời hạn <b>{pkg.durationInDays} ngày</b> kể từ lúc kích hoạt.
                        </p>

                        <div style={{ marginBottom: "30px" }}>
                            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "700", color: "#d0fd3e", marginBottom: "12px" }}>
                                Ngày bắt đầu mong muốn
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={(e) => setStartDate(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "16px",
                                    borderRadius: "15px",
                                    border: "1px solid #27272a",
                                    background: "#09090b",
                                    fontSize: "1rem",
                                    color: "#fff",
                                    fontWeight: "600",
                                    outline: "none",
                                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)"
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
                                    background: "#27272a",
                                    color: "#fff",
                                    border: "none",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                    transition: "all 0.2s"
                                }}
                                onMouseOver={(e) => e.target.style.background = "#3f3f46"}
                                onMouseOut={(e) => e.target.style.background = "#27272a"}
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
                                    background: "linear-gradient(90deg, #d0fd3e 0%, #b5e625 100%)",
                                    color: "#000",
                                    border: "none",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                    transition: "all 0.2s",
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
