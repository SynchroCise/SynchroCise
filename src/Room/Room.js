import React, { useEffect, useState, useRef, useCallback } from "react";
import Participant from "./Participant/Participant";
import { RoutesEnum } from '../App'
import { useHistory } from 'react-router-dom'
import SideBar from "./SideBar/SideBar";
import BottomControl from "./BottomControl/BottomControl"
import { useAppContext } from "../AppContext";
import { Typography, Box, IconButton } from '@material-ui/core';
import Video from './Video/Video';
import { sckt } from '../Socket';
import { makeStyles } from "@material-ui/core/styles";
import { Redirect } from "react-router-dom";
import * as requests from "../utils/requests"
import { ArrowForward, ArrowBack } from '@material-ui/icons';

// using roomName and token, we will create a room
const Room = (props) => {
  const [participants, setParticipants] = useState([]);
  const [participantPage, setParticipantPage] = useState(0);
  const ppp = 4; // participants per page
  const history = useHistory();
  const { username, room, userId, openSideBar, roomProps, updateRoomProps, workoutType, videoProps, updateVideoProps, setNameArray, pinnedParticipantId } = useAppContext();

  // Initializing Room Stuff
  const modifyVideoState = useCallback((paramsToChange) => {
    if (playerRef.current !== null) return;
    const { playing, seekTime } = paramsToChange;
    if (playing !== undefined) {
      updateVideoProps({ playing });
    }
    if (seekTime !== undefined) {
      playerRef.current.seekTo(seekTime);
    }
  }, [updateVideoProps]);

  //handle people leaving and entering
  const participantDisconnected = useCallback((participant) => {
    setParticipants((prevParticipants) =>
      [...prevParticipants].filter((p) => p.sid !== participant.sid)
    );
    setNameArray((prevParticipants) =>
      [...prevParticipants].filter((p) => p.sid !== participant.sid));
  }, [setNameArray]);

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
    const handler = ({ name, sid }) => {
      setNameArray((oldArray) => [...oldArray, { name, sid }]);
    }
    sckt.socket.on("newUser", handler);
    return () => sckt.socket.off('newUser', handler);
  }, [setNameArray]);


  // sending sync video
  const playerRef = useRef(null);
  const drawerWidth = 360;

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

    room.on("participantConnected", participantConnected);
    room.on("participantDisconnected", participantDisconnected);
    room.participants.forEach(participantConnected);

    return () => {
      room.off("participantConnected", participantConnected);
      room.off("participantDisconnected", participantDisconnected);
    };
  }, [room, participantDisconnected]);

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
  }, [room, setNameArray]);

  // joins the room through sockets
  useEffect(() => {
    if (!room) return;
    const sid = room.localParticipant.sid;
    const name = username;
    setNameArray((oldArray) => [...oldArray, { name, sid }]);
    sckt.socket.emit('join', { name, room: room.sid, sid, userId }, ({ id, leaderList }) => { });
  }, [room, userId, username, setNameArray]);

  // handels leader leaves server
  useEffect(() => {
    const handler = () => {
      alert('Room has closed due to leader leaving');
      history.push(RoutesEnum.Home)
    }
    sckt.socket.on('killroom', handler);
    return () => sckt.socket.off('killroom', handler);
  }, [history]);

  // handels a random person leaving the server
  useEffect(() => {
    sckt.socket.on('leaver', participantDisconnected);
    return () => sckt.socket.off('leaver', participantDisconnected);
  });

  // gets first joined participant
  const getFirstParticipantId = useCallback(() => {
    if (participants.length === 0) return ""
    const sortedParticipants = participants.sort((a, b) => a.startDate - b.startDate);
    return sortedParticipants[0].sid
  }, [participants]);

  // get all participants
  const getAllRemoteParticipants = useCallback(() => {
    if (!room) return [];
    let all_participants = [...participants, room.localParticipant];
    const newPinnedParticipantId = (pinnedParticipantId === "") ? getFirstParticipantId() : pinnedParticipantId
    all_participants = (workoutType === 'yt') ? all_participants : all_participants.filter((participant) => participant.sid !== newPinnedParticipantId)
    return all_participants
  }, [participants, pinnedParticipantId, workoutType, getFirstParticipantId, room]);

  // resets participant page if there are no remote participants
  useEffect(() => {
    if (!room) return;
    let all_participants = getAllRemoteParticipants();
    const viewer_len = all_participants.slice(participantPage * ppp, participantPage * ppp + ppp).length
    if (viewer_len === 0 && participantPage !== 0) {
      setParticipantPage(0)
    }
  }, [participants, participantPage, room, workoutType, pinnedParticipantId, getAllRemoteParticipants]);

  // show all the particpants in the room
  const remoteParticipants = () => {
    if (!room) return;
    if (participants.length < 1) {
      return <Typography color="secondary">No Other Participants</Typography>;
    }
    let all_participants = getAllRemoteParticipants();
    return (all_participants
      .slice(participantPage * ppp, participantPage * ppp + ppp)
      .map((participant, index) => (
        <Participant
          key={participant.sid}
          participant={participant}
          data-test="remoteParticipantComponent"
        />
      )));
  };

  //set functionality to scroll through participant screens
  const handleParticipantPage = (pageDelta) => {
    if (!room) return;
    let all_participants = getAllRemoteParticipants();
    const newPageNum = participantPage + pageDelta;
    if (all_participants.slice(newPageNum * ppp, newPageNum * ppp + ppp).length > 0) {
      setParticipantPage(newPageNum)
    }
  }

  const leaderParticipant = () => {
    if (!room) return;
    const newPinnedParticipantId = (pinnedParticipantId === "") ? getFirstParticipantId() : pinnedParticipantId
    const participant = participants.filter(
      (participant) => participant.sid === newPinnedParticipantId
    )[0];
    if (!participant) {
      return (
        <Participant
          key={room.localParticipant.sid}
          participant={room.localParticipant}
          data-test="leaderParticipantComponent"
        />
      );
    }
    return (
      <Participant
        key={participant.sid}
        participant={participant}
        data-test="leaderParticipantComponent"
      />
    );
  };

  const useStyles = makeStyles(theme => ({
    content: {
      position: "absolute",
      transition: theme.transitions.create('padding', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      paddingRight: drawerWidth + 16,
      top: 0,
      bottom: 80,
      overflow: "hidden"
    },
    contentShift: {
      transition: theme.transitions.create('padding', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      paddingRight: 0,
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
  //height go from 70 to 90 and remove grid item container if only one person

  return (
    <React.Fragment>
      <Box
        bgcolor="text.primary"
        data-test="roomComponent"
        style={{ position: "fixed", minHeight: "100%", width: "100%" }}
      >
        <Box
          width="100%"
          className={`${classes.content} ${openSideBar ? '' : (classes.contentShift)}`}
        >
          <Box height={participants.length > 0 ? "70%" : "100%"}>
            {room && (workoutType === 'vid') ? leaderParticipant() : <Video playerRef={playerRef} data-test="youtubeComponent" />}
          </Box>

          {participants.length > 0 &&
            <Box height="30%" flexDirection="row" display="flex" justifyContent="space-around">
              <IconButton color="secondary" onClick={() => handleParticipantPage(-1)} data-test="backPPButton">
                <ArrowBack style={{ fill: "white" }} />
              </IconButton>
              {
                remoteParticipants()
              }
              <IconButton color="secondary" onClick={() => handleParticipantPage(1)} data-test="forwardPPButton">
                <ArrowForward style={{ fill: "white" }} />
              </IconButton>
            </Box>
          }
        </Box>
        <Box style={{ position: "fixed", width: "100vw", bottom: 0 }}>
          <BottomControl
            participantPage={participantPage}
            setParticipantPage={setParticipantPage}
            getAllRemoteParticipants={getAllRemoteParticipants}
            ppp={ppp}
          />
        </Box>
        <SideBar
          currUser={room.localParticipant}
          users={participants}
          drawerWidth={drawerWidth}
        />
      </Box>
    </React.Fragment>
  );
};

export default Room;
