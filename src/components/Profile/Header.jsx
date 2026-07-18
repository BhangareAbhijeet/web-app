import React from "react";
import { NavLink } from "react-router-dom";
import { FiMessageSquare, FiUsers, FiPhone, FiUser } from "react-icons/fi";

import "../../styles/Header.css";
import headlogo from "../../assets/headlogo.png";

const Header = () => {
  return (
    <header className="header">
      {/* Left */}
      <div className="header-left">
        <img src={headlogo} alt="LokChat Logo" className="head-logo" />
      </div>

      {/* Center */}
      <nav className="header-nav">
        <NavLink
          to="/messages"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          <FiMessageSquare />
          <span>Messages</span>
        </NavLink>

        <NavLink
          to="/contacts"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          <FiUsers />
          <span>Contacts</span>
        </NavLink>

        <NavLink
          to="/calls"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          <FiPhone />
          <span>Calls</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          <FiUser />
          <span>Profile</span>
        </NavLink>
      </nav>

      {/* Right */}
      <div className="profile-icon">
        <FiUser />
      </div>
    </header>
  );
};

export default Header;
