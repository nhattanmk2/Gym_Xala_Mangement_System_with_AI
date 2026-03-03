import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPtMemberHistory, getPtMemberProgress } from '../../../api/ptScheduleApi';
import { ArrowLeft, Clock, CheckCircle } from 'lucide-react';
import './my-clients.css'; // Reuse styles from MyClients if applicable.

const MemberProgressDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [progress, setProgress] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('HISTORY'); // 'HISTORY' | 'PROGRESS'

    useEffect(() => {
        if (id) {
            fetchMemberDetails();
        }
    }, [id]);

    const fetchMemberDetails = async () => {
        try {
            setLoading(true);
            const [historyData, progressData] = await Promise.all([
                getPtMemberHistory(id),
                getPtMemberProgress(id)
            ]);
            setHistory(historyData);
            setProgress(progressData);
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin học viên!');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="pt-clients-container">
                <div className="clients-loading">
                    <div className="loader"></div>
                    <p>Đang tải dữ liệu tiến độ...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="pt-clients-container">
                <div className="clients-error">
                    <p>⚠️ {error}</p>
                    <button onClick={fetchMemberDetails} className="btn-retry">Thử lại</button>
                    <button onClick={() => navigate(-1)} className="btn-retry" style={{ marginLeft: '10px' }}>Trở lại</button>
                </div>
            </div>
        );
    }

    const completedExercises = progress.filter(p => p.isCompleted).length;
    const totalExercises = progress.length;
    const progressPercentage = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;

    return (
        <div className="pt-clients-container animated-fade-in">
            <div className="pt-clients-header" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-color)' }}>
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h2>Chi Tiết Tiến Độ Học Viên</h2>
                    <p>Theo dõi lịch sử tập luyện và tiến trình hoàn thành bài tập của học viên.</p>
                </div>
            </div>

            <div className="tabs-container" style={{ margin: '20px 0', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '20px' }}>
                <button
                    className={`tab-button ${activeTab === 'HISTORY' ? 'active' : ''}`}
                    onClick={() => setActiveTab('HISTORY')}
                    style={{
                        padding: '10px 20px',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'HISTORY' ? '2px solid var(--primary-color)' : 'none',
                        color: activeTab === 'HISTORY' ? 'var(--primary-color)' : '#64748b',
                        fontWeight: activeTab === 'HISTORY' ? '600' : 'normal',
                        cursor: 'pointer'
                    }}
                >
                    Lịch Sử Buổi Tập
                </button>
                <button
                    className={`tab-button ${activeTab === 'PROGRESS' ? 'active' : ''}`}
                    onClick={() => setActiveTab('PROGRESS')}
                    style={{
                        padding: '10px 20px',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'PROGRESS' ? '2px solid var(--primary-color)' : 'none',
                        color: activeTab === 'PROGRESS' ? 'var(--primary-color)' : '#64748b',
                        fontWeight: activeTab === 'PROGRESS' ? '600' : 'normal',
                        cursor: 'pointer'
                    }}
                >
                    Tiến Độ Bài Tập
                </button>
            </div>

            {activeTab === 'HISTORY' && (
                <div className="history-tab">
                    {history.length === 0 ? (
                        <div className="clients-empty">
                            <Clock size={48} color="#cbd5e1" />
                            <h3>Chưa có lịch sử</h3>
                            <p>Học viên này chưa có buổi tập nào đã hoàn thành với bạn trong quá khứ.</p>
                        </div>
                    ) : (
                        <div className="table-responsive" style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                                        <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600' }}>Thời gian</th>
                                        <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600' }}>Trạng thái</th>
                                        <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600' }}>Chi nhánh</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((session, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                            <td style={{ padding: '12px 16px' }}>
                                                {new Date(session.startTime).toLocaleString('vi-VN')} -
                                                {new Date(session.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <span className={`status-badge ${session.status.toLowerCase()}`}>
                                                    {session.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                {session.branchName || 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'PROGRESS' && (
                <div className="progress-tab">
                    <div style={{ marginBottom: '20px', background: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontWeight: '600', color: '#334155' }}>Tiến độ tổng quan</span>
                            <span style={{ fontWeight: '600', color: 'var(--primary-color)' }}>{progressPercentage}%</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${progressPercentage}%`, height: '100%', background: 'var(--primary-color)', transition: 'width 0.3s ease' }}></div>
                        </div>
                        <p style={{ marginTop: '8px', fontSize: '14px', color: '#64748b' }}>
                            Đã hoàn thành {completedExercises} / {totalExercises} bài tập
                        </p>
                    </div>

                    {progress.length === 0 ? (
                        <div className="clients-empty">
                            <CheckCircle size={48} color="#cbd5e1" />
                            <h3>Chưa có bài tập</h3>
                            <p>Học viên này chưa được giao bài tập hoặc chưa mua gói có lộ trình.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '15px' }}>
                            {progress.map((item, idx) => (
                                <div key={idx} style={{ background: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>{item.exerciseName}</h4>
                                        <p style={{ margin: '0', fontSize: '14px', color: '#64748b' }}>
                                            {item.sets} Set x {item.reps} Rep
                                        </p>
                                        {item.completedAt && (
                                            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                                                Hoàn thành: {new Date(item.completedAt).toLocaleString('vi-VN')}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        {item.isCompleted ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10b981', fontWeight: '500' }}>
                                                <CheckCircle size={20} />
                                                Đã xong
                                            </div>
                                        ) : (
                                            <span style={{ color: '#94a3b8', fontSize: '14px' }}>Chưa tập</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MemberProgressDetail;
