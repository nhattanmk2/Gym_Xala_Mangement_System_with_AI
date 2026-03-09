import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";
import {
  getAllPackages,
  createPackage,
  updatePackage,
  deletePackage,
  togglePackageActive
} from "../../api/adminPackageApi";
import { getCategories, getExercisesByCategory, getLevelsByExercise } from "../../api/adminExerciseApi";
import { getAllEquipment } from "../../api/adminEquipmentApi";
import "./packageManagement.css";

const PackageManagement = () => {
  const navigate = useNavigate();
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
    promotion: "",
    maxSessions: "",
    roadmaps: []
  });

  // Auxiliary data for dropdowns
  const [categories, setCategories] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [exerciseOptions, setExerciseOptions] = useState([]);
  const [levelOptions, setLevelOptions] = useState([]);

  // Modal control for nesting
  const [showRoadmapModal, setShowRoadmapModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);

  // Draft states for currently adding items
  const [currentRoadmap, setCurrentRoadmap] = useState({ name: "", description: "", sessions: [] });
  const [currentSession, setCurrentSession] = useState({ name: "", exercises: [] });
  const [currentExercise, setCurrentExercise] = useState({
    categoryId: "",
    standardExerciseId: "",
    exerciseLevelId: ""
  });
  const [activeRoadmapIndex, setActiveRoadmapIndex] = useState(-1);
  const [activeSessionIndex, setActiveSessionIndex] = useState(-1);

  useEffect(() => {
    fetchPackages();
    fetchAuxData();
  }, []);

  const fetchAuxData = async () => {
    try {
      const [catRes, equipRes] = await Promise.all([
        getCategories(),
        getAllEquipment()
      ]);
      setCategories(catRes.data);
      setEquipmentList(equipRes.data);
    } catch (err) {
      console.error("Error fetching aux data:", err);
    }
  };

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
        maxSessions: pkg.maxSessions ? pkg.maxSessions.toString() : "",
        category: pkg.category,
        active: pkg.active,
        promotion: pkg.promotion || "",
        roadmaps: pkg.roadmaps || []
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
        promotion: "",
        maxSessions: "",
        roadmaps: []
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
    if (formData.maxSessions && parseInt(formData.maxSessions) < 0) {
      alert("Số buổi tập tối đa không được âm");
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

  // --- Roadmap & Nested UI Logic ---

  const handleAddRoadmap = () => {
    setCurrentRoadmap({ name: "", description: "", sessions: [] });
    setShowRoadmapModal(true);
  };

  const saveRoadmapDraft = () => {
    if (!currentRoadmap.name) return alert("Nhập tên lộ trình");
    const newRoadmaps = [...formData.roadmaps, { ...currentRoadmap, orderIndex: formData.roadmaps.length + 1 }];
    setFormData({ ...formData, roadmaps: newRoadmaps });
    setShowRoadmapModal(false);
  };

  const handleAddSession = (rmIndex) => {
    setActiveRoadmapIndex(rmIndex);
    setCurrentSession({ name: "", exercises: [] });
    setShowSessionModal(true);
  };

  const saveSessionDraft = () => {
    if (!currentSession.name) return alert("Nhập tên buổi tập");
    const newRoadmaps = [...formData.roadmaps];
    const roadmap = newRoadmaps[activeRoadmapIndex];
    roadmap.sessions = [...(roadmap.sessions || []), { ...currentSession, orderIndex: (roadmap.sessions?.length || 0) + 1 }];
    setFormData({ ...formData, roadmaps: newRoadmaps });
    setShowSessionModal(false);
  };

  const handleAddExercise = (rmIndex, sessIndex) => {
    setActiveRoadmapIndex(rmIndex);
    setActiveSessionIndex(sessIndex);
    setCurrentExercise({ categoryId: "", standardExerciseId: "", exerciseLevelId: "" });
    setShowExerciseModal(true);
  };

  const onCategoryChange = async (catId) => {
    setCurrentExercise({ ...currentExercise, categoryId: catId, standardExerciseId: "", exerciseLevelId: "" });
    const res = await getExercisesByCategory(catId);
    setExerciseOptions(res.data);
  };

  const onExerciseChange = async (exId) => {
    setCurrentExercise({ ...currentExercise, standardExerciseId: exId, exerciseLevelId: "" });
    const res = await getLevelsByExercise(exId);
    setLevelOptions(res.data);
  };

  const saveExerciseDraft = () => {
    if (!currentExercise.exerciseLevelId) return alert("Chọn mức độ bài tập");
    const newRoadmaps = [...formData.roadmaps];
    const sess = newRoadmaps[activeRoadmapIndex].sessions[activeSessionIndex];
    sess.exercises = [...(sess.exercises || []), {
      exerciseLevelId: parseInt(currentExercise.exerciseLevelId),
      orderIndex: (sess.exercises?.length || 0) + 1
    }];
    setFormData({ ...formData, roadmaps: newRoadmaps });
    setShowExerciseModal(false);
  };

  const removeRoadmap = (idx) => {
    const news = formData.roadmaps.filter((_, i) => i !== idx);
    setFormData({ ...formData, roadmaps: news });
  };

  const handleOpenRoadmap = (pkg) => {
    navigate(`/admin/packages/${pkg.id}/roadmap`);
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
            <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
              {pkg.durationInDays} ngày {pkg.maxSessions ? `• ${pkg.maxSessions} buổi` : ""}
            </div>
          </div>
          <div style={{ display: "flex", gap: "5px" }}>
            <button onClick={() => handleOpenRoadmap(pkg)} title="Lộ trình tập" style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "6px", borderRadius: "6px", cursor: "pointer" }}>📋</button>
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
                    <th style={{ padding: "18px", textAlign: "left", fontSize: "0.85rem", fontWeight: "700", color: "#475569" }}>Lợi ích</th>
                    <th style={{ padding: "18px", textAlign: "left", fontSize: "0.85rem", fontWeight: "700", color: "#475569" }}>Giá (VNĐ)</th>
                    <th style={{ padding: "18px", textAlign: "left", fontSize: "0.85rem", fontWeight: "700", color: "#475569" }}>Thời hạn / Số buổi</th>
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
                      <td style={{ padding: "18px", color: "#64748b", fontSize: "0.85rem" }}>
                        <div>{pkg.durationInDays} ngày</div>
                        {pkg.maxSessions && (
                          <div style={{ fontSize: "0.75rem", color: "#2563eb", marginTop: "4px", fontWeight: "600" }}>
                            {pkg.maxSessions} buổi
                          </div>
                        )}
                      </td>
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
                          <button onClick={() => handleOpenRoadmap(pkg)} style={{ background: "none", border: "1px solid #bfdbfe", color: "#2563eb", padding: "6px 12px", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer" }}>Lộ trình</button>
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
          <div className="modal-overlay">
            <div className="modal-content">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3>{editingPkg ? "Chỉnh sửa gói tập" : "Thêm gói tập mới"}</h3>
                <button onClick={handleCloseModal} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#94a3b8" }}>&times;</button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="image-upload-section">
                  <div className="image-preview-box">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" />
                    ) : (
                      <div style={{ color: "#cbd5e1", fontSize: "2.5rem" }}>🖼️</div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <input type="file" id="package-image" hidden onChange={handleImageChange} accept="image/*" />
                    <label htmlFor="package-image" className="upload-btn">Chọn ảnh minh họa</label>
                    <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "5px" }}>Dung lượng tối đa 2MB. Định dạng JPG, PNG.</p>
                  </div>
                </div>

                <div className="form-group">
                  <label>Tên gói tập *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="VD: Gói tập Premium 12 tháng"
                  />
                </div>

                <div className="form-group">
                  <label>Loại gói (Category)</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="GENERAL">Chung (General)</option>
                    <option value="CARDIO">Tim mạch (Cardio)</option>
                    <option value="MUSCLE">Tăng cơ (Muscle)</option>
                    <option value="YOGA">Yoga</option>
                  </select>
                </div>

                <div style={{ display: "flex", gap: "15px" }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Giá niêm yết (VNĐ) *</label>
                    <input
                      type="text"
                      value={formatCurrency(formData.price)}
                      onChange={handlePriceChange}
                      required
                      placeholder="0"
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Thời hạn (Ngày) *</label>
                    <input
                      type="number"
                      value={formData.durationInDays}
                      onChange={handleDurationChange}
                      required
                      placeholder="30"
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Số buổi tập (Tùy chọn)</label>
                    <input
                      type="number"
                      value={formData.maxSessions}
                      onChange={(e) => setFormData({ ...formData, maxSessions: e.target.value })}
                      placeholder="VD: 15"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Mô tả chi tiết</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    placeholder="Nhập các quyền lợi đi kèm..."
                  />
                </div>

                <div className="form-group">
                  <label>Khuyến mãi & Quà tặng (Highlight)</label>
                  <input
                    className="promotion-input"
                    type="text"
                    value={formData.promotion}
                    onChange={(e) => setFormData({ ...formData, promotion: e.target.value })}
                    placeholder="VD: Tặng áo thun + Bình nước Gym Xala..."
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={handleCloseModal}>Hủy bỏ</button>
                  <button type="submit" className="btn-submit">{editingPkg ? "Cập nhật" : "Thêm Mới"}</button>
                </div>
              </form>
            </div>
          </div>
        )}


      </div>
    </AdminLayout>
  );
};

export default PackageManagement;
