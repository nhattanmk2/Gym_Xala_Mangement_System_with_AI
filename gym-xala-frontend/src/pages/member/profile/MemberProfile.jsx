import React, { useEffect, useState } from "react";
import { getProfile } from "../../../api/memberApi";
import { useNavigate } from "react-router-dom";
import { logout } from "../../../utils/auth";

import "./member-profile.css";

export default function MemberProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // ================= LOAD PROFILE =================
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
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
        <img
          className="profile-avatar"
          src={
            profile.avatar ||
            "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          }
          alt="avatar"
        />

        <div>
          <h2>{profile.name}</h2>
          <p className="join-text">Thành viên Gym Xala</p>
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

        <div className="profile-row">
          <span>Trạng thái:</span>
          <b className={profile.status === "ACTIVE" ? "active" : "inactive"}>
            {profile.status === "ACTIVE"
              ? "Đang hoạt động"
              : "Ngừng hoạt động"}
          </b>
        </div>

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
