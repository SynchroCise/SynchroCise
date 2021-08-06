import React, { useEffect, useRef, useState } from "react";
import { buildOptions } from "../../utils/jitsi";
import { useAppContext } from "../../AppContext";

const WorkoutDisplay = () => {
  const { JitsiMeetJS } = useAppContext();
  const videoRef = useRef();
  const audioRef = useRef();
  const [videoTracks, setVideoTracks] = useState([]);
  const [audioTracks, setAudioTracks] = useState([]);
  
  // attach video track to DOM
  useEffect(() => {
    const videoTrack = videoTracks[0];
    if (videoTrack) {
      videoTrack.attach(videoRef.current);
      return () => {
        videoTrack.detach();
      };
    }
  }, [videoTracks]);

  // attach audio track to DOM
  useEffect(() => {
    const audioTrack = audioTracks[0];
    if (audioTrack) {
      audioTrack.attach(audioRef.current);
      return () => {
        audioTrack.detach();
      };
    }
  }, [audioTracks]);

  useEffect(() => {
    let connection;
    let room;
    const roomName = 'hello';
    const tenant = 'world';
    const options = buildOptions(roomName, tenant)
    const onConnectionSuccess = () => {
      console.log('jitsi success');
      room = connection.initJitsiConference(roomName, options.conference);
      room.join();
    }
    const onConnectionFailed = () => {
      console.log('jitsi failed');
    }
    const disconnect = () => {
      console.log('jitsi disconnect');
    }
    const onLocalTracks = (tracks) => {
      tracks.forEach((track) => {
        if (track.getType() === "video") {
          setVideoTracks((videoTracks) => [...videoTracks, track]);
        } else if (track.getType() === "audio") {
          setAudioTracks((audioTracks) => [...audioTracks, track]);
        }
      });
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
      <video ref={videoRef} autoPlay={true}/>
      <audio ref={audioRef} autoPlay={true}/>
    </div>
  );
};

export default WorkoutDisplay;
