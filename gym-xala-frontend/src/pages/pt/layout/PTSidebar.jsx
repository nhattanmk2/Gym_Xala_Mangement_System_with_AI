import { Link } from "react-router-dom";
import "./ptSidebar.css";

const PTSidebar = () => {
  return (
    <div className="pt-sidebar">
      <h2 className="logo">GYM XALA</h2>

      <nav>
        <Link to="/pt/dashboard">Dashboard</Link>
        <Link to="/pt/members">My Members</Link>
        <Link to="/pt/schedule">Schedule</Link>
      </nav>
    </div>
  );
};

export default PTSidebar;

