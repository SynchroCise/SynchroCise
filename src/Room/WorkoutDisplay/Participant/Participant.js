import React, { useEffect, useRef, useState } from "react";
import { Box } from '@material-ui/core';
import { useAppContext } from "../../../AppContext";
import { makeStyles } from "@material-ui/core/styles";
import placeHolder from "../../../media/placeHolder.png";

const Participant = ({id, tracks}) => {
  const [displayName, setDisplayName] = useState("");
  const videoRef = useRef();
  const audioRef = useRef();
  const { JitsiMeetJS, room, username, setPinnedParticipantId } = useAppContext();
  const [videoMute, setVideoMute] = useState(true);
  const [audioMute, setAudioMute] = useState(true);

  // handle mute track
  useEffect(() => {
    if(!room) return;
    const muteChanged = (track) => {
      console.log(track.getType(), track.isMuted(), track.getParticipantId(), id);
      if (track.getParticipantId() !== id) return;
      if (track.getType() === 'video') {
        setVideoMute(track.isMuted());
      } else if (track.getType() === 'audio') {
        setAudioMute(track.isMuted());
      }
    }
    room.on(JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED, muteChanged);
    return () => {
      room.off(JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED, muteChanged);
    }
  }, [JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED, id, room]);

  // attach video track to DOM
  useEffect(() => {
    if (!tracks) return;
    let vidCount = 0;
    let audCount = 0;
    tracks.forEach((track) => {
      if (track.getType() === 'video' && vidCount === 0) {
        track.attach(videoRef.current);
        setVideoMute(track.isMuted());
        vidCount += 1;
      } else if (track.getType() === 'audio' && audCount === 0) {
        track.attach(audioRef.current);
        setAudioMute(track.isMuted());
        audCount += 1;
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
      {videoMute && <img src={placeHolder} alt="" style={{ objectFit: "contain", width: "100%", height: "100%", }} />}
      <video ref={videoRef} autoPlay={true} style={{height: "100%", width: "100%", display: (videoMute) && "none"}} poster={placeHolder}/>
      <div className={classes.displayName}>{displayName}</div>
      <audio ref={audioRef} autoPlay={true} muted={audioMute}/>
    </Box>
  );
}

export default Participant;