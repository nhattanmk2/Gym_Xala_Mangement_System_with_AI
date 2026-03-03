import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPtClients } from '../../../api/ptScheduleApi';
import { Mail, Phone, Activity, Target, Calendar, Search } from 'lucide-react';
import './my-clients.css';

const MyClients = () => {
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const data = await getPtClients();
            setClients(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách học viên!');
        } finally {
            setLoading(false);
        }
    };

    const getGoalLabel = (goalType) => {
        const goals = {
            'GIAM_CAN': 'Giảm cân',
            'TANG_CO': 'Tăng cơ',
            'TANG_CAN': 'Tăng cân',
            'DUY_TRI_SUC_KHOE': 'Duy trì sức khỏe'
        };
        return goals[goalType] || 'Chưa thiết lập';
    };

    if (loading) {
        return (
            <div className="pt-clients-container">
                <div className="pt-clients-header">
                    <h2>Danh Sách Học Viên</h2>
                    <p>Đang tải dữ liệu học viên của bạn...</p>
                </div>
                <div className="clients-loading">
                    <div className="loader"></div>
                    <p>Vui lòng đợi trong giây lát</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="pt-clients-container">
                <div className="clients-error">
                    <p>⚠️ {error}</p>
                    <button onClick={fetchClients} className="btn-retry">Thử lại</button>
                </div>
            </div>
        );
    }

    const filteredClients = clients.filter(client =>
        client.memberName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="pt-clients-container animated-fade-in">
            <div className="pt-clients-header">
                <h2>Danh Sách Học Viên</h2>
                <p>Tổng quan về các học viên bạn đang huấn luyện ({clients.length} người)</p>
            </div>

            <div style={{ marginBottom: '20px', position: 'relative' }}>
                <Search size={20} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên học viên..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '12px 15px 12px 45px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                />
            </div>

            {filteredClients.length === 0 ? (
                <div className="clients-empty">
                    <img src="https://cdni.iconscout.com/illustration/premium/thumb/empty-state-2130362-1800926.png" alt="Empty Clients" />
                    <h3>Không tìm thấy học viên</h3>
                    <p>Không có học viên nào phù hợp với tìm kiếm của bạn.</p>
                </div>
            ) : (
                <div className="clients-grid">
                    {filteredClients.map((client) => (
                        <div key={client.memberId} className="client-card">
                            <div className="client-card-header">
                                <div className="client-avatar">
                                    {client.memberName.charAt(0).toUpperCase()}
                                </div>
                                <div className="client-title">
                                    <h3>{client.memberName}</h3>
                                    <span className="client-id">ID: #{client.memberId}</span>
                                </div>
                            </div>

                            <div className="client-card-body">
                                <div className="client-contact-info">
                                    <div className="info-item">
                                        <Mail size={16} />
                                        <span>{client.email || 'Chưa cập nhật'}</span>
                                    </div>
                                    <div className="info-item">
                                        <Phone size={16} />
                                        <span>{client.phone || 'Chưa cập nhật'}</span>
                                    </div>
                                </div>

                                <div className="client-stats-grid">
                                    <div className="stat-box">
                                        <span className="stat-label">Chiều cao</span>
                                        <span className="stat-value">{client.height ? `${client.height} cm` : 'N/A'}</span>
                                    </div>
                                    <div className="stat-box">
                                        <span className="stat-label">Cân nặng</span>
                                        <span className="stat-value">{client.weight ? `${client.weight} kg` : 'N/A'}</span>
                                    </div>
                                    <div className="stat-box highlight-stat">
                                        <span className="stat-label">BMI</span>
                                        <span className="stat-value">{client.bmi ? client.bmi.toFixed(1) : 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="client-goal">
                                    <Target size={16} className="goal-icon" />
                                    <div className="goal-text">
                                        <span className="goal-label">Mục tiêu:</span>
                                        <span className="goal-value">{getGoalLabel(client.goalType)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="client-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div className="package-info">
                                    <div className="package-tag">
                                        <Activity size={14} />
                                        Gói tập hiện tại
                                    </div>
                                    <h4 className="package-name">{client.activePackageName}</h4>
                                    {client.packageEndDate && (
                                        <div className="package-expiry">
                                            <Calendar size={14} />
                                            Hạn: {new Date(client.packageEndDate).toLocaleDateString('vi-VN')}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => navigate(`/pt/clients/${client.memberId}`)}
                                    style={{ padding: '8px 15px', background: 'var(--primary-color, #10b981)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '14px' }}
                                >
                                    Chi tiết
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyClients;
