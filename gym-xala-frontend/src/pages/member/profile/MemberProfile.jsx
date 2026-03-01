import React, { useEffect, useState } from "react";
import { getProfile } from "../../../api/memberApi";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { logout, getToken } from "../../../utils/auth";
import { getMyCardList } from "../../../api/membershipApi";

import "./member-profile.css";

export default function MemberProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Avatar preview state
  const [avatarPreview, setAvatarPreview] = useState(null);

  // ================= LOAD PROFILE =================
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [profileData, cardsData] = await Promise.all([
          getProfile(),
          getMyCardList()
        ]);

        console.info("Profile data:", profileData);
        console.info("Subscriptions data:", cardsData);

        setProfile(profileData);
        // Đảm bảo subscriptions luôn là mảng để tránh lỗi .map
        setSubscriptions(Array.isArray(cardsData) ? cardsData : []);

        if (profileData.avatarBase64) {
          setAvatarPreview(`data:image/jpeg;base64,${profileData.avatarBase64}`);
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu hồ sơ:", error);
        // Nếu lỗi 403/401 thì mới logout, còn lại chỉ thông báo
        if (error.response?.status === 401 || error.response?.status === 403) {
          alert("Phiên đăng nhập hết hạn.");
          logout();
        } else {
          alert("Không thể tải một số thông tin. Vui lòng thử lại sau.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
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


      </div>

      {/* SUBSCRIPTIONS SECTION */}
      <div className="profile-card">
        <h3>Gói tập đã đăng ký</h3>
        {Array.isArray(subscriptions) && subscriptions.length > 0 ? (
          <div className="subscription-list">
            {subscriptions.map(card => (
              <div key={card.id} className="subscription-item">
                <div className="sub-header">
                  <span className="sub-pkg-name">{card.packageName || "Gói tập không tên"}</span>
                  <span className={`sub-status ${(card.status || "UNKNOWN").toLowerCase()}`}>
                    {card.status === "ACTIVE" ? "Đang hoạt động" : card.status}
                  </span>
                </div>
                <div className="sub-dates">
                  <div>Từ: <b>{card.startDate ? new Date(card.startDate).toLocaleDateString("vi-VN") : "N/A"}</b></div>
                  <div>Đến: <b>{card.endDate ? new Date(card.endDate).toLocaleDateString("vi-VN") : "N/A"}</b></div>
                </div>
                <div className="sub-category">Loại: {card.category || "N/A"}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-sub-text">Bạn chưa đăng ký gói tập nào.</p>
        )}
      </div>

      {/* ACTION BUTTONS */}
      <div className="profile-actions">
        <button onClick={() => navigate("/member/profile/edit")}>
          ✏️ Chỉnh sửa thông tin
        </button>

        <button onClick={() => navigate("/member/schedule")}>
          📅 Xem lịch tập
        </button>

        <button onClick={() => navigate("/member/my-package")}>
          📦 Gói tập của tôi
        </button>

        <button onClick={() => navigate("/member/packages")}>
          🛒 Đăng ký gói tập mới
        </button>
      </div>
    </div>
  );
}
