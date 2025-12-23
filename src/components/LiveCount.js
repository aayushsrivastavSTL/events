"use client";
import React, { useEffect, useState } from "react";
import { socket } from "../socket";

const LiveCount = () => {
  const [liveCount, setLiveCount] = useState(0);
  const storedCheckpoint =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("checkpoint"))
      : null;


  //listen for sockets
  useEffect(() => {
    // Join the checkin point room
    if (storedCheckpoint?.id) {
      console.log(" Joining room:", `checkinpoint-${storedCheckpoint.id}`);
      socket.emit("join-checkin-point", storedCheckpoint.id);
    }

    // Listen for updates
    const handleLiveCountUpdate = (data) => {
      console.log(" Received live-count-updated:", data);
      if (data && data.checkinpointID === storedCheckpoint?.id) {
        setLiveCount(data.currentCount);
      }
    };

    socket.on("live-count-updated", handleLiveCountUpdate);

    // Cleanup
    return () => {
      if (storedCheckpoint?.id) {
        socket.emit("leave-checkin-point", storedCheckpoint.id);
      }
      socket.off("live-count-updated", handleLiveCountUpdate);
    };
  }, [storedCheckpoint?.id]);


  return <div>{liveCount}</div>;
};

export default LiveCount;
