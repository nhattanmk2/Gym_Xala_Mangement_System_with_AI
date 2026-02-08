import PTSidebar from "./PTSidebar";
import PTHeader from "./PTHeader";
import "./ptLayout.css";
import { Outlet } from "react-router-dom";

const PTLayout = () => {
  return (
    <div className="pt-container">
      {/* Sidebar */}
      <PTSidebar />

      {/* Main */}
      <div className="pt-main">
        <PTHeader />

        <div className="pt-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default PTLayout;
