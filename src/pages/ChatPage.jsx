import React, { useState } from "react";
import {
  FiMessageSquare,
  FiPhone,
  FiSearch,
  FiMoreVertical,
} from "react-icons/fi";

import Header from "../components/profile/Header";
import "../styles/ChatPage.css";

const chats = [
  {
    id: 1,
    name: "Shubham Patil",
    message: "Hey! How are you?",
    time: "Just now",
    unread: 2,
    online: true,
    avatar: "S",
  },
  {
    id: 2,
    name: "Kartik Nair",
    message: "Let's meet tomorrow.",
    time: "12:30 PM",
    unread: 0,
    online: true,
    avatar: "K",
  },
  {
    id: 3,
    name: "Ritesh Darade",
    message: "See you soon.",
    time: "Yesterday",
    unread: 0,
    online: false,
    avatar: "R",
  },
  {
    id: 4,
    name: "Roshan Raut",
    message: "Good Morning!",
    time: "Monday",
    unread: 0,
    online: true,
    avatar: "R",
  },
];

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [search, setSearch] = useState("");

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <Header />

      <div className="chat-page">
        <div className="main-container">
          {/* ================= Sidebar ================= */}

          <aside className="sidebar">
            <div className="sidebar-header">
              <h2>Chats</h2>

              <FiMoreVertical className="menu-icon" />
            </div>

            <div className="search-box">
              <FiSearch className="search-icon" />

              <input
                type="text"
                placeholder="Search chats..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="chat-list">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`chat-card ${
                    selectedChat?.id === chat.id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedChat(chat)}
                >
                  <div className="chat-avatar">
                    {chat.avatar}

                    {chat.online && <span className="online-dot"></span>}
                  </div>

                  <div className="chat-info">
                    <div className="top">
                      <h4>{chat.name}</h4>

                      <span>{chat.time}</span>
                    </div>

                    <div className="bottom">
                      <p>{chat.message}</p>

                      {chat.unread > 0 && (
                        <span className="badge">{chat.unread}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* ================= Chat Area ================= */}

          <section className="chat-area">
            {!selectedChat ? (
              <div className="empty-chat">
                <div className="empty-icon">
                  <FiMessageSquare />
                </div>

                <h1>No Conversation Selected</h1>

                <p>
                  Select a conversation from the left sidebar to start chatting.
                </p>

                <button>Start Conversation</button>
              </div>
            ) : (
              <>
                {/* ================= Chat Header ================= */}

                <div className="chat-header">
                  <div className="header-left">
                    <div className="chat-avatar large">
                      {selectedChat.avatar}
                    </div>

                    <div>
                      <h3>{selectedChat.name}</h3>

                      <span>{selectedChat.online ? "Online" : "Offline"}</span>
                    </div>
                  </div>

                  <div className="header-actions">
                    <FiPhone />

                    <FiMoreVertical />
                  </div>
                </div>

                {/* ================= Empty Chat Screen ================= */}

                <div className="empty-chat-screen">
                  <div className="empty-icon">
                    <FiMessageSquare />
                  </div>

                  <h2>No Chats Yet</h2>

                  <p>
                    Start a conversation with{" "}
                    <strong>{selectedChat.name}</strong>.
                  </p>

                  <p className="sub-text">
                    Messages will appear here once you start chatting.
                  </p>

                  <button>Start Chat</button>
                </div>

                {/* ================= Chat Input ================= */}

                <div className="chat-input">
                  <input type="text" placeholder="Type a message..." />

                  <button>Send</button>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </>
  );
};

export default ChatPage;
