import { useEffect, useRef, useState } from "react";
import socket from "../services/socket";
import "../styles/VoiceCall.css";

import { Mic, MicOff, Phone, Volume2, VolumeX } from "lucide-react";

import avatar from "../assets/avatar.jpg";

import {
  createPeer,
  getPeer,
  getLocalStream,
  getAudioOnlyStream,
  closePeer,
  muteAudio,
} from "../services/webrtc";

function VoiceCall({
  user,
  receiver,
  receiverName,
  receiverPhoto,
  onEnd,
  isCaller,
}) {
  const audioRef = useRef(null);
  const peerRef = useRef(null);

  const [time, setTime] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);

  // =====================================================
  // TIMER
  // =====================================================

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // =====================================================
  // CREATE PEER
  // =====================================================

  useEffect(() => {
    let peer = getPeer();

    if (!peer) {
      peer = createPeer();
    }

    peerRef.current = peer;

    // ===================================================
    // REMOTE AUDIO
    // ===================================================

    peer.ontrack = (event) => {
      console.log("🎵 Remote audio received");

      const remoteStream = event.streams[0];

      if (!remoteStream || !audioRef.current) {
        return;
      }

      audioRef.current.srcObject = remoteStream;

      audioRef.current
        .play()
        .then(() => {
          console.log("✅ Remote audio playing");
        })
        .catch((err) => {
          console.log("Audio play error:", err);
        });
    };

    // ===================================================
    // ICE CANDIDATE
    // ===================================================

    peer.onicecandidate = (event) => {
      if (!event.candidate) return;

      console.log("📤 Sending ICE candidate");

      socket.emit("ice-candidate", {
        from: user,
        to: receiver,
        candidate: event.candidate,
      });
    };

    // ===================================================
    // RECEIVE OFFER
    // ===================================================

    const handleOffer = async (data) => {
      try {
        console.log("📩 Voice offer received from:", data.from);

        const stream = await getAudioOnlyStream();

        stream.getTracks().forEach((track) => {
          const alreadyAdded = peer
            .getSenders()
            .some((sender) => sender.track === track);

          if (!alreadyAdded) {
            peer.addTrack(track, stream);
          }
        });

        await peer.setRemoteDescription(new RTCSessionDescription(data.offer));

        const answer = await peer.createAnswer();

        await peer.setLocalDescription(answer);

        // IMPORTANT:
        // Answer MUST be sent here
        socket.emit("webrtc-answer", {
          from: user,
          to: data.from,
          answer: peer.localDescription,
        });

        console.log("📤 Voice answer sent to:", data.from);
      } catch (error) {
        console.error("❌ Offer handling error:", error);
      }
    };

    // ===================================================
    // RECEIVE ANSWER
    // ===================================================

    const handleAnswer = async (data) => {
      try {
        console.log("📩 Voice answer received from:", data.from);

        if (
          !peer.currentRemoteDescription ||
          peer.currentRemoteDescription.type === ""
        ) {
          await peer.setRemoteDescription(
            new RTCSessionDescription(data.answer),
          );

          console.log("✅ Remote answer applied");
        }
      } catch (error) {
        console.error("❌ Answer handling error:", error);
      }
    };

    // ===================================================
    // RECEIVE ICE
    // ===================================================

    const handleIceCandidate = async (data) => {
      try {
        if (!data.candidate) return;

        await peer.addIceCandidate(new RTCIceCandidate(data.candidate));

        console.log("✅ ICE candidate added");
      } catch (error) {
        console.error("❌ ICE candidate error:", error);
      }
    };

    // ===================================================
    // CALL ENDED
    // ===================================================

    const handleCallEnded = () => {
      console.log("📞 Other user ended the call");

      closePeer();

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.srcObject = null;
      }

      if (onEnd) {
        onEnd();
      }
    };

    socket.on("webrtc-offer", handleOffer);
    socket.on("webrtc-answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("call-ended", handleCallEnded);

    return () => {
      socket.off("webrtc-offer", handleOffer);
      socket.off("webrtc-answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("call-ended", handleCallEnded);
    };
  }, [user, receiver, onEnd]);

  // =====================================================
  // CALLER STARTS CALL
  // =====================================================

  useEffect(() => {
    if (!isCaller) return;

    startVoiceCall();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCaller]);

  const startVoiceCall = async () => {
    try {
      let peer = getPeer();

      if (!peer) {
        peer = createPeer();
      }

      peerRef.current = peer;

      const stream = await getAudioOnlyStream();

      stream.getTracks().forEach((track) => {
        const alreadyAdded = peer
          .getSenders()
          .some((sender) => sender.track === track);

        if (!alreadyAdded) {
          peer.addTrack(track, stream);
        }
      });

      const offer = await peer.createOffer();

      await peer.setLocalDescription(offer);

      socket.emit("webrtc-offer", {
        from: user,
        to: receiver,
        offer: peer.localDescription,
      });

      console.log("📤 Voice offer sent to:", receiver);
    } catch (error) {
      console.error("❌ Start voice call error:", error);
    }
  };

  // =====================================================
  // MUTE
  // =====================================================

  const handleMute = () => {
    muteAudio();
    setMuted((prev) => !prev);
  };

  // =====================================================
  // SPEAKER
  // =====================================================

  const handleSpeaker = () => {
    const newState = !speakerOn;

    setSpeakerOn(newState);

    if (audioRef.current) {
      audioRef.current.muted = !newState;
    }
  };

  // =====================================================
  // END CALL
  // =====================================================

  const endCall = async () => {
    console.log("📞 Ending voice call");

    socket.emit("end-call", {
      from: user,
      to: receiver,
    });

    try {
      const stream = await getLocalStream();

      stream.getTracks().forEach((track) => {
        track.stop();
      });
    } catch (error) {
      console.log("Stream stop error:", error);
    }

    closePeer();

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.srcObject = null;
    }

    if (onEnd) {
      onEnd();
    }
  };

  return (
    <div
      className="voice-call"
      style={{
        backgroundImage: `url(${receiverPhoto || avatar})`,
      }}
    >
      <div className="overlay">
        <audio ref={audioRef} autoPlay playsInline />

        <div className="top-section">
          <img src={receiverPhoto || avatar} className="avatar" alt="avatar" />

          <h2>{receiverName || receiver}</h2>

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
