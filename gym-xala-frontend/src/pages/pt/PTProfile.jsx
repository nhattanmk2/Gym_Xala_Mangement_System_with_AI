import { useState, useEffect } from "react";
import { getPTProfile, updatePTProfile, updatePTAvatar } from "../../api/ptProfileApi";
import { getAllPositions, getAllLocations } from "../../api/ptApi";
import "./pt-profile.css";

const PTProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [positions, setPositions] = useState([]);
    const [locations, setLocations] = useState([]);
    const [avatarPreview, setAvatarPreview] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [profileData, posData, locData] = await Promise.all([
                getPTProfile(),
                getAllPositions(),
                getAllLocations()
            ]);
            setProfile(profileData);
            setPositions(posData);
            setLocations(locData);
            if (profileData.avatar) {
                setAvatarPreview(`data:image/png;base64,${profileData.avatar}`);
            }
        } catch (error) {
            console.error("Error loading profile data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                // Preview immediately
                setAvatarPreview(URL.createObjectURL(file));

                // Upload to server
                await updatePTAvatar(file);
                alert("✅ Cập nhật ảnh đại diện thành công!");
            } catch (error) {
                console.error("Error uploading avatar:", error);
                alert("❌ Lỗi khi tải ảnh lên. Vui lòng thử lại.");
            }
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const updateData = {
                fullName: profile.name,
                phone: profile.phone,
                ptSpecialty: profile.ptSpecialty,
                ptExperience: profile.ptExperience,
                ptBio: profile.ptBio
            };

            await updatePTProfile(updateData);
            alert("✅ Cập nhật hồ sơ thành công!");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("❌ Cập nhật thất bại. Vui lòng kiểm tra lại dữ liệu.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="pt-profile-wrapper">
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
                    <div className="loader"></div>
                    <p style={{ marginLeft: "15px", color: "#64748b" }}>Đang tải hồ sơ...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="pt-profile-wrapper">
                <div style={{ textAlign: "center", padding: "50px" }}>
                    <h3>⚠️ Không thể tải dữ liệu</h3>
                    <p>Vui lòng thử đăng nhập lại hoặc liên hệ Admin.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-profile-wrapper">
            <header className="pt-profile-header">
                <h1>Hồ sơ cá nhân</h1>
                <p>Quản lý thông tin công tác và xây dựng thương hiệu cá nhân của bạn.</p>
            </header>

            <div className="pt-profile-grid">
                {/* Side Card: Avatar & Basic Stats */}
                <aside className="pt-avatar-card">
                    <div className="pt-avatar-container">
                        <div className="pt-avatar-inner">
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="PT Profile" />
                            ) : (
                                <div className="pt-avatar-placeholder">
                                    {profile.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <label htmlFor="avatar-upload" className="btn-upload-avatar">
                            📷
                            <input
                                type="file"
                                id="avatar-upload"
                                hidden
                                accept="image/*"
                                onChange={handleAvatarChange}
                            />
                        </label>
                    </div>

                    <div className="pt-basic-info">
                        <h3>{profile.name}</h3>
                        <p className="pt-username">@{profile.username}</p>
                        <div className="pt-rating-badge">
                            ⭐ {profile.ptRating ? profile.ptRating.toFixed(1) : "5.0"} (Đánh giá)
                        </div>
                    </div>
                </aside>

                {/* Main Card: Forms */}
                <main className="pt-details-card">
                    <form onSubmit={handleSave}>
                        {/* Section 1: Thông tin cơ bản */}
                        <section className="pt-form-section">
                            <h4>👤 Thông tin cơ bản</h4>
                            <div className="pt-form-grid">
                                <div className="pt-input-group">
                                    <label>Họ và tên</label>
                                    <input
                                        type="text"
                                        value={profile.name || ""}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="pt-input-group">
                                    <label>Số điện thoại</label>
                                    <input
                                        type="text"
                                        value={profile.phone || ""}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                    />
                                </div>
                                <div className="pt-input-group full-width">
                                    <label>Email (Không được đổi)</label>
                                    <input type="email" value={profile.email || ""} disabled />
                                </div>
                            </div>
                        </section>

                        {/* Section 2: Thông tin chuyên môn */}
                        <section className="pt-form-section">
                            <h4>🏋️ Chuyên môn & Kinh nghiệm</h4>
                            <div className="pt-form-grid">
                                <div className="pt-input-group">
                                    <label>Lĩnh vực chuyên môn</label>
                                    <input
                                        type="text"
                                        placeholder="Ví dụ: Giảm cân, Tăng cơ, Yoga..."
                                        value={profile.ptSpecialty || ""}
                                        onChange={(e) => setProfile({ ...profile, ptSpecialty: e.target.value })}
                                    />
                                </div>
                                <div className="pt-input-group">
                                    <label>Kinh nghiệm làm việc</label>
                                    <input
                                        type="text"
                                        placeholder="Ví dụ: 3 năm, 5 năm..."
                                        value={profile.ptExperience || ""}
                                        onChange={(e) => setProfile({ ...profile, ptExperience: e.target.value })}
                                    />
                                </div>
                                <div className="pt-input-group full-width">
                                    <label>Mô tả bản thân & Thành tích</label>
                                    <textarea
                                        placeholder="Giới thiệu chi tiết để học viên tin tưởng bạn hơn..."
                                        value={profile.ptBio || ""}
                                        onChange={(e) => setProfile({ ...profile, ptBio: e.target.value })}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Vị trí công tác */}
                        <section className="pt-form-section">
                            <h4>🏢 Thông tin công tác (Chỉ đọc)</h4>
                            <div className="pt-form-grid">
                                <div className="pt-input-group">
                                    <label>Vị trí hiện tại</label>
                                    <select value={profile.positionId || ""} disabled>
                                        <option value="">Chưa gán</option>
                                        {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="pt-input-group">
                                    <label>Chi nhánh giảng dạy</label>
                                    <select value={profile.gymLocationId || ""} disabled>
                                        <option value="">Chưa gán</option>
                                        {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "10px" }}>
                                * Liên hệ Quản trị viên nếu cần thay đổi thông tin công tác hoặc chi nhánh.
                            </p>
                        </section>

                        <div className="pt-profile-actions">
                            <button type="submit" className="btn-save-profile" disabled={saving}>
                                {saving ? "Đang lưu..." : "Lưu thay đổi hồ sơ"}
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    );
};

export default PTProfile;
