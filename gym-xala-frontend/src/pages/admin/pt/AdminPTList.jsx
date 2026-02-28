import { useEffect, useState, useCallback } from "react";
import AdminLayout from "../layout/AdminLayout";
import { getAllPts, deletePt, downgradeToMember, createPt, getAllPositions, getAllLocations, getPtDetail, updatePt } from "../../../api/adminPtApi";
import "../member/adminMemberList.css"; // Reuse CSS

const AdminPTList = () => {
    const [pts, setPts] = useState([]);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);

    // Add PT Modal States
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedPt, setSelectedPt] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState("");

    const [positions, setPositions] = useState([]);
    const [locations, setLocations] = useState([]);
    const [newPt, setNewPt] = useState({
        username: "", password: "", fullName: "", email: "", phone: "",
        ptSpecialty: "", positionId: "", gymLocationId: ""
    });

    const fetchPts = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getAllPts(name, phone);
            setPts(Array.isArray(data) ? data : data.content || data.data || []);
        } catch (error) {
            console.error("Error fetching PTs:", error);
        } finally {
            setLoading(false);
        }
    }, [name, phone]);

    useEffect(() => {
        fetchPts();
        loadMetadata();
    }, [fetchPts]);

    const loadMetadata = async () => {
        try {
            const [posData, locData] = await Promise.all([getAllPositions(), getAllLocations()]);
            setPositions(posData);
            setLocations(locData);
        } catch (error) {
            console.error("Error loading PT metadata:", error);
        }
    };

    const handleAddClick = () => {
        setNewPt({
            username: "", password: "", fullName: "", email: "", phone: "",
            ptSpecialty: "", positionId: "", gymLocationId: ""
        });
        setShowAddModal(true);
    };

    const handleSaveAdd = async () => {
        try {
            if (!newPt.username || !newPt.password || !newPt.fullName || !newPt.email) {
                alert("Vui lòng điền các trường bắt buộc (*)");
                return;
            }
            await createPt(newPt);
            setShowAddModal(false);
            fetchPts();
            alert("Thêm mới Huấn luyện viên thành công!");
        } catch (error) {
            console.error("Lỗi thêm mới PT:", error);
            alert(error.response?.data || "Thêm mới thất bại.");
        }
    };

    const handleEditClick = async (id) => {
        try {
            const data = await getPtDetail(id);
            setSelectedPt(data);
            setAvatarPreview(data.avatar ? `data:image/png;base64,${data.avatar}` : "");
            setAvatarFile(null);
            setShowDetailModal(true);
        } catch (error) {
            alert("Không thể lấy thông tin chi tiết PT.");
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleUpdatePt = async () => {
        try {
            const formData = new FormData();
            const updateData = {
                fullName: selectedPt.name,
                phone: selectedPt.phone,
                ptSpecialty: selectedPt.ptSpecialty,
                positionId: selectedPt.positionId,
                gymLocationId: selectedPt.gymLocationId,
                status: selectedPt.status
            };
            formData.append("data", JSON.stringify(updateData));
            if (avatarFile) {
                formData.append("avatar", avatarFile);
            }

            await updatePt(selectedPt.id, formData);
            setShowDetailModal(false);
            fetchPts();
            alert("Cập nhật thông tin PT thành công!");
        } catch (error) {
            console.error("Lỗi cập nhật PT:", error);
            alert("Cập nhật thất bại.");
        }
    };

    const handleDowngrade = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn hạ cấp Huấn luyện viên này xuống làm Hội viên không?")) {
            try {
                await downgradeToMember(id);
                fetchPts();
                alert("Hạ cấp Huấn luyện viên thành công!");
            } catch (error) {
                console.error("Lỗi hạ cấp PT:", error);
                alert("Thao tác thất bại.");
            }
        }
    };

    const handleDeleteCompletely = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn XÓA VĨNH VIỄN tài khoản của Huấn luyện viên này không? Thao tác này không thể hoàn tác!")) {
            try {
                await deletePt(id);
                fetchPts();
                alert("Xóa vĩnh viễn Huấn luyện viên thành công!");
            } catch (error) {
                console.error("Lỗi xóa PT:", error);
                alert("Xóa thất bại.");
            }
        }
    };
    return (
        <AdminLayout>
            <div className="member-container">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h2 style={{ margin: 0 }}>Quản lý Huấn Luyện Viên (PT)</h2>
                    <button className="action-btn" style={{ background: "#4CAF50", color: "white", padding: "10px 15px" }} onClick={handleAddClick}>
                        + Thêm Huấn Luyện Viên
                    </button>
                </div>

                {/* Filter Bar */}
                <div className="filter-bar">
                    <input
                        type="text"
                        placeholder="Tìm theo tên..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <input
                        type="text"
                        placeholder="Tìm theo Số điện thoại..."
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />

                    <button onClick={fetchPts}>Tìm kiếm</button>
                </div>

                {/* Table */}
                {loading ? (
                    <p>Đang tải dữ liệu...</p>
                ) : pts.length === 0 ? (
                    <p>Không tìm thấy Huấn luyện viên nào.</p>
                ) : (
                    <table className="member-table">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Họ và tên</th>
                                <th>Tài khoản</th>
                                <th>SĐT</th>
                                <th>Email</th>
                                <th>Chuyên môn</th>
                                <th>Rating</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pts.map((pt, index) => (
                                <tr key={pt.id}>
                                    <td>{index + 1}</td>
                                    <td>{pt.name}</td>
                                    <td>{pt.username}</td>
                                    <td>{pt.phone}</td>
                                    <td>{pt.email}</td>
                                    <td>{pt.ptSpecialty || "Chưa cập nhật"}</td>
                                    <td>{pt.ptRating ? `${pt.ptRating} ⭐` : "Chưa có"}</td>
                                    <td>
                                        <button className="action-btn" style={{ background: "#2196F3", color: "white" }} onClick={() => handleEditClick(pt.id)}>Chi tiết</button>
                                        <button className="action-btn" style={{ background: "orange", color: "white" }} onClick={() => handleDowngrade(pt.id)}>Hạ xuống Member</button>
                                        <button className="action-btn delete" onClick={() => handleDeleteCompletely(pt.id)}>Xóa hẳn</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Add PT Modal */}
                {showAddModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Thêm Huấn Luyện Viên Mới</h3>

                            <div className="form-group">
                                <label>Tên đăng nhập *</label>
                                <input type="text" value={newPt.username} onChange={(e) => setNewPt({ ...newPt, username: e.target.value })} />
                            </div>

                            <div className="form-group">
                                <label>Mật khẩu *</label>
                                <input type="password" value={newPt.password} onChange={(e) => setNewPt({ ...newPt, password: e.target.value })} />
                            </div>

                            <div className="form-group">
                                <label>Họ và tên *</label>
                                <input type="text" value={newPt.fullName} onChange={(e) => setNewPt({ ...newPt, fullName: e.target.value })} />
                            </div>

                            <div className="form-group">
                                <label>Email *</label>
                                <input type="email" value={newPt.email} onChange={(e) => setNewPt({ ...newPt, email: e.target.value })} />
                            </div>

                            <div className="form-group">
                                <label>Số điện thoại</label>
                                <input type="text" value={newPt.phone} onChange={(e) => setNewPt({ ...newPt, phone: e.target.value })} />
                            </div>

                            <div className="form-group">
                                <label>Chuyên môn</label>
                                <input type="text" placeholder="Yoga, Boxing..." value={newPt.ptSpecialty} onChange={(e) => setNewPt({ ...newPt, ptSpecialty: e.target.value })} />
                            </div>

                            <div className="form-group">
                                <label>Vị trí công tác</label>
                                <select value={newPt.positionId} onChange={(e) => setNewPt({ ...newPt, positionId: e.target.value })}>
                                    <option value="">-- Chọn vị trí --</option>
                                    {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Chi nhánh</label>
                                <select value={newPt.gymLocationId} onChange={(e) => setNewPt({ ...newPt, gymLocationId: e.target.value })}>
                                    <option value="">-- Chọn chi nhánh --</option>
                                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button className="action-btn" onClick={() => setShowAddModal(false)}>Hủy</button>
                                <button className="action-btn" style={{ background: "#4CAF50", color: "white" }} onClick={handleSaveAdd}>Lưu PT</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* PT Detail/Edit Modal */}
                {showDetailModal && selectedPt && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ maxWidth: "600px" }}>
                            <h3>Hồ sơ Chi tiết Huấn luyện viên</h3>

                            <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ width: "120px", height: "120px", border: "1px solid #ddd", borderRadius: "50%", overflow: "hidden", margin: "0 auto 10px", background: "#f9f9f9" }}>
                                        {avatarPreview ? (
                                            <img src={avatarPreview} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        ) : (
                                            <div style={{ lineHeight: "120px", color: "#999" }}>No image</div>
                                        )}
                                    </div>
                                    <input type="file" accept="image/*" id="pt-avatar" style={{ display: "none" }} onChange={handleAvatarChange} />
                                    <label htmlFor="pt-avatar" className="action-btn" style={{ padding: "5px 10px", cursor: "pointer", display: "inline-block", fontSize: "12px" }}>Đổi ảnh</label>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div className="form-group">
                                        <label>Họ và tên</label>
                                        <input type="text" value={selectedPt.name} onChange={(e) => setSelectedPt({ ...selectedPt, name: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Số điện thoại</label>
                                        <input type="text" value={selectedPt.phone} onChange={(e) => setSelectedPt({ ...selectedPt, phone: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Chuyên môn</label>
                                <input type="text" value={selectedPt.ptSpecialty || ""} onChange={(e) => setSelectedPt({ ...selectedPt, ptSpecialty: e.target.value })} />
                            </div>

                            <div className="form-group">
                                <label>Vị trí công tác</label>
                                <select value={selectedPt.positionId || ""} onChange={(e) => setSelectedPt({ ...selectedPt, positionId: e.target.value })}>
                                    <option value="">-- Chọn vị trí --</option>
                                    {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Chi nhánh</label>
                                <select value={selectedPt.gymLocationId || ""} onChange={(e) => setSelectedPt({ ...selectedPt, gymLocationId: e.target.value })}>
                                    <option value="">-- Chọn chi nhánh --</option>
                                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Trạng thái hoạt động</label>
                                <select value={selectedPt.status} onChange={(e) => setSelectedPt({ ...selectedPt, status: e.target.value === "true" })}>
                                    <option value="true">Đang hoạt động</option>
                                    <option value="false">Tạm khóa</option>
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button className="action-btn" onClick={() => setShowDetailModal(false)}>Đóng</button>
                                <button className="action-btn" style={{ background: "#4CAF50", color: "white" }} onClick={handleUpdatePt}>Lưu thay đổi</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminPTList;
