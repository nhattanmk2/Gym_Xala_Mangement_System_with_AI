import React, { useState, useEffect } from 'react';
import { getRevenueReport, getPtPerformanceReport, getMemberSummaryReport } from '../../api/adminReportApi';
import './admin-reports.css';

const AdminReports = () => {
    const [activeTab, setActiveTab] = useState('revenue');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    const fetchData = async () => {
        setData([]); // Clear old data to avoid key conflicts during tab switch
        setLoading(true);
        try {
            let response;
            if (activeTab === 'revenue') {
                response = await getRevenueReport(startDate, endDate);
            } else if (activeTab === 'pt') {
                response = await getPtPerformanceReport(startDate, endDate);
            } else {
                response = await getMemberSummaryReport();
            }
            setData(response.data);
        } catch (error) {
            console.error("Error fetching report data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const handleFilter = () => {
        fetchData();
    };

    const exportToCSV = () => {
        if (data.length === 0) return;

        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
        const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `report_${activeTab}_${startDate}_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderTable = () => {
        if (loading) return <div className="loading">Đang tải dữ liệu...</div>;
        if (data.length === 0) return <div className="no-data">Không có dữ liệu cho khoảng thời gian này.</div>;

        if (activeTab === 'revenue') {
            return (
                <table className="ad-report-table">
                    <thead>
                        <tr>
                            <th>Mã HD</th>
                            <th>Hội viên</th>
                            <th>Gói tập</th>
                            <th>Số tiền</th>
                            <th>Ngày</th>
                            <th>Chi nhánh</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={`rev-${item.id}-${index}`}>
                                <td>#{item.id}</td>
                                <td>{item.memberName}</td>
                                <td>{item.packageName}</td>
                                <td>{item.amount?.toLocaleString()} VNĐ</td>
                                <td>{item.registrationDate}</td>
                                <td>{item.branchName}</td>
                                <td>
                                    <span className={`status-badge status-${item.status?.toLowerCase()}`}>
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }

        if (activeTab === 'pt') {
            return (
                <table className="ad-report-table">
                    <thead>
                        <tr>
                            <th>Tên PT</th>
                            <th>Chuyên môn</th>
                            <th>Số buổi hoàn thành</th>
                            <th>Đánh giá TB</th>
                            <th>Chi nhánh</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={`pt-${item.ptId}-${index}`}>
                                <td>{item.ptName}</td>
                                <td>{item.specialty}</td>
                                <td>{item.completedSessions}</td>
                                <td>⭐ {item.averageRating?.toFixed(1)}</td>
                                <td>{item.branchName}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }

        if (activeTab === 'member') {
            return (
                <table className="ad-report-table">
                    <thead>
                        <tr>
                            <th>Tên hội viên</th>
                            <th>Gói đang dùng</th>
                            <th>Ngày bắt đầu</th>
                            <th>Ngày hết hạn</th>
                            <th>Chi nhánh</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={`mem-${item.cardId}-${index}`}>
                                <td>{item.memberName}</td>
                                <td>{item.packageName}</td>
                                <td>{item.startDate}</td>
                                <td>{item.endDate}</td>
                                <td>{item.branchName}</td>
                                <td>
                                    <span className={`status-badge status-${item.status?.toLowerCase()}`}>
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }
    };

    return (
        <div className="ad-reports-container">
            <div className="ad-reports-header">
                <h1>Báo cáo sơ bộ</h1>
                <button className="ad-btn-export" onClick={exportToCSV}>
                    Xuất CSV (Excel)
                </button>
            </div>

            <div className="ad-reports-filters">
                <div className="filter-group">
                    <label>Từ ngày</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="filter-group">
                    <label>Đến ngày</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <button className="ad-tab-btn active" style={{ marginTop: '20px', height: '40px' }} onClick={handleFilter}>
                    Lọc dữ liệu
                </button>
            </div>

            <div className="ad-reports-tabs">
                <button
                    className={`ad-tab-btn ${activeTab === 'revenue' ? 'active' : ''}`}
                    onClick={() => setActiveTab('revenue')}
                >
                    Báo cáo Doanh thu
                </button>
                <button
                    className={`ad-tab-btn ${activeTab === 'pt' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pt')}
                >
                    Hiệu suất PT
                </button>
                <button
                    className={`ad-tab-btn ${activeTab === 'member' ? 'active' : ''}`}
                    onClick={() => setActiveTab('member')}
                >
                    Tổng hợp Hội viên
                </button>
            </div>

            <div className="ad-report-table-wrapper">
                {renderTable()}
            </div>
        </div>
    );
};

export default AdminReports;
