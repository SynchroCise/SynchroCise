import React, { useEffect, useState, useRef } from "react";
import { useHistory } from 'react-router-dom'
import { useAppContext } from "../../AppContext"
import { RoutesEnum } from '../../App'
import { IconButton, TextField, Box, Typography, Grid } from '@material-ui/core';
import { ArrowBack, ArrowForward, Videocam, VideocamOff, Mic, MicOff } from '@material-ui/icons';
import { makeStyles } from "@material-ui/core/styles";
import * as requests from "../../utils/requests"
import { createConnection, buildOptions } from "../../utils/jitsi"


// this component renders form to be passed to VideoChat.js
const JoinRoom = (props) => {
  const { JitsiMeetJS, connecting, username, roomName, handleUsernameChange, handleSetRoom, handleSetConnecting, handleSetRoomName, room, setLocalTracks, localTracks } = useAppContext()
  // const [videoTracks, setVideoTracks] = useState([]);
  // const [audioTracks, setAudioTracks] = useState([]);
  const [vid, setVid] = useState(true);
  const [mic, setMic] = useState(true);

  const videoRef = useRef();
  const videoContainerRef = useRef();
  const history = useHistory()

  // initializes roomcode and userId
  useEffect(() => {
    const checkRoomExists = async (roomCode) => {
      if (!roomCode) return null
      const res = await requests.getRoomByName(roomCode);
      return (res.ok) ? res.body.id : null
    }
    const checkRoom = async () => {
      const roomCode = await checkRoomExists(props.match.params.roomCode);
      if (!roomCode) {
        alert('Room Code does not exist!');
        history.push(RoutesEnum.Home);
      } else {
        handleSetRoomName(roomCode);
      }
    };
    checkRoom();
  }, [history, handleSetRoomName, props.match.params.roomCode]);

  // initializes Jitsi Connection
  useEffect(() => {
    let connection;
    const options = buildOptions(roomName.toLowerCase());
    const onConnectionSuccess = async () => {
      handleSetConnecting(false);
      const room = connection.initJitsiConference(roomName.toLowerCase(), options.conference);
      handleSetRoom(room);
      room.setSenderVideoConstraint(180);
    }
    const onConnectionFailed = () => {
      handleSetConnecting(false);
      console.log('jitsi failed');
    }
    const disconnect = () => {
      handleSetConnecting(false);
      console.log('jitsi disconnect');
    }
    const onLocalTracks = (tracks) => {
      console.log('setLocalTracks');
      setLocalTracks(tracks);
      tracks.forEach((track) => {
        if (track.getType() === 'video') {
          track.attach(videoRef.current);
        }
      });
    }
    handleSetConnecting(true);
    if (!roomName) return;
    if (JitsiMeetJS) {
      console.log('starting connection')
      connection = createConnection(JitsiMeetJS, roomName.toLowerCase());
      connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, onConnectionSuccess);
      connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_FAILED, onConnectionFailed);
      connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED, disconnect);
      connection.connect()
      JitsiMeetJS.createLocalTracks({
        devices: ['audio', 'video'],
        maxFps: 24,
        resolution: 180,
        facingMode: 'user'
      })
        .then(onLocalTracks)
        .catch(error => {
          throw error;
        });
      return () => {
        connection.removeEventListener(JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, onConnectionSuccess);
        connection.removeEventListener(JitsiMeetJS.events.connection.CONNECTION_FAILED, onConnectionFailed);
        connection.removeEventListener(JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED, disconnect);
      }
    }
  }, [roomName]);


  const handleMic = () => {
    localTracks.forEach(track => {
      if (track.getType() === 'audio') {
        (mic) ? track.mute() : track.unmute()
      }
    });
    setMic(!mic);
  };

  const handleVid = () => {
    localTracks.forEach(track => {
      if (track.getType() === 'video') {
        (vid) ? track.mute() : track.unmute()
      }
    });
    setVid(!vid);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    handleSetConnecting(true);
    if (!roomName) {
      handleSetConnecting(false);
      history.push(RoutesEnum.Home)
      return;
    }
    if (!room) { handleSetConnecting(false); return; }
    room.setLocalParticipantProperty('displayName', username);
    handleSetConnecting(false);
    history.push(`${RoutesEnum.Room}/${roomName.substring(0, 6).toUpperCase()}`);
  }
  const useStyles = makeStyles(theme => ({
    containedButton: {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      "&:hover, &.Mui-focusVisible": { backgroundColor: theme.palette.primary.dark }
    },
    blackContainedButton: {
      backgroundColor: "black",
      color: "white",
      "&:hover, &.Mui-focusVisible": { backgroundColor: theme.palette.primary.dark }
    },
    blackButton: {
      color: "black",
    },
  }));
  const classes = useStyles();
  return (
    <Box display="flex" alignItems="center" justifyContent="center" mx={15} my={3} data-test="joinRoomComponent">
      <form onSubmit={handleSubmit} data-test="joinRoomForm">
        <Grid container justify="center" spacing={2} wrap="nowrap">
          <Grid item xs={1} >
            <IconButton
              className={classes.blackButton}
              onClick={() => { history.push(RoutesEnum.Home) }}
              data-test="backButton">
              <ArrowBack />
            </IconButton>
          </Grid>
          <Grid container item xs spacing={2}>
            <Grid item xs={12}>
              <Box mb={2}>
                <Typography variant="h4">
                  {"Room: " + roomName.substring(0, 6).toUpperCase()}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}><b>Room Owner</b></Grid>
            <Grid item xs={6}><b>Today's Workout</b></Grid>
            <Grid item xs={6}>Test User</Grid>
            <Grid item xs={6}>Test Workout!</Grid>
            <Grid item xs={5}>
              <Box mt={1}>
                <TextField
                  placeholder="Username"
                  variant="outlined"
                  fullWidth
                  required
                  value={username}
                  onChange={handleUsernameChange}
                  readOnly={connecting}
                  data-test="usernameField"
                />
              </Box>
            </Grid>
            <Grid item xs={7} />
            <Grid item xs={5}>
              <TextField
                placeholder="Room Code:"
                variant="outlined"
                fullWidth
                value={"Room Code: " + roomName.substring(0, 6).toUpperCase()}
                data-test="roomCodeField"
                disabled
              />
            </Grid>
            <Grid item xs={7} />
            <Grid item xs={12}><hr /></Grid>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="center">
                <Typography variant="h5">How you'll appear</Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="center" ref={videoContainerRef}>
                {(videoRef) ? <video ref={videoRef} autoPlay={true} style={{ width: "40%", maxHeight: "40%" }} /> : ''}
              </Box>
            </Grid>
            <Grid item xs={1}>
              <IconButton
                color="primary"
                className={classes.blackContainedButton}
                onClick={handleVid}
                data-test="vidButton">
                {vid ? <Videocam data-test="vidIcon" /> : <VideocamOff data-test="vidOffIcon" />}
              </IconButton>
            </Grid>
            <Grid item xs={1}>
              <IconButton
                color="primary"
                className={classes.blackContainedButton}
                onClick={handleMic}
                data-test="micButton">
                {mic ? <Mic data-test="micIcon" /> : <MicOff data-test="micOffIcon" />}
              </IconButton>
            </Grid>
          </Grid>
          <Grid item xs={1}>
            <Box height="100%" display="flex" alignItems="flex-end">
              <IconButton
                color="primary"
                className={classes.containedButton}
                type="submit"
                disabled={connecting}>
                <ArrowForward />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default JoinRoom;
