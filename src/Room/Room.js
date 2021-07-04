import React, { useEffect, useState, useRef, useCallback } from "react";
import Participant from "./Participant/Participant";
import { RoutesEnum } from '../App'
import { useHistory } from 'react-router-dom'
import SideBar from "./SideBar/SideBar";
import BottomControl from "./BottomControl/BottomControl"
import { useAppContext } from "../AppContext";
import { Grid, Typography, Box } from '@material-ui/core';
import Video from './Video/Video';
import { sckt } from '../Socket';
import { makeStyles } from "@material-ui/core/styles";
import { Redirect } from "react-router-dom";
import * as requests from "../utils/requests"

// using roomName and token, we will create a room
const Room = (props) => {
  const [participants, setParticipants] = useState([]);
  const [participantPage, setParticipantPage] = useState(0);
  const [leaderParticipantIDs, setLeaderParticipantIDs] = useState([]);
  const ppp = 4; // participants per page
  const history = useHistory();
  const { username, room, handleLeaveRoom, userId, openSideBar, roomProps, updateRoomProps, workoutType, videoProps, updateVideoProps } = useAppContext();
  const [nameArr, setNameArray] = useState([room ? { name: username, sid: room.localParticipant.sid } : {}]);

  // Initializing Room Stuff
  const modifyVideoState = useCallback((paramsToChange) => {
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
  }, [updateVideoProps]);

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
  }, [modifyVideoState, updateVideoProps, updateRoomProps]);


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
        [...prevParticipants].filter((p) => p.sid !== participant.sid)
      );
      setNameArray((prevParticipants) =>
        [...prevParticipants].filter((p) => p.sid !== participant.sid));
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
      const res = await requests.getDisplayNamesInRoom(room.sid);
      if (res.ok) {
        const names = res.body;
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

    sckt.socket.emit('join', { name, room: room.sid, sid, userId }, ({ id, leaderList }) => {
      setLeaderParticipantIDs([...leaderList]);
    });
  }, [room, userId, username]);
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
      history.push(RoutesEnum.Home)
    }
    sckt.socket.on('killroom', handler);
    return () => sckt.socket.off('killroom', handler);
  }, [history]);

  // resets participant page if there are no remote participants
  useEffect(() => {
    if (!room) return;
    let all_participants = [...participants, room.localParticipant];
    all_participants = (workoutType === 'yt') ? all_participants : all_participants.filter((participant) => participant.sid !== leaderParticipantIDs[0])
    const viewer_len = all_participants.slice(participantPage * ppp, participantPage * ppp + ppp).length
    if (viewer_len === 0 && participantPage !== 0) {
      setParticipantPage(0)
    }
  }, [participants, leaderParticipantIDs, participantPage, room, workoutType]);

  // show all the particpants in the room
  const remoteParticipants = () => {
    if (!room) return;
    if (participants.length < 1) {
      return <Typography color="secondary">No Other Participants</Typography>;
    }
    let all_participants = [...participants, room.localParticipant];
    all_participants = (workoutType === 'yt') ? all_participants : all_participants.filter((participant) => participant.sid !== leaderParticipantIDs[0])
    return (all_participants
      .slice(participantPage * ppp, participantPage * ppp + ppp)
      .map((participant, index) => (
        <Grid item xs={3} key={index} style={{ height: "100%" }}>
          <Participant participant={participant} names={nameArr} participantPage={participantPage} data-test="remoteParticipantComponent" />
        </Grid>
      )));
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
            names={nameArr}
            participant={room.localParticipant}
            data-test="leaderParticipantComponent"
          />
        );
      }
      return <Participant key={participant.sid} participant={participant} names={nameArr} data-test="leaderParticipantComponent" />;
    } else {
      return (
        <Participant
          key={room.localParticipant.sid}
          participant={room.localParticipant}
          names={nameArr}
          data-test="leaderParticipantComponent"
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
      <Redirect to={`/join-room/${props.match.params.roomCode}`} data-test="redirectComponent" />
    );
  }

  return (
    <React.Fragment>
      <Box display="flex" alignItems="center" justifyContent="center" className={`${classes.content} ${openSideBar ? '' : (classes.contentShift)}`} height="100%" bgcolor="text.primary" data-test="roomComponent">
        <Grid container style={{ height: "100vh" }}>
          <Grid item xs={12} style={{ height: "70%", width: "100%" }}>
            {room && (workoutType === 'vid') ? leaderParticipant() :
              <Video playerRef={playerRef} data-test="youtubeComponent" />}
          </Grid>
          <Grid item container xs={12} style={{ height: "20%", width: "100%" }}>
            {remoteParticipants()}
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
