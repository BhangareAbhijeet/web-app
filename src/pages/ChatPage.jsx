import React, { useState, useEffect } from "react";
import { FiMessageSquare, FiPhone, FiMoreVertical } from "react-icons/fi";

import ChatListSidebar from "../components/chats/ChatListSidebar";
import ContactsSidebar from "../components/chats/ContactsSidebar";
import { getContacts, getConversation } from "../services/api";
import socket from "../services/socket";
import "../styles/ChatPage.css";

// ✅ Same palette used in ContactsSidebar, kept consistent across the app
const AVATAR_PALETTE = [
  { avatarColor: "#331c1c", textColor: "#f87171" },
  { avatarColor: "#1e2530", textColor: "#60a5fa" },
  { avatarColor: "#152233", textColor: "#38bdf8" },
  { avatarColor: "#2a1e33", textColor: "#c084fc" },
  { avatarColor: "#33231e", textColor: "#fb923c" },
];

function getAvatarStyle(name) {
  const index = name ? name.charCodeAt(0) % AVATAR_PALETTE.length : 0;
  return AVATAR_PALETTE[index];
}

const ChatPage = () => {
  const [chats, setChats] = useState([]);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [chatsError, setChatsError] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");

  const [sidebarView, setSidebarView] = useState("chats");

  useEffect(() => {
    getContacts()
      .then((res) => {
        const mapped = res.data.map((u) => {
          const fullName = `${u.firstName || ""} ${u.lastName || ""}`.trim();
          const displayName = fullName || u.phone || u.email || "Unknown User";
          const initials =
            (
              (u.firstName?.[0] || "") + (u.lastName?.[0] || "")
            ).toUpperCase() || "?";
          const style = getAvatarStyle(displayName);

          return {
            id: u._id,
            name: displayName,
            message: "Tap to start chatting",
            time: "",
            unread: 0,
            online: u.isOnline,
            avatar: initials,
            avatarColor: style.avatarColor,
            textColor: style.textColor,
            messages: [],
          };
        });
        setChats(mapped);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch chats:", err);
        setChatsError("Could not load chats");
      })
      .finally(() => setChatsLoading(false));
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    if (!userId) return;

    socket.emit("addUser", userId);

    socket.on("getMessage", (message) => {
      console.log("New Message:", message);

      if (selectedChat && message.senderId === selectedChat.id) {
        setSelectedChat((prev) => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              id: message.messageId,
              text: message.text,
              sender: "other",
              time: new Date(message.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ],
        }));
      }

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === message.senderId
            ? {
                ...chat,
                message: message.text,
                time: "Now",
              }
            : chat,
        ),
      );
    });


    
    return () => {
      socket.off("getMessage");
    };
  }, [selectedChat]);

  const handleSend = () => {
    if (!draft.trim() || !selectedChat) return;

    const messageData = {
      senderId: localStorage.getItem("userId"),
      receiverId: selectedChat.id,
      text: draft,
    };

    socket.emit("sendMessage", messageData);

    setSelectedChat((prev) => ({
      ...prev,
      messages: [
        ...prev.messages,
        {
          id: Date.now(),
          text: draft,
          sender: "me",
          time: "Now",
        },
      ],
    }));

    setDraft("");
  };

  const handleSelectContact = async (contact) => {
    const existingChat = chats.find((c) => c.id === contact.id);

    let chat = existingChat;

    if (!existingChat) {
      chat = {
        id: contact.id,
        name: contact.name,
        message: "",
        time: "",
        unread: 0,
        online: contact.online,
        avatar: contact.initials,
        avatarColor: contact.avatarColor,
        textColor: contact.textColor,
        messages: [],
      };

      setChats((prev) => [chat, ...prev]);
    }

    try {
      const res = await getConversation(
        localStorage.getItem("userId"),
        contact.id,
      );

      const messages = res.data.map((msg) => ({
        id: msg._id,
        text: msg.text,
        sender:
          msg.sender._id === localStorage.getItem("userId") ? "me" : "other",
        time: new Date(msg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));

      setSelectedChat({
        ...chat,
        messages,
      });
    } catch (err) {
      console.log(err);
      setSelectedChat(chat);
    }

    setSidebarView("chats");
  };

  return (
    <>
      <div className="chat-page">
        <div className="main-container">
          {/* ================= Sidebar ================= */}

          {sidebarView === "chats" ? (
            <ChatListSidebar
              chats={chats}
              loading={chatsLoading}
              error={chatsError}
              search={search}
              setSearch={setSearch}
              selectedChat={selectedChat}
              setSelectedChat={setSelectedChat}
              onShowContacts={() => setSidebarView("contacts")}
            />
          ) : (
            <ContactsSidebar
              onSelectContact={handleSelectContact}
              onBack={() => setSidebarView("chats")}
            />
          )}

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
                    <div
                      className="chat-avatar large"
                      style={{
                        background: selectedChat.avatarColor,
                        color: selectedChat.textColor,
                      }}
                    >
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

                {/* ================= Messages Area ================= */}

                <div className="messages-area">
                  {selectedChat.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`message-row ${
                        msg.sender === "me" ? "sent" : "received"
                      }`}
                    >
                      <div className="message-bubble">
                        <p>{msg.text}</p>
                        <span className="message-time">{msg.time}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ================= Chat Input ================= */}

                <div className="chat-input">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  />

                  <button onClick={handleSend}>Send</button>
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
