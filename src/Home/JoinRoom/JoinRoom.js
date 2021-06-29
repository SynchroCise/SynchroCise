import React, {useEffect, useState, useRef} from "react";
import {useHistory} from 'react-router-dom'
import {useAppContext} from "../../AppContext"
import Video from "twilio-video";
import { RoutesEnum } from '../../App'
import { IconButton, TextField, Box, Typography, Grid } from '@material-ui/core';
import { ArrowBack, ArrowForward, Videocam, VideocamOff, Mic, MicOff } from '@material-ui/icons';
import { makeStyles } from "@material-ui/core/styles";
import * as requests from "../../utils/requests"

// this component renders form to be passed to VideoChat.js
const JoinRoom = (props) => {
  const {connecting, username, roomName, handleUsernameChange, handleSetRoom, isLoggedIn, handleSetConnecting, handleSetRoomName, createTempUser, userId} = useAppContext()
  const [videoTracks, setVideoTracks] = useState([]);
  const [audioTracks, setAudioTracks] = useState([]);
  const [vid, setVid] = useState(true);
  const [mic, setMic] = useState(true);

  const videoRef = useRef(); 
  const videoContainerRef = useRef();
  const history = useHistory()

  // create local video track
  useEffect(() => {
    if (!roomName) return;
    let isMounted = true;
    async function getLocalVideoTrack() {
      const videoTrack = await Video.createLocalVideoTrack();
      if(isMounted) { setVideoTracks((prevVideoTrack) => [...prevVideoTrack, videoTrack]); }
    }
    async function getLocalAudioTrack() {
      const audioTrack = await Video.createLocalAudioTrack();
      if(isMounted) { setAudioTracks((prevAudioTrack) => [...prevAudioTrack, audioTrack]); }
    }
    getLocalVideoTrack()
    getLocalAudioTrack()
    return () => { isMounted = false }
  }, [roomName])

  useEffect(() => {
    const videoTrack = videoTracks[0];
    if (videoTrack) {
      videoTrack.attach(videoRef.current);
      return () => {
        videoTrack.detach();
      };
    }
  }, [videoTracks]);

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
        handleSetRoomName(roomCode)
      }
    };
    checkRoom();
  }, [history.push, handleSetRoomName, props.match.params.roomCode]);


  const handleMic = () => {
    audioTracks.forEach(track => {
      (mic) ? track.disable() : track.enable()
    });
    setMic(!mic);
  };

  const handleVid = () => {
    videoTracks.forEach(track => {
      (vid) ? track.disable() : track.enable()
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
    const tempUserId = (isLoggedIn) ? userId : (await createTempUser(username));
    const tok_res = await requests.twilioToken(tempUserId, roomName);
    if (!tok_res.ok) { handleSetConnecting(false); return; }
    const token = tok_res.body.token;
    const tracks = videoTracks.concat(audioTracks);
    const room = await requests.joinTwilioRoom(token, roomName, tracks);
    if (!room) { handleSetConnecting(false); return; }
    room.localParticipant.tracks.forEach(localTracks => {
      localTracks.setPriority('low')
    });
    handleSetConnecting(false);
    await handleSetRoom(room);
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
              onClick={()=>{history.push(RoutesEnum.Home)}}
              data-test="backButton">
              <ArrowBack/>
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
            <Grid item xs={7}/>
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
            <Grid item xs={7}/>
            <Grid item xs={12}><hr/></Grid>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="center">
                <Typography variant="h5">How you'll appear</Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="center" ref={videoContainerRef}>
              {(videoRef) ? <video ref={videoRef} autoPlay={true} style={{width: "40%", maxHeight: "40%"}}/> : ''}
              </Box>
            </Grid>
            <Grid item xs={1}>
              <IconButton
                color="primary"
                className={classes.blackContainedButton}
                onClick={handleVid}
                data-test="vidButton">
                {vid ? <Videocam data-test="vidIcon"/> : <VideocamOff data-test="vidOffIcon"/>}
              </IconButton>
            </Grid>
            <Grid item xs={1}>
              <IconButton
                color="primary"
                className={classes.blackContainedButton}
                onClick={handleMic}
                data-test="micButton">
                {mic ? <Mic data-test="micIcon" /> : <MicOff data-test="micOffIcon"/>}
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
                <ArrowForward/>
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default JoinRoom;
