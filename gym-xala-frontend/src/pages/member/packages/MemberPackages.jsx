import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getActivePackages } from "../../../api/packageApi";

export default function MemberPackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const data = await getActivePackages();
        setPackages(data);
      } catch (error) {
        console.error("Error fetching packages:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px", color: "#64748b" }}>
      <div className="loader">Đang tải gói tập...</div>
    </div>
  );

  return (
    <div style={{ padding: "30px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ marginBottom: "10px", fontSize: "2.2rem", fontWeight: "900", color: "#ffffffff", letterSpacing: "-0.025em" }}>
          💳 Chọn gói tập của bạn
        </h1>
        <p style={{ color: "#64748b", fontSize: "1.1rem" }}>Bắt đầu hành trình thay đổi bản thân ngay hôm nay với các lộ trình chuyên nghiệp.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "30px" }}>
        {packages.map(pkg => (
          <div key={pkg.id} className="package-card" style={{
            background: "white",
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)",
            display: "flex",
            flexDirection: "column",
            border: "1px solid #f1f5f9",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            cursor: "pointer",
            position: "relative"
          }}
            onClick={() => navigate(`/member/packages/${pkg.id}`)}>

            {pkg.image ? (
              <div style={{ width: "100%", height: "200px", position: "relative" }}>
                <img
                  src={`data:image/png;base64,${pkg.image}`}
                  alt={pkg.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div style={{
                  position: "absolute",
                  bottom: "0",
                  left: "0",
                  right: "0",
                  height: "50%",
                  background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)"
                }}></div>
              </div>
            ) : (
              <div style={{ width: "100%", height: "200px", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }}>
                🏋️
              </div>
            )}

            <div style={{ padding: "24px", display: "flex", flexDirection: "column", flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <span style={{
                  background: "#eff6ff",
                  color: "#2563eb",
                  padding: "5px 14px",
                  borderRadius: "20px",
                  fontSize: "0.75rem",
                  fontWeight: "800",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em"
                }}>
                  {pkg.category}
                </span>
                {pkg.promotion && (
                  <span style={{
                    background: "#fef3c7",
                    color: "#92400e",
                    padding: "5px 14px",
                    borderRadius: "20px",
                    fontSize: "0.75rem",
                    fontWeight: "800",
                  }}>
                    🔥 ƯU ĐÃI
                  </span>
                )}
              </div>

              <h3 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#1e293b", marginBottom: "8px" }}>{pkg.name}</h3>
              <p style={{ color: "#64748b", fontSize: "0.95rem", lineHeight: "1.6", marginBottom: "15px", height: "45px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                {pkg.description}
              </p>

              {/* ROADMAPS SUMMARY */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ display: "inline-block", width: "12px", height: "2px", background: "#2563eb" }}></span>
                  Lộ trình huấn luyện
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {pkg.roadmaps && pkg.roadmaps.length > 0 ? (
                    pkg.roadmaps.slice(0, 2).map((rm, idx) => (
                      <div key={idx} style={{
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        padding: "5px 10px",
                        borderRadius: "10px",
                        fontSize: "0.8rem",
                        color: "#475569",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}>
                        <span style={{ color: "#2563eb" }}>✓</span> {rm.name}
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: "0.85rem", color: "#94a3b8", fontStyle: "italic" }}>
                      Đang cập nhật lộ trình cụ thể...
                    </div>
                  )}
                  {pkg.roadmaps && pkg.roadmaps.length > 2 && (
                    <div style={{ fontSize: "0.8rem", color: "#64748b", alignSelf: "center", fontWeight: "600" }}>
                      +{pkg.roadmaps.length - 2} khác
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginTop: "auto" }}>
                {pkg.promotion && (
                  <div style={{
                    background: "#fffbeb",
                    border: "1px dashed #fcd34d",
                    borderRadius: "12px",
                    padding: "10px 15px",
                    fontSize: "0.85rem",
                    color: "#92400e",
                    marginBottom: "20px",
                    fontWeight: "600"
                  }}>
                    🎁 {pkg.promotion.substring(0, 50)}{pkg.promotion.length > 50 ? "..." : ""}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "20px" }}>
                  <div>
                    <div style={{ color: "#94a3b8", fontSize: "0.85rem", fontWeight: "600", marginBottom: "2px" }}>Giá chỉ từ</div>
                    <div style={{ fontSize: "1.8rem", fontWeight: "900", color: "#2563eb" }}>
                      {pkg.price?.toLocaleString()} <span style={{ fontSize: "0.9rem", fontWeight: "700" }}>đ</span>
                    </div>
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: "0.85rem", fontWeight: "600", paddingBottom: "5px" }}>
                    / {pkg.durationInDays} ngày
                  </div>
                </div>

                <button style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "14px",
                  background: "#0f172a",
                  color: "white",
                  border: "none",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow: "0 4px 6px -1px rgba(15,23,42,0.1)"
                }}>
                  Xem chi tiết
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {packages.length === 0 && (
        <div style={{ textAlign: "center", padding: "100px 20px", background: "white", borderRadius: "30px", marginTop: "30px" }}>
          <div style={{ fontSize: "4rem", marginBottom: "20px" }}>📭</div>
          <h3 style={{ fontSize: "1.5rem", color: "#1e293b", marginBottom: "10px" }}>Chưa có gói tập nào</h3>
          <p style={{ color: "#64748b" }}>Vui lòng quay lại sau hoặc liên hệ Admin để được hỗ trợ.</p>
        </div>
      )}

      <style>
        {`
          .package-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
          }
          .package-card button:hover {
            background: #1e293b;
            transform: scale(1.02);
          }
        `}
      </style>
    </div>
  );
}
