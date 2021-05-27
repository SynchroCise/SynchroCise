import React, { useState, useEffect, useRef } from "react";
import { Box, Typography } from '@material-ui/core';
import './Participant.scss';

// import "../../media/CoLab.css";

const Participant = ({ participant }) => {
  const [videoTracks, setVideoTracks] = useState([]);
  const [audioTracks, setAudioTracks] = useState([]);

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
      <video ref={videoRef} autoPlay={true}  style={{position: "relative", flexGrow: 1, maxWidth:"100%", minHeight: 0}}/>
      <div className="name">
        <Typography color="secondary">{participant.identity}</Typography>
      </div>
      <audio ref={audioRef} autoPlay={true} muted={true} />
    </Box>
  );
};

export default Participant;
