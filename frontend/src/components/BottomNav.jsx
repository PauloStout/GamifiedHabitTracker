import { NavLink } from "react-router-dom";
import "./BottomNav.css";

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/dashboard" className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
        <span className="nav-icon">🏠</span>
        Dashboard
      </NavLink>

      <NavLink to="/progress" className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
        <span className="nav-icon">📈</span>
        Progress
      </NavLink>

      <NavLink to="/social" className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
        <span className="nav-icon">👥</span>
        Social
      </NavLink>

    </nav>
  );
}