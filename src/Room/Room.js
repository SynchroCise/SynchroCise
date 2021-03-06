import React, { useEffect, useRef, useCallback } from "react";
import { RoutesEnum } from '../App'
import { useHistory } from 'react-router-dom'
import SideBar from "./SideBar/SideBar";
import BottomControl from "./BottomControl/BottomControl"
import { useAppContext } from "../AppContext";
import { Box, AppBar } from '@material-ui/core';
import WorkoutDisplay from './WorkoutDisplay/WorkoutDisplay'
import { sckt } from '../Socket';
import { makeStyles } from "@material-ui/core/styles";
import { Redirect } from "react-router-dom";
import TopBar from "./TopBar/TopBar"

// using roomName and token, we will create a room
const Room = (props) => {
  const ppp = 4; // participants per page
  const history = useHistory();
  const { room, openSideBar, roomProps, updateRoomProps, videoProps, updateVideoProps, roomName, userId, username } = useAppContext();

  // Initializing Room Stuff (TODO: move to WorkoutDisplay)
  const modifyVideoState = useCallback((paramsToChange) => {
    if (youtubeRef.current !== null) return;
    const { playing, seekTime } = paramsToChange;
    if (playing !== undefined) {
      updateVideoProps({ playing });
    }
    if (seekTime !== undefined) {
      youtubeRef.current.seekTo(seekTime);
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
    // give data to new user joining
    const getVideoSyncHandler = ({ id }) => {
      if (youtubeRef.current !== null) {
        let params = {
          id: id,
          ...videoProps,
          seekTime: youtubeRef.current.getCurrentTime(),
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
      updateRoomProps({ ...receivedRoomProps });
    };
    const startVideoSyncHandler = (videoProps) => {
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
    sckt.socket.emit('join', { room: roomName, uid: userId, displayName: username });
  }, [roomName, userId, username]);


  // sending sync video
  const youtubeRef = useRef(null);
  const drawerWidth = 360;

  // handels leader leaves server
  useEffect(() => {
    const handler = () => {
      alert('Room has closed due to leader leaving');
      history.push(RoutesEnum.Home)
    }
    sckt.socket.on('killroom', handler);
    return () => sckt.socket.off('killroom', handler);
  }, [history]);

  const useStyles = makeStyles(theme => ({
    content: {
      position: "fixed",
      transition: theme.transitions.create("padding", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      paddingRight: drawerWidth + 16,
      top: "64px",
      bottom: "80px",
      overflow: "hidden",
    },
    contentShift: {
      transition: theme.transitions.create("padding", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      paddingRight: 0,
    },
    abRoot: {
      backgroundColor: "rgba(0, 0, 0, 0.87)",
      boxShadow: "none",
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
      <AppBar
        position="sticky"
        bgcolor="text.primary"
        classes={{ root: classes.abRoot }}
      >
        <TopBar />
      </AppBar>
      <Box
        bgcolor="text.primary"
        data-test="roomComponent"
        style={{ position: "fixed", minHeight: "100%", width: "100%" }}
      >
        <Box
          width="100%"
          className={`${classes.content} ${openSideBar ? "" : classes.contentShift
            }`}
        >
          <WorkoutDisplay ppp={ppp} youtubeRef={youtubeRef}></WorkoutDisplay>
        </Box>
        <Box style={{ position: "fixed", width: "100vw", bottom: 0 }}>
          <BottomControl />
        </Box>
        <SideBar
          drawerWidth={drawerWidth}
        />
      </Box>
    </React.Fragment>
  );
};

export default Room;
