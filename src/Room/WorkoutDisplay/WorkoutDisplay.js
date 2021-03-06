import React, { useEffect, useState } from "react";
import { useAppContext } from "../../AppContext";
import Participant from "./Participant/Participant";
import Youtube from "../Youtube/Youtube"
import { Box } from '@material-ui/core';


const WorkoutDisplay = ({ ppp, youtubeRef }) => {
  // TODO: move `ppp` out of props
  const { JitsiMeetJS, pinnedParticipantId, participantIds, setParticipantIds, room, localTracks, workoutType } = useAppContext();
  const [remoteTracks, setRemoteTracks] = useState({});
  const [displayParticipantId, setDisplayParticipantId] = useState("");
  const [bottomDisplayParticipantIds, setBottomDisplayParticipantIds] = useState([]);

  // sets display participant id
  useEffect(() => {
    if (!room) return;
    const remoteParticipants = room.getParticipants();
    if (remoteParticipants.length === 0) return setDisplayParticipantId(room.myUserId());
    if (pinnedParticipantId !== "") return setDisplayParticipantId(pinnedParticipantId);
    return setDisplayParticipantId(remoteParticipants[0].getId());
  }, [pinnedParticipantId, room, participantIds]);

  // sets bottom display participant ids
  useEffect(() => {
    if (!room) return setBottomDisplayParticipantIds([]);
    let tempBottomParticipantIds = [room.myUserId(), ...room.getParticipants().map(p => p.getId())];

    if (workoutType === 'vid') {
      tempBottomParticipantIds = tempBottomParticipantIds.filter((id) => id !== displayParticipantId).slice(0, ppp);
    } else {
      tempBottomParticipantIds = tempBottomParticipantIds.slice(0, ppp);
    }
    setBottomDisplayParticipantIds(tempBottomParticipantIds);
    
  }, [displayParticipantId, room, participantIds, workoutType, ppp]);

  // once room has been initialized
  useEffect(() => {
    const onRemoteTrack = (track) => {
      if (track.isLocal()) {
        return;
      }
      const participantId = track.getParticipantId();
      let prevTracks = [];
      if (remoteTracks[participantId]) {
        prevTracks = [...remoteTracks[participantId]];
      }  
      setRemoteTracks((prev) => ({...prev, [participantId]: [...prevTracks, track] }));      
    }
    const onConferenceJoined = () => {
      setParticipantIds((prev) => [...prev, room.myUserId()]);
      localTracks.forEach((track) => room.addTrack(track));
    };
    const onUserJoined = (id) => {
      setParticipantIds(prev => [...prev, id]);
    }
    const onUserLeft = (id) => {
      setParticipantIds(prev => [...prev].filter(p => (p !== id)));
      if (remoteTracks[id]) remoteTracks[id].forEach((track) => track.detach())
    }
    if (room) {
      room.join()
      room.on(JitsiMeetJS.events.conference.TRACK_ADDED, onRemoteTrack);
      room.on(JitsiMeetJS.events.conference.CONFERENCE_JOINED, onConferenceJoined);
      room.on(JitsiMeetJS.events.conference.USER_JOINED, onUserJoined);
      room.on(JitsiMeetJS.events.conference.USER_LEFT, onUserLeft);
      room.setReceiverVideoConstraint(720);
      return () => {
        room.off(JitsiMeetJS.events.conference.TRACK_ADDED, onRemoteTrack);
        room.off(JitsiMeetJS.events.conference.CONFERENCE_JOINED, onConferenceJoined);
        room.off(JitsiMeetJS.events.conference.USER_JOINED, onUserJoined);
        room.off(JitsiMeetJS.events.conference.USER_LEFT, onUserLeft);
      }
    }
  }, [room, JitsiMeetJS.events.conference.CONFERENCE_JOINED, JitsiMeetJS.events.conference.TRACK_ADDED, JitsiMeetJS.events.conference.USER_JOINED, JitsiMeetJS.events.conference.USER_LEFT, localTracks, remoteTracks, setParticipantIds]);
      
  return (
    <React.Fragment>
      <Box height={bottomDisplayParticipantIds.length > 0  ? "80%" : "100%"} pb={1}>
        {(workoutType === 'vid') ? (
          <Participant
            id={displayParticipantId}
            tracks={(displayParticipantId === room.myUserId()) ? localTracks : remoteTracks[displayParticipantId]}
          />
        ) : (
          <Youtube playerRef={youtubeRef}></Youtube>
        )} 
      </Box>
      {bottomDisplayParticipantIds.length > 0 && 
       <Box height="20%" flexDirection="row" display="flex" justifyContent="flex-start" px={1}>
          {
            [...bottomDisplayParticipantIds]
            .map((participantId) => {
              if (participantId === room.myUserId()) {
                return (<Participant key={participantId} id={participantId} tracks={localTracks}/>)
              } else {
                return (<Participant key={participantId} id={participantId} tracks={(remoteTracks[participantId]) ? remoteTracks[participantId] : []}/>)
              }
            })
          }
        </Box>
      }
    </React.Fragment>
  );
};

export default WorkoutDisplay;
