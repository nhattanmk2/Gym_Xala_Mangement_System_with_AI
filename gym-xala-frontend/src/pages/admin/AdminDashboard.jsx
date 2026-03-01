import { useEffect, useState } from "react";
import AdminLayout from "./layout/AdminLayout";
import { getDashboardStats } from "../../api/adminDashboardApi";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalPTs: 0,
    totalPackages: 0,
    todayBookings: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <AdminLayout>
      <h1>Admin Dashboard</h1>
      <p>Quản lý hệ thống phòng gym Xala</p>

      <div style={{ marginTop: "25px" }}>
        <h3>Thống kê nhanh</h3>

        <ul>
          <li>👤 Tổng số Member: {stats.totalMembers}</li>
          <li>🏋️ Tổng số PT: {stats.totalPTs}</li>
          <li>📦 Gói tập hiện có: {stats.totalPackages}</li>
          <li>🧾 Hóa đơn chờ duyệt: {stats.todayBookings}</li>
        </ul>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
