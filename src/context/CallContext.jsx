import { createContext, useContext, useEffect, useState } from "react";
import socket from "../services/socket";

const CallContext = createContext(null);

export function CallProvider({ children, currentUserId }) {
  const [status, setStatus] = useState("idle");
  const [otherUser, setOtherUser] = useState(null);
  const [isCaller, setIsCaller] = useState(false);

  // ==========================================
  // REGISTER USER + CALL LISTENERS
  // ==========================================

  useEffect(() => {
    if (!currentUserId) return;

    const registerUser = () => {
      console.log("📡 Registering user:", currentUserId);

      socket.emit("register-user", currentUserId);
    };

    // If already connected
    if (socket.connected) {
      registerUser();
    }

    // Register whenever socket connects
    socket.on("connect", registerUser);

    // ==========================================
    // INCOMING CALL
    // ==========================================

    const handleIncoming = (data) => {
      console.log("📞 INCOMING CALL:", data);

      setOtherUser({
        id: data.from,
        name: data.fromName || data.from,
        photo: data.fromPhoto || null,
      });

      setIsCaller(false);
      setStatus("incoming");
    };

    // ==========================================
    // CALL ACCEPTED
    // ==========================================

    const handleAccepted = (data) => {
      console.log("✅ CALL ACCEPTED:", data);

      setIsCaller(true);
      setStatus("connected");
    };

    // ==========================================
    // CALL DECLINED
    // ==========================================

    const handleDeclined = () => {
      console.log("❌ CALL DECLINED");

      setStatus("ended");
    };

    // ==========================================
    // CALL ENDED
    // ==========================================

    const handleEnded = () => {
      console.log("📴 CALL ENDED");

      setStatus("ended");
    };

    socket.on("incoming-call", handleIncoming);
    socket.on("call-accepted", handleAccepted);
    socket.on("call-declined", handleDeclined);
    socket.on("call-ended", handleEnded);

    return () => {
      socket.off("connect", registerUser);

      socket.off("incoming-call", handleIncoming);
      socket.off("call-accepted", handleAccepted);
      socket.off("call-declined", handleDeclined);
      socket.off("call-ended", handleEnded);
    };
  }, [currentUserId]);

  // ==========================================
  // START CALL
  // ==========================================

  const startCall = (targetUser) => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "null");

    const callerName =
      `${currentUser?.firstName || ""} ${currentUser?.lastName || ""}`.trim() ||
      currentUserId;

      const callerPhoto = currentUser?.profilePic?.url || null;

    console.log("📞 CALLING USER:", targetUser);
    console.log("📞 CALLER NAME:", callerName);

    setOtherUser(targetUser);
    setIsCaller(true);
    setStatus("calling");

    socket.emit("call-user", {
      from: currentUserId,
      to: targetUser.id,
      fromName: callerName,
      fromPhoto: callerPhoto,
    });
  };

  // ==========================================
  // ACCEPT
  // ==========================================

  const acceptCall = () => {
    if (!otherUser) return;

    console.log("✅ ACCEPTING CALL FROM:", otherUser.id);

    socket.emit("accept-call", {
      from: currentUserId,
      to: otherUser.id,
    });

    setIsCaller(false);
    setStatus("connected");
  };

  // ==========================================
  // DECLINE
  // ==========================================

  const declineCall = () => {
    if (!otherUser) return;

    console.log("❌ DECLINING CALL FROM:", otherUser.id);

    socket.emit("decline-call", {
      from: currentUserId,
      to: otherUser.id,
    });

    setStatus("ended");
  };

  // ==========================================
  // END
  // ==========================================

  const endCall = () => {
    if (!otherUser) return;

    console.log("📴 ENDING CALL WITH:", otherUser.id);

    socket.emit("end-call", {
      from: currentUserId,
      to: otherUser.id,
    });

    setStatus("ended");
  };

  // ==========================================
  // RESET
  // ==========================================

  const resetCall = () => {
    setStatus("idle");
    setOtherUser(null);
    setIsCaller(false);
  };

  return (
    <CallContext.Provider
      value={{
        status,
        otherUser,
        isCaller,
        startCall,
        acceptCall,
        declineCall,
        endCall,
        resetCall,
      }}
    >
      {children}
    </CallContext.Provider>
  );
}

export const useCall = () => {
  const context = useContext(CallContext);

  if (!context) {
    throw new Error("useCall must be used inside CallProvider");
  }

  return context;
};
