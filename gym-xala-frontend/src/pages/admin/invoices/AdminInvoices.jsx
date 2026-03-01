import { useEffect, useState } from "react";
import { getInvoices, updateInvoiceStatus } from "../../../api/adminInvoiceApi";
import "./admin-invoices.css";

export default function AdminInvoices() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filter states
    const [memberCode, setMemberCode] = useState("");
    const [registrationDate, setRegistrationDate] = useState("");
    const [status, setStatus] = useState("PENDING"); // Default load pending

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const data = await getInvoices(status, memberCode, registrationDate);
            setInvoices(data);
        } catch (error) {
            console.error("Lỗi khi tải danh sách hóa đơn:", error);
            alert("Không thể tải danh sách hóa đơn, vui lòng kiểm tra kết nối!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, [status]); // Reload when tab changes

    const handleSearch = (e) => {
        e.preventDefault();
        fetchInvoices();
    };

    const handleClearFilters = () => {
        setMemberCode("");
        setRegistrationDate("");
        // Trigger reset fetch directly since state updates are async
        getInvoices(status, "", "").then(setInvoices).catch(console.error);
    };

    const handleApprove = async (id) => {
        if (!window.confirm("Xác nhận đã nhận thanh toán cho hóa đơn này?")) return;
        try {
            await updateInvoiceStatus(id, "ACTIVE");
            alert("Duyệt hóa đơn thành công!");
            fetchInvoices();
        } catch (err) {
            console.error(err);
            alert("Lỗi khi duyệt hóa đơn.");
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm("Bạn có chắc muốn HỦY yêu cầu đăng ký này?")) return;
        try {
            await updateInvoiceStatus(id, "CANCELLED");
            alert("Đã hủy hóa đơn.");
            fetchInvoices();
        } catch (err) {
            console.error(err);
            alert("Lỗi khi hủy hóa đơn.");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN') + " " + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="invoices-container">
            <div className="invoices-header-area">
                <h1 className="invoices-title">🧾 Quản lý Hóa Đơn</h1>
                <p className="invoices-subtitle">Duyệt hoặc quản lý các yêu cầu đăng ký gói tập của hội viên.</p>
            </div>

            <div className="invoices-tabs">
                <button
                    className={`tab-btn ${status === 'PENDING' ? 'active' : ''}`}
                    onClick={() => setStatus('PENDING')}
                >
                    🟡 Chờ duyệt (Pending)
                </button>
                <button
                    className={`tab-btn ${status === 'ACTIVE' ? 'active' : ''}`}
                    onClick={() => setStatus('ACTIVE')}
                >
                    🟢 Đã duyệt (Active)
                </button>
                <button
                    className={`tab-btn ${status === 'CANCELLED' ? 'active' : ''}`}
                    onClick={() => setStatus('CANCELLED')}
                >
                    🔴 Đã hủy (Cancelled)
                </button>
            </div>

            <div className="invoices-filter-card">
                <form onSubmit={handleSearch} className="filter-form">
                    <div className="filter-group">
                        <label>Mã hội viên</label>
                        <input
                            type="text"
                            placeholder="Nhập ID (Ví dụ: 1 hoặc MEM0001)"
                            value={memberCode}
                            onChange={(e) => setMemberCode(e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <label>Ngày lập hóa đơn</label>
                        <input
                            type="date"
                            value={registrationDate}
                            onChange={(e) => setRegistrationDate(e.target.value)}
                        />
                    </div>

                    <div className="filter-actions">
                        <button type="button" className="btn-clear" onClick={handleClearFilters}>Làm mới</button>
                        <button type="submit" className="btn-search">🔍 Tìm kiếm</button>
                    </div>
                </form>
            </div>

            <div className="invoices-table-card">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Đang tải dữ liệu...</p>
                    </div>
                ) : invoices.length === 0 ? (
                    <div className="empty-state">
                        <span>📭</span>
                        <h3>Không tìm thấy hóa đơn nào</h3>
                        <p>Thử xóa bộ lọc hoặc tìm với từ khóa khác.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="invoices-table">
                            <thead>
                                <tr>
                                    <th>MÃ HV</th>
                                    <th>HỘI VIÊN</th>
                                    <th>GÓI TẬP</th>
                                    <th>SỐ TIỀN</th>
                                    <th>THỜI GIAN LẬP</th>
                                    <th>TRẠNG THÁI</th>
                                    {status === 'PENDING' && <th className="text-center">HÀNH ĐỘNG</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((inv) => (
                                    <tr key={inv.id}>
                                        <td className="font-bold">{inv.memberCode}</td>
                                        <td>{inv.memberName}</td>
                                        <td><span className="badge-package">{inv.packageName}</span></td>
                                        <td className="text-price">{inv.amount?.toLocaleString()} đ</td>
                                        <td>{formatDate(inv.registrationDate)}</td>
                                        <td>
                                            <span className={`status-badge ${inv.status.toLowerCase()}`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        {status === 'PENDING' && (
                                            <td className="action-cells">
                                                <button
                                                    className="btn-approve-text"
                                                    onClick={() => handleApprove(inv.id)}
                                                    disabled={loading}
                                                >
                                                    {loading ? "Đang xử lý..." : "Xác nhận thanh toán"}
                                                </button>
                                                <button
                                                    className="btn-reject-text"
                                                    onClick={() => handleReject(inv.id)}
                                                    disabled={loading}
                                                >
                                                    Hủy
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
