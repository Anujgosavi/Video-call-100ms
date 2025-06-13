import React, { useState, useEffect } from "react";
import {
  selectIsConnectedToRoom,
  selectPeers,
  useHMSActions,
  useHMSStore,
  useAVToggle,
  useVideo,
} from "@100mslive/react-sdk";

// Peer Component
function Peer({ peer }) {
  const { videoRef } = useVideo({ trackId: peer.videoTrack });

  return (
    <div className="peer-container">
      <video
        ref={videoRef}
        className={`peer-video ${peer.isLocal ? "local" : ""}`}
        autoPlay
        muted
        playsInline
      ></video>
      <div className="peer-name">
        {peer.name} {peer.isLocal ? "(You)" : ""}
      </div>
    </div>
  );
}

// Conference Component
function Conference() {
  const peers = useHMSStore(selectPeers);
  return (
    <div className="conference-section">
      <h2>Conference</h2>
      <div className="peers-container">
        {peers.map((peer) => (
          <Peer key={peer.id} peer={peer} />
        ))}
      </div>
    </div>
  );
}

// Footer Component
function Footer() {
  const { isLocalAudioEnabled, toggleAudio, isLocalVideoEnabled, toggleVideo } = useAVToggle();

  return (
    <div className="control-bar">
      <button className="btn-control" onClick={toggleAudio}>
        {isLocalAudioEnabled ? "Mute" : "Unmute"}
      </button>
      <button className="btn-control" onClick={toggleVideo}>
        {isLocalVideoEnabled ? "Hide" : "Unhide"}
      </button>
    </div>
  );
}

// JoinForm Component
function JoinForm() {
  const hmsActions = useHMSActions();
  const [inputValues, setInputValues] = useState({ name: "", roomCode: "" });

  const handleInputChange = (e) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [e.target.name]: e.target.value,
    }))
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, roomCode } = inputValues;

    if (!name || !roomCode) return;

    try {
      // Retrieve Auth Token first
      const authToken = await hmsActions.getAuthTokenByRoomCode({ roomCode });
      await hmsActions.join({ userName: name, authToken });
    } catch (e) {
      console.error(e);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <h2>Join Room</h2>
      <div className="input-container">
        <input
          required
          id="name"
          name="name"
          type="text"
          value={inputValues.name}
          onChange={handleInputChange}
          placeholder="Your Name"
        />
      </div>
      <div className="input-container">
        <input
          required
          id="roomCode"
          name="roomCode"
          type="text"
          value={inputValues.roomCode}
          onChange={handleInputChange}
          placeholder="Room Code"
        />
      </div>
      <button className="btn-primary" type="submit">
        Join
      </button>
    </form>
  )
}

function App() {
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const hmsActions = useHMSActions();

  useEffect(() => {
    window.onunload = () => {
      if (isConnected) {
        hmsActions.leave();
      }
    };
  }, [isConnected, hmsActions]);

  return (
    <div className="App">
      {isConnected ? (
        <>
          <Conference />
          <Footer />
        </>
      ) : (
        <JoinForm />
      )}

    </div>
  )
}

export default App;
