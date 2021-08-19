import React, { useEffect, useRef, useState } from "react";
import { Box } from '@material-ui/core';
import { useAppContext } from "../../../AppContext";
import { makeStyles } from "@material-ui/core/styles";

const Participant = ({id, tracks}) => {
  const [displayName, setDisplayName] = useState("");
  const videoRef = useRef();
  const audioRef = useRef();
  const { room, username, setPinnedParticipantId } = useAppContext();

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
  }, [tracks]);

  useEffect(() => {
    if (!room) return;
    if (id === room.myUserId()) return setDisplayName(username);
    room.getParticipants().forEach((p) => {
      if (p.getId() === id) {
        return setDisplayName(p.getProperty("displayName"));
      }
    });
  }, [room, username, id]);

  const useStyles = makeStyles(theme => ({
    displayName: {
      position: "relative",
      bottom: "2.1em",
      color: "#fff",
      padding: "0.3em",
      fontSize: "16px",
      lineHeight: 1,
      float: "right",
      zIndex: 1,
      borderRadius: "2px"
    },
  }));
  const classes = useStyles();

  return (
    <Box display="flex" flexDirection="column" alignItems="center" height="100%" onDoubleClick={() => setPinnedParticipantId(id)}>
      <video ref={videoRef} autoPlay={true} style={{height: "100%", width: "100%"}}/>
      <div className={classes.displayName}>{displayName}</div>
      <audio ref={audioRef} autoPlay={true}/>
    </Box>
  );
}

export default Participant;