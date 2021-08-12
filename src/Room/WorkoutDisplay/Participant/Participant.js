import React, { useEffect, useRef } from "react";
import { Box } from '@material-ui/core';

const Participant = ({id, tracks}) => {
  const videoRef = useRef();
  const audioRef = useRef();

  // Add track to room

  // attach video track to DOM
  useEffect(() => {
    if (!tracks) return;
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
    <Box display="flex" flexDirection="column" alignItems="center" height="100%">
      <div>{id}</div>
      <video ref={videoRef} autoPlay={true} style={{height: "100%", width: "100%"}}/>
      <audio ref={audioRef} autoPlay={true}/>
    </Box>
  );
}

export default Participant;