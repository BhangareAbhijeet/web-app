let peerConnection = null;
let localStream = null;
let pendingCandidates = [];

const config = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

// ---------------------------------------------------------------------------
// Peer Connection
// ---------------------------------------------------------------------------

// Create WebRTC Peer Connection
export const createPeerConnection = (onIceCandidate) => {
  peerConnection = new RTCPeerConnection(config);

  console.log("✅ WebRTC Peer Connection Created");

  peerConnection.onicecandidate = (event) => {
    if (event.candidate && onIceCandidate) {
      onIceCandidate(event.candidate);
    }
  };

  // Add any ICE candidates that arrived before the peer connection existed
  while (pendingCandidates.length > 0) {
    const candidate = pendingCandidates.shift();

    peerConnection
      .addIceCandidate(new RTCIceCandidate(candidate))
      .then(() => console.log("Queued ICE Candidate added"))
      .catch((err) => console.error("Error adding queued ICE:", err));
  }

  return peerConnection;
};

// Alias — shorter name, same behavior (no-op if already created)
export const createPeer = () => {
  if (!peerConnection) {
    return createPeerConnection();
  }
  return peerConnection;
};

// Get existing peer connection
export const getPeerConnection = () => {
  return peerConnection;
};

// Alias
export const getPeer = () => {
  return peerConnection;
};

// ---------------------------------------------------------------------------
// Local Media
// ---------------------------------------------------------------------------

// Get Camera + Microphone (video call)
export const getLocalStream = async () => {
  if (localStream) {
    return localStream;
  }

  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    console.log("🎥 Camera and microphone access granted");

    return localStream;
  } catch (error) {
    console.error("Error accessing camera or microphone:", error);
    throw error;
  }
};

// Get Microphone only (audio-only calls)
export const getAudioOnlyStream = async () => {
  if (localStream) {
    return localStream;
  }

  localStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
  });

  console.log("🎤 Local audio stream ready");

  return localStream;
};

// Get existing local stream (without requesting a new one)
export const getLocalStreamObject = () => {
  return localStream;
};

// Set existing local stream
export const setLocalStream = (stream) => {
  localStream = stream;
};

export const addLocalStreamToPeer = (stream) => {
  if (!peerConnection) {
    console.error("Peer connection not created");
    return;
  }

  stream.getTracks().forEach((track) => {
    console.log("Track Settings:", track.getSettings());
    peerConnection.addTrack(track, stream);
  });

  console.log("Local stream added to peer connection");
};

// Receive remote video/audio stream
export const setupRemoteStream = (onRemoteStream) => {
  if (!peerConnection) {
    console.error("Peer connection not created");
    return;
  }

  peerConnection.ontrack = (event) => {
    const [remoteStream] = event.streams;

    const track = remoteStream.getVideoTracks()[0];

    if (track) {
      console.log("Remote Track Settings:", track.getSettings());
    }

    onRemoteStream(remoteStream);
  };
};

// ---------------------------------------------------------------------------
// Offer / Answer / ICE
// ---------------------------------------------------------------------------

export const createOffer = async () => {
  if (!peerConnection) {
    console.error("Peer connection not created");
    return null;
  }

  try {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    console.log("WebRTC Offer Created");

    return offer;
  } catch (error) {
    console.error("Error creating offer:", error);
    return null;
  }
};

export const createAnswer = async (offer) => {
  if (!peerConnection) {
    console.error("Peer connection not created");
    return null;
  }

  try {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    console.log("WebRTC Answer Created");

    return answer;
  } catch (error) {
    console.error("Error creating answer:", error);
    return null;
  }
};

export const setRemoteAnswer = async (answer) => {
  if (!peerConnection) {
    console.error("Peer connection not created");
    return;
  }

  try {
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(answer),
    );
    console.log("Remote answer set successfully");
  } catch (error) {
    console.error("Error setting remote answer:", error);
  }
};

export const addIceCandidate = async (candidate) => {
  // Queue candidate if peer connection isn't ready yet
  if (!peerConnection) {
    console.log("Peer connection not ready. Queueing ICE candidate...");
    pendingCandidates.push(candidate);
    return;
  }

  try {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    console.log("ICE Candidate added successfully");
  } catch (error) {
    console.error("Error adding ICE Candidate:", error);
  }
};

// ---------------------------------------------------------------------------
// Track Controls
// ---------------------------------------------------------------------------

export const toggleMicrophone = () => {
  if (!localStream) return false;

  const audioTrack = localStream.getAudioTracks()[0];

  if (!audioTrack) return false;

  audioTrack.enabled = !audioTrack.enabled;

  return audioTrack.enabled;
};

// Alias — same behavior, simpler name (matches second file's API)
export const muteAudio = () => {
  toggleMicrophone();
};

export const toggleCamera = () => {
  if (!localStream) return false;

  const videoTrack = localStream.getVideoTracks()[0];

  if (!videoTrack) return false;

  videoTrack.enabled = !videoTrack.enabled;

  return videoTrack.enabled;
};

export const switchCamera = async () => {
  if (!localStream) return;

  const videoTrack = localStream.getVideoTracks()[0];

  if (!videoTrack) return;

  const currentFacingMode = videoTrack.getSettings().facingMode;
  const newFacingMode = currentFacingMode === "user" ? "environment" : "user";

  const newStream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: newFacingMode },
    audio: false,
  });

  const newVideoTrack = newStream.getVideoTracks()[0];

  if (peerConnection) {
    const sender = peerConnection
      .getSenders()
      .find((s) => s.track && s.track.kind === "video");

    if (sender) {
      await sender.replaceTrack(newVideoTrack);
    }
  }

  videoTrack.stop();
  localStream.removeTrack(videoTrack);
  localStream.addTrack(newVideoTrack);

  return localStream;
};

// ---------------------------------------------------------------------------
// Cleanup
// ---------------------------------------------------------------------------

export const cleanupCall = () => {
  // Stop camera and microphone
  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop());
  }

  // Close PeerConnection
  if (peerConnection) {
    peerConnection.close();
  }

  // ✅ Correctly reset module-level state (fixed: was shadowing with `const` before)
  peerConnection = null;
  localStream = null;
  pendingCandidates = [];

  console.log("❌ WebRTC cleanup completed");
};

// Alias — matches second file's simpler naming
export const closePeer = () => {
  cleanupCall();
};
