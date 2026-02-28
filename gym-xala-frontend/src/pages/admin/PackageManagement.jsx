import { useState, useEffect } from "react";
import AdminLayout from "./layout/AdminLayout";
import {
  getAllPackages,
  createPackage,
  updatePackage,
  deletePackage,
  togglePackageActive
} from "../../api/adminPackageApi";

const PackageManagement = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'cards'
  const [showModal, setShowModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    durationInDays: "",
    category: "GENERAL",
    active: true,
    promotion: ""
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const data = await getAllPackages();
      setPackages(data);
    } catch (error) {
      console.error("Error fetching packages:", error);
      alert("Không thể tải danh sách gói tập.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (pkg = null) => {
    if (pkg) {
      setEditingPkg(pkg);
      setFormData({
        name: pkg.name,
        description: pkg.description,
        price: pkg.price.toString(),
        durationInDays: pkg.durationInDays.toString(),
        category: pkg.category,
        active: pkg.active,
        promotion: pkg.promotion || ""
      });
      setImagePreview(pkg.image ? `data:image/png;base64,${pkg.image}` : "");
    } else {
      setEditingPkg(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        durationInDays: "",
        category: "GENERAL",
        active: true,
        promotion: ""
      });
      setImagePreview("");
    }
    setImageFile(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPkg(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const formatCurrency = (value) => {
    if (!value) return "";
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handlePriceChange = (e) => {
    const value = e.target.value.replace(/\./g, "");
    if (!isNaN(value) && parseInt(value || 0) >= 0) {
      setFormData({ ...formData, price: value });
    }
  };

  const handleDurationChange = (e) => {
    const value = e.target.value;
    if (!isNaN(value) && parseInt(value || 0) >= 0) {
      setFormData({ ...formData, durationInDays: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (parseInt(formData.price) <= 0) {
      alert("Giá tiền phải lớn hơn 0");
      return;
    }
    if (parseInt(formData.durationInDays) <= 0) {
      alert("Thời gian phải ít nhất 1 ngày");
      return;
    }

    try {
      const data = new FormData();
      // Send data part as JSON to match Spring's expectation for @RequestPart DTO
      data.append("data", new Blob([JSON.stringify(formData)], { type: 'application/json' }));
      if (imageFile) {
        data.append("image", imageFile);
      }

      if (editingPkg) {
        await updatePackage(editingPkg.id, data);
        alert("Cập nhật gói tập thành công!");
      } else {
        await createPackage(data);
        alert("Thêm gói tập mới thành công!");
      }
      handleCloseModal();
      fetchPackages();
    } catch (error) {
      console.error("Error saving package:", error);
      alert("Lỗi khi lưu gói tập.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa gói tập này?")) {
      try {
        await deletePackage(id);
        alert("Đã xóa gói tập.");
        fetchPackages();
      } catch (error) {
        console.error("Error deleting package:", error);
        alert("Lỗi khi xóa gói tập.");
      }
    }
  };

  const handleToggle = async (id) => {
    try {
      await togglePackageActive(id);
      fetchPackages();
    } catch (error) {
      console.error("Error toggling package:", error);
      alert("Lỗi khi thay đổi trạng thái.");
    }
  };

  const PackageCard = ({ pkg }) => (
    <div style={{
      background: "white",
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
      border: "1px solid #f1f5f9",
      position: "relative"
    }}>
      <div style={{ position: "absolute", top: "10px", right: "10px", zIndex: 1 }}>
        <button
          onClick={() => handleToggle(pkg.id)}
          style={{
            background: pkg.active ? "#dcfce7" : "#fee2e2",
            color: pkg.active ? "#166534" : "#991b1b",
            border: "none",
            padding: "4px 10px",
            borderRadius: "20px",
            fontSize: "0.7rem",
            fontWeight: "700",
            cursor: "pointer"
          }}
        >
          {pkg.active ? "Đang hiện" : "Đang ẩn"}
        </button>
      </div>
      <div style={{ width: "100%", height: "160px", background: "#f8fafc" }}>
        {pkg.image ? (
          <img src={`data:image/png;base64,${pkg.image}`} alt={pkg.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "2.5rem" }}>🖼️</div>
        )}
      </div>
      <div style={{ padding: "15px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
          <h4 style={{ margin: 0, fontSize: "1.1rem", color: "#1e293b" }}>{pkg.name}</h4>
          <span style={{ fontSize: "0.7rem", background: "#f1f5f9", padding: "2px 8px", borderRadius: "10px", color: "#64748b", fontWeight: "600" }}>{pkg.category}</span>
        </div>
        <div style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "15px", height: "40px", overflow: "hidden" }}>{pkg.description}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "12px" }}>
          <div>
            <div style={{ fontSize: "1.2rem", fontWeight: "800", color: "#2563eb" }}>{pkg.price?.toLocaleString()}đ</div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{pkg.durationInDays} ngày</div>
          </div>
          <div style={{ display: "flex", gap: "5px" }}>
            <button onClick={() => handleOpenModal(pkg)} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "6px", borderRadius: "6px", cursor: "pointer" }}>✏️</button>
            <button onClick={() => handleDelete(pkg.id)} style={{ background: "#fff1f2", border: "1px solid #fecaca", padding: "6px", borderRadius: "6px", cursor: "pointer" }}>🗑️</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="admin-member-container" style={{ padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "25px", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0 }}>Gym Package Management</h2>
            <div style={{ marginTop: "10px", display: "flex", background: "#f1f5f9", padding: "4px", borderRadius: "8px", width: "fit-content" }}>
              <button
                onClick={() => setViewMode("table")}
                style={{
                  padding: "6px 15px", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600",
                  background: viewMode === "table" ? "white" : "transparent",
                  color: viewMode === "table" ? "#2563eb" : "#64748b",
                  boxShadow: viewMode === "table" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
                }}
              >
                📊 Dạng bảng
              </button>
              <button
                onClick={() => setViewMode("cards")}
                style={{
                  padding: "6px 15px", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600",
                  background: viewMode === "cards" ? "white" : "transparent",
                  color: viewMode === "cards" ? "#2563eb" : "#64748b",
                  boxShadow: viewMode === "cards" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
                }}
              >
                🃏 Dạng thẻ (Preview)
              </button>
            </div>
          </div>
          <button
            onClick={() => handleOpenModal()}
            style={{ background: "#2563eb", color: "white", border: "none", padding: "12px 24px", borderRadius: "8px", cursor: "pointer", fontWeight: "700", boxShadow: "0 4px 6px -1px rgba(37,99,235,0.2)" }}
          >
            + Thêm gói tập mới
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "50px", color: "#64748b" }}>Đang tải dữ liệu...</div>
        ) : (
          viewMode === "table" ? (
            <div className="table-container" style={{ background: "white", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden", border: "1px solid #f1f5f9" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                  <tr>
                    <th style={{ padding: "18px", textAlign: "left", fontSize: "0.85rem", fontWeight: "700", color: "#475569" }}>Ảnh</th>
                    <th style={{ padding: "18px", textAlign: "left", fontSize: "0.85rem", fontWeight: "700", color: "#475569" }}>Tên gói</th>
                    <th style={{ padding: "18px", textAlign: "left", fontSize: "0.85rem", fontWeight: "700", color: "#475569" }}>Loại</th>
                    <th style={{ padding: "18px", textAlign: "left", fontSize: "0.85rem", fontWeight: "700", color: "#475569" }}>Giá (VNĐ)</th>
                    <th style={{ padding: "18px", textAlign: "left", fontSize: "0.85rem", fontWeight: "700", color: "#475569" }}>Thời hạn</th>
                    <th style={{ padding: "18px", textAlign: "center", fontSize: "0.85rem", fontWeight: "700", color: "#475569" }}>Trạng thái</th>
                    <th style={{ padding: "18px", textAlign: "center", fontSize: "0.85rem", fontWeight: "700", color: "#475569" }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map((pkg) => (
                    <tr key={pkg.id} style={{ borderBottom: "1px solid #f8fafc", transition: "background 0.2s" }} className="table-row-hover">
                      <td style={{ padding: "12px 18px" }}>
                        <div style={{ width: "50px", height: "50px", background: "#f1f5f9", borderRadius: "8px", overflow: "hidden" }}>
                          {pkg.image ? (
                            <img src={`data:image/png;base64,${pkg.image}`} alt={pkg.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#cbd5e1" }}>🖼️</div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "18px" }}>
                        <div style={{ fontWeight: "700", color: "#1e293b" }}>{pkg.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "2px" }}>{pkg.description?.substring(0, 40)}...</div>
                      </td>
                      <td style={{ padding: "18px" }}>
                        <span style={{ fontSize: "0.75rem", background: "#f1f5f9", padding: "3px 10px", borderRadius: "12px", color: "#64748b", fontWeight: "600" }}>{pkg.category}</span>
                      </td>
                      <td style={{ padding: "18px", fontWeight: "700", color: "#0f172a" }}>{pkg.price?.toLocaleString()}</td>
                      <td style={{ padding: "18px", color: "#64748b" }}>{pkg.durationInDays} ngày</td>
                      <td style={{ padding: "18px", textAlign: "center" }}>
                        <button
                          onClick={() => handleToggle(pkg.id)}
                          style={{
                            background: pkg.active ? "#dcfce7" : "#fee2e2",
                            color: pkg.active ? "#166534" : "#991b1b",
                            border: "none",
                            padding: "5px 14px",
                            borderRadius: "20px",
                            fontSize: "0.75rem",
                            fontWeight: "700",
                            cursor: "pointer"
                          }}
                        >
                          {pkg.active ? "● Hiện" : "○ Ẩn"}
                        </button>
                      </td>
                      <td style={{ padding: "18px", textAlign: "center" }}>
                        <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                          <button onClick={() => handleOpenModal(pkg)} style={{ background: "none", border: "1px solid #e2e8f0", padding: "6px 12px", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer" }}>Sửa</button>
                          <button onClick={() => handleDelete(pkg.id)} style={{ background: "none", border: "1px solid #fee2e2", color: "#ef4444", padding: "6px 12px", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer" }}>Xóa</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "25px" }}>
              {packages.map(pkg => <PackageCard key={pkg.id} pkg={pkg} />)}
            </div>
          )
        )}

        {showModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "white", padding: "35px", borderRadius: "20px", width: "650px", maxWidth: "95%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                <h3 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "800", color: "#0f172a" }}>{editingPkg ? "Chỉnh sửa gói tập" : "Thêm gói tập mới"}</h3>
                <button onClick={handleCloseModal} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#94a3b8" }}>&times;</button>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ display: "flex", gap: "25px", marginBottom: "25px" }}>
                  <div style={{ width: "140px" }}>
                    <div style={{ width: "140px", height: "140px", background: "#f8fafc", borderRadius: "16px", overflow: "hidden", marginBottom: "12px", border: "2px dashed #e2e8f0", position: "relative" }}>
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#cbd5e1", fontSize: "2.5rem" }}>🖼️</div>
                      )}
                    </div>
                    <input type="file" id="package-image" hidden onChange={handleImageChange} accept="image/*" />
                    <label htmlFor="package-image" style={{ display: "block", textAlign: "center", color: "#2563eb", fontSize: "0.85rem", fontWeight: "700", cursor: "pointer", padding: "8px", background: "#f0f7ff", borderRadius: "8px" }}>Chọn ảnh</label>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: "20px" }}>
                      <label style={{ display: "block", marginBottom: "8px", fontSize: "0.85rem", fontWeight: "700", color: "#475569" }}>Tên gói tập</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="VD: Gói tập Premium 12 tháng"
                        style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "0.95rem" }}
                      />
                    </div>
                    <div style={{ marginBottom: "0" }}>
                      <label style={{ display: "block", marginBottom: "8px", fontSize: "0.85rem", fontWeight: "700", color: "#475569" }}>Loại gói (Category)</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "0.95rem", background: "white" }}
                      >
                        <option value="GENERAL">Chung (General)</option>
                        <option value="CARDIO">Tim mạch (Cardio)</option>
                        <option value="MUSCLE">Tăng cơ (Muscle)</option>
                        <option value="YOGA">Yoga</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "0.85rem", fontWeight: "700", color: "#475569" }}>Giá niêm yết (VNĐ)</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type="text"
                        value={formatCurrency(formData.price)}
                        onChange={handlePriceChange}
                        required
                        placeholder="0"
                        style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "1.1rem", fontWeight: "800", color: "#2563eb" }}
                      />
                      <span style={{ position: "absolute", right: "15px", top: "12px", color: "#94a3b8", fontWeight: "600" }}>đ</span>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "0.85rem", fontWeight: "700", color: "#475569" }}>Thời hạn (Ngày)</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type="number"
                        value={formData.durationInDays}
                        onChange={handleDurationChange}
                        required
                        placeholder="30"
                        style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "0.95rem" }}
                      />
                      <span style={{ position: "absolute", right: "15px", top: "12px", color: "#94a3b8", fontSize: "0.85rem" }}>ngày</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "0.85rem", fontWeight: "700", color: "#475569" }}>Mô tả chi tiết</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    placeholder="Nhập các quyền lợi đi kèm..."
                    style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "0.95rem", resize: "none" }}
                  />
                </div>

                <div style={{ marginBottom: "30px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "0.85rem", fontWeight: "700", color: "#475569" }}>Khuyến mãi & Quà tặng (Highlight)</label>
                  <textarea
                    value={formData.promotion}
                    onChange={(e) => setFormData({ ...formData, promotion: e.target.value })}
                    rows="2"
                    placeholder="VD: Tặng áo thun + Bình nước Gym Xala..."
                    style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "2px solid #fde68a", fontSize: "0.95rem", background: "#fffbeb", resize: "none" }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                  <button type="button" onClick={handleCloseModal} style={{ padding: "12px 25px", border: "1px solid #e2e8f0", background: "white", borderRadius: "10px", cursor: "pointer", fontWeight: "600", color: "#64748b" }}>Hủy bỏ</button>
                  <button type="submit" style={{ padding: "12px 35px", background: "#2563eb", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "700", boxShadow: "0 4px 6px -1px rgba(37,99,235,0.3)" }}>Lưu thay đổi</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <style>
        {`
                    .table-row-hover:hover {
                        background-color: #f8fafc !important;
                    }
                `}
      </style>
    </AdminLayout>
  );
};

export default PackageManagement;
