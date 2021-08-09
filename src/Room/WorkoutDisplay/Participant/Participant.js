import React, { useEffect, useRef } from "react";

const Participant = ({id, tracks}) => {
  const videoRef = useRef();
  const audioRef = useRef();

  // Add track to room

  // attach video track to DOM
  useEffect(() => {
    tracks.forEach((track) => {
      if (track.getType() === 'video') {
        track.attach(videoRef.current);
      } else if(track.getType() === 'audio') {
        track.attach(audioRef.current);
      }
    });
    return () => {
      tracks.forEach((track) => track.detach())
    }
  }, [tracks]);

  return (
    <div>
      <video ref={videoRef} autoPlay={true}/>
      <audio ref={audioRef} autoPlay={true}/>
    </div>
  );
}

export default Participant;