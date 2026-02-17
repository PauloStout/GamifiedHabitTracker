import { NavLink } from "react-router-dom";
import "./BottomNav.css";

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/dashboard" className="nav-item">
        Dashboard 🏠
      </NavLink>

      <NavLink to="/progress" className="nav-item">
        Progress 📈
      </NavLink>

      <NavLink to="/social" className="nav-item">
        Social 👥
      </NavLink>

      <NavLink to="/settings" className="nav-item">
        Settings ⚙️
      </NavLink>
    </nav>
  );
}