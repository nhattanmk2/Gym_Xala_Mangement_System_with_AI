import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { getAllSchedules, updateSchedule, deleteSchedule, batchAddSchedule } from "../../../api/adminScheduleApi";
import { getAllLocations } from "../../../api/locationApi";
import { getAllMembers } from "../../../api/adminMemberApi";
import "./admin-schedules.css";

const AdminSchedules = () => {
    const [schedules, setSchedules] = useState([]);
    const [allSchedules, setAllSchedules] = useState([]); // Luôn giữ tất cả để validate BUSY
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialMemberName = queryParams.get("memberName") || "";
    const initialPtName = queryParams.get("ptName") || "";
    const initialViewMode = queryParams.get("viewMode") || "LIST";

    // Filters
    const [filters, setFilters] = useState({
        branchId: "",
        ptName: initialPtName,
        memberName: initialMemberName,
        status: ""
    });

    // View mode
    const [viewMode, setViewMode] = useState(initialViewMode); // 'LIST' or 'CALENDAR'
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // UI state
    const [expandedPtId, setExpandedPtId] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [editFormData, setEditFormData] = useState({
        startTime: "08:00",
        endTime: "09:00",
        status: "AVAILABLE",
        adminNotes: ""
    });
    const [selectedExistingSlotIds, setSelectedExistingSlotIds] = useState([]);
    const [selectedNewDates, setSelectedNewDates] = useState([]);
    const [upcomingDates, setUpcomingDates] = useState([]);
    const [toast, setToast] = useState(null);
    const [modalError, setModalError] = useState(null);

    // Member search for Edit Modal
    const [memberSearchQuery, setMemberSearchQuery] = useState("");
    const [memberSearchResults, setMemberSearchResults] = useState([]);
    const [isSearchingMember, setIsSearchingMember] = useState(false);
    const [selectedMemberName, setSelectedMemberName] = useState("");

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3500);
    };

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            // Luôn lấy tất cả trạng thái để có đủ dữ liệu validate BUSY overlap
            const [allScheduleData, locationData] = await Promise.all([
                getAllSchedules({ ...filters, status: undefined }), // Lấy tất cả lịch, bỏ qua filter status
                getAllLocations()
            ]);
            setAllSchedules(allScheduleData); // Lưu toàn bộ lịch vào allSchedules

            // Lọc dữ liệu hiển thị theo status filter (nếu có)
            const displayData = filters.status
                ? allScheduleData.filter(s => s.status === filters.status || s.status === 'BUSY') // Luôn giữ BUSY để Admin thấy
                : allScheduleData;

            setSchedules(displayData); // Cập nhật schedules để hiển thị
            setLocations(locationData);
        } catch (error) {
            console.error("Error fetching admin schedule data:", error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchData();
        generateUpcomingDates();
    }, [fetchData]);

    const generateUpcomingDates = () => {
        const dates = [];
        const today = new Date();
        for (let i = 0; i < 14; i++) {
            const nextDay = new Date(today);
            nextDay.setDate(today.getDate() + i);
            dates.push(nextDay.toISOString().split("T")[0]);
        }
        setUpcomingDates(dates);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const toggleExpand = (ptId) => {
        setExpandedPtId(expandedPtId === ptId ? null : ptId);
    };

    // Helper functions for dates (matching PT style)
    const getDayName = (isoStr) => new Date(isoStr).toLocaleDateString("vi-VN", { weekday: "short" });
    const getDayNumber = (isoStr) => new Date(isoStr).getDate();

    // Group schedules by PT
    const groupedByPT = schedules.reduce((acc, curr) => {
        if (!acc[curr.ptId]) {
            acc[curr.ptId] = {
                ptName: curr.ptName,
                branchName: curr.branchName,
                ptPhone: curr.ptPhone,
                ptSpecialty: curr.ptSpecialty,
                slots: []
            };
        }
        acc[curr.ptId].slots.push(curr);
        return acc;
    }, {});

    // Group slots by Time + Member + Status for a specific PT
    const groupSlotsByTime = (slots) => {
        const grouped = slots.reduce((acc, slot) => {
            const startD = new Date(slot.startTime);
            const endD = new Date(slot.endTime);
            const startTimeT = startD.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
            const endTimeT = endD.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
            const timeRange = `${startTimeT} - ${endTimeT}`;
            const dateStr = startD.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });

            const key = `${timeRange}_${slot.memberId || 'none'}_${slot.status}`;

            if (!acc[key]) {
                acc[key] = {
                    timeRange,
                    memberName: slot.memberName,
                    status: slot.status,
                    dates: [],
                    rawSlots: [],
                    adminNotes: slot.adminNotes // Lấy note từ slot đầu tiên của group
                };
            }
            acc[key].dates.push(dateStr);
            acc[key].rawSlots.push(slot);
            return acc;
        }, {});

        return Object.values(grouped);
    };

    const handleEditClick = (group, ptName) => {
        const firstSlot = group.rawSlots[0];
        const startD = new Date(firstSlot.startTime);
        const endD = new Date(firstSlot.endTime);

        const formatTime = (date) => {
            return date.getHours().toString().padStart(2, '0') + ":" +
                date.getMinutes().toString().padStart(2, '0');
        };

        setEditingGroup({ ...group, ptName });
        setEditFormData({
            startTime: formatTime(startD),
            endTime: formatTime(endD),
            status: firstSlot.status,
            adminNotes: firstSlot.adminNotes || "",
            memberId: firstSlot.memberId || null
        });
        setSelectedMemberName(firstSlot.memberName || "Chưa có học viên");
        setMemberSearchQuery("");
        setMemberSearchResults([]);
        setModalError(null);
        setSelectedExistingSlotIds(group.rawSlots.map(s => s.id));
        setSelectedNewDates([]);
        setIsEditModalOpen(true);
    };

    const toggleExistingSlot = (id) => {
        setSelectedExistingSlotIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleNewDate = (date) => {
        setSelectedNewDates(prev =>
            prev.includes(date) ? prev.filter(item => item !== date) : [...prev, date].sort()
        );
    };

    const handleQuickStatus = async (slots, newStatus) => {
        const statusMap = {
            'CONFIRMED': 'Sắp diễn ra',
            'COMPLETED': 'Hoàn thành',
            'ABSENT': 'Vắng mặt'
        };
        if (!window.confirm(`Xác nhận chuyển ${slots.length} khung giờ sang trạng thái: ${statusMap[newStatus]}?`)) return;

        try {
            setLoading(true);
            await Promise.all(slots.map(slot =>
                updateSchedule(slot.id, {
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    status: newStatus,
                    adminNotes: slot.adminNotes // Giữ nguyên ghi chú cũ nếu có
                })
            ));
            showToast(`✅ Đã cập nhật trạng thái thành ${statusMap[newStatus]}.`);
            fetchData();
        } catch (error) {
            alert("Lỗi khi cập nhật trạng thái: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = async (group) => {
        if (!window.confirm(`Bạn có chắc muốn xóa tất cả ${group.rawSlots.length} khung giờ này không?`)) return;

        try {
            setLoading(true);
            await Promise.all(group.rawSlots.map(slot => deleteSchedule(slot.id)));
            showToast(`🗑️ Đã xóa ${group.rawSlots.length} khung giờ và gửi thông báo cho PT.`);
            fetchData();
        } catch (error) {
            alert("Lỗi khi xóa lịch: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const checkBusyOverlap = (ptId, date, startTime, endTime, excludingSlotIds = []) => {
        const startDT = new Date(`${date}T${startTime}:00`);
        const endDT = new Date(`${date}T${endTime}:00`);

        return allSchedules.some(slot => {
            if (slot.ptId !== ptId || slot.status !== 'BUSY' || excludingSlotIds.includes(slot.id)) return false;

            const slotStart = new Date(slot.startTime);
            const slotEnd = new Date(slot.endTime);

            return startDT < slotEnd && endDT > slotStart;
        });
    };

    const handleSearchMember = async (query) => {
        setMemberSearchQuery(query);
        if (query.trim().length < 2) {
            setMemberSearchResults([]);
            return;
        }
        try {
            setIsSearchingMember(true);
            const members = await getAllMembers(query);
            setMemberSearchResults(members);
        } catch (error) {
            console.error("Error searching members:", error);
        } finally {
            setIsSearchingMember(false);
        }
    };

    const selectMemberForSlot = (member) => {
        setEditFormData({ ...editFormData, memberId: member.id });
        setSelectedMemberName(member.name);
        setMemberSearchResults([]);
        setMemberSearchQuery("");
    };

    const clearMemberFromSlot = () => {
        setEditFormData({ ...editFormData, memberId: null });
        setSelectedMemberName("Chưa có học viên (Rảnh)");
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (selectedExistingSlotIds.length === 0 && selectedNewDates.length === 0) {
            alert("Vui chọn ít nhất một ngày để áp dụng!");
            return;
        }

        // Frontend Validation
        const ptId = editingGroup.rawSlots[0].ptId;
        const busyConflicts = [];

        // Check existing slots being updated
        editingGroup.rawSlots.forEach(slot => {
            if (!selectedExistingSlotIds.includes(slot.id)) return;
            const dateStr = slot.startTime.split('T')[0];
            if (checkBusyOverlap(ptId, dateStr, editFormData.startTime, editFormData.endTime, [slot.id])) {
                busyConflicts.push(new Date(slot.startTime).toLocaleDateString("vi-VN"));
            }
        });

        // Check new dates being added
        selectedNewDates.forEach(date => {
            if (checkBusyOverlap(ptId, date, editFormData.startTime, editFormData.endTime)) {
                busyConflicts.push(new Date(date).toLocaleDateString("vi-VN"));
            }
        });

        if (busyConflicts.length > 0) {
            setModalError(`Không thể lưu: PT đã có lịch BẬN CÁ NHÂN vào ngày ${busyConflicts.join(', ')} tại khung giờ này.`);
            return;
            setModalError("Vui lòng chọn ít nhất một lịch hiện có hoặc một ngày mới để áp dụng thay đổi.");
            return;
        }
        
        try {
            setLoading(true);
            
            const formatLocalISO = (dateStr, timeStr) => {
                const datePart = dateStr.split('T')[0];
                return `${datePart}T${timeStr}:00`;
            };

            // 1. Cập nhật các slot hiện có
            const updatePromises = selectedExistingSlotIds
                .map(id => allSchedules.find(s => s.id === id))
                .filter(slot => !!slot)
                .map(slot => {
                    return updateSchedule(slot.id, {
                        startTime: formatLocalISO(slot.startTime, editFormData.startTime),
                        endTime: formatLocalISO(slot.endTime, editFormData.endTime),
                        status: editFormData.status,
                        adminNotes: editFormData.adminNotes,
                        memberId: editFormData.memberId
                    });
                });

            // 2. Thêm các slot mới (nếu có chọn ngày mới trong modal)
            const addPromises = selectedNewDates.map(date => {
                return batchAddSchedule(editingGroup.rawSlots[0].ptId, [{
                    startTime: `${date}T${editFormData.startTime}:00`,
                    endTime: `${date}T${editFormData.endTime}:00`,
                    status: editFormData.status,
                    adminNotes: editFormData.adminNotes,
                    memberId: editFormData.memberId
                }]);
            });

            // 3. Xóa các slot bị bỏ chọn
            const deletePromises = editingGroup.rawSlots
                .filter(slot => !selectedExistingSlotIds.includes(slot.id))
                .map(slot => deleteSchedule(slot.id));

            await Promise.all([...updatePromises, ...addPromises, ...deletePromises]);
            showToast("Cập nhật lịch thành công!");
            setIsEditModalOpen(false);
            fetchData();
        } catch (error) {
            console.error("Error updating/adding schedules:", error);
            setModalError(error.response?.data?.message || error.response?.data || "Lỗi khi cập nhật lịch.");
        } finally {
            setLoading(false);
        }
    };

    // ----- CALENDAR LOGIC -----
    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => {
        let day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; // Convert to Monday=0
    };

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const renderCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const totalDays = daysInMonth(year, month);
        const startDay = firstDayOfMonth(year, month);

        let days = [];

        // Trống trước ngày mùng 1
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        // Các ngày trong tháng
        for (let d = 1; d <= totalDays; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

            // Lấy các slot của ngày dựa trên allSchedules (vì schedules có thể bị filter status)
            const daySlots = allSchedules.filter(s => {
                const sDate = new Date(s.startTime);
                return sDate.getFullYear() === year &&
                       sDate.getMonth() === month &&
                       sDate.getDate() === d;
            });

            const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();

            days.push(
                <div key={d} className={`calendar-day ${isToday ? 'today' : ''}`}>
                    <div className="day-number">{d}</div>
                    <div className="day-slots">
                        {daySlots.map(slot => (
                            <div
                                key={slot.id}
                                className={`cal-slot-badge ${slot.status.toLowerCase()}`}
                                onClick={() => handleEditClick({ rawSlots: [slot] }, slot.ptName)}
                            >
                                <span className="time">{slot.startTime.split('T')[1].substring(0, 5)}</span>
                                <span className="entity">{filters.memberName ? `PT: ${slot.ptName}` : (slot.memberName || "Rống")}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return days;
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case "AVAILABLE": return <span className="badge badge-success">Rảnh</span>;
            case "CONFIRMED": return <span className="badge badge-primary">Đã đặt</span>;
            case "PENDING": return <span className="badge badge-warning">Chờ duyệt</span>;
            case "CANCELLED": return <span className="badge badge-danger">Đã hủy</span>;
            case "COMPLETED": return <span className="badge badge-info">Hoàn thành</span>;
            case "ABSENT": return <span className="badge badge-secondary">Vắng mặt</span>;
            case "BUSY": return <span className="badge badge-busy">🔒 Lịch cá nhân</span>;
            default: return status;
        }
    };

    return (
        <div className="admin-schedules-container">
            {toast && <div className="toast-notification">{toast}</div>}

            <header className="page-header">
                <h2>📅 Bảng tổng sắp lịch tập</h2>
                <p>Danh sách các PT có lịch làm việc. Nhấn vào tên PT để xem chi tiết.</p>
            </header>

            <section className="filter-section card">
                <div className="filter-grid">
                    <div className="filter-item">
                        <label>Chi nhánh</label>
                        <select
                            name="branchId"
                            value={filters.branchId}
                            onChange={handleFilterChange}
                        >
                            <option value="">Tất cả chi nhánh</option>
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-item">
                        <label>Tên PT</label>
                        <input
                            type="text"
                            name="ptName"
                            placeholder="Nhập tên PT..."
                            value={filters.ptName}
                            onChange={handleFilterChange}
                        />
                    </div>

                    <div className="filter-item">
                        <label>Tên Học Viên</label>
                        <input
                            type="text"
                            name="memberName"
                            placeholder="Nhập tên học viên..."
                            value={filters.memberName}
                            onChange={handleFilterChange}
                        />
                    </div>

                    <div className="filter-item">
                        <label>Trạng thái</label>
                        <select
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="AVAILABLE">Rảnh</option>
                            <option value="CONFIRMED">Đã đặt (Confirmed)</option>
                            <option value="PENDING">Chờ duyệt (Pending)</option>
                            <option value="COMPLETED">Hoàn thành</option>
                            <option value="BUSY">PT Bận</option>
                        </select>
                    </div>

                    <div className="view-mode-toggle-admin">
                        <label>Chế độ xem</label>
                        <div className="toggle-buttons">
                            <button 
                                className={`mode-btn ${viewMode === 'LIST' ? 'active' : ''}`}
                                onClick={() => setViewMode('LIST')}
                            >
                                📋 Danh sách
                            </button>
                            <button 
                                className={`mode-btn ${viewMode === 'CALENDAR' ? 'active' : ''}`}
                                onClick={() => setViewMode('CALENDAR')}
                            >
                                📅 Lịch tập
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <main className="pt-list-section">
                {loading && schedules.length > 0 && <div className="loading-overlay">Đang xử lý...</div>}

                {loading && schedules.length === 0 ? (
                    <div className="loading-spinner">Đang tải dữ liệu...</div>
                ) : viewMode === 'LIST' ? (
                    <div className="pt-cards-grid slide-up">
                        {Object.keys(groupedByPT).length === 0 ? (
                            <div className="empty-state card">
                                <p>Không có lịch tập nào phù hợp với bộ lọc.</p>
                            </div>
                        ) : (
                            Object.entries(groupedByPT).map(([ptId, data]) => (
                                <div key={ptId} className={`pt-group-card ${expandedPtId === ptId ? "expanded" : ""}`}>
                                    <div className="pt-group-header" onClick={() => toggleExpand(ptId)}>
                                        <div className="pt-main-info">
                                            <div className="pt-avatar-circle">PT</div>
                                            <div className="pt-text">
                                                <h3>{data.ptName}</h3>
                                                <div className="pt-sub-info">
                                                    <span className="pt-specialty-tag">{data.ptSpecialty}</span>
                                                    <span className="pt-phone-tag">{data.ptPhone}</span>
                                                    <span className="branch-tag">{data.branchName}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="pt-stats">
                                            <div className="stat-item">
                                                <span className="stat-value">{data.slots.length}</span>
                                                <span className="stat-label">Khung giờ</span>
                                            </div>
                                            <div className="expand-icon">{expandedPtId === ptId ? "−" : "+"}</div>
                                        </div>
                                    </div>

                                    {expandedPtId === ptId && (
                                        <div className="pt-detail-content">
                                            <table className="admin-table detail-table">
                                                <thead>
                                                    <tr>
                                                        <th>Thời gian</th>
                                                        <th>Ngày áp dụng</th>
                                                        <th>Học viên</th>
                                                        <th>Ghi chú Admin</th>
                                                        <th>Hành động</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {groupSlotsByTime(data.slots).map((group, idx) => (
                                                        <tr key={idx}>
                                                            <td className="time-range-cell">{group.timeRange}</td>
                                                            <td className="dates-cell">
                                                                <div className="dates-list">
                                                                    {group.dates.map((d, i) => (
                                                                        <span key={i} className="date-pill">{d}</span>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                {group.memberName ? (
                                                                    <span className={`badge badge-${group.status.toLowerCase()}`}>
                                                                        {group.memberName} ({group.status})
                                                                    </span>
                                                                ) : (
                                                                    <span className="badge badge-secondary">Rảnh</span>
                                                                )}
                                                            </td>
                                                            <td className="notes-cell" onClick={() => handleEditClick(group, data.ptName)}>
                                                                {group.adminNotes && (
                                                                    <div className="notes-content-truncate" title={group.adminNotes}>
                                                                        {group.adminNotes}
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="action-cell">
                                                                {group.status !== 'BUSY' ? (
                                                                    <div className="admin-actions">
                                                                        <div className="quick-status-buttons">
                                                                            <button className="btn-status upcoming" title="Sắp diễn ra" onClick={() => handleQuickStatus(group.rawSlots, 'CONFIRMED')}>📅</button>
                                                                            <button className="btn-status completed" title="Hoàn thành" onClick={() => handleQuickStatus(group.rawSlots, 'COMPLETED')}>✅</button>
                                                                            <button className="btn-status absent" title="Vắng mặt" onClick={() => handleQuickStatus(group.rawSlots, 'ABSENT')}>❌</button>
                                                                        </div>
                                                                        <div className="main-actions">
                                                                            <button className="btn-icon edit" title="Sửa lịch" onClick={() => handleEditClick(group, data.ptName)}>
                                                                                ✏️
                                                                            </button>
                                                                            <button className="btn-icon delete" title="Xóa lịch" onClick={() => handleDeleteClick(group)}>
                                                                                🗑️
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <span className="read-only-tag" title="Lịch bận cá nhân của PT - Không thể chỉnh sửa">🔒 Đọc duy nhất</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="admin-calendar-view slide-up">
                        <div className="calendar-nav-header card">
                            <button className="cal-btn" onClick={prevMonth}>◀ Tháng trước</button>
                            <h2 className="current-month-label">
                                Tháng {currentMonth.getMonth() + 1}, {currentMonth.getFullYear()}
                            </h2>
                            <button className="cal-btn" onClick={nextMonth}>Tháng sau ▶</button>
                            
                            {(filters.memberName || filters.ptName) && (
                                <div className="cal-filtering-info">
                                    🔍 Đang xem lịch của: <strong>{filters.memberName || filters.ptName}</strong>
                                </div>
                            )}
                        </div>

                        <div className="calendar-grid-admin card">
                            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => (
                                <div key={day} className="calendar-day-header-admin">{day}</div>
                            ))}
                            {renderCalendar()}
                        </div>
                    </div>
                )}
            </main>

            {/* Edit Modal (Enhanced with Add/Delete Dates) */}
            {isEditModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal-content-pt card">
                        <div className="modal-header-pt">
                            <h3>✏️ Chỉnh sửa lịch PT</h3>
                            <span className="selected-count-pt">
                                {selectedExistingSlotIds.length + selectedNewDates.length} ngày được xử lý
                            </span>
                        </div>

                        <p className="pt-name-label">Của PT: <strong>{editingGroup?.ptName}</strong></p>

                        {modalError && (
                            <div className="modal-error-alert">
                                ⚠️ {modalError}
                            </div>
                        )}

                        <div className="modal-scroll-area">
                            {/* Section: Existing Affected Dates */}
                            <div className="form-group-pt">
                                <label>Các ngày hiện tại (Nhấn để bỏ chọn)</label>
                                <div className="quick-date-grid-admin">
                                    {editingGroup?.rawSlots.map(slot => (
                                        <div
                                            key={slot.id}
                                            className={`date-chip ${selectedExistingSlotIds.includes(slot.id) ? 'active' : ''} ${checkBusyOverlap(editingGroup.rawSlots[0].ptId, slot.startTime.split('T')[0], editFormData.startTime, editFormData.endTime, [slot.id]) ? 'date-busy-conflict' : ''}`}
                                            onClick={() => toggleExistingSlot(slot.id)}
                                            title={checkBusyOverlap(editingGroup.rawSlots[0].ptId, slot.startTime.split('T')[0], editFormData.startTime, editFormData.endTime, [slot.id]) ? "PT đã có lịch bận vào khung giờ này" : ""}
                                        >
                                            <span className="chip-day">{getDayName(slot.startTime)}</span>
                                            <span className="chip-num">{getDayNumber(slot.startTime)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Section: Add More Dates */}
                            <div className="form-group-pt">
                                <label>Chọn thêm ngày mới (2 tuần tới)</label>
                                <div className="quick-date-grid-admin">
                                    {upcomingDates.map(date => {
                                        // Check if this date is already in existing slots
                                        const isExisting = editingGroup?.rawSlots.some(s => new Date(s.startTime).toISOString().split('T')[0] === date);
                                        if (isExisting) return null;

                                        return (
                                            <div
                                                key={date}
                                                className={`date-chip ${selectedNewDates.includes(date) ? 'active' : ''} ${checkBusyOverlap(editingGroup.rawSlots[0].ptId, date, editFormData.startTime, editFormData.endTime) ? 'date-busy-conflict' : ''}`}
                                                onClick={() => toggleNewDate(date)}
                                                title={checkBusyOverlap(editingGroup.rawSlots[0].ptId, date, editFormData.startTime, editFormData.endTime) ? "PT đã có lịch bận vào khung giờ này" : ""}
                                            >
                                                <span className="chip-day">{getDayName(date)}</span>
                                                <span className="chip-num">{getDayNumber(date)}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <form onSubmit={handleSaveEdit}>
                                <div className="time-inputs-row-pt">
                                    <div className="form-group-pt">
                                        <label>Giờ bắt đầu</label>
                                        <input
                                            type="time"
                                            value={editFormData.startTime}
                                            onChange={(e) => setEditFormData({ ...editFormData, startTime: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group-pt">
                                        <label>Giờ kết thúc</label>
                                        <input
                                            type="time"
                                            value={editFormData.endTime}
                                            onChange={(e) => setEditFormData({ ...editFormData, endTime: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group-pt status-select-group">
                                    <label>Trạng thái áp dụng</label>
                                    <select
                                        className="status-select-admin"
                                        value={editFormData.status}
                                        onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                                    >
                                        <option value="AVAILABLE">Rảnh (Sẵn sàng)</option>
                                        <option value="CONFIRMED">Đã đặt</option>
                                        <option value="PENDING">Chờ duyệt</option>
                                        <option value="CANCELLED">Hủy bỏ</option>
                                        <option value="COMPLETED">Hoàn thành</option>
                                        <option value="ABSENT">Vắng mặt</option>
                                    </select>
                                </div>

                                {/* Member Assignment Section */}
                                <div className="form-group-pt member-assign-section">
                                    <label>Gán Học Viên Cho Buổi Tập</label>
                                    <div className="current-member-display">
                                        👤 <strong>{selectedMemberName}</strong>
                                        {editFormData.memberId && (
                                            <button type="button" className="btn-clear-member" onClick={clearMemberFromSlot}>Gỡ học viên</button>
                                        )}
                                    </div>
                                    
                                    <div className="member-search-box">
                                        <input 
                                            type="text" 
                                            placeholder="🔍 Tìm kiếm học viên để gán..."
                                            value={memberSearchQuery}
                                            onChange={(e) => handleSearchMember(e.target.value)}
                                        />
                                        {isSearchingMember && <div className="search-loading-tiny">Đang tìm...</div>}
                                        {memberSearchResults.length > 0 && (
                                            <div className="member-search-results-dropdown card">
                                                {memberSearchResults.map(m => (
                                                    <div key={m.id} className="member-result-item" onClick={() => selectMemberForSlot(m)}>
                                                        <div className="m-info">
                                                            <span className="m-name">{m.name}</span>
                                                            <span className="m-sub">{m.phone} | {m.email}</span>
                                                        </div>
                                                        <button type="button" className="btn-select-m">Chọn</button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <p className="helper-text-admin">* Lưu ý: Khi gán học viên mới, hệ thống sẽ tự động trừ 1 buổi tập từ thẻ của họ.</p>
                                </div>

                                <div className="form-group-pt">
                                    <label>Ghi chú của Quản trị viên</label>
                                    <textarea
                                        className="admin-notes-textarea"
                                        rows="4"
                                        placeholder="Nhập ghi chú hoặc nhắc nhở thêm..."
                                        value={editFormData.adminNotes}
                                        onChange={(e) => setEditFormData({ ...editFormData, adminNotes: e.target.value })}
                                    ></textarea>
                                </div>

                                {editingGroup && editingGroup.rawSlots[0] && (editingGroup.rawSlots[0].status === 'COMPLETED' || editingGroup.rawSlots[0].exercises || editingGroup.rawSlots[0].ptEvaluation) && (
                                    <div className="pt-evaluation-readonly-container">
                                        <h4 className="eval-readonly-title">🏋️ Nội dung & Nhận xét từ PT</h4>
                                        <div className="eval-readonly-box">
                                            <div className="eval-read-group">
                                                <label>Bài tập đã thực hiện:</label>
                                                <div className="eval-read-content">{editingGroup.rawSlots[0].exercises || "Chưa có thông tin"}</div>
                                            </div>
                                            <div className="eval-read-group">
                                                <label>Mục tiêu đạt được:</label>
                                                <div className="eval-read-content">{editingGroup.rawSlots[0].achievedGoals || "Chưa có thông tin"}</div>
                                            </div>
                                            <div className="eval-read-group">
                                                <label>Đánh giá của PT:</label>
                                                <div className="eval-read-content">{editingGroup.rawSlots[0].ptEvaluation || "Chưa có nhận xét"}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="modal-actions-pt">
                                    <button type="button" className="btn-cancel-pt" onClick={() => { setIsEditModalOpen(false); setModalError(null); }}>Hủy</button>
                                    <button type="submit" className="btn-save-pt">Lưu Thay Đổi</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSchedules;
