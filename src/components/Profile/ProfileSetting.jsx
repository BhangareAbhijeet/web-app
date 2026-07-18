import React, { useState } from "react";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiBell,
  FiMoon,
  FiGlobe,
  FiLogOut,
} from "react-icons/fi";

import "../../styles/ProfileSetting.css";

const ProfileSetting = () => {
  const [notification, setNotification] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");

    window.location.href = "/login";
  };

  return (
    <div className="profile-setting-container">
      {/* ACCOUNT INFORMATION */}

      <div className="profile-setting-card">
        <h2>Account Information</h2>

        <div className="setting-row">
          <div className="setting-label">
            <FiUser />

            <span>Name</span>
          </div>

          <p></p>
        </div>

        <div className="setting-row">
          <div className="setting-label">
            <FiMail />

            <span>Email Address</span>
          </div>

          <p></p>
        </div>

        <div className="setting-row">
          <div className="setting-label">
            <FiPhone />

            <span>Phone Number</span>
          </div>

          <p></p>
        </div>
      </div>

      {/* SYSTEM SETTINGS */}

      <div className="profile-setting-card">
        <h2>System Settings</h2>

        <div className="setting-row">
          <div className="setting-label">
            <FiLock />

            <span>Security</span>
          </div>

          <span>&gt;</span>
        </div>

        <div className="setting-row">
          <div className="setting-label">
            <FiBell />

            <span>Notifications</span>
          </div>

          <label className="toggle">
            <input
              type="checkbox"
              checked={notification}
              onChange={() => setNotification(!notification)}
            />

            <span className="slider"></span>
          </label>
        </div>

        <div className="setting-row">
          <div className="setting-label">
            <FiMoon />

            <span>Appearance</span>
          </div>

          <span>Dark Mode</span>
        </div>

        <div className="setting-row">
          <div className="setting-label">
            <FiGlobe />

            <span>Language</span>
          </div>

          <span>English</span>
        </div>
      </div>

      <button className="logout-button" onClick={logout}>
        <FiLogOut />
        Logout
      </button>
    </div>
  );
};

export default ProfileSetting;
