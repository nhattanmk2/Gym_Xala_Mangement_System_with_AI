import { useEffect, useState } from "react";
import AdminLayout from "./layout/AdminLayout";
import { getDashboardStats, getMemberGrowth, getPtRanking } from "../../api/adminDashboardApi";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import "./admin-dashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalPTs: 0,
    totalPackages: 0,
    todayBookings: 0,
    monthlyRevenue: 0,
    activeMembersByBranch: {}
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("month");

  const [growthData, setGrowthData] = useState({ labels: [], data: [] });
  const [ptRanking, setPtRanking] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [statsData, growthResponse, rankingResponse] = await Promise.all([
          getDashboardStats(),
          getMemberGrowth(filter),
          getPtRanking(filter)
        ]);

        setStats(statsData);
        setGrowthData(growthResponse);
        setPtRanking(rankingResponse);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [filter]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <AdminLayout>
      <div className="admin-dashboard-container">
        <div className="ad-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Admin Dashboard</h1>
            <p>Chào mừng trở lại! Dưới đây là tổng quan tình hình kinh doanh của hệ thống Xala Gym.</p>
          </div>
          <div className="ad-filter-wrapper">
            <select
              className="ad-filter-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="week">7 Ngày Qua</option>
              <option value="month">30 Ngày Qua</option>
              <option value="year">12 Tháng Qua</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="ad-loading">Đang tải dữ liệu Thống kê...</div>
        ) : (
          <>
            <div className="ad-stats-grid">
              <div className="ad-stat-card revenue">
                <div className="ad-card-icon">💰</div>
                <div className="ad-card-info">
                  <h3>Doanh Thu Tháng Này</h3>
                  <h2>{formatCurrency(stats.monthlyRevenue)}</h2>
                </div>
              </div>

              <div className="ad-stat-card members">
                <div className="ad-card-icon">🏃‍♂️</div>
                <div className="ad-card-info">
                  <h3>Học Viên Active</h3>
                  <h2>{stats.totalMembers}</h2>
                </div>
              </div>

              <div className="ad-stat-card pts">
                <div className="ad-card-icon">🏋️‍♂️</div>
                <div className="ad-card-info">
                  <h3>Huấn Luyện Viên</h3>
                  <h2>{stats.totalPTs}</h2>
                </div>
              </div>

              <div className="ad-stat-card packages">
                <div className="ad-card-icon">📦</div>
                <div className="ad-card-info">
                  <h3>Gói Tập Đang Bán</h3>
                  <h2>{stats.totalPackages}</h2>
                </div>
              </div>
            </div>

            <div className="ad-middle-section">
              <div className="ad-chart-wrapper">
                <h3>Biểu Đồ Tổng Số Hội Viên</h3>
                <div className="chart-container">
                  <Line
                    data={{
                      labels: growthData.labels,
                      datasets: [
                        {
                          label: 'Tổng số hội viên',
                          data: growthData.data,
                          borderColor: '#00e5ff',
                          backgroundColor: 'rgba(0, 229, 255, 0.2)',
                          borderWidth: 2,
                          pointBackgroundColor: '#fff',
                          fill: true,
                          tension: 0.4
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: { stepSize: 1, color: '#aaa' }
                        },
                        x: {
                          ticks: { color: '#aaa' }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              <div className="ad-leaderboard-wrapper">
                <h3>🏆 Bảng Xếp Hạng PT </h3>
                <div className="pt-ranking-list">
                  {ptRanking.length > 0 ? (
                    ptRanking.map((pt, index) => (
                      <div key={pt.ptId} className="pt-ranking-item">
                        <div className="pt-rank-number">#{index + 1}</div>
                        <div className="pt-rank-info">
                          <h4>{pt.ptName}</h4>
                          <div className="pt-rank-stats">
                            <span>⭐ {pt.rating.toFixed(1)}</span>
                            <span style={{ color: '#d0fd3e', marginLeft: '10px' }}>✔️ {pt.completedSessions} buổi hoàn thành</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-pt-data">Chưa có PT nào hoàn thành buổi dạy trong gian đoạn này.</p>
                  )}
                </div>
              </div>
            </div>
            <div className="ad-details-section">
              <div className="ad-branch-stats">
                <h3>Học viên hoạt động theo Cơ sở (Chi nhánh)</h3>
                {Object.keys(stats.activeMembersByBranch || {}).length > 0 ? (
                  <div className="ad-branch-list">
                    {Object.entries(stats.activeMembersByBranch).map(([branch, count]) => (
                      <div key={branch} className="ad-branch-item">
                        <div className="ad-branch-name">🏢 {branch}</div>
                        <div className="ad-branch-count">{count} học viên</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="ad-no-data">Chưa có dữ liệu học viên tại các cơ sở.</p>
                )}
              </div>

              <div className="ad-pending-stats">
                <h3>Hoạt động cần chú ý</h3>
                <div className="ad-attention-item">
                  <span className="attention-icon">⏳</span>
                  <span className="attention-text">Hóa đơn mua gói chờ duyệt: <strong>{stats.todayBookings}</strong></span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
