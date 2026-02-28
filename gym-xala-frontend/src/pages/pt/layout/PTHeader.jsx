import { useEffect, useState } from "react";
import "./ptHeader.css";
import { getMyProfile } from "../../../api/ptApi";

const PTHeader = () => {
  const username = localStorage.getItem("username");
  const [profile, setProfile] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getMyProfile();
      setProfile(data);
    } catch (error) {
      console.error("Error fetching PT profile:", error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="pt-header">
      <div className="pt-header-left">
        <h3>PT Panel</h3>
      </div>

      <div className="pt-header-right">
        <span className="welcome-text">
          Xin chào, <b>{username}</b>
        </span>

        <div className="avatar-dropdown-container">
          <div className="avatar-circle" onClick={() => setShowDropdown(!showDropdown)}>
            {profile?.avatar ? (
              <img src={`data:image/png;base64,${profile.avatar}`} alt="Avatar" />
            ) : (
              <div className="avatar-placeholder">{username?.charAt(0).toUpperCase()}</div>
            )}
          </div>

          {showDropdown && (
            <div className="dropdown-menu">
              <div className="dropdown-item" onClick={() => window.location.href = "/pt/profile"}>
                👤 Hồ sơ của tôi
              </div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-item logout" onClick={handleLogout}>
                🚪 Đăng xuất
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PTHeader;
