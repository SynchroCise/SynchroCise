import React, { useState, useEffect, useRef } from "react";
// import "../../media/CoLab.css";

const Participant = ({ participant }) => {
  const [videoTracks, setVideoTracks] = useState(localStorage.getItem('VideoTracks') === null ? [] : videoTracks);
  const [audioTracks, setAudioTracks] = useState(localStorage.getItem('AudioTracks') === null ? [] : audioTracks);

  // creates ref to html element
  const videoRef = useRef();
  const audioRef = useRef();

  // filter out tracks that don't exist
  const trackpubsToTracks = (trackMap) =>
  // console.log(trackMap)
    Array.from(trackMap.values())
      .map((publication) => publication.track)
      .filter((track) => track !== null);

  useEffect(() => {
    // use participant objects to set initial values for tracks
    setVideoTracks(trackpubsToTracks(participant.videoTracks));
    localStorage.setItem("VideoTracks", JSON.stringify(participant.videoTracks));
    setAudioTracks(trackpubsToTracks(participant.audioTracks));
    localStorage.setItem("AudioTracks", JSON.stringify(participant.audioTracks));

    // when audio or video track is added for participant
    const trackSubscribed = (track) => {
      if (track.kind === "video") {
        setVideoTracks((videoTracks) => [...videoTracks, track]);
        localStorage.setItem("VideoTracks", JSON.stringify((videoTracks) => [...videoTracks, track]));
      } else if (track.kind === "audio") {
        setAudioTracks((audioTracks) => [...audioTracks, track]);
        localStorage.setItem("AudioTracks", JSON.stringify((audioTracks) => [...audioTracks, track]));
      }
    };

    // when audio or video track is removed for participant
    const trackUnsubscribed = (track) => {
      if (track.kind === "video") {
        setVideoTracks((videoTracks) => videoTracks.filter((v) => v !== track));
        localStorage.setItem("VideoTracks", JSON.stringify((videoTracks) => videoTracks.filter((v) => v !== track)));
      } else if (track.kind === "audio") {
        setAudioTracks((audioTracks) => audioTracks.filter((a) => a !== track));
        localStorage.setItem("AudioTracks", JSON.stringify((audioTracks) => audioTracks.filter((a) => a !== track)));
      }
    };

    // set listeners to the above functions
    participant.on("trackSubscribed", trackSubscribed);
    participant.on("trackUnsubscribed", trackUnsubscribed);

    return () => {
      setVideoTracks([]);
      localStorage.setItem("VideoTracks", JSON.stringify([]));
      setAudioTracks([]);
      localStorage.setItem("AudioTracks", JSON.stringify([]));
      participant.removeAllListeners();
    };
  }, [participant]);

  // attach video track to DOM
  useEffect(() => {
    if(videoTracks != null) {
      const videoTrack = videoTracks[0];
      if (videoTrack) {
        videoTrack.attach(videoRef.current);
        return () => {
          videoTrack.detach();
        };
      }
    }
  }, [videoTracks]);

  // attach audio track to DOM
  useEffect(() => {
    if(audioTracks != null) {
      const audioTrack = audioTracks[0];
      if (audioTrack) {
        audioTrack.attach(audioRef.current);
        return () => {
          audioTrack.detach();
        };
      }
    }
  }, [audioTracks]);

  return (
    <div className="me-2 col">
      <p>{participant.identity}</p>
      <video ref={videoRef} autoPlay={true}  style={{width: "100%", maxHeight: "100%"}}/>
      <audio ref={audioRef} autoPlay={true} muted={true} />
    </div>
  );
};

export default Participant;
