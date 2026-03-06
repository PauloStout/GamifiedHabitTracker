import "./Settings.css";

export default function Settings() {
  return (
    <div className="settings-page page-container">
      <h1>Settings</h1>

      {/* Profile card */}
      <div className="settings-profile-card">
        <div className="settings-avatar">👤</div>
        <div className="settings-profile-info">
          <div className="settings-profile-name">Paulo</div>
          <div className="settings-profile-sub">Level 2 • 110 XP</div>
          <div className="settings-profile-email"></div>
        </div>
        <div className="settings-profile-actions">
          <button className="settings-edit-btn">Edit ✏️</button>
        </div>
      </div>

      {/* Reminders */}
      <div className="settings-section">
        <div className="settings-section-title">
          <span className="section-icon">🔔</span>
          Reminders
        </div>
        <div className="settings-row">
          <div className="settings-row-info">
            <h4>Notified Reminders</h4>
          </div>
          <label className="toggle">
            <input type="checkbox" defaultChecked />
            <span className="toggle-slider" />
          </label>
        </div>
        <div className="settings-row">
          <div className="settings-row-info">
            <h4>Custom Reminder</h4>
          </div>
          <label className="toggle">
            <input type="checkbox" defaultChecked />
            <span className="toggle-slider" />
          </label>
        </div>
        <input
          className="settings-reminder-input"
          placeholder="Write Here..."
        />
      </div>

      {/* Appearance */}
      <div className="settings-section">
        <div className="settings-section-title">
          <span className="section-icon">🎨</span>
          Appearance
        </div>
        <div className="settings-row-info" style={{ marginBottom: "12px" }}>
          <h4>Theme</h4>
        </div>
        <div className="settings-theme-row">
          <button className="settings-theme-option selected">
            <span className="theme-icon">☀️</span>
            Light
          </button>
          <button className="settings-theme-option">
            <span className="theme-icon">🌙</span>
            Dark
          </button>
        </div>
      </div>
    </div>
  );
}
