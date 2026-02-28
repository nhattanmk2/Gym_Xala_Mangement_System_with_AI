import { useState, useEffect } from "react";
import { getMyProfile, updateMyProfile, getAllPositions, getAllLocations } from "../../api/ptApi";

const PTProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [positions, setPositions] = useState([]);
    const [locations, setLocations] = useState([]);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [profileData, posData, locData] = await Promise.all([
                getMyProfile(),
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
            alert("Không thể tải thông tin hồ sơ.");
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            const updateData = {
                fullName: profile.name,
                phone: profile.phone,
                ptSpecialty: profile.ptSpecialty,
                positionId: profile.positionId,
                gymLocationId: profile.gymLocationId
            };
            formData.append("data", JSON.stringify(updateData));
            if (avatarFile) {
                formData.append("avatar", avatarFile);
            }

            await updateMyProfile(formData);
            alert("Cập nhật hồ sơ thành công!");
            window.location.reload();
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Cập nhật thất bại.");
        }
    };

    if (loading) return <div>Đang tải...</div>;

    if (!profile) return <div className="member-container"><h2>Lỗi</h2><p>Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.</p></div>;

    return (
        <div className="member-container">
            <h2>Hồ sơ của tôi</h2>
            <form onSubmit={handleSave} style={{ maxWidth: "600px", background: "white", padding: "30px", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
                <div style={{ textAlign: "center", marginBottom: "30px" }}>
                    <div style={{ width: "150px", height: "150px", borderRadius: "50%", margin: "0 auto 15px", overflow: "hidden", border: "3px solid #f1f5f9" }}>
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                            <div style={{ height: "100%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem", color: "#94a3b8" }}>
                                {profile?.username?.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <input type="file" id="avatar-input" style={{ display: "none" }} onChange={handleAvatarChange} />
                    <label htmlFor="avatar-input" style={{ cursor: "pointer", color: "#2563eb", fontWeight: "600", fontSize: "0.9rem" }}>
                        Thay đổi ảnh đại diện
                    </label>
                </div>

                <div className="form-group">
                    <label>Tên đăng nhập</label>
                    <input type="text" value={profile.username} disabled style={{ background: "#f8fafc" }} />
                </div>

                <div className="form-group">
                    <label>Họ và tên</label>
                    <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={profile.email} disabled style={{ background: "#f8fafc" }} />
                </div>

                <div className="form-group">
                    <label>Số điện thoại</label>
                    <input type="text" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                </div>

                <div className="form-group">
                    <label>Chuyên môn</label>
                    <input type="text" value={profile.ptSpecialty || ""} onChange={(e) => setProfile({ ...profile, ptSpecialty: e.target.value })} />
                </div>

                <div className="form-group">
                    <label>Vị trí</label>
                    <select value={profile.positionId || ""} onChange={(e) => setProfile({ ...profile, positionId: e.target.value })} disabled style={{ background: "#f8fafc" }}>
                        <option value="">Chưa gán</option>
                        {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <small style={{ color: "#64748b" }}>* Liên hệ Quản trị viên để đổi vị trí công tác</small>
                </div>

                <div className="form-group">
                    <label>Chi nhánh</label>
                    <select value={profile.gymLocationId || ""} onChange={(e) => setProfile({ ...profile, gymLocationId: e.target.value })} disabled style={{ background: "#f8fafc" }}>
                        <option value="">Chưa gán</option>
                        {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                    <small style={{ color: "#64748b" }}>* Liên hệ Quản trị viên để đổi chi nhánh</small>
                </div>

                <div style={{ marginTop: "30px", display: "flex", justifyContent: "flex-end" }}>
                    <button type="submit" className="action-btn" style={{ background: "#4CAF50", color: "white", padding: "12px 25px" }}>
                        Lưu thay đổi
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PTProfile;
