import { useEffect, useState, useRef } from "react";
import { socket } from "../services/socket";
import VoiceCall from "./VoiceCall";
import "../styles/CallScreen.css";
import avatar from "../assets/avatar.jpg";

import { Phone, MessageSquare, Mic, MicOff, Volume2 } from "lucide-react";

function CallScreen({ user, targetUser }) {
  const [status, setStatus] = useState("idle");

  // Incoming caller info
  const [caller, setCaller] = useState("");
  const [callerName, setCallerName] = useState("");

  const [isCaller, setIsCaller] = useState(false);
  const [micMuted, setMicMuted] = useState(false);

  // 📞 Outgoing Ringing
  const ringtone = useRef(new Audio("/sounds/ringing.mp3"));

  // 📲 Incoming Ringtone
  const incomingRingtone = useRef(new Audio("/sounds/ringtone.mp3"));

  // ==========================
  // Socket Events
  // ==========================
  useEffect(() => {
    socket.on("incoming-call", (data) => {
      console.log("Incoming Call:", data);

      setCaller(data.from);
      setCallerName(data.fromName || data.from);
      setIsCaller(false);
      setStatus("incoming");
    });

    socket.on("call-accepted", () => {
      console.log("Call Accepted");

      ringtone.current.pause();
      ringtone.current.currentTime = 0;

      incomingRingtone.current.pause();
      incomingRingtone.current.currentTime = 0;

      setIsCaller(true);
      setStatus("connected");
    });

    socket.on("call-declined", () => {
      ringtone.current.pause();
      ringtone.current.currentTime = 0;

      incomingRingtone.current.pause();
      incomingRingtone.current.currentTime = 0;

      setStatus("ended");
    });

    socket.on("call-ended", () => {
      ringtone.current.pause();
      ringtone.current.currentTime = 0;

      incomingRingtone.current.pause();
      incomingRingtone.current.currentTime = 0;

      setIsCaller(false);
      setStatus("ended");
    });

    return () => {
      ringtone.current.pause();
      ringtone.current.currentTime = 0;

      incomingRingtone.current.pause();
      incomingRingtone.current.currentTime = 0;

      socket.off("incoming-call");
      socket.off("call-accepted");
      socket.off("call-declined");
      socket.off("call-ended");
    };
  }, []);

  // 📞 Outgoing Ring
  useEffect(() => {
    if (status === "calling") {
      ringtone.current.loop = true;
      ringtone.current.play().catch(() => {});
    } else {
      ringtone.current.pause();
      ringtone.current.currentTime = 0;
    }
  }, [status]);

  // 📲 Incoming Ring
  useEffect(() => {
    if (status === "incoming") {
      incomingRingtone.current.loop = true;
      incomingRingtone.current.play().catch((err) => {
        console.log("Incoming ringtone error:", err);
      });
    } else {
      incomingRingtone.current.pause();
      incomingRingtone.current.currentTime = 0;
    }
  }, [status]);

  // ==========================
  // Call the selected contact
  // ==========================
  const callUser = () => {
    socket.emit("call-user", {
      from: user,
      to: targetUser.id,
    });

    console.log("Calling:", targetUser.id);

    setIsCaller(true);
    setStatus("calling");
  };

  // ✅ Accept Incoming Call
  const acceptCall = () => {
    incomingRingtone.current.pause();
    incomingRingtone.current.currentTime = 0;

    ringtone.current.pause();
    ringtone.current.currentTime = 0;

    socket.emit("accept-call", {
      from: user,
      to: caller,
    });

    setIsCaller(false);
    setStatus("connected");
  };

  // ❌ Decline / End Call
  const declineCall = () => {
    incomingRingtone.current.pause();
    incomingRingtone.current.currentTime = 0;

    ringtone.current.pause();
    ringtone.current.currentTime = 0;

    socket.emit("decline-call", {
      from: user,
      to: caller,
    });

    setStatus("ended");
  };

  // ✅ Whoever we're actually talking to right now
  const activeContactId = isCaller ? targetUser.id : caller;
  const activeContactName = isCaller
    ? targetUser.name || targetUser.id
    : callerName || caller;

  return (
    <div className="call-container">
      {/* Idle */}
      {status === "idle" && (
        <div className="call-screen">
          <button className="call-btn" onClick={callUser}>
            <Phone size={22} strokeWidth={2.5} />
            <span>Call {targetUser.name || targetUser.id}</span>
          </button>
        </div>
      )}

      {/* Calling */}
      {status === "calling" && (
        <div
          className="call-ui"
          style={{
            backgroundImage: `url(${targetUser.photo || avatar})`,
          }}
        >
          <div className="call-overlay">
            <h2 className="calling-user-name">
              {targetUser.name || targetUser.id}
            </h2>

            <p className="calling-text">Calling...</p>

            <img
              src={targetUser.photo || avatar}
              alt="Avatar"
              className="caller-avatar"
            />

            <div className="calling-actions">
              <button
                className="control-btn"
                onClick={() => setMicMuted(!micMuted)}
              >
                {micMuted ? (
                  <MicOff size={24} color="white" />
                ) : (
                  <Mic size={24} color="white" />
                )}
              </button>

              <button className="end-call-btn" onClick={declineCall}>
                <Phone size={28} color="white" />
              </button>

              <button className="control-btn">
                <Volume2 size={24} color="white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Incoming */}
      {status === "incoming" && (
        <div
          className="incoming-ui"
          style={{
            backgroundImage: `url(${avatar})`,
            backgroundSize: "115%",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="incoming-overlay">
            <h2 className="incoming-user-name">{callerName || caller}</h2>

            <img src={avatar} alt="Avatar" className="incoming-user-avatar" />

            <div className="incoming-actions">
              <div className="action-item">
                <button className="incoming-decline-btn" onClick={declineCall}>
                  <Phone size={30} color="white" />
                </button>
                <span>Decline</span>
              </div>

              <div className="action-item">
                <button className="incoming-accept-btn" onClick={acceptCall}>
                  <Phone size={30} color="white" />
                </button>
                <span>Swipe up to accept</span>
              </div>

              <div className="action-item">
                <button className="incoming-message-btn">
                  <MessageSquare size={30} color="white" />
                </button>
                <span>Message</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connected */}
      {status === "connected" && (
        <div className="voicecall-wrapper">
          <VoiceCall
            user={user}
            receiver={activeContactId}
            receiverName={activeContactName}
            isCaller={isCaller}
            onEnd={() => {
              ringtone.current.pause();
              ringtone.current.currentTime = 0;

              incomingRingtone.current.pause();
              incomingRingtone.current.currentTime = 0;

              setStatus("ended");
            }}
          />
        </div>
      )}

      {/* Ended */}
      {status === "ended" && (
        <div className="call-screen">
          <img src={avatar} alt="Avatar" className="caller-avatar" />

          <h2>Call Ended</h2>

          <button
            className="call-btn"
            onClick={() => {
              ringtone.current.pause();
              ringtone.current.currentTime = 0;

              incomingRingtone.current.pause();
              incomingRingtone.current.currentTime = 0;

              setStatus("idle");
            }}
          >
            <Phone size={22} strokeWidth={2.5} />
            <span>Call Again</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default CallScreen;
