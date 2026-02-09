import React, { useEffect, useState } from "react";
import { getProfile } from "../../../api/memberApi";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { logout, getToken } from "../../../utils/auth";

import "./member-profile.css";

export default function MemberProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Avatar preview state
  const [avatarPreview, setAvatarPreview] = useState(null);

  // ================= LOAD PROFILE =================
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);

        // Nếu backend trả avatarBase64
        if (data.avatarBase64) {
          setAvatarPreview(`data:image/jpeg;base64,${data.avatarBase64}`);
        }
      } catch (error) {
        console.error("Lỗi lấy profile:", error);

        alert("Không thể tải hồ sơ. Token hết hạn hoặc không hợp lệ!");
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ================= UPLOAD AVATAR =================
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // ✅ Preview ảnh ngay lập tức
    setAvatarPreview(URL.createObjectURL(file));

    // ✅ Multipart FormData
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = getToken();

      await axios.put(
        "http://localhost:8080/api/member/avatar",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("✅ Cập nhật avatar thành công!");

      // Reload lại profile sau upload
      const updated = await getProfile();
      setProfile(updated);

      if (updated.avatarBase64) {
        setAvatarPreview(
          `data:image/jpeg;base64,${updated.avatarBase64}`
        );
      }
    } catch (err) {
      console.error("Upload avatar lỗi:", err);
      alert("❌ Upload thất bại!");
    }
  };

  // ================= UI LOADING =================
  if (loading) {
    return <h2 className="loading-text">Đang tải hồ sơ cá nhân...</h2>;
  }

  if (!profile) {
    return <h2 className="loading-text">Không tìm thấy thông tin học viên</h2>;
  }

  // ================= UI PROFILE =================
  return (
    <div className="profile-container">
      {/* HEADER */}
      <div className="profile-header">
        {/* Avatar Upload */}
        <label className="avatar-wrapper">
          <img
            className="profile-avatar"
            src={
              avatarPreview ||
              "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            }
            alt="avatar"
          />

          {/* Hidden file input */}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleAvatarChange}
          />
        </label>

        <div>
          <h2>{profile.fullName}</h2>
          <p className="join-text">Thành viên Gym Xala</p>
          <p className="change-text">📸 Nhấn vào ảnh để đổi avatar</p>
        </div>
      </div>

      {/* INFO CARD */}
      <div className="profile-card">
        <h3>Thông tin cá nhân</h3>

        <div className="profile-row">
          <span>Email:</span>
          <b>{profile.email}</b>
        </div>

        <div className="profile-row">
          <span>Số điện thoại:</span>
          <b>{profile.phone}</b>
        </div>

        <div className="profile-row">
          <span>CCCD:</span>
          <b>{profile.cccd}</b>
        </div>

        <div className="profile-row">
          <span>Giới tính:</span>
          <b>{profile.sex}</b>
        </div>

        {/* <div className="profile-row">
          <span>Trạng thái:</span>
          <b className={profile.status === "ACTIVE" ? "active" : "inactive"}>
            {profile.status === "ACTIVE"
              ? "Đang hoạt động"
              : "Ngừng hoạt động"}
          </b>
        </div> */}

        <div className="profile-row">
          <span>Mã thẻ hội viên:</span>
          <b>{profile.membercard_id}</b>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="profile-actions">
        <button onClick={() => navigate("/member/profile/edit")}>
          ✏️ Chỉnh sửa thông tin
        </button>

        <button onClick={() => navigate("/member/schedule")}>
          📅 Xem lịch tập
        </button>

        <button onClick={() => navigate("/member/packages")}>
          💳 Gói tập đã đăng ký
        </button>
      </div>
    </div>
  );
}
