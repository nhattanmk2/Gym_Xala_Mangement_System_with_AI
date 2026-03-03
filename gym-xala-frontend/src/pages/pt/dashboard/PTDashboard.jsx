import React, { useState, useEffect } from 'react';
import { getMonthlyCompletedSessions, getManagedClientsCount, getUpcomingSchedules } from '../../../api/ptScheduleApi';
import { CheckCircle, Users, Calendar } from 'lucide-react';

const PTDashboard = () => {
    const [stats, setStats] = useState({
        monthlySessions: 0,
        clientsCount: 0,
        upcomingCount: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [sessionsRes, clientsRes, upcomingRes] = await Promise.all([
                    getMonthlyCompletedSessions(),
                    getManagedClientsCount(),
                    getUpcomingSchedules()
                ]);

                setStats({
                    monthlySessions: sessionsRes,
                    clientsCount: clientsRes,
                    upcomingCount: upcomingRes.length // Since it returns an array of bookings
                });
            } catch (error) {
                console.error("Lỗi khi tải thống kê:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div style={{ padding: '20px', animation: 'fadeIn 0.5s ease-in' }}>
            <h2 style={{ marginBottom: '5px', color: '#1e293b' }}>Tổng Quan Dashboard</h2>
            <p style={{ color: '#64748b', marginBottom: '25px' }}>Chào mừng bạn quay lại, đây là thống kê của bạn trong tháng này.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '25px', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.4)' }}>
                    <div>
                        <p style={{ margin: '0 0 10px 0', fontSize: '15px', opacity: '0.9', fontWeight: '500' }}>Buổi dạy hoàn thành (Tháng {new Date().getMonth() + 1})</p>
                        {loading ? (
                            <h3 style={{ margin: '0', fontSize: '32px' }}>...</h3>
                        ) : (
                            <h3 style={{ margin: '0', fontSize: '36px', fontWeight: 'bold' }}>{stats.monthlySessions}</h3>
                        )}
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '15px', borderRadius: '50%' }}>
                        <CheckCircle size={32} color="white" />
                    </div>
                </div>

                <div style={{ background: 'white', padding: '25px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div>
                        <p style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#64748b', fontWeight: '500' }}>Học viên đang quản lý</p>
                        {loading ? (
                            <h3 style={{ margin: '0', fontSize: '30px', color: '#1e293b' }}>...</h3>
                        ) : (
                            <h3 style={{ margin: '0', fontSize: '30px', color: '#1e293b' }}>{stats.clientsCount} người</h3>
                        )}
                    </div>
                    <div style={{ background: '#f1f5f9', padding: '15px', borderRadius: '50%' }}>
                        <Users size={32} color="#64748b" />
                    </div>
                </div>

                <div style={{ background: 'white', padding: '25px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div>
                        <p style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#64748b', fontWeight: '500' }}>Lịch dạy sắp tới</p>
                        {loading ? (
                            <h3 style={{ margin: '0', fontSize: '30px', color: '#1e293b' }}>...</h3>
                        ) : (
                            <h3 style={{ margin: '0', fontSize: '30px', color: '#1e293b' }}>{stats.upcomingCount} buổi</h3>
                        )}
                    </div>
                    <div style={{ background: '#f1f5f9', padding: '15px', borderRadius: '50%' }}>
                        <Calendar size={32} color="#64748b" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PTDashboard;
