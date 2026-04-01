import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile } from "../../../api/memberApi";
import "./member-profile-edit.css";

export default function MemberProfileEdit() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    cccd: "",
    sex: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setFormData({
          fullName: data.fullName || "",
          phone: data.phone || "",
          cccd: data.cccd || "",
          sex: data.sex || ""
        });
      } catch (error) {
        console.error("Lỗi tải hồ sơ:", error);
        alert("Không thể tải thông tin hồ sơ.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateProfile(formData);
      alert("✅ Cập nhật thông tin thành công!");
      navigate("/member/profile");
    } catch (error) {
      console.error("Lỗi cập nhật hồ sơ:", error);
      alert("❌ Cập nhật thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="edit-profile-loading">Đang tải thông tin...</div>;
  }

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-card">
        <div className="edit-profile-header">
          <h2>Chỉnh sửa thông tin cá nhân</h2>
          <p>Cập nhật thông tin của bạn để chúng tôi phục vụ tốt hơn</p>
        </div>

        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="form-group">
            <label htmlFor="fullName">Họ và tên</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="Nhập họ và tên"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Số điện thoại</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div className="form-group">
              <label htmlFor="sex">Giới tính</label>
              <select
                id="sex"
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                required
              >
                <option value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="cccd">CCCD / CMND</label>
            <input
              type="text"
              id="cccd"
              name="cccd"
              value={formData.cccd}
              onChange={handleChange}
              required
              placeholder="Nhập số căn cước công dân"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate("/member/profile")}
              disabled={submitting}
            >
              Hủy bỏ
            </button>
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
