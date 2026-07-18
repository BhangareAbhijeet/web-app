import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Contacts.css";
import Header from "./Profile/Header";

// Swap this with real data from your backend / context later
const CONTACTS = [
  {
    id: 1,
    name: "Saniya Chendurkar",
    status: "Busy",
    online: true,
    avatarColor: "#e35d2b",
    initials: "S",
  },
  {
    id: 2,
    name: "Kartik Nair",
    status: "Hey there! I am using LokChat",
    online: true,
    avatarColor: "#3a3a3a",
    initials: "K",
  },
  {
    id: 3,
    name: "Ritesh Darade",
    status: "At work",
    online: true,
    photo: null, // put an image URL here if you have one
    avatarColor: "#4a4a4a",
    initials: "R",
  },
  {
    id: 4,
    name: "Roshan raut",
    status: "Hey there! I am using LokChat",
    online: true,
    avatarColor: "#2f6fed",
    initials: "R",
  },
  {
    id: 5,
    name: "devika Shaw",
    status: "Hey there! I am using LokChat",
    online: true,
    avatarColor: "#8b3fd4",
    initials: "D",
  },
];

function Contacts() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeChat, setActiveChat] = useState(null);

  const filteredContacts = CONTACTS.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <>
      <Header />
      <div className="contacts-page">
        {/* Left column */}
        <aside className="contacts-sidebar">
          <div className="contacts-sidebar-header">
            <h1>Contacts</h1>
            <div className="contacts-header-icons">
              <button className="icon-btn" aria-label="Search">
                <SearchIcon />
              </button>
              <button className="icon-btn" aria-label="Notifications">
                <BellIcon />
                <span className="notif-dot" />
              </button>
              <button className="icon-btn" aria-label="Add contact">
                <PlusIcon />
              </button>
            </div>
          </div>

          <div className="contacts-search">
            <SearchIcon className="contacts-search-icon" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <button className="action-row">
            <span className="action-icon">
              <PlusCircleIcon />
            </span>
            <span className="action-text">
              <span className="action-title">New Group</span>
              <span className="action-subtitle">Tap to create a group</span>
            </span>
          </button>

          <button className="action-row">
            <span className="action-icon">
              <UserPlusIcon />
            </span>
            <span className="action-text">
              <span className="action-title">Invite Friends</span>
              <span className="action-subtitle">Invite friends to join</span>
            </span>
          </button>

          <div className="contacts-list-label">Contacts on LokChat</div>

          <ul className="contacts-list">
            {filteredContacts.map((contact) => (
              <li
                key={contact.id}
                className={`contact-item ${
                  activeChat === contact.id ? "contact-active" : ""
                }`}
                onClick={() => setActiveChat(contact.id)}
              >
                {/* Avatar */}
                <div
                  className="avatar"
                  style={{ background: contact.avatarColor }}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent chat from opening
                    navigate(`/contactinfo/${contact.id}`, {
                      state: { contact },
                    });
                  }}
                >
                  {contact.photo ? (
                    <img src={contact.photo} alt={contact.name} />
                  ) : (
                    contact.initials
                  )}

                  {contact.online && <span className="status-dot" />}
                </div>

                {/* Contact Info */}
                <div className="contact-info">
                  <span className="contact-name">{contact.name}</span>
                  <span className="contact-status">{contact.status}</span>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Right column */}
        <main className="contacts-empty-state">
          {activeChat === null ? (
            <>
              <div className="empty-icon">
                <TranslateIcon />
              </div>
              <h2>No active chat selected</h2>
              <p>
                Select any friend from your active roster to start translating,
                secure-calling, and chatting in real-time.
              </p>
              <button
                className="chat-cta"
                onClick={() => setActiveChat(CONTACTS[0].id)}
              >
                Chat {CONTACTS[0].name}
              </button>
            </>
          ) : (
            <div className="active-chat-placeholder">
              <h2>
                Chat with {CONTACTS.find((c) => c.id === activeChat)?.name}
              </h2>
              <p>Hook your chat window component up here.</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

/* --- Inline icon components (no external icon library needed) --- */

function SearchIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
      <circle
        cx="11"
        cy="11"
        r="7"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <line
        x1="21"
        y1="21"
        x2="16.65"
        y2="16.65"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18">
      <path
        d="M12 3a5 5 0 00-5 5v3.5c0 .6-.2 1.2-.6 1.7L5 15h14l-1.4-1.8c-.4-.5-.6-1.1-.6-1.7V8a5 5 0 00-5-5z"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 18a2.5 2.5 0 005 0"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18">
      <line
        x1="12"
        y1="5"
        x2="12"
        y2="19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="5"
        y1="12"
        x2="19"
        y2="12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlusCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20">
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
      />
      <line
        x1="12"
        y1="8"
        x2="12"
        y2="16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <line
        x1="8"
        y1="12"
        x2="16"
        y2="12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UserPlusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20">
      <circle
        cx="9"
        cy="8"
        r="3.2"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
      />
      <path
        d="M3.5 19c0-3 2.5-5.2 5.5-5.2s5.5 2.2 5.5 5.2"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
      <line
        x1="18"
        y1="8"
        x2="18"
        y2="14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <line
        x1="15"
        y1="11"
        x2="21"
        y2="11"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TranslateIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26">
      <path
        d="M4 5h9M8.5 3v2M6 5c0 4 2.5 6.5 6 8"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M11 13c1.5-1.5 2.5-3.5 3-6"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M14 21l4-9 4 9M15.3 18h5.4"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default Contacts;
