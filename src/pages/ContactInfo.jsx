import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/ContactInfo.css";


import {
  ArrowLeft,
  MoreVertical,
  Phone,
  Video,
  Heart,
  Lock,
  Image,
  VideoIcon,
  FileText,
  Bell,
  Users,
  Trash2,
  Ban,
  Pencil,
  Star,
  ChevronRight,
} from "lucide-react";
import Sidebar from "../components/Profile/Sidebar";

function ContactInfo() {
  const [activeTab, setActiveTab] = useState("photos");
  const [showMenu, setShowMenu] = useState(false);

  // Backend data will be connected here later
  const location = useLocation();
  const navigate = useNavigate();

  const contact = location.state?.contact || {
    profileImage: "",
    name: "",
    status: "",
    about: "",
    phone: "",
  };
  return (
    <>
    <Sidebar />
      <div className="contactPage">
        {/* HEADER */}

        <div className="topBar">
          <button className="iconBtn" onClick={() => window.history.back()}>
            <ArrowLeft size={24} />
          </button>

          <div className="menuContainer">
            <button className="iconBtn" onClick={() => setShowMenu(!showMenu)}>
              <MoreVertical size={24} />
            </button>

            {showMenu && (
              <div className="menu">
                <div className="menuItem">
                  <Pencil size={18} />
                  Edit Contact
                </div>

                <div className="menuItem">
                  <Bell size={18} />
                  Notifications
                </div>

                <div className="menuItem">
                  <Users size={18} />
                  Groups In Common
                </div>

                <div className="menuItem dangerMenu">
                  <Ban size={18} />
                  Block User
                </div>

                <div className="menuItem dangerMenu">
                  <Trash2 size={18} />
                  Delete Contact
                </div>

                <div className="menuItem dangerMenu">
                  <Trash2 size={18} />
                  Clear Chat
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PROFILE */}

        <div className="profileSection">
          <div
            className="profileImage"
            style={{ background: contact.avatarColor || "#2563eb" }}
          >
            {contact.photo || contact.profileImage ? (
              <img
                src={contact.photo || contact.profileImage}
                alt={contact.name}
              />
            ) : (
              <span>{contact.initials || contact.name.charAt(0)}</span>
            )}
          </div>

          <h2>{contact.name || "Contact Name"}</h2>

          <p>{contact.status || "No Status"}</p>
        </div>

        {/* ACTION BUTTONS */}

        <div className="actions">
          <div className="actionCard">
            <Phone size={26} />
            <span>Call</span>
          </div>

          <div className="actionCard">
            <Video size={26} />
            <span>Video Call</span>
          </div>

          <div className="actionCard">
            <Heart size={26} />
            <span>Favorite</span>
          </div>

          <div className="actionCard">
            <Lock size={26} />
            <span>Chat Lock</span>
          </div>
        </div>

        {/* MEDIA TABS */}

        <div className="tabs">
          <button
            className={activeTab === "photos" ? "active" : ""}
            onClick={() => setActiveTab("photos")}
          >
            Photos
          </button>

          <button
            className={activeTab === "videos" ? "active" : ""}
            onClick={() => setActiveTab("videos")}
          >
            Videos
          </button>

          <button
            className={activeTab === "documents" ? "active" : ""}
            onClick={() => setActiveTab("documents")}
          >
            Documents
          </button>
        </div>

        {/* MEDIA CONTENT */}

        <div className="mediaSection">
          {activeTab === "photos" && (
            <div className="emptyMedia">
              <Image size={55} />

              <h3>No Photos Available</h3>

              <p>Photos shared in this chat will appear here.</p>
            </div>
          )}

          {activeTab === "videos" && (
            <div className="emptyMedia">
              <VideoIcon size={55} />

              <h3>No Videos Available</h3>

              <p>Videos shared in this chat will appear here.</p>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="emptyMedia">
              <FileText size={55} />

              <h3>No Documents Available</h3>

              <p>Documents shared in this chat will appear here.</p>
            </div>
          )}
        </div>

        {/* ABOUT */}

        <div className="infoCard">
          <h4>About</h4>

          <p>{contact.about || "No about available."}</p>
        </div>

        {/* PHONE */}

        <div className="infoCard">
          <h4>Phone Number</h4>

          <p>{contact.phone || "No phone number available."}</p>
        </div>

        {/* OPTIONS */}

        <div className="options">
          <div className="option">
            <div className="optionLeft">
              <Star size={20} />

              <span>Starred Messages</span>
            </div>

            <ChevronRight size={18} />
          </div>
        </div>
      </div>
    </>
  );
}

export default ContactInfo;
