import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPtMemberHistory, getPtMemberProgress } from '../../../api/ptScheduleApi';
import { ArrowLeft, Clock, CheckCircle } from 'lucide-react';
import './my-clients.css'; // Reuse styles from MyClients if applicable.

const MemberProgressDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('HISTORY'); // 'HISTORY' | 'PROGRESS'
    const [expandedRoadmap, setExpandedRoadmap] = useState(null);
    const [expandedSession, setExpandedSession] = useState(null);

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
            
            // Tự động mở rộng roadmap đầu tiên nếu có
            if (progressData && progressData.roadmaps && progressData.roadmaps.length > 0) {
                setExpandedRoadmap(progressData.roadmaps[0].roadmapId);
            }
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

    const { totalCompletedExercises = 0, totalExercises = 0, overallPercentage = 0, roadmaps = [] } = progress || {};

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
                            <span style={{ fontWeight: '600', color: 'var(--primary-color)' }}>{overallPercentage}%</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${overallPercentage}%`, height: '100%', background: 'var(--primary-color)', transition: 'width 0.3s ease' }}></div>
                        </div>
                        <p style={{ marginTop: '8px', fontSize: '14px', color: '#64748b' }}>
                            Đã hoàn thành {totalCompletedExercises} / {totalExercises} bài tập
                        </p>
                    </div>

                    {roadmaps.length === 0 ? (
                        <div className="clients-empty">
                            <CheckCircle size={48} color="#cbd5e1" />
                            <h3>Chưa có lộ trình</h3>
                            <p>Học viên này chưa được giao lộ trình hoặc gói tập không có bài tập đi kèm.</p>
                        </div>
                    ) : (
                        <div className="roadmap-accordion-container">
                            {roadmaps.map((roadmap) => (
                                <div key={roadmap.roadmapId} className="roadmap-group" style={{ marginBottom: '15px', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                                    <div 
                                        className="roadmap-header" 
                                        onClick={() => setExpandedRoadmap(expandedRoadmap === roadmap.roadmapId ? null : roadmap.roadmapId)}
                                        style={{ padding: '15px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}
                                    >
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>{roadmap.name}</h3>
                                            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{roadmap.completedExercises}/{roadmap.totalExercises} bài tập ({roadmap.percentage}%)</span>
                                        </div>
                                        <div style={{ transform: expandedRoadmap === roadmap.roadmapId ? 'rotate(180deg)' : 'rotate(0)' }}>▼</div>
                                    </div>

                                    {expandedRoadmap === roadmap.roadmapId && (
                                        <div className="roadmap-sessions" style={{ padding: '10px 20px 20px 20px' }}>
                                            {roadmap.sessionProgresses.map((sess) => (
                                                <div key={sess.sessionId} className="session-item" style={{ marginTop: '10px', border: '1px solid #f1f5f9', borderRadius: '8px' }}>
                                                    <div 
                                                        className="session-header"
                                                        onClick={() => setExpandedSession(expandedSession === sess.sessionId ? null : sess.sessionId)}
                                                        style={{ padding: '12px 15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: expandedSession === sess.sessionId ? '#f1f5f9' : 'transparent' }}
                                                    >
                                                        <span style={{ fontWeight: '500', color: '#334155' }}>{sess.name}</span>
                                                        <span style={{ fontSize: '0.85rem', color: sess.percentage === 100 ? '#10b981' : '#64748b' }}>
                                                            {sess.completedExercises}/{sess.totalExercises}
                                                        </span>
                                                    </div>

                                                    {expandedSession === sess.sessionId && (
                                                        <div className="session-exercises" style={{ padding: '10px', borderTop: '1px solid #f1f5f9' }}>
                                                            {sess.exercises.map((ex) => (
                                                                <div key={ex.sessionExerciseId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: ex.isCompleted ? 'rgba(16, 185, 129, 0.03)' : 'transparent', borderRadius: '6px', marginBottom: '5px' }}>
                                                                    <div>
                                                                        <div style={{ fontWeight: '500', color: ex.isCompleted ? '#059669' : '#1e293b', fontSize: '0.95rem' }}>{ex.exerciseName}</div>
                                                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{ex.sets} Set x {ex.reps} Rep • {ex.levelName}</div>
                                                                        {ex.completedAt && <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Xong: {ex.completedAt}</div>}
                                                                    </div>
                                                                    <div>
                                                                        {ex.isCompleted ? (
                                                                            <CheckCircle size={18} color="#10b981" />
                                                                        ) : (
                                                                            <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Chưa tập</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
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
