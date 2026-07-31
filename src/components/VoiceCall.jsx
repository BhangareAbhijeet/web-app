import { useEffect, useRef, useState } from "react";
import socket from "../services/socket";
import "../styles/VoiceCall.css";

import { Mic, MicOff, Phone, Volume2, VolumeX } from "lucide-react";

import avatar from "../assets/avatar.jpg";

import {
  createPeer,
  getPeer,
  getLocalStream,
  closePeer,
  muteAudio,
} from "../services/webrtc";

function VoiceCall({ user, receiver, onEnd, isCaller }) {
  const audioRef = useRef(null);

  const [time, setTime] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);

  // ==========================
  // Timer
  // ==========================
  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ==========================
  // Caller Starts Call
  // ==========================
  useEffect(() => {
    if (isCaller) {
      startVoiceCall();
    }
  }, [isCaller]);

  // ==========================
  // WebRTC Events
  // ==========================
  useEffect(() => {
    let peer = getPeer();

    if (!peer) {
      peer = createPeer();
    }

    // Remote Audio
    peer.ontrack = (event) => {
      console.log("🎵 Remote Audio Received", event.streams);

      if (!audioRef.current) return;

      audioRef.current.srcObject = event.streams[0];

      audioRef.current.onloadedmetadata = async () => {
        try {
          await audioRef.current.play();
          console.log("✅ Audio Playing");
        } catch (err) {
          console.log("Play Error:", err);
        }
      };
    };

    // ICE Candidate Send
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          from: user,
          to: receiver,
          candidate: event.candidate,
        });
      }
    };

    // ==========================
    // Receive Offer
    // ==========================
    socket.on("webrtc-offer", async (data) => {
      console.log("📩 Offer Received");

      const stream = await getLocalStream();

      stream.getTracks().forEach((track) => {
        const sender = peer.getSenders().find((s) => s.track === track);

        if (!sender) {
          peer.addTrack(track, stream);
        }
      });

      await peer.setRemoteDescription(data.offer);

      const answer = await peer.createAnswer();

      await peer.setLocalDescription(answer);

      socket.emit("webrtc-answer", {
        from: user,
        to: data.from,
        answer,
      });

      console.log("✅ Answer Sent");
    });
    // ==========================
    // Receive Answer
    // ==========================
    socket.on("webrtc-answer", async (data) => {
      try {
        console.log("✅ Answer Received");

        if (!peer.currentRemoteDescription) {
          await peer.setRemoteDescription(data.answer);
          console.log("✅ Remote Description Set");
        }
      } catch (err) {
        console.log("Answer Error:", err);
      }
    });

    // ==========================
    // Receive ICE Candidate
    // ==========================
    socket.on("ice-candidate", async (data) => {
      try {
        if (data.candidate) {
          await peer.addIceCandidate(data.candidate);
          console.log("✅ ICE Candidate Added");
        }
      } catch (err) {
        console.log("ICE Error:", err);
      }
    });

    return () => {
      socket.off("webrtc-offer");
      socket.off("webrtc-answer");
      socket.off("ice-candidate");
    };
  }, []);

  // ==========================
  // Start Voice Call (Caller)
  // ==========================
  const startVoiceCall = async () => {
    try {
      let peer = getPeer();

      if (!peer) {
        peer = createPeer();
      }

      const stream = await getLocalStream();

      // Duplicate Track Prevent
      stream.getTracks().forEach((track) => {
        const sender = peer.getSenders().find((s) => s.track === track);

        if (!sender) {
          peer.addTrack(track, stream);
        }
      });

      const offer = await peer.createOffer();

      await peer.setLocalDescription(offer);

      console.log("Local Offer:", peer.localDescription);

      socket.emit("webrtc-offer", {
        from: user,
        to: receiver,
        offer,
      });

      console.log("📤 Offer Sent");
    } catch (err) {
      console.log("Start Call Error:", err);
    }
  };
  // ==========================
  // Mute / Unmute
  // ==========================
  const handleMute = () => {
    muteAudio();
    setMuted((prev) => !prev);
  };

  const handleSpeaker = () => {
    const newState = !speakerOn;

    setSpeakerOn(newState);

    if (audioRef.current) {
      audioRef.current.muted = !newState;
    }
  };
  // ==========================
  // End Call
  // ==========================
  const endCall = () => {
    socket.emit("end-call", {
      from: user,
      to: receiver,
    });

    closePeer();

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.srcObject = null;
    }

    if (onEnd) {
      onEnd();
    }
  };

  // ==========================
  // UI
  // ==========================
  return (
    <div
      className="voice-call"
      style={{
        backgroundImage: `url(${avatar})`,
      }}
    >
      <div className="overlay">
        <audio ref={audioRef} autoPlay playsInline />

        <div className="top-section">
          <img src={avatar} className="avatar" alt="avatar" />

          <h2>{receiver}</h2>

          <p>Voice Call</p>

          <h3>
            {Math.floor(time / 60)}:
            {time % 60 < 10 ? "0" + (time % 60) : time % 60}
          </h3>
        </div>

        <div className="bottom-controls">
          <button className="icon-btn" onClick={handleMute}>
            {muted ? <MicOff /> : <Mic />}
          </button>

          <button className="icon-btn" onClick={handleSpeaker}>
            {speakerOn ? <Volume2 /> : <VolumeX />}
          </button>

          <button className="end-btn" onClick={endCall}>
            <Phone />
          </button>
        </div>
      </div>
    </div>
  );
}

export default VoiceCall;
