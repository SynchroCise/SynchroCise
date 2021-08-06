import React, { useEffect, useRef, useState } from "react";
import { buildOptions } from "../../utils/jitsi";
import { useAppContext } from "../../AppContext";
import Participant from "./Participant/Participant";

const WorkoutDisplay = () => {
  const { JitsiMeetJS } = useAppContext();
  const [isJoined, setIsJoined] = useState(false);
  const [room, setRoom] = useState(null);
  const [localTracks, setLocalTracks] = useState([]);
  const [participantIds, setParticipantIds] = useState(() => new Set());
  const [remoteTracks, setRemoteTracks] = useState({});

  // once room has been initialized
  useEffect(() => {
    const onRemoteTrack = (track) => {
      console.log('onRemoteTrack');
      const participantId = track.getParticipantId();
      let prevTracks = [];
      if (remoteTracks[participantId]) {
        prevTracks = [...remoteTracks[participantId]];
      }  
      setRemoteTracks((prev) => ({...prev, [participantId]: [...prevTracks, track] }));      
    }
    const onConferenceJoined = () => {
      console.log('onConferenceJoined', room.myUserId());
      setParticipantIds((prev) => [...prev, room.myUserId()]);
      localTracks.forEach((track) => room.addTrack(track));
      setIsJoined(true);
    };
    const onUserJoined = (id) => {
      console.log('onUserJoined', id);
      setParticipantIds(prev => new Set(prev).add(id));
    }
    const onUserLeft = (id) => {
      console.log('onUserLeft');
      setParticipantIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next
      });
    }
    if (room) {
      room.join()
      room.on(JitsiMeetJS.events.conference.TRACK_ADDED, (track) => !track.isLocal() && onRemoteTrack(track));
      room.on(JitsiMeetJS.events.conference.CONFERENCE_JOINED, onConferenceJoined);
      room.on(JitsiMeetJS.events.conference.USER_JOINED, onUserJoined);
      room.on(JitsiMeetJS.events.conference.USER_LEFT, onUserLeft);
      room.setReceiverVideoConstraint(720);
    }
  }, [room]);

  useEffect(() => {
    let connection;
    const roomName = 'hello';
    const tenant = 'world';
    const options = buildOptions(roomName, tenant)
    const onConnectionSuccess = () => {
      console.log('jitsi success');
      setRoom(connection.initJitsiConference(roomName, options.conference));
    }
    const onConnectionFailed = () => {
      console.log('jitsi failed');
    }
    const disconnect = () => {
      console.log('jitsi disconnect');
    }
    const onLocalTracks = (tracks) => {
      console.log('setLocalTracks');
      setLocalTracks(tracks)
      if (isJoined) {
        localTracks.forEach((track) => room.addTrack(track));
      }
    }
    const startJitsi = async () => {
      await JitsiMeetJS.init()
      connection = new JitsiMeetJS.JitsiConnection(null, null, options.connection)
      connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, onConnectionSuccess);
      connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_FAILED, onConnectionFailed);
      connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED, disconnect);
      connection.connect()
      JitsiMeetJS.createLocalTracks({ devices: [ 'audio', 'video' ] })
        .then(onLocalTracks)
        .catch(error => {
            throw error;
      });
      console.log(connection)
    }
    if (JitsiMeetJS) {
      startJitsi()
    }
  }, [JitsiMeetJS]);
      
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
