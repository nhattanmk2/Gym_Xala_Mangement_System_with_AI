import { useEffect, useState } from "react";
import AdminLayout from "./layout/AdminLayout";
import { getDashboardStats, getMemberGrowth, getPtPerformance } from "../../api/adminDashboardApi";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
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
  Legend,
  Filler
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
  const [ptPerformance, setPtPerformance] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [statsData, growthResponse, performanceResponse] = await Promise.all([
          getDashboardStats(),
          getMemberGrowth(filter),
          getPtPerformance(filter)
        ]);

        setStats(statsData);
        setGrowthData(growthResponse);
        setPtPerformance(performanceResponse);
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
                <h3>🏆 Bảng Xếp Hạng Năng Suất PT </h3>
                <div className="pt-ranking-list">
                  {ptPerformance.length > 0 ? (
                    ptPerformance.map((pt, index) => (
                      <div key={pt.ptId} className="pt-ranking-item" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '15px' }}>
                        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="pt-rank-number" style={{ position: 'static', marginRight: 0 }}>#{index + 1}</div>
                            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{pt.ptName}</h4>
                          </div>
                          <div style={{ color: '#00e5ff', fontWeight: 'bold' }}>
                            {formatCurrency(pt.revenue)}
                          </div>
                        </div>
                        <div className="pt-rank-stats" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#ccc' }}>
                          <span>📦 Bán ra: <strong style={{color: '#fff'}}>{pt.soldPackages}</strong> gói</span>
                          <span>✔️ Hoàn thành: <strong style={{color: '#fff'}}>{pt.completedSessions}</strong> buổi</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-pt-data">Chưa có dữ liệu hoạt động của PT trong giai đoạn này.</p>
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
