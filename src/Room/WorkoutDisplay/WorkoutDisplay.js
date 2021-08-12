import React, { useEffect, useState } from "react";
import { useAppContext } from "../../AppContext";
import Participant from "./Participant/Participant";
import { Box } from '@material-ui/core';


const WorkoutDisplay = () => {
  const { JitsiMeetJS, pinnedParticipantId, participantIds, setParticipantIds, room, localTracks, workoutType } = useAppContext();
  const [isJoined, setIsJoined] = useState(false);
  const [remoteTracks, setRemoteTracks] = useState({});

  const getDisplayParticipantId = () => {
    const remoteParticipants = room.getParticipants();
    if (remoteParticipants.length === 0) return room.myUserId();
    if (pinnedParticipantId !== "") return pinnedParticipantId;
    return remoteParticipants[0].getId();
  }

  // once room has been initialized
  useEffect(() => {
    const onRemoteTrack = (track) => {
      console.log('onRemoteTrack');
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
      room.setLocalParticipantProperty("favouriteColour", "yess");
      setParticipantIds((prev) => [...prev, room.myUserId()]);
      localTracks.forEach((track) => room.addTrack(track));
      setIsJoined(true);
    };
    const onUserJoined = (id) => {
      console.log('onUserJoined', id);
      setParticipantIds(prev => [...prev, id]);
    }
    const onUserLeft = (id) => {
      console.log('onUserLeft');
      setParticipantIds(prev => [...prev].filter(p => (p !== id)));
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
      <Box height={room.getParticipants().length > 0 ? "70%" : "100%"}>
        {(workoutType === 'vid') ? (
          <Participant
            id={getDisplayParticipantId()}
            tracks={(getDisplayParticipantId() === room.myUserId()) ? localTracks : remoteTracks[getDisplayParticipantId()]}
          />
        ) : (
          // TODO: insert Youtube here
          null
        )} 
      </Box>
      {room.getParticipants().length > 0 && 
       <Box height="30%" flexDirection="row" display="flex" justifyContent="space-around">
          {
            [...participantIds]
            .filter((participantId) => participantId !== getDisplayParticipantId())
            .map((participantId) => {
              if (participantId === room.myUserId()) {
                return (<Participant key={participantId} id={participantId} tracks={localTracks}/>)
              } else if (remoteTracks[participantId]) {
                console.log('remotetracks', remoteTracks[participantId])
                return (<Participant key={participantId} id={participantId} tracks={remoteTracks[participantId]}/>)
              }
              return null
            })
          }
        </Box>
      }
    </React.Fragment>
  );
};

export default WorkoutDisplay;
