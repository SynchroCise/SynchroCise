import React, { useEffect, useContext, useState, useRef } from "react";
import Participant from "./Participant/Participant";
import SideBar from "./SideBar/SideBar";
import BottomControl from "./BottomControl/BottomControl"
import { AppContext } from "../AppContext";
import { Grid, Typography, Box } from '@material-ui/core';
import Video from './Video/Video';
import { sckt } from '../Socket';
import { makeStyles } from "@material-ui/core/styles";
import { Redirect } from "react-router-dom";

// using roomName and token, we will create a room
const Room = (props) => {
  const [participants, setParticipants] = useState([]);
  const [particiapntsComponent, setParticipantsComponent] = useState(<Typography color="secondary">Loading</Typography>);
  const [participantPage, setParticipantPage] = useState(0);
  const [leaderParticipantIDs, setLeaderParticipantIDs] = useState([]);
  const ppp = 4; // participants per page
  const { username, room, handleLeaveRoom, userId, openSideBar, roomProps, updateRoomProps, workoutType, videoProps, updateVideoProps } = useContext(AppContext);
  const [nameArr, setNameArray] = useState([room ? { name: username, sid: room.localParticipant.sid } : {}]);

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
      console.log("New user needs videoProps to sync.", 'server');
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


  useEffect(() => {
    const handler = ({ name, sid }) => {
      setNameArray((oldArray) => [...oldArray, { name, sid }]);
    }
    sckt.socket.on("newUser", handler);
    return () => sckt.socket.off('newUser', handler);
  }, []);


  // sending sync video
  const playerRef = useRef(null);
  const drawerWidth = 300;

  const modifyVideoState = (paramsToChange) => {
    if (playerRef.current !== null) return;
    const { playing, seekTime } = paramsToChange;
    if (playing !== undefined) {
      updateVideoProps({ playing });
      // } else if (playbackRate !== undefined) {
      //     player.setPlaybackRate(playbackRate);
    }
    if (seekTime !== undefined) {
      playerRef.current.seekTo(seekTime);
    }
  }

  // once room is rendered do below
  useEffect(() => {
    if (!room) return;
    // if participant connects or disconnects update room properties
    const participantConnected = (participant) => {
      setParticipants((prevParticipants) =>
        [...prevParticipants, participant].filter(
          (v, i, a) => a.indexOf(v) === i
        ))
    };

    const participantDisconnected = (participant) => {
      setParticipants((prevParticipants) =>
        prevParticipants.filter((p) => p !== participant)
      );
      setNameArray((prevParticipants) =>
        prevParticipants.filter((p) => p.sid !== participant.sid));
    };

    room.on("participantConnected", participantConnected);
    room.on("participantDisconnected", participantDisconnected);
    room.participants.forEach(participantConnected);

    return () => {
      room.off("participantConnected", participantConnected);
      room.off("participantDisconnected", participantDisconnected);
    };
  }, [room]);

  useEffect(() => {
    if (!room) return;
    const gettingNames = async () => {
      const res = await fetch("/api/displayNameInRoom?rid=" + room.sid, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        const names = await res.json();
        setNameArray((oldArray) => oldArray.concat(names));
      }
    }
    gettingNames();
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
    return () => sckt.socket.off('killroom', handler);
  }, []);

  // resets participant page if there are no remote participants
  useEffect(() => {
    if (!room) return;
    let all_participants = [...participants, room.localParticipant];
    all_participants = (workoutType === 'yt') ? all_participants : all_participants.filter((participant) => participant.sid !== leaderParticipantIDs[0])
    const viewer_len = all_participants.slice(participantPage * ppp, participantPage * ppp + ppp).length
    if (viewer_len === 0 && participantPage !== 0) {
      setParticipantPage(0)
    }
  }, [participants]);

  // show all the particpants in the room
  useEffect(() => {
    if (!room) return;
    let all_participants = [...participants, room.localParticipant];
    all_participants = (workoutType === 'yt') ? all_participants : all_participants.filter((participant) => participant.sid !== leaderParticipantIDs[0])
    all_participants
      .slice(participantPage * ppp, participantPage * ppp + ppp)
      .map((participant, index) => (
        console.log(participant.sid)
      ));
    console.log(nameArr);
    setParticipantsComponent(all_participants
      .slice(participantPage * ppp, participantPage * ppp + ppp)
      .map((participant, index) => (
        <Grid item xs={3} key={index} style={{ height: "100%" }}>
          <Participant participant={participant} names={nameArr} participantPage={participantPage} />
        </Grid>
      )));

  }, [nameArr, participantPage]);

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
            {room && (workoutType === 'vid') ? leaderParticipant() :
              <Video playerRef={playerRef} />}
          </Grid>
          <Grid item container xs={12} style={{ height: "20%", width: "100%" }}>
            {particiapntsComponent}
          </Grid>
          <Grid item container xs={12} style={{ height: "10%", width: "100%" }} alignItems="center">
            <BottomControl
              participants={participants}
              participantPage={participantPage}
              setParticipantPage={setParticipantPage}
              leaderParticipantIDs={leaderParticipantIDs}
              ppp={ppp}
            />
          </Grid>
        </Grid>
      </Box>
      <SideBar
        handleLeaveRoom={handleLeaveRoom}
        currUser={room.localParticipant}
        users={participants}
        isYoutube={workoutType === 'yt' ? 1 : 0}
        drawerWidth={drawerWidth}
      />
    </React.Fragment>
  );
};

export default Room;
