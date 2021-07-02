import React, { useState, useEffect, useRef } from "react";
import { Box, Typography } from '@material-ui/core';
import './Participant.scss';

const Participant = ({ participant, names, participantPage }) => {
  const [videoTracks, setVideoTracks] = useState([]);
  const [audioTracks, setAudioTracks] = useState([]);
  const [displayName, setDisplayName] = useState('');


  useEffect(() => {
    if (!names) return;
    if (!names.find(x => x.sid === participant.sid)) return;
    setDisplayName(names.find(x => x.sid === participant.sid).name)
  }, [names, participant.sid]);

  // creates ref to html element
  const videoRef = useRef();
  const audioRef = useRef();

  // filter out tracks that don't exist
  const trackpubsToTracks = (trackMap) =>
    Array.from(trackMap.values())
      .map((publication) => publication.track)
      .filter((track) => track !== null);

  useEffect(() => {
    // use participant objects to set initial values for tracks
    setVideoTracks(trackpubsToTracks(participant.videoTracks));
    setAudioTracks(trackpubsToTracks(participant.audioTracks));

    // when audio or video track is added for participant
    const trackSubscribed = (track) => {
      if (track.kind === "video") {
        setVideoTracks((videoTracks) => [...videoTracks, track]);
      } else if (track.kind === "audio") {
        setAudioTracks((audioTracks) => [...audioTracks, track]);
      }
    };

    // when audio or video track is removed for participant
    const trackUnsubscribed = (track) => {
      if (track.kind === "video") {
        setVideoTracks((videoTracks) => videoTracks.filter((v) => v !== track));
      } else if (track.kind === "audio") {
        setAudioTracks((audioTracks) => audioTracks.filter((a) => a !== track));
      }
    };

    // set listeners to the above functions
    participant.on("trackSubscribed", trackSubscribed);
    participant.on("trackUnsubscribed", trackUnsubscribed);

    return () => {
      setVideoTracks([]);
      setAudioTracks([]);
      participant.removeAllListeners();
    };
  }, [participant]);

  // attach video track to DOM
  useEffect(() => {
    const videoTrack = videoTracks[0];
    if (videoTrack) {
      videoTrack.attach(videoRef.current);
      return () => {
        videoTrack.detach();
      };
    } else {
      console.log("THERE IS NO VIDEO!!")
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

  return (
    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100%">
      {/* <div className='name'>{participant.identity}</div> */}
      {(videoTracks[0]) ? <video ref={videoRef} autoPlay={true} style={{ position: "relative", flexGrow: 1, maxWidth: "100%", minHeight: 0 }} data-test="videoComponent" /> : null}
      <div className="name">
        <Typography color="secondary" data-test="displayNameComponent">{displayName}</Typography>
      </div>
      <audio ref={audioRef} autoPlay={true} muted={true} data-test="audioComponent" />
    </Box>
  );
};

export default Participant;
