import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../layout/AdminLayout";
import { getAllMembers, updateMember, updateMemberStatus, deleteMember, createMember, upgradeToPt } from "../../../api/adminMemberApi";
import "./adminMemberList.css";

const AdminMemberList = () => {
  const [members, setMembers] = useState([]);
  const [name, setName] = useState("");
  const [cccd, setCccd] = useState("");
  const [loading, setLoading] = useState(false);

  // Edit Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  // Add Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({
    username: "", password: "", name: "", cccd: "", sex: "", email: "", phone: ""
  });

  // Membership Modal States
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [currentSelectedMemberId, setCurrentSelectedMemberId] = useState(null);
  const [selectedMemberships, setSelectedMemberships] = useState([]);
  const [memberAiHistory, setMemberAiHistory] = useState([]);
  const [customPriceInput, setCustomPriceInput] = useState({});

  const navigate = useNavigate();

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllMembers(name, cccd);
      console.log("DATA:", data);
      setMembers(Array.isArray(data) ? data : data.content || data.data || []);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  }, [name, cccd]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleEditClick = (member) => {
    setEditingMember({ ...member });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      if (!editingMember) return;
      await updateMember(editingMember.id, editingMember);
      setShowEditModal(false);
      setEditingMember(null);
      fetchMembers(); // refresh
      alert("Cập nhật thành công!");
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      alert("Cập nhật thất bại.");
    }
  };

  const handleToggleStatus = async (member) => {
    try {
      const newStatus = typeof member.status === 'boolean' ? !member.status : false;
      await updateMemberStatus(member.id, newStatus);
      fetchMembers();
      alert(`Đã ${newStatus ? 'mở khóa' : 'khóa'} tài khoản thành công!`);
    } catch (error) {
      console.error("Lỗi thay đổi trạng thái:", error);
      alert("Thay đổi trạng thái thất bại.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hội viên này không? Thao tác này sẽ xóa hoàn toàn cùng tài khoản truy cập!")) {
      try {
        await deleteMember(id);
        fetchMembers();
        alert("Xóa thành công!");
      } catch (error) {
        console.error("Lỗi xóa hội viên:", error);
        alert("Xóa thất bại do lỗi phía server. (Có thể vướng khóa ngoại DB)");
      }
    }
  };

  const handleUpgradeToPt = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn nâng cấp hội viên này lên làm Huấn luyện viên (PT) không?")) {
      try {
        await upgradeToPt(id);
        fetchMembers();
        alert("Nâng cấp lên PT thành công!");
      } catch (error) {
        console.error("Lỗi nâng cấp PT:", error);
        alert("Nâng cấp thất bại.");
      }
    }
  };

  const handleManageMemberships = async (member) => {
    try {
      setLoading(true);
      const { getMemberMemberships, getMemberAiHistory } = await import("../../../api/adminMemberApi");
      const [memberships, aiHist] = await Promise.all([
        getMemberMemberships(member.id),
        getMemberAiHistory(member.id)
      ]);
      setSelectedMemberships(memberships);
      setMemberAiHistory(aiHist);
      setCurrentSelectedMemberId(member.id);
      setShowMembershipModal(true);
      
      const priceInit = {};
      memberships.forEach(m => priceInit[m.id] = m.originalPrice || 0);
      setCustomPriceInput(priceInit);
      
    } catch (error) {
       console.error("Lỗi tải thông tin thẻ tập:", error);
       alert("Lỗi tải thông tin thẻ tập");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveMembership = async (cardId) => {
    try {
      const { approveMembership, getMemberMemberships } = await import("../../../api/adminMemberApi");
      const priceToApprove = customPriceInput[cardId] !== "" ? Number(customPriceInput[cardId]) : null;
      await approveMembership(cardId, priceToApprove);
      alert("Duyệt thẻ thành công!");
      
      // Refresh modal data
      if (currentSelectedMemberId) {
        const memberships = await getMemberMemberships(currentSelectedMemberId);
        setSelectedMemberships(memberships);
      }
    } catch (error) {
      console.error("Lỗi duyệt thẻ:", error);
      alert(error.response?.data?.message || error.response?.data || "Duyệt thẻ thất bại.");
    }
  };

  const handleAddClick = () => {
    setNewMember({ username: "", password: "", name: "", cccd: "", sex: "", email: "", phone: "" });
    setShowAddModal(true);
  };

  const handleSaveAdd = async () => {
    try {
      if (!newMember.username || !newMember.password || !newMember.name || !newMember.email) {
        alert("Vui lòng điền đầy đủ Tên đăng nhập, Mật khẩu, Họ tên và Email");
        return;
      }
      await createMember(newMember);
      setShowAddModal(false);
      fetchMembers();
      alert("Thêm mới hội viên thành công!");
    } catch (error) {
      console.error("Lỗi thêm mới:", error);
      alert(error.response?.data?.message || "Thêm mới thất bại. Có thể Username/Email đã tồn tại.");
    }
  };

  const handleViewSchedule = (member) => {
    // Navigate to admin schedules page with member name pre-filled
    navigate(`/admin/schedules?memberName=${encodeURIComponent(member.name)}`);
  };

  return (
    <AdminLayout>
      <div className="member-container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0 }}>Member Management</h2>
          <button className="action-btn" style={{ background: "#4CAF50", color: "white", padding: "10px 15px", fontSize: "14px" }} onClick={handleAddClick}>
            + Thêm Hội Viên
          </button>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search by name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="text"
            placeholder="Search by CCCD..."
            value={cccd}
            onChange={(e) => setCccd(e.target.value)}
          />

          <button onClick={fetchMembers}>Search</button>
        </div>

        {/* Table */}
        {loading ? (
          <p>Loading data...</p>
        ) : members.length === 0 ? (
          <p>No members found.</p>
        ) : (
          <table className="member-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Họ và tên</th>
                <th>CCCD</th>
                <th>Giới tính</th>
                <th>Email</th>
                <th>SĐT</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m, index) => (
                <tr key={m.id}>
                  <td>{index + 1}</td>
                  <td>{m.name}</td>
                  <td>{m.cccd || "Chưa cập nhật"}</td>
                  <td>{m.sex || "Chưa cập nhật"}</td>
                  <td>{m.email}</td>
                  <td>{m.phone}</td>
                  <td>
                    {m.status !== false ? (
                      <span style={{ color: "green", fontWeight: "bold", fontSize: "14px" }}>Hoạt động</span>
                    ) : (
                      <span style={{ color: "red", fontWeight: "bold", fontSize: "14px" }}>Bị khóa</span>
                    )}
                  </td>
                  <td>
                    <button className="action-btn" style={{ background: "#4CAF50", color: "white" }} onClick={() => handleEditClick(m)}>Sửa</button>
                    <button
                      className="action-btn"
                      style={{ background: m.status !== false ? "orange" : "#2196F3", color: "white" }}
                      onClick={() => handleToggleStatus(m)}
                    >
                      {m.status !== false ? "Khóa" : "Mở Khóa"}
                    </button>
                    <button className="action-btn" style={{ background: "#673AB7", color: "white" }} onClick={() => handleUpgradeToPt(m.id)}>Nâng cấp PT</button>
                    <button className="action-btn" style={{ background: "#4caf50", color: "white" }} onClick={() => handleManageMemberships(m)}>Thẻ Tập</button>
                    <button className="action-btn" style={{ background: "#2196F3", color: "white" }} onClick={() => handleViewSchedule(m)}>Lịch Tập</button>
                    <button className="action-btn delete" onClick={() => handleDelete(m.id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingMember && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Sửa thông tin hội viên</h3>

            <div className="form-group">
              <label>Họ và tên</label>
              <input
                type="text"
                value={editingMember.name || ""}
                onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>CCCD</label>
              <input
                type="text"
                value={editingMember.cccd || ""}
                onChange={(e) => setEditingMember({ ...editingMember, cccd: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Giới tính</label>
              <select
                value={editingMember.sex || ""}
                onChange={(e) => setEditingMember({ ...editingMember, sex: e.target.value })}
              >
                <option value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={editingMember.email || ""}
                onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Số điện thoại</label>
              <input
                type="text"
                value={editingMember.phone || ""}
                onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
              />
            </div>

            <div className="modal-actions">
              <button className="action-btn" onClick={() => setShowEditModal(false)}>Hủy</button>
              <button className="action-btn" style={{ background: "#2196F3", color: "white" }} onClick={handleSaveEdit}>Lưu</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Thêm Khách Hàng Mới</h3>

            <div className="form-group">
              <label>Tên đăng nhập *</label>
              <input
                type="text"
                value={newMember.username}
                onChange={(e) => setNewMember({ ...newMember, username: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Mật khẩu *</label>
              <input
                type="password"
                value={newMember.password}
                onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Họ và tên *</label>
              <input
                type="text"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>CCCD</label>
              <input
                type="text"
                value={newMember.cccd}
                onChange={(e) => setNewMember({ ...newMember, cccd: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Giới tính</label>
              <select
                value={newMember.sex}
                onChange={(e) => setNewMember({ ...newMember, sex: e.target.value })}
              >
                <option value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Số điện thoại</label>
              <input
                type="text"
                value={newMember.phone}
                onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
              />
            </div>

            <div className="modal-actions">
              <button className="action-btn" onClick={() => setShowAddModal(false)}>Hủy</button>
              <button className="action-btn" style={{ background: "#4CAF50", color: "white" }} onClick={handleSaveAdd}>Thêm Mới</button>
            </div>
          </div>
        </div>
      )}

      {/* Membership Management Modal */}
      {showMembershipModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Quản lý Thẻ Tập Hội Viên</h3>
              <button 
                onClick={() => setShowMembershipModal(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}
              >✕</button>
            </div>

            {/* AI Hint Section */}
            {memberAiHistory && memberAiHistory.length > 0 && (
              <div style={{ background: '#f0f9ff', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #0284c7', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#0369a1' }}>🤖 Phân tích Thể trạng từ AI Consultant</h4>
                {memberAiHistory.slice(0, 1).map(ai => (
                  <div key={ai.id} style={{ fontSize: '14px', color: '#334155' }}>
                    <p><strong>BMI:</strong> {ai.bmi} - <strong>Phân loại:</strong> {ai.bmiCategory}</p>
                    <p><strong>Mục tiêu:</strong> {ai.goal}</p>
                    <p style={{ fontStyle: 'italic', marginBottom: 0 }}>"{ai.advice}"</p>
                    <p style={{ marginTop: '5px', fontSize: '12px', color: '#64748b' }}>
                      * Thông tin này giúp bạn (Admin) tùy biến giá (Custom Price) theo độ tuổi, bệnh lý, và khối lượng tập luyện.
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Memberships List */}
            {selectedMemberships.length === 0 ? (
              <p>Hội viên này chưa đăng ký gói tập nào.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {selectedMemberships.map(card => (
                  <div key={card.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px', background: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <h4 style={{ margin: 0 }}>{card.packageName} <span style={{ fontSize: '12px', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>{card.category}</span></h4>
                      <span style={{ 
                        fontWeight: 'bold', 
                        color: card.status === 'ACTIVE' ? 'green' : card.status === 'PENDING' ? 'orange' : 'red',
                        background: card.status === 'ACTIVE' ? '#dcfce7' : card.status === 'PENDING' ? '#fef3c7' : '#fee2e2',
                        padding: '4px 8px', borderRadius: '4px', fontSize: '12px'
                      }}>
                        {card.status}
                      </span>
                    </div>
                    
                    <div style={{ fontSize: '14px', color: '#475569', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <span><strong>Ngày bắt đầu:</strong> {card.startDate}</span>
                      <span><strong>Ngày kết thúc:</strong> {card.endDate}</span>
                      <span><strong>Số buổi:</strong> {card.maxSessions} (Còn {card.remainingSessions})</span>
                      <span>
                        <strong>Giá gốc:</strong> {(card.originalPrice || 0).toLocaleString()} VNĐ
                        {card.customPrice && <span style={{ color: 'red', marginLeft: '10px' }}>(Đã duyệt mức giá: {card.customPrice.toLocaleString()} VNĐ)</span>}
                      </span>
                    </div>

                    {card.status === 'PENDING' && (
                      <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Thiết lập Mức giá Tùy chỉnh (VNĐ) <span style={{fontWeight: 'normal', color: '#64748b'}}>* Dành riêng cho học viên này</span></label>
                          <input 
                            type="number" 
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                            value={customPriceInput[card.id] || ""}
                            onChange={(e) => setCustomPriceInput({...customPriceInput, [card.id]: e.target.value})}
                          />
                        </div>
                        <button 
                          className="action-btn" 
                          style={{ background: "#f59e0b", color: "white", alignSelf: 'flex-end', padding: '9px 20px' }} 
                          onClick={() => handleApproveMembership(card.id)}
                        >
                          Duyệt Gói Này
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminMemberList;