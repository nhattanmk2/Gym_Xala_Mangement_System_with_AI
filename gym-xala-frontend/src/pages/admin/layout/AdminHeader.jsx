import "./adminHeader.css";

const AdminHeader = () => {
  const username = localStorage.getItem("username");

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="admin-header">
      <h3>Admin Panel</h3>

      <div>
        <span style={{ marginRight: "15px" }}>
          Xin chào, <b>{username}</b>
        </span>

        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default AdminHeader;
