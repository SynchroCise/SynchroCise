import React, { useEffect, useContext, useState, useRef } from "react";
import Participant from "./Participant/Participant";
import SideBar from "./SideBar/SideBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AppContext } from "./../AppContext";
import { Paper, Tab, Tabs, Grid, Typography, Box, IconButton, BottomNavigation, BottomNavigationAction, withStyles } from '@material-ui/core';
import { ArrowForward, ArrowBack, Videocam, VideocamOff, Mic, MicOff, CallEnd, Fullscreen, Apps, ChevronLeft, ChevronRight, YouTube, FitnessCenter } from '@material-ui/icons';
import {
  faMicrophone,
  faVideo,
  faArrowLeft,
  faArrowRight,
  faExpandAlt,
  faVideoSlash,
  faMicrophoneSlash,
} from "@fortawesome/free-solid-svg-icons";
import Video from '../Video/Video';
import { getVideoType } from '../utils/video';
import { sckt } from '../Socket';
import { makeStyles } from "@material-ui/core/styles";
import { Redirect } from "react-router-dom";



const VideoElement = <FontAwesomeIcon icon={faVideo} />;
const VideoElementMuted = <FontAwesomeIcon icon={faVideoSlash} />;
const MicElement = <FontAwesomeIcon icon={faMicrophone} />;
const leftElement = <FontAwesomeIcon icon={faArrowLeft} />;
const rightElement = <FontAwesomeIcon icon={faArrowRight} />;
const fullElement = <FontAwesomeIcon icon={faExpandAlt} />;
const MicElementMuted = <FontAwesomeIcon icon={faMicrophoneSlash} />;

// using roomName and token, we will create a room
const Room = (props) => {
  const [participants, setParticipants] = useState([]);
  const [participantPage, setParticipantPage] = useState(0);
  const ppp = 4; // participants per page
  const [leaderParticipantIDs, setLeaderParticipantIDs] = useState([]);
  const { username, room, handleLeaveRoom, workout, userId, handleSetWorkout, openSideBar, handleOpenSideBar, roomProps, updateRoomProps, workoutType, setWorkoutType, videoProps, updateVideoProps, sendRoomState } = useContext(AppContext);
  const [vid, setVid] = useState((room) ? room.localParticipant.videoTracks.values().next().value.isTrackEnabled : false);
  const [mic, setMic] = useState((room) ? room.localParticipant.audioTracks.values().next().value.isTrackEnabled : false);
  const loadingRoomData = useRef(true);

  // Initializing Room Stuff
  useEffect(() => {
    const getRoomSyncHandler = ({ id }) => {
      let params = {
        id: id,
        ...roomProps,
      }
      sckt.socket.emit('sendRoomSync', params, (error) => { });
    };
    const getVideoSyncHandler = ({ id }) => {
      log("New user needs videoProps to sync.", 'server');
      if (playerRef.current !== null) {
        let params = {
          id: id,
          ...videoProps,
          seekTime: playerRef.current.getCurrentTime(),
          receiving: true
        }
        sckt.socket.emit('sendVideoSync', params, (error) => { });
      }
    }
    sckt.socket.on("getRoomSync", getRoomSyncHandler);
    sckt.socket.on("getVideoSync", getVideoSyncHandler);
    return () => {
      sckt.socket.off("getRoomSync", getRoomSyncHandler)
      sckt.socket.off("getVideoSync", getVideoSyncHandler);
    }
  });
  useEffect(() => {
    const startRoomSyncHandler = (receivedRoomProps) => {
      console.log("I'm syncing room.", 'server');
      updateRoomProps({ ...receivedRoomProps });
    };
    const startVideoSyncHandler = (videoProps) => {
      console.log("I'm syncing video.", 'server');
      updateVideoProps({ ...videoProps });
      modifyVideoState({ ...videoProps });
      // loadVideo(videoProps.history[0], true);
    };
    const receiveRoomStateHandler = ({ name, room, eventName, eventParams = {} }) => {
      const { playWorkoutState, workout, workoutType } = eventParams;
      switch (eventName) {
        case 'syncWorkoutState':
          updateRoomProps({ playWorkoutState });
          break;
        case 'syncWorkoutType':
          updateRoomProps({ workoutType });
          break;
        case 'syncWorkout':
          updateRoomProps({ workout });
          break;
        default:
          break;
      }
    }
    sckt.socket.on('receiveRoomState', receiveRoomStateHandler)
    sckt.socket.on("startRoomSync", startRoomSyncHandler);
    sckt.socket.on("startVideoSync", startVideoSyncHandler);
    return () => {
      sckt.socket.off('receiveRoomState', receiveRoomStateHandler)
      sckt.socket.off("startRoomSync", startRoomSyncHandler);
      sckt.socket.off("startVideoSync", startVideoSyncHandler);
    }
  }, []);

  // sending sync video
  const playerRef = useRef(null);
  const drawerWidth = 300;

  const modifyVideoState = (paramsToChange) => {
    if (playerRef.current !== null) {
      const { playing, seekTime, playbackRate } = paramsToChange;
      if (playing !== undefined) {
        updateVideoProps({ playing });
        // } else if (playbackRate !== undefined) {
        //     player.setPlaybackRate(playbackRate);
      }
      if (seekTime !== undefined) {
        playerRef.current.seekTo(seekTime);
      }
    }
  }

  const sendVideoState = ({ eventName, eventParams }) => {
    if (!room) return;
    let params = {
      name: username,
      room: room.sid,
      eventName: eventName,
      eventParams: eventParams
    };
    sckt.socket.emit('sendVideoState', params, (error) => { });
  };

  const playVideoFromSearch = (searchItem) => {
    const url = searchItem.video.url;
    const videoType = getVideoType(url);
    if (videoType !== null) {
      updateVideoProps({ videoType });
    }
    // Handle playing video immediately
    const { history } = videoProps;
    loadVideo(searchItem, false);
    sendVideoState({
      eventName: "syncLoad",
      eventParams: { searchItem, history: [searchItem, ...history] }
    });
    updateVideoProps({ history: [searchItem, ...history] });
  }
  const loadVideo = (searchItem, sync) => {
    const { playing, seekTime, initVideo } = videoProps;
    if ((playerRef.current !== null || !initVideo) && searchItem) {
      if (!initVideo) updateVideoProps({ initVideo: true });
      let videoUrl = searchItem.video.url;
      if (sync) {
        updateVideoProps({ url: videoUrl });
        updateVideoProps({ playing });
        updateVideoProps({ receiving: false });
        playerRef.current.seekTo(seekTime, 'seconds');
      } else {
        updateVideoProps({ url: videoUrl });
        updateVideoProps({ playing: true });
        updateVideoProps({ receiving: false });
      }
      // sckt.socket.emit('updateRoomData', { video: searchItem }, (error) => { });
    }
  }
  const log = (msg, type) => {
    let baseStyles = [
      "color: #fff",
      "background-color: #444",
      "padding: 2px 4px",
      "border-radius: 2px"
    ].join(';');
    let serverStyles = [
      "background-color: gray"
    ].join(';');
    let otherStyles = [
      "color: #eee",
      "background-color: red"
    ].join(';');
    let meStyles = [
      "background-color: green"
    ].join(';');
    // Set style based on input type
    let style = baseStyles + ';';
    switch (type) {
      case "server": style += serverStyles; break;
      case "other": style += otherStyles; break;
      case "me": style += meStyles; break;
      case "none": style = ''; break;
      default: break;
    }
    console.log(`%c${msg}`, style);
  }

  // once room is rendered do below
  useEffect(() => {
    if (!room) return;
    // if participant connects or disconnects update room properties
    const participantConnected = (participant) => {
      setParticipants((prevParticipants) =>
        [...prevParticipants, participant].filter(
          (v, i, a) => a.indexOf(v) === i
        )
      );
    };

    const participantDisconnected = (participant) => {
      setParticipants((prevParticipants) =>
        prevParticipants.filter((p) => p !== participant)
      );
    };

    room.on("participantConnected", participantConnected);
    room.on("participantDisconnected", participantDisconnected);
    room.participants.forEach(participantConnected);

    return () => {
      room.off("participantConnected", participantConnected);
      room.off("participantDisconnected", participantDisconnected);
    };

  }, [room]);

  // joins the room through sockets
  useEffect(() => {
    if (!room) return;
    const sid = room.localParticipant.sid;
    const name = username;

    sckt.socket.emit('join', { name, room: room.sid, sid, userId }, ({ id }) => {
      // updateCurrUser({ id });
      // setTimeout(() => {
      //   setIsJoined(true);
      // }, 750);
    });
  }, []);
  // handles leader changes from server
  useEffect(() => {
    const handler = (leaderList) => {
      setLeaderParticipantIDs([...leaderList]);
    }
    sckt.socket.on('leader', handler);
    return () => sckt.socket.off('leader', handler);
  }, []);

  // handels leader leaves server
  useEffect(() => {
    const handler = () => {
      alert('Room has closed due to leader leaving');
      window.location.replace('/');
    }
    sckt.socket.on('killroom', handler);
    return () => sckt.socket.off('leader', handler);
  }, []);

  // resets participant page if there are no remote participants
  useEffect(() => {
    if (!room) return;
    let all_participants = [...participants, room.localParticipant];
    all_participants = (workoutType == 'yt') ? all_participants : all_participants.filter((participant) => participant.sid !== leaderParticipantIDs[0])
    const viewer_len = all_participants.slice(participantPage * ppp, participantPage * ppp + ppp).length
    if (viewer_len == 0 && participantPage != 0) {
      setParticipantPage(0)
    }
  }, [participants]);

  // show all the particpants in the room
  const remoteParticipants = () => {
    if (!room) return;
    if (participants.length < 1) {
      return <Typography color="secondary">No Other Participants</Typography>;
    }
    let all_participants = [...participants, room.localParticipant];
    all_participants = (workoutType == 'yt') ? all_participants : all_participants.filter((participant) => participant.sid !== leaderParticipantIDs[0])
    return all_participants
      .slice(participantPage * ppp, participantPage * ppp + ppp)
      .map((participant, index) => (
        <Grid item xs={3} key={index} style={{ height: "100%" }}>
          <Participant participant={participant} key={participant.sid} />
        </Grid>
      ));
  };


  const leaderParticipant = () => {
    if (!room) return;
    if (participants.length >= 1) {
      const participant = participants.filter(
        (participant) => participant.sid === leaderParticipantIDs[0]
      )[0];
      if (participant === undefined) {
        return (
          <Participant
            key={room.localParticipant.sid}
            participant={room.localParticipant}
          />
        );
      }
      return <Participant key={participant.sid} participant={participant} />;
    } else {
      return (
        <Participant
          key={room.localParticipant.sid}
          participant={room.localParticipant}
        />
      );
    }
  };

  const handleMic = () => {
    if (!room) return;
    room.localParticipant.audioTracks.forEach(track => {
      (mic) ? track.track.disable() : track.track.enable()
    });
    setMic(!mic);
  };

  const handleVid = () => {
    if (!room) return;
    room.localParticipant.videoTracks.forEach(track => {
      (vid) ? track.track.disable() : track.track.enable()
    });
    setVid(!vid);
  };

  const handleParticipantPage = (pageDelta) => {
    if (!room) return;
    let all_participants = [...participants, room.localParticipant];
    all_participants = (workoutType == 'yt') ? all_participants : all_participants.filter((participant) => participant.sid !== leaderParticipantIDs[0])
    const newPageNum = participantPage + pageDelta;
    if (all_participants.slice(newPageNum * ppp, newPageNum * ppp + ppp).length > 0) {
      setParticipantPage(newPageNum)
    }
  }

  const useStyles = makeStyles(theme => ({
    content: {
      flexGrow: 1,
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      marginRight: drawerWidth,
    },
    contentShift: {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginRight: 0,
    },
  }));
  const classes = useStyles();

  const handleChangeWorkoutType = (value) => {
    const newWorkoutType = value ? 'yt' : 'vid';
    sendRoomState({
      eventName: 'syncWorkoutType',
      eventParams: { workoutType: newWorkoutType }
    }, () => { setWorkoutType(newWorkoutType) });
  }

  const CustomBottomNavigationAction = withStyles({
    root: {
      backgroundColor: 'rgba(0, 0, 0, 0.87)',
      color: 'white'
    },
  })(BottomNavigationAction);

  // check if room exists
  // TODO: Add loading screen. https://stackoverflow.com/questions/56861580/how-can-i-redirect-before-render
  if (!room) {
    return (
      <Redirect to={`/join-room/${props.match.params.roomCode}`} />
    );
  }

  return (
    <React.Fragment>
      <Box display="flex" alignItems="center" justifyContent="center" className={`${classes.content} ${openSideBar ? '' : (classes.contentShift)}`} height="100%" bgcolor="text.primary">
        <Grid container style={{ height: "100vh" }}>
          <Grid item xs={12} style={{ height: "70%", width: "100%" }}>
            {room && (workoutType == 'vid') ? leaderParticipant() :
              <Video
                log={log}
                room={room}
                videoProps={videoProps}
                updateVideoProps={updateVideoProps}
                playerRef={playerRef}
                sendVideoState={sendVideoState}
                loadVideo={loadVideo}
                playVideoFromSearch={playVideoFromSearch}
              />}
          </Grid>
          <Grid item container xs={12} style={{ height: "20%", width: "100%" }}>
            {remoteParticipants()}
          </Grid>
          <Grid item container xs={12} style={{ height: "10%", width: "100%" }} alignItems="center">
            <Grid item xs={4}>
              <Box display="flex" justifyContent="flex-start" alignItems="center">
                <IconButton color="secondary" size="medium" onClick={handleVid}>
                  {vid ? <Videocam /> : <VideocamOff />}
                </IconButton>
                <IconButton color="secondary" size="medium" onClick={handleMic}>
                  {mic ? <Mic /> : <MicOff />}
                </IconButton>
                {/* <IconButton>
                  <CallEnd></CallEnd>
                </IconButton> */}
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box display="flex" justifyContent="center" alignItems="center" l={3} r={3}>
                <IconButton color="secondary" size="medium" onClick={() => handleParticipantPage(-1)}>
                  <ArrowBack style={{ fill: "white" }} />
                </IconButton>
                <Typography color="secondary"> {participants.length + leaderParticipantIDs.length}/{participants.length + leaderParticipantIDs.length} participants {participantPage} </Typography>
                <IconButton color="secondary" size="medium" onClick={() => handleParticipantPage(1)}>
                  <ArrowForward style={{ fill: "white" }} />
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box display="flex" justifyContent="flex-end" alignItems="center">
                {/* <IconButton color="secondary" size="medium">
                  <Apps/>
                </IconButton>
                <IconButton color="secondary" size="medium">
                  <Fullscreen/>
                </IconButton> */}

                <BottomNavigation
                  value={workoutType == 'yt' ? 1 : 0}
                  onChange={(event, newValue) => {
                    handleChangeWorkoutType(newValue);
                  }}
                  showLabels
                  className={classes.root}
                  color="secondary"
                >
                  <CustomBottomNavigationAction label="Custom" icon={<FitnessCenter />} />
                  <CustomBottomNavigationAction color="secondary" label="Youtube" icon={<YouTube />} />
                </BottomNavigation>
                <IconButton color="secondary" size="medium" onClick={handleOpenSideBar}>
                  {openSideBar ? <ChevronRight /> : <ChevronLeft />}
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Box>
      <SideBar
        handleLeaveRoom={handleLeaveRoom}
        currUser={room.localParticipant}
        users={participants}
        isYoutube={workoutType == 'yt' ? 1 : 0}
        drawerWidth={drawerWidth}
        room={room}
      />
    </React.Fragment>
  );
};

export default Room;
