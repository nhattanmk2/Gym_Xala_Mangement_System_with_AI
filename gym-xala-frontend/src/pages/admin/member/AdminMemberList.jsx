import { useEffect, useState, useCallback } from "react";
import AdminLayout from "../layout/AdminLayout";
import { getAllMembers } from "../../../api/adminMemberApi";
import "./adminMemberList.css";

const AdminMemberList = () => {
  const [members, setMembers] = useState([]);
  const [name, setName] = useState("");
  const [cccd, setCccd] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchMembers = useCallback(async () => {
    try {
        setLoading(true);
        const data = await getAllMembers(name, cccd);
        console.log("DATA:", data); // thêm dòng này
        setMembers(data);
    } catch (error) {
        console.error("Error fetching members:", error);
    } finally {
        setLoading(false);
    }
    }, [name, cccd]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

  return (
    <AdminLayout>
      <div className="member-container">
        <h2>Member Management</h2>

        {/* Filter Bar */}
        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search by name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="text"
            placeholder="Search by CCCD..."
            value={cccd}
            onChange={(e) => setCccd(e.target.value)}
          />

          <button onClick={fetchMembers}>Search</button>
        </div>

        {/* Table */}
        {loading ? (
          <p>Loading data...</p>
        ) : members.length === 0 ? (
          <p>No members found.</p>
        ) : (
          <table className="member-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Họ và tên</th>
                <th>CCCD</th>
                <th>Email</th>
                <th>SĐT</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m, index) => (
                <tr key={m.id}>
                  <td>{index + 1}</td>
                  <td>{m.name}</td>
                  <td>{m.cccd || "Chưa cập nhật"}</td>
                  <td>{m.email}</td>
                  <td>{m.phone}</td>
                  <td>
                    <button className="action-btn lock">Khóa</button>
                    <button className="action-btn delete">Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMemberList;