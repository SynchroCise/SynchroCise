import React, { useEffect, useRef, useState } from "react";
import { buildOptions } from "../../utils/jitsi";
import { useAppContext } from "../../AppContext";
import Participant from "./Participant/Participant";

const WorkoutDisplay = () => {
  const { JitsiMeetJS, pinnedParticipantId, participantIds, setParticipantIds, room, localTracks } = useAppContext();
  const [isJoined, setIsJoined] = useState(false);
  const [remoteTracks, setRemoteTracks] = useState({});

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
  }, [room]);
      
  return (
    <div>
      {[...participantIds].map((participantId) => {
        if (participantId === room.myUserId()) {
          return (<Participant key={participantId} id={participantId} tracks={localTracks}/>)
        } else if (remoteTracks[participantId]) {
          console.log('remotetracks', remoteTracks[participantId])
          return (<Participant key={participantId} id={participantId} tracks={remoteTracks[participantId]}/>)
        }
      })}
    </div>
  );
};

export default WorkoutDisplay;
