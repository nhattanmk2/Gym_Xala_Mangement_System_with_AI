import AdminLayout from "./layout/AdminLayout";

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <h1>Admin Dashboard</h1>
      <p>Quản lý hệ thống phòng gym Xala</p>

      <div style={{ marginTop: "25px" }}>
        <h3>Thống kê nhanh</h3>

        <ul>
          <li>👤 Tổng số Member: 120</li>
          <li>🏋️ Tổng số PT: 8</li>
          <li>📦 Gói tập hiện có: 6</li>
          <li>📅 Booking hôm nay: 15</li>
        </ul>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
