import React, { useState, useEffect, useRef } from "react";
import { Box, Typography } from '@material-ui/core';
import placeHolder from "../../media/placeHolder.png";
import './Participant.scss';

const Participant = ({ participant, names, setPinnedParticipantId }) => {
  const [videoTracks, setVideoTracks] = useState([]);
  const [audioTracks, setAudioTracks] = useState([]);
  const [displayName, setDisplayName] = useState('');
  const [videoMute, setVideoMute] = useState(true);
  const [audioMute, setAudioMute] = useState(true);

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
      console.log('track subscribed', track)
      if (track.kind === "video") {
        setVideoTracks((videoTracks) => [...videoTracks, track]);
      } else if (track.kind === "audio") {
        setAudioTracks((audioTracks) => [...audioTracks, track]);
      }
      track.on('disabled', handleMute);
      track.on('enabled', handleMute);
    };

    // when audio or video track is removed for participant
    const trackUnsubscribed = (track) => {
      if (track.kind === "video") {
        setVideoTracks((videoTracks) => videoTracks.filter((v) => v !== track));
      } else if (track.kind === "audio") {
        setAudioTracks((audioTracks) => audioTracks.filter((a) => a !== track));
      }
    };
    const handleMute = (track) => {
      console.log(track)
      if (track.kind === "video") {
        setVideoMute(track.isEnabled);
      }
      else if (track.kind === "audio") {
        setAudioMute(track.isEnabled);
      }
    }

    // set listeners to the above functions
    participant.on("trackSubscribed", trackSubscribed);
    participant.on("trackUnsubscribed", trackUnsubscribed);
    participant.tracks.forEach(publication => {
      if (publication.track) {
        publication.track.on('disabled', handleMute);
        publication.track.on('enabled', handleMute);
      }
    });

    return () => {
      setVideoTracks([]);
      setAudioTracks([]);
      participant.removeAllListeners();
      participant.tracks.forEach((publication) => {
        if (publication.track) {
          publication.track.removeListener('disabled', handleMute);
          publication.track.removeListener('enabled', handleMute);
        }
      })
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
    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100%" onClick={() => setPinnedParticipantId(participant.sid)}>
      {/* <div className='name'>{participant.identity}</div> */}
      {(videoTracks[0]) ? <video muted={videoMute} ref={videoRef} autoPlay={true} style={{ position: "relative", flexGrow: 1, maxWidth: "100%", minHeight: 0 }} data-test="videoComponent" /> : 
        <img src={placeHolder} alt="" style={{ objectFit: "contain", width: "100%", height: "100%", }}></img>}
      <div className="name">
        <Typography color="secondary" data-test="displayNameComponent">{displayName}</Typography>
      </div>
      <audio ref={audioRef} autoPlay={true} muted={audioMute} data-test="audioComponent" />
    </Box>
  );
};

export default Participant;
