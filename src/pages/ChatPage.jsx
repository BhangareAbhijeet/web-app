import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import ContactsSidebar from "../components/chats/ContactsSidebar";
import ChatListSidebar from "../components/chats/ChatListSidebar";
import {
  FiMessageSquare,
  FiPhone,
  FiSearch,
  FiMoreVertical,
  FiMic,
  FiImage,
  FiSmile,
  FiPaperclip,
  FiUsers,
  FiUser,
} from "react-icons/fi";

import Header from "../components/profile/Sidebar";
import "../styles/ChatPage.css";
import { useNavigate, useLocation } from "react-router-dom";

// ---------------------------------------------------------------------------
// CONFIG — adjust these three to match your existing backend setup
// ---------------------------------------------------------------------------
// ADJUST: base URL of your existing Express server
const SOCKET_URL = "http://localhost:5000";
const API_BASE_URL = "http://localhost:5000/api";
console.log("Socket URL:", API_BASE_URL);
// ADJUST: whatever key you already use to store the JWT after login
const AUTH_TOKEN_KEY = "token";
// ADJUST: whatever key you already use to store the logged-in user object after login
const AUTH_USER_KEY = "user";

// axios instance — every request automatically carries the JWT your
// authMiddleware.js expects (typically `Authorization: Bearer <token>`)
const api = axios.create({
  baseURL: API_BASE_URL,
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------------------------------------------------------------------------
// ENDPOINTS — ADJUST these to exactly match your messageRoutes.js.
// Everything else in this file is written against these five calls, so if
// your real route names differ, this is the only block you need to edit.
// ---------------------------------------------------------------------------
const ENDPOINTS = {
  chatList: () => "/users",
  conversation: (currentUserId, userId) =>
    `/messages/${currentUserId}/${userId}`,
  sendMessage: () => "/messages",
  markRead: (senderId, receiverId) =>
    `/messages/mark-read/${senderId}/${receiverId}`,
};

// ---------------------------------------------------------------------------
// SOCKET.IO — ADJUST event names to match socket.js on the server.
// ---------------------------------------------------------------------------
const SOCKET_EVENTS = {
  newMessage: "getMessage",
  onlineUsers: "getUsers",
  unreadCount: "unreadCount",
  messageStatus: "messageStatus",
  messagesSeen: "messagesSeen",
  typing: "typing",
  stopTyping: "stopTyping",
};

const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem(AUTH_USER_KEY) || "null");
  } catch {
    return null;
  }
};

const avatarColors = [
  "#E35D2B",
  "#8B5CF6",
  "#10B981",
  "#F59E0B",
  "#3B82F6",
  "#EC4899",
  "#14B8A6",
  "#EF4444",
  "#0EA5E9",
  "#F97316",
];

const getAvatarColor = (name) => {
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) {
    hash += name.charCodeAt(i);
  }
  return avatarColors[hash % avatarColors.length];
};

const getInitials = (name = "") => {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
};

// ---------------------------------------------------------------------------
// Time helpers (unchanged from the reference version)
// ---------------------------------------------------------------------------
const formatMessageTime = (dateTimeInput) => {
  if (!dateTimeInput) return "";
  const dateTime = new Date(dateTimeInput);
  const now = new Date();
  const diffMs = now.getTime() - dateTime.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const isToday = dateTime.toDateString() === now.toDateString();
  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(now.getDate() - 1);
  const isYesterday = dateTime.toDateString() === yesterdayDate.toDateString();

  if (diffMinutes < 1) return "Just now";
  if (isToday) {
    return dateTime.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  if (isYesterday) return "Yesterday";
  if (diffDays < 7) {
    return dateTime.toLocaleDateString([], { weekday: "long" });
  }
  return `${dateTime.getDate()}/${dateTime.getMonth() + 1}/${dateTime.getFullYear()}`;
};

const formatBubbleTime = (dateTimeInput) => {
  if (!dateTimeInput) return "";
  const dateTime = new Date(dateTimeInput);
  return dateTime.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
};

// ---------------------------------------------------------------------------
// Message-shape helpers
// --------------------------------------------------------------------------
// Your Message model uses { sender, receiver, text, type, read, delivered,
// seen, createdAt }. `sender`/`receiver` are ObjectId refs — normalize to
// plain string ids here so the rest of the component can compare simply.
// ---------------------------------------------------------------------------
const normalizeMessage = (msg) => ({
  id: msg._id || msg.id,

  text: msg.text,

  translatedText: msg.translatedText,

  type: msg.type || "text",

  senderId: typeof msg.sender === "object" ? msg.sender?._id : msg.sender,

  receiverId:
    typeof msg.receiver === "object" ? msg.receiver?._id : msg.receiver,

  sender: msg.sender,
  receiver: msg.receiver,

  senderLanguage: msg.senderLanguage,
  receiverLanguage: msg.receiverLanguage,

  read: Boolean(msg.read),
  delivered: Boolean(msg.delivered),
  seen: Boolean(msg.seen),

  createdAt: msg.createdAt,
});

const isAudioMessage = (chat) => chat.lastMessage?.type === "audio";
const isImageMessage = (chat) => chat.lastMessage?.type === "image";

const ChatPage = () => {
  const currentUser = getCurrentUser(); // ADJUST if you fetch the user differently
  const currentUserId = currentUser?._id || currentUser?.id;

  const [selectedChat, setSelectedChat] = useState(null);
  const [search, setSearch] = useState("");
  const [showUnread, setShowUnread] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const activeNav =
    location.pathname === "/messages"
      ? "messages"
      : location.pathname === "/contacts"
        ? "contacts"
        : location.pathname === "/calls"
          ? "calls"
          : location.pathname === "/profile"
            ? "profile"
            : "messages";
  // ---- Backend-driven state ---------------------------------------------
  const [chats, setChats] = useState([]);
  const [sidebarView, setSidebarView] = useState("chats");
  const [showMenu, setShowMenu] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [chatsError, setChatsError] = useState(null);

  const [messages, setMessages] = useState({}); // { [userId]: normalizedMessage[] }
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [conversationError, setConversationError] = useState(null);

  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const socketRef = useRef(null);

  const shouldHighlightUnread = useCallback(
    (chat) => {
      const msg = chat.lastMessage;
      if (!msg || !currentUserId) return false;
      return msg.senderId !== currentUserId && !msg.read;
    },
    [currentUserId],
  );

  const getPreviewText = useCallback(
    (chat) => {
      const msg = chat.lastMessage;
      if (!msg) return "";
      if (isAudioMessage(chat)) {
        return msg.senderId === currentUserId
          ? "Sent voice message"
          : "Received voice message";
      }
      if (isImageMessage(chat)) {
        return msg.senderId === currentUserId
          ? "Sent an image"
          : "Received an image";
      }
      return msg.text || "";
    },
    [currentUserId],
  );

  // =========================================================================
  // 1. Fetch chat list (sidebar) from the existing backend
  const fetchChatList = useCallback(async () => {
    setIsLoadingChats(true);
    setChatsError(null);

    try {
      const res = await api.get("/users");

      console.log("CONTACTS API DATA:", res.data);

      const data = Array.isArray(res.data) ? res.data : [];

      const mapped = data.map((u) => ({
        id: u._id,
        name: `${u.firstName || ""} ${u.lastName || ""}`.trim(),
        photo: u.profilePic?.url || null,
        online: !!u.isOnline,
        unread: 0,
        lastMessage: {
          text: "Tap to start chatting",
          type: "text",
          senderId: null,
          createdAt: null,
          read: true,
        },
      }));

      console.log("Mapped Chats:", mapped);

      setChats(mapped);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setChatsError("Failed to load chats");
    } finally {
      setIsLoadingChats(false);
    }
  }, []);

  // =========================================================================
  // 2. Fetch full conversation when a chat is opened + mark it read
  // =========================================================================
  // =========================================================================
  // 2. Mark conversation as read
  // =========================================================================

  const markConversationRead = useCallback(async (userId) => {
    try {
      await api.patch(ENDPOINTS.markRead(userId, currentUserId));
    } catch (err) {
      // Non-fatal — sidebar badge still clears locally below
      console.error("Failed to mark conversation as read:", err);
    }
    setChats((prev) =>
      prev.map((c) =>
        c.id === userId
          ? {
              ...c,
              unread: 0,
              lastMessage: c.lastMessage
                ? { ...c.lastMessage, read: true }
                : null,
            }
          : c,
      ),
    );
  }, []);

  // =========================================================================
  // 3. Fetch full conversation when a chat is opened
  // =========================================================================
  const fetchConversation = useCallback(
    async (userId) => {
      setIsLoadingConversation(true);
      setConversationError(null);

      try {
        console.log("Current User ID:", currentUserId);
        console.log("Selected User ID:", userId);
        console.log("URL:", `/messages/${currentUserId}/${userId}`);

        const res = await api.get(`/messages/${currentUserId}/${userId}`);

        console.log("Conversation API Response:", res.data);
        console.log("Conversation API Response:", res.data);

        const data = Array.isArray(res.data)
          ? res.data
          : res.data.messages || [];

        const normalized = data.map(normalizeMessage);

        console.log("Normalized Messages:", normalized);

        setMessages((prev) => ({
          ...prev,
          [userId]: normalized,
        }));
      } catch (err) {
        console.error("Failed to load conversation:", err);
        console.error("Response:", err.response?.data);
        setConversationError("Couldn't load this conversation.");
      } finally {
        setIsLoadingConversation(false);
      }
    },
    [currentUserId],
  );

  // =========================================================================
  // 4. Mount: load chat list + connect Socket.IO
  // =========================================================================
  useEffect(() => {
    fetchChatList();

    const token = localStorage.getItem(AUTH_TOKEN_KEY);

    const socket = io(SOCKET_URL, {
      auth: {
        token,
      },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);

      socket.emit("addUser", currentUserId);
    });

    // ==========================
    // Receive New Message
    // ==========================
    socket.on("getMessage", (data) => {
      console.log("📩 Received Message:", data);

      const msg = normalizeMessage({
        _id: data.messageId,
        sender: data.senderId,
        receiver: data.receiverId,
        text: data.text,
        translatedText: data.translatedText,
        type: data.type,
        delivered: data.delivered,
        read: false,
        seen: false,
        createdAt: data.createdAt,
      });

      const otherUserId =
        msg.senderId === currentUserId ? msg.receiverId : msg.senderId;

      // Add message to conversation
      setMessages((prev) => ({
        ...prev,
        [otherUserId]: [...(prev[otherUserId] || []), msg],
      }));

      // Update sidebar
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id !== otherUserId) return chat;

          const isOpen = selectedChat?.id === otherUserId;

          return {
            ...chat,
            lastMessage: msg,
            unread: isOpen ? 0 : (chat.unread || 0) + 1,
          };
        }),
      );

      // Mark messages as read if chat is open
      if (selectedChat?.id === otherUserId) {
        markConversationRead(otherUserId);
      }
    });

    // ==========================
    // Online Users
    // ==========================
    socket.on("getUsers", (onlineUserIds) => {
      console.log("🟢 Online Users:", onlineUserIds);

      setChats((prev) =>
        prev.map((chat) => ({
          ...chat,
          online: onlineUserIds.includes(chat.id),
        })),
      );
    });

    // ==========================
    // Message Status
    // ==========================
    socket.on("messageStatus", (data) => {
      console.log("📦 Message Status:", data);

      setMessages((prev) => {
        const updated = { ...prev };

        Object.keys(updated).forEach((userId) => {
          updated[userId] = updated[userId].map((m) =>
            m.id === data.messageId
              ? {
                  ...m,
                  delivered: data.status === "delivered",
                }
              : m,
          );
        });

        return updated;
      });
    });

    // ==========================
    // Messages Seen
    // ==========================
    socket.on("messagesSeen", ({ receiverId }) => {
      console.log("👀 Messages Seen:", receiverId);

      setMessages((prev) => {
        if (!prev[receiverId]) return prev;

        return {
          ...prev,
          [receiverId]: prev[receiverId].map((m) =>
            m.senderId === currentUserId
              ? {
                  ...m,
                  read: true,
                  seen: true,
                }
              : m,
          ),
        };
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [fetchChatList, markConversationRead, selectedChat?.id, currentUserId]);

  // =========================================================================
  // 5. When a chat is selected
  // =========================================================================
  const handleSelectChat = (chat) => {
    console.log("SELECTED CHAT:", chat);

    setSelectedChat(chat);

    if (!messages[chat.id]) {
      fetchConversation(chat.id);
    }

    if (chat.unread > 0) {
      markConversationRead(chat.id);
    }
  };

  // =========================================================================
  // 6. Send message
  // =========================================================================
  const handleSendMessage = () => {
    const text = messageInput.trim();

    if (!text) return;
    if (!selectedChat) return;
    if (!currentUserId) return;
    if (!socketRef.current?.connected) {
      console.error("Socket not connected");
      return;
    }

    socketRef.current.emit("sendMessage", {
      senderId: currentUserId,
      receiverId: selectedChat.id,
      text,
      type: "text",
    });

    const tempMessage = {
      id: Date.now().toString(),
      text,
      type: "text",
      senderId: currentUserId,
      receiverId: selectedChat.id,
      createdAt: new Date().toISOString(),
      delivered: false,
      read: false,
      seen: false,
    };

    setMessages((prev) => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), tempMessage],
    }));

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === selectedChat.id
          ? {
              ...chat,
              lastMessage: tempMessage,
            }
          : chat,
      ),
    );

    setMessageInput("");
  };
  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  // =========================================================================
  // Derived list for the sidebar
  // =========================================================================
  const filteredChats = chats.filter((chat) => {
    console.log(chat.name, chat.photo);
    const matchesSearch = (chat.name || "")
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesUnread = showUnread ? chat.unread > 0 : true;
    return matchesSearch && matchesUnread;
  });

  const conversation = selectedChat ? messages[selectedChat.id] || [] : [];

  return (
    <>
      {/* <Header /> */}

      <div className="chat-page">
        <div className="main-container">
          {/* ================= Sidebar ================= */}
          {(activeNav === "messages" || activeNav === "contacts") && (
            <>
              {activeNav === "messages" ? (
                <aside className="chatpg-sidebar">
                  <div className="sidebar-header">
                    <h2>LokChat</h2>

                    <div className="menu-wrapper">
                      <FiMoreVertical
                        className="menu-icon"
                        onClick={() => setShowMenu(!showMenu)}
                      />

                      {showMenu && (
                        <div className="menu-dropdown">
                          <div
                            className="menu-item"
                            onClick={() => {
                              navigate("/contacts");
                              setShowMenu(false);
                            }}
                          >
                            Contacts
                          </div>
                        </div>
                      )}
                    </div>
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

                  <div className="chat-filter">
                    <div
                      className={`toggle-slider ${showUnread ? "right" : "left"}`}
                    ></div>

                    <button
                      className={!showUnread ? "active" : ""}
                      onClick={() => setShowUnread(false)}
                    >
                      All
                    </button>

                    <button
                      className={showUnread ? "active" : ""}
                      onClick={() => setShowUnread(true)}
                    >
                      Unread
                    </button>
                  </div>

                  <div className="chat-list">
                    {isLoadingChats ? (
                      <p style={{ padding: 20 }}>Loading chats...</p>
                    ) : chatsError ? (
                      <p style={{ padding: 20 }}>{chatsError}</p>
                    ) : (
                      filteredChats.map((chat) => {
                        const highlight = shouldHighlightUnread(chat);

                        return (
                          <div
                            key={chat.id}
                            className={`chat-card ${
                              selectedChat?.id === chat.id ? "selected" : ""
                            }`}
                            onClick={() => handleSelectChat(chat)}
                          >
                            <div
                              className="chat-avatar"
                              style={{
                                backgroundColor: getAvatarColor(chat.name),
                              }}
                            >
                              {chat.photo ? (
                                <img
                                  src={chat.photo}
                                  alt={chat.name}
                                  className="avatar-image"
                                />
                              ) : (
                                <span>
                                  <span>{getInitials(chat.name)}</span>
                                </span>
                              )}

                              {chat.online && (
                                <span className="online-dot"></span>
                              )}
                            </div>

                            <div className="chat-info">
                              <div className="top">
                                <h4>{chat.name}</h4>

                                <span>
                                  {formatMessageTime(
                                    chat.lastMessage?.createdAt,
                                  )}
                                </span>
                              </div>

                              <div className="bottom">
                                <p className={highlight ? "unread-text" : ""}>
                                  {getPreviewText(chat)}
                                </p>

                                {chat.unread > 0 && (
                                  <span className="badge">{chat.unread}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </aside>
              ) : (
                <ContactsSidebar
                  onBack={() => navigate("/messages")}
                  onSelectContact={(contact) => {
                    setSidebarView("chats");
                    handleSelectChat(contact);
                  }}
                />
              )}
            </>
          )}

          {/* ================= Chat Area ================= */}

          <section className="chat-area">
            {!selectedChat ? (
              <div className="empty-chat">
              <h2>No Conversation Selected</h2>
              <p>Select a conversation from the left sidebar to start chatting.</p>
            </div>
              
            ) : (
              <>
                {/* ================= Chat Header ================= */}

                <div className="chat-header">
                  <div className="header-left">
                    <div
                      className="chat-avatar large"
                      style={{
                        backgroundColor: selectedChat.photo
                          ? "transparent"
                          : getAvatarColor(selectedChat.name),
                      }}
                    >
                      {selectedChat.photo ? (
                        <img
                          src={selectedChat.photo}
                          alt={selectedChat.name}
                          className="avatar-image"
                        />
                      ) : (
                        <span>{getInitials(selectedChat.name)}</span>
                      )}
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

                {/* ================= Chat Content (messages or empty state) ================= */}

                <div className="chat-content">
                  {isLoadingConversation ? (
                    <div className="empty-chat-screen">
                      <p>Loading conversation…</p>
                    </div>
                  ) : conversationError ? (
                    <div className="empty-chat-screen">
                      <p style={{ color: "#f87171" }}>{conversationError}</p>
                    </div>
                  ) : conversation.length === 0 ? (
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
                    </div>
                  ) : (
                    <div className="chat-body">
                      {conversation.map((msg) => (
                        <div
                          key={msg.id}
                          className={`message ${
                            msg.senderId === currentUserId ? "sent" : "received"
                          }`}
                        >
                          <p>{msg.text}</p>
                          <span>{formatBubbleTime(msg.createdAt)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ================= Chat Input ================= */}

                <div className="chat-input">
                  <div className="input-wrapper">
                    <div className="input-icon">
                      <FiSmile />
                    </div>

                    <input
                      type="text"
                      placeholder="Message"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={handleInputKeyDown}
                      disabled={isSending}
                    />

                    <div className="attach-icon">
                      <FiPaperclip />
                    </div>
                  </div>

                  <button className="mic-btn" onClick={handleSendMessage}>
                    <FiMic />
                  </button>
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
