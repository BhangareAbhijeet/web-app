import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import "../styles/VideoCallingPage.css";
import socket from "../services/socket";
import {
  createPeerConnection,
  addLocalStreamToPeer,
  getPeerConnection,
  createOffer,
  createAnswer,
  setRemoteAnswer,
  addIceCandidate,
  setupRemoteStream,
  toggleMicrophone,
  cleanupCall,
  getLocalStream,
  getLocalStreamObject,
  setLocalStream,
} from "../services/webrtc";
import {
  FiMic,
  FiMicOff,
  FiVideo,
  FiVideoOff,
  FiRefreshCw,
  FiPhone,
  FiPhoneOff,
} from "react-icons/fi";

const VideoCallingPage = () => {
  const location = useLocation();

  const query = new URLSearchParams(window.location.search);
  const userId = query.get("user");
  const targetUserId = query.get("target");

  // Info about the person being called, passed from ChatPage
  const remoteUserInfo = location.state?.remoteUser || {
    id: targetUserId,
    name: "Waiting for user...",
    status: "Connecting...",
    profile: "https://i.pravatar.cc/200?img=12",
  };

  console.log("Target User ID:", targetUserId);
  console.log("Current User ID:", userId);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const targetSocketIdRef = useRef(null);
  const [localStream, setLocalStreamState] = useState(null);
  const [mute, setMute] = useState(false);
  const [camera, setCamera] = useState(true);

  // Detect System Theme
  const [isDarkMode, setIsDarkMode] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleTheme = (e) => {
      setIsDarkMode(e.matches);
    };

    mediaQuery.addEventListener("change", handleTheme);

    return () => mediaQuery.removeEventListener("change", handleTheme);
  }, []);

  useEffect(() => {
    startCamera();
  }, []);

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("Connected to backend:", socket.id);

      // Register current user
      socket.emit("register-user", userId);

      console.log("User registered:", userId);
    });

    // RECEIVE INCOMING CALL
    socket.on("incoming-call", (data) => {
      console.log("Incoming call received!");
      console.log("Caller ID:", data.callerId);
      console.log("Caller Socket ID:", data.callerSocketId);

      const acceptCall = window.confirm(
        `Incoming call from ${data.callerId}. Accept?`,
      );

      if (acceptCall) {
        socket.emit("answer-call", {
          callerSocketId: data.callerSocketId,
          answererId: userId,
        });

        console.log("Call accepted");
      }
    });

    // CALL ACCEPTED
    socket.on("call-accepted", async (data) => {
      try {
        console.log("Call accepted by:", data.answererId);
        console.log("Answerer Socket ID:", data.answererSocketId);

        const targetSocketId = data.answererSocketId;
        targetSocketIdRef.current = targetSocketId;

        const stream = getLocalStreamObject();

        if (!stream) {
          console.error("Local stream not available");
          return;
        }

        console.log("Using existing local camera and microphone stream");
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        createPeerConnection((candidate) => {
          console.log("Caller ICE Candidate generated:", candidate);

          socket.emit("webrtc-candidate", {
            targetSocketId: targetSocketId,
            candidate: candidate,
          });

          console.log("Caller ICE Candidate sent");
        });
        setupRemoteStream((remoteStream) => {
          console.log("Remote stream received on Caller");

          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });

        addLocalStreamToPeer(stream);

        const offer = await createOffer();

        console.log("WebRTC Offer Created:", offer);

        socket.emit("webrtc-offer", {
          targetSocketId: targetSocketId,
          offer: offer,
        });

        console.log("WebRTC Offer Sent");
      } catch (error) {
        console.error("Error starting WebRTC call:", error);
      }
    });

    // RECEIVE WEBRTC OFFER
    socket.on("webrtc-offer", async (data) => {
      try {
        console.log("WebRTC Offer received!");

        const callerSocketId = data.callerSocketId;
        targetSocketIdRef.current = callerSocketId;
        console.log("Caller Socket ID:", callerSocketId);

        let stream = getLocalStreamObject();

        if (!stream) {
          stream = await getLocalStream();
        }

        setLocalStream(stream);
        setLocalStreamState(stream);

        console.log("Receiver camera and microphone started");

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        createPeerConnection((candidate) => {
          console.log("Receiver ICE Candidate generated:", candidate);

          socket.emit("webrtc-candidate", {
            targetSocketId: callerSocketId,
            candidate: candidate,
          });

          console.log("Receiver ICE Candidate sent");
        });
        setupRemoteStream((remoteStream) => {
          console.log("Remote stream received on Receiver");

          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });

        addLocalStreamToPeer(stream);

        const answer = await createAnswer(data.offer);

        console.log("WebRTC Answer Created:", answer);

        socket.emit("webrtc-answer", {
          targetSocketId: callerSocketId,
          answer: answer,
        });

        console.log("WebRTC Answer Sent");
      } catch (error) {
        console.error("Error while answering WebRTC Offer:", error);
      }
    });

    // RECEIVE WEBRTC ANSWER
    socket.on("webrtc-answer", async (data) => {
      try {
        console.log("WebRTC Answer received!");

        await setRemoteAnswer(data.answer);

        console.log("Remote Answer set successfully");
      } catch (error) {
        console.error("Error while setting remote answer:", error);
      }
    });

    // RECEIVE ICE CANDIDATE
    socket.on("webrtc-candidate", async (data) => {
      try {
        console.log("ICE Candidate received!");

        await addIceCandidate(data.candidate);

        console.log("ICE Candidate added");
      } catch (error) {
        console.error("Error handling ICE Candidate:", error);
      }
    });

    socket.on("call-ended", () => {
      console.log("Other user ended the call");

      cleanupCall();

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    });

    return () => {
      socket.off("connect");
      socket.off("incoming-call");
      socket.off("call-accepted");
      socket.off("webrtc-offer");
      socket.off("webrtc-answer");
      socket.off("webrtc-candidate");
      socket.off("call-ended");
      // socket.disconnect();
    };
  }, [userId]);

  // ✅ Auto-start the call once we know who to call
  useEffect(() => {
    if (!userId || !targetUserId) return;

    const timer = setTimeout(() => {
      socket.emit("call-user", {
        targetUserId: targetUserId,
        callerId: userId,
      });
      console.log("Auto-calling:", targetUserId);
    }, 800);

    return () => clearTimeout(timer);
  }, [userId, targetUserId]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setLocalStreamState(stream);
      setLocalStream(stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleToggleMicrophone = () => {
    if (!localStream) return;

    const audioTrack = localStream.getAudioTracks()[0];

    if (!audioTrack) return;

    audioTrack.enabled = !audioTrack.enabled;

    setMute(!audioTrack.enabled);

    console.log("Microphone:", audioTrack.enabled ? "ON" : "OFF");
  };

  const handleToggleCamera = () => {
    if (!localStream) return;

    const videoTrack = localStream.getVideoTracks()[0];

    if (!videoTrack) return;

    videoTrack.enabled = !videoTrack.enabled;

    setCamera(videoTrack.enabled);

    console.log("Camera:", videoTrack.enabled ? "ON" : "OFF");
  };

  const handleSwitchCamera = async () => {
    try {
      // Requires a switchCamera() export in your webrtc service
      // await switchCamera();

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = getLocalStream();
      }

      console.log("Camera switched");
    } catch (error) {
      console.error("Failed to switch camera:", error);
    }
  };

  const handleEndCall = () => {
    if (targetSocketIdRef.current) {
      socket.emit("end-call", {
        targetSocketId: targetSocketIdRef.current,
      });
    }

    cleanupCall();

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    console.log("Call ended and cleaned up");
  };

  return (
    <div className={`videoPage ${isDarkMode ? "dark" : "light"}`}>
      {/* Remote Video */}
      <div className="remoteVideo">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="remoteImage"
        />

        <div className="overlay"></div>

        <div className="userDetails">
          <img src={remoteUserInfo.profile} alt="Profile" className="profile" />

          <div>
            <h2>{remoteUserInfo.name}</h2>
            <p>{remoteUserInfo.status}</p>
          </div>
        </div>
      </div>

      {/* Local Camera */}
      <div className="selfCamera">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="selfVideo"
        />
      </div>

      {/* Controls */}
      <div className="controls">
        <button onClick={handleToggleMicrophone}>
          {mute ? <FiMicOff /> : <FiMic />}
        </button>

        <button onClick={handleToggleCamera}>
          {camera ? <FiVideo /> : <FiVideoOff />}
        </button>

        <button onClick={handleSwitchCamera}>
          <FiRefreshCw />
        </button>

        <button onClick={handleEndCall} className="endBtn">
          <FiPhoneOff />
        </button>
      </div>
    </div>
  );
};

export default VideoCallingPage;
