import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";
import { getDashboardStats, getMemberGrowth, getPtPerformance, getRevenueStats } from "../../api/adminDashboardApi";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import "./admin-dashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalPTs: 0,
    totalPackages: 0,
    todayBookings: 0,
    monthlyRevenue: 0,
    activeMembersByBranch: {}
  });
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState("month");
  const [pivotDate, setPivotDate] = useState(new Date());

  // State riêng cho Doanh thu
  const [revViewType, setRevViewType] = useState("year");
  const [revPivotDate, setRevPivotDate] = useState(new Date());

  const [growthData, setGrowthData] = useState({ labels: [], data: [], secondData: [] });
  const [revenueData, setRevenueData] = useState({ labels: [], data: [] });
  const [ptPerformance, setPtPerformance] = useState([]);
  
  const [rangeLabel, setRangeLabel] = useState("");
  const [revRangeLabel, setRevRangeLabel] = useState("");

  // Fetch Global Stats (Once)
  useEffect(() => {
    getDashboardStats().then(setStats).catch(err => console.error("Stats fail", err));
  }, []);

  // Fetch Member Growth & PT Performance
  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        const baseDate = pivotDate.toISOString().split('T')[0];
        const [growthResponse, performanceResponse] = await Promise.all([
          getMemberGrowth(viewType, baseDate),
          getPtPerformance(viewType, baseDate)
        ]);
        setGrowthData(growthResponse);
        setPtPerformance(performanceResponse);
        updateRangeLabel(viewType, pivotDate, setRangeLabel);
      } catch (error) {
        console.error("Member data fail", error);
      }
    };
    fetchMemberData();
  }, [viewType, pivotDate]);

  // Fetch Revenue Stats
  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const baseDate = revPivotDate.toISOString().split('T')[0];
        const revenueResponse = await getRevenueStats(revViewType, baseDate);
        setRevenueData(revenueResponse);
        updateRangeLabel(revViewType, revPivotDate, setRevRangeLabel);
      } catch (error) {
        console.error("Revenue data fail", error);
      } finally {
        setLoading(false); // Kết thúc loading sau khi load xong các chart
      }
    };
    fetchRevenueData();
  }, [revViewType, revPivotDate]);

  const updateRangeLabel = (type, date, setter) => {
    const d = new Date(date);
    let label = "";
    if (type === 'week') {
      const start = new Date(d);
      start.setDate(d.getDate() - (d.getDay() === 0 ? 6 : d.getDay() - 1));
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      label = `Tuần ${start.toLocaleDateString('vi-VN', {day:'2-digit', month:'2-digit'})} - ${end.toLocaleDateString('vi-VN', {day:'2-digit', month:'2-digit', year:'numeric'})}`;
    } else if (type === 'year') {
      label = `Năm ${d.getFullYear()}`;
    } else {
      label = `Tháng ${d.toLocaleDateString('vi-VN', {month: '2-digit', year: 'numeric'})}`;
    }
    setter(label);
  };

  const handleNav = (type, direction, currentPivot, currentViewType, setter) => {
    const newDate = new Date(currentPivot);
    const multiplier = direction === 'next' ? 1 : -1;

    if (currentViewType === 'week') newDate.setDate(newDate.getDate() + (7 * multiplier));
    else if (currentViewType === 'year') newDate.setFullYear(newDate.getFullYear() + multiplier);
    else newDate.setMonth(newDate.getMonth() + multiplier);
    
    if (direction === 'next' && newDate > new Date()) return;
    setter(newDate);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <AdminLayout>
      <div className="admin-dashboard-container">
        <div className="ad-header" style={{ marginBottom: '30px' }}>
          <h1>Admin Dashboard</h1>
          <p>Chào mừng trở lại! Dưới đây là tổng quan tình hình kinh doanh của hệ thống Xala Gym.</p>
        </div>

        {loading ? (
          <div className="ad-loading">Đang tải dữ liệu Thống kê...</div>
        ) : (
          <>
            <div className="ad-stats-grid">
              <div className="ad-stat-card revenue" onClick={() => navigate("/admin/invoices")}>
                <div className="ad-card-icon">💰</div>
                <div className="ad-card-info">
                  <h3>Doanh Thu Tháng Này</h3>
                  <h2>{formatCurrency(stats.monthlyRevenue)}</h2>
                </div>
              </div>

              <div className="ad-stat-card members" onClick={() => navigate("/admin/members")}>
                <div className="ad-card-icon">🏃‍♂️</div>
                <div className="ad-card-info">
                  <h3>Học Viên Active</h3>
                  <h2>{stats.totalMembers}</h2>
                </div>
              </div>

              <div className="ad-stat-card pts" onClick={() => navigate("/admin/pts")}>
                <div className="ad-card-icon">🏋️‍♂️</div>
                <div className="ad-card-info">
                  <h3>Huấn Luyện Viên</h3>
                  <h2>{stats.totalPTs}</h2>
                </div>
              </div>

              <div className="ad-stat-card packages" onClick={() => navigate("/admin/packages")}>
                <div className="ad-card-icon">📦</div>
                <div className="ad-card-info">
                  <h3>Gói Tập Đang Bán</h3>
                  <h2>{stats.totalPackages}</h2>
                </div>
              </div>
            </div>

            <div className="ad-middle-section">
              <div className="ad-chart-wrapper">
                <div className="chart-header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                  <h3 style={{ margin: 0, paddingBottom: 0, borderBottom: 'none' }}>Biểu Đồ Xu Hướng Hội Viên</h3>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                    <div className="ad-view-switcher" style={{ margin: 0 }}>
                      <button className={viewType === 'week' ? 'active' : ''} onClick={() => setViewType('week')}>Tuần</button>
                      <button className={viewType === 'month' ? 'active' : ''} onClick={() => setViewType('month')}>Tháng</button>
                      <button className={viewType === 'year' ? 'active' : ''} onClick={() => setViewType('year')}>Năm</button>
                    </div>

                    <div className="ad-date-navigation" style={{ margin: 0, padding: '5px 12px' }}>
                      <button className="nav-btn" onClick={() => handleNav('member', 'prev', pivotDate, viewType, setPivotDate)} style={{ padding: '4px 8px' }}>
                        <span className="nav-icon">◀</span>
                      </button>
                      <div className="current-range" style={{ minWidth: 'auto', padding: '0 10px' }}>
                        <span className="range-text" style={{ fontSize: '13px' }}>{rangeLabel}</span>
                      </div>
                      <button 
                        className="nav-btn" 
                        onClick={() => handleNav('member', 'next', pivotDate, viewType, setPivotDate)} 
                        disabled={new Date(pivotDate).setHours(0,0,0,0) >= new Date().setHours(0,0,0,0)}
                        style={{ padding: '4px 8px' }}
                      >
                        <span className="nav-icon">▶</span>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="chart-container">
                  <Line
                    key={`member-chart-${viewType}-${pivotDate.toISOString()}`}
                    data={{
                      labels: growthData.labels,
                      datasets: [
                        {
                          label: 'Đăng ký mới',
                          data: growthData.data,
                          borderColor: '#ff9800',
                          backgroundColor: 'rgba(255, 152, 0, 0.2)',
                          borderWidth: 2,
                          pointBackgroundColor: '#fff',
                          fill: true,
                          tension: 0.4
                        },
                        {
                          label: 'Đang tham gia tập',
                          data: growthData.secondData,
                          borderColor: '#00e5ff',
                          backgroundColor: 'rgba(0, 229, 255, 0.1)',
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
                        legend: { 
                          display: true, 
                          position: 'top',
                          labels: { color: '#aaa', boxWidth: 12, font: { size: 10 } }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: { color: '#aaa', font: { size: 10 } }
                        },
                        x: {
                          ticks: { color: '#aaa', font: { size: 10 } }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              <div className="ad-leaderboard-wrapper">
                <h3>🏆 Bảng Xếp Hạng Doanh Thu PT</h3>
                <div className="pt-ranking-list">
                  {ptPerformance.length > 0 ? (
                    ptPerformance.map((pt, index) => (
                      <div key={pt.ptId} className="pt-ranking-item" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '12px' }}>
                        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="pt-rank-number" style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>#{index + 1}</div>
                            <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{pt.ptName}</h4>
                          </div>
                          <div style={{ color: '#00e5ff', fontWeight: 'bold', fontSize: '0.9rem' }}>
                            {formatCurrency(pt.revenue)}
                          </div>
                        </div>
                        <div className="pt-rank-stats" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                          <span>📦 Bán: <strong>{pt.soldPackages}</strong></span>
                          <span>✔️ Dạy: <strong>{pt.completedSessions}</strong> buổi</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-pt-data">Chưa có dữ liệu PT.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="ad-details-section" style={{ marginTop: '30px' }}>
              <div className="ad-chart-wrapper" style={{ marginBottom: 0 }}>
                <div className="chart-header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                  <h3 style={{ margin: 0, paddingBottom: 0, borderBottom: 'none' }}>Biểu Đồ Doanh Thu Định Kỳ</h3>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                    <div className="ad-view-switcher" style={{ margin: 0 }}>
                      <button className={revViewType === 'week' ? 'active' : ''} onClick={() => setRevViewType('week')}>Tuần</button>
                      <button className={revViewType === 'month' ? 'active' : ''} onClick={() => setRevViewType('month')}>Tháng</button>
                      <button className={revViewType === 'year' ? 'active' : ''} onClick={() => setRevViewType('year')}>Năm</button>
                    </div>

                    <div className="ad-date-navigation" style={{ margin: 0, padding: '5px 12px' }}>
                      <button className="nav-btn" onClick={() => handleNav('revenue', 'prev', revPivotDate, revViewType, setRevPivotDate)} style={{ padding: '4px 8px' }}>
                        <span className="nav-icon">◀</span>
                      </button>
                      <div className="current-range" style={{ minWidth: 'auto', padding: '0 10px' }}>
                        <span className="range-text" style={{ fontSize: '13px' }}>{revRangeLabel}</span>
                      </div>
                      <button 
                        className="nav-btn" 
                        onClick={() => handleNav('revenue', 'next', revPivotDate, revViewType, setRevPivotDate)} 
                        disabled={new Date(revPivotDate).setHours(0,0,0,0) >= new Date().setHours(0,0,0,0)}
                        style={{ padding: '4px 8px' }}
                      >
                        <span className="nav-icon">▶</span>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="chart-container" style={{ height: '250px' }}>
                  <Bar
                    key={`revenue-chart-${revViewType}-${revPivotDate.toISOString()}`}
                    data={{
                      labels: revenueData.labels,
                      datasets: [
                        {
                          label: 'Doanh thu (VNĐ)',
                          data: revenueData.data,
                          backgroundColor: 'rgba(37, 99, 235, 0.6)',
                          borderColor: '#2563eb',
                          borderWidth: 1,
                          borderRadius: 5
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
                          ticks: { 
                            color: '#aaa',
                            font: { size: 10 },
                            callback: (value) => value.toLocaleString() + ' đ'
                          }
                        },
                        x: {
                          ticks: { color: '#aaa', font: { size: 10 } }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              <div className="ad-sub-details" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="ad-branch-stats" style={{ height: 'fit-content' }}>
                  <h3>Học viên theo Cơ sở</h3>
                  {Object.keys(stats.activeMembersByBranch || {}).length > 0 ? (
                    <div className="ad-branch-list">
                      {Object.entries(stats.activeMembersByBranch).map(([branch, count]) => (
                        <div key={branch} className="ad-branch-item" style={{ padding: '8px 12px' }}>
                          <div className="ad-branch-name" style={{ fontSize: '0.85rem' }}>🏢 {branch}</div>
                          <div className="ad-branch-count" style={{ fontSize: '0.8rem' }}>{count} HV</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="ad-no-data">Chưa có dữ liệu.</p>
                  )}
                </div>

                <div className="ad-attention-item" style={{ padding: '12px' }}>
                  <span className="attention-icon" style={{ fontSize: '20px' }}>⏳</span>
                  <span className="attention-text" style={{ fontSize: '0.85rem' }}>
                    Hóa đơn chờ duyệt: <strong>{stats.todayBookings}</strong>
                  </span>
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
