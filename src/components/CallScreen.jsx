
  import { useEffect, useRef, useState } from "react";
  import VoiceCall from "./VoiceCall";
  import "../styles/CallScreen.css";
  import avatar from "../assets/avatar.jpg";

  import { Phone, MessageSquare, Mic, MicOff, Volume2 } from "lucide-react";

  function CallScreen({
    user,
    status,
    otherUser,
    isCaller,
    acceptCall,
    declineCall,
    endCall,
    resetCall,
  }) {
    const [micMuted, setMicMuted] = useState(false);

    // 📞 Outgoing ringtone
    const ringtone = useRef(new Audio("/sounds/ringing.mp3"));

    // 📲 Incoming ringtone
    const incomingRingtone = useRef(new Audio("/sounds/ringtone.mp3"));

    // =====================================================
    // STOP ALL RINGTONES
    // =====================================================

    const stopRingtones = () => {
      ringtone.current.pause();
      ringtone.current.currentTime = 0;

      incomingRingtone.current.pause();
      incomingRingtone.current.currentTime = 0;
    };

    // =====================================================
    // OUTGOING RING
    // =====================================================

    useEffect(() => {
      if (status === "calling") {
        ringtone.current.loop = true;

        ringtone.current.play().catch((err) => {
          console.log("Outgoing ringtone error:", err);
        });
      } else {
        ringtone.current.pause();
        ringtone.current.currentTime = 0;
      }

      return () => {
        ringtone.current.pause();
        ringtone.current.currentTime = 0;
      };
    }, [status]);

    // =====================================================
    // INCOMING RING
    // =====================================================

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

      return () => {
        incomingRingtone.current.pause();
        incomingRingtone.current.currentTime = 0;
      };
    }, [status]);

    // =====================================================
    // NO USER
    // =====================================================

    if (!otherUser) {
      return null;
    }

    // =====================================================
    // CURRENT CONTACT
    // =====================================================

    const activeContactId = otherUser.id;

    const activeContactName =
      otherUser.name || otherUser.id;

    // =====================================================
    // RENDER
    // =====================================================

    return (
      <div className="call-container">

        {/* =================================================
            CALLING
        ================================================= */}

        {status === "calling" && (
          <div
            className="call-ui"
            style={{
              backgroundImage: `url(${otherUser.photo || avatar})`,
            }}
          >
            <div className="call-overlay">

              <h2 className="calling-user-name">
                {activeContactName}
              </h2>

              <p className="calling-text">
                Calling...
              </p>

              <img
                src={otherUser.photo || avatar}
                alt="Avatar"
                className="caller-avatar"
              />

              <div className="calling-actions">

                {/* MUTE */}
                <button
                  className="control-btn"
                  onClick={() => setMicMuted((prev) => !prev)}
                >
                  {micMuted ? (
                    <MicOff size={24} color="white" />
                  ) : (
                    <Mic size={24} color="white" />
                  )}
                </button>

                {/* END CALL */}
                <button
                  className="end-call-btn"
                  onClick={() => {
                    stopRingtones();
                    endCall();
                  }}
                >
                  <Phone size={28} color="white" />
                </button>

                {/* SPEAKER */}
                <button className="control-btn">
                  <Volume2 size={24} color="white" />
                </button>

              </div>
            </div>
          </div>
        )}

        {/* =================================================
            INCOMING CALL
        ================================================= */}

        {status === "incoming" && (
          <div
            className="incoming-ui"
            style={{
              backgroundImage: `url(${otherUser.photo || avatar})`,
              backgroundSize: "115%",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="incoming-overlay">

              <h2 className="incoming-user-name">
                {activeContactName}
              </h2>

              <img
                src={otherUser.photo || avatar}
                alt="Avatar"
                className="incoming-user-avatar"
              />

              <div className="incoming-actions">

                {/* DECLINE */}
                <div className="action-item">

                  <button
                    className="incoming-decline-btn"
                    onClick={() => {
                      stopRingtones();
                      declineCall();
                    }}
                  >
                    <Phone
                      size={30}
                      color="white"
                    />
                  </button>

                  <span>
                    Decline
                  </span>

                </div>

                {/* ACCEPT */}
                <div className="action-item">

                  <button
                    className="incoming-accept-btn"
                    onClick={() => {
                      stopRingtones();
                      acceptCall();
                    }}
                  >
                    <Phone
                      size={30}
                      color="white"
                    />
                  </button>

                  <span>
                    Swipe up to accept
                  </span>

                </div>

                {/* MESSAGE */}
                <div className="action-item">

                  <button className="incoming-message-btn">
                    <MessageSquare
                      size={30}
                      color="white"
                    />
                  </button>

                  <span>
                    Message
                  </span>

                </div>

              </div>
            </div>
          </div>
        )}

        {/* =================================================
            CONNECTED
        ================================================= */}

        {status === "connected" && (
          <div className="voicecall-wrapper">

            <VoiceCall
              user={user}
              receiver={activeContactId}
              receiverName={activeContactName}
              isCaller={isCaller}
            onEnd={() => {
  stopRingtones();
  resetCall();
}}
            />

          </div>
        )}

        {/* =================================================
            ENDED
        ================================================= */}

        {status === "ended" && (
          <div className="call-screen">

            <img
              src={otherUser.photo || avatar}
              alt="Avatar"
              className="caller-avatar"
            />

            <h2>
              Call Ended
            </h2>

            <button
              className="call-btn"
              onClick={() => {
                stopRingtones();
                resetCall();
              }}
            >
              <Phone
                size={22}
                strokeWidth={2.5}
              />

              <span>
                Call Again
              </span>
            </button>

          </div>
        )}

      </div>
    );
  }

  export default CallScreen;
