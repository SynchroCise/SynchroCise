import React, { useEffect, useState } from "react";
import { useHistory } from 'react-router-dom'
import { useAppContext } from "../../AppContext"
import { RoutesEnum } from '../../App'
import WorkoutTable from "./WorkoutTable"
import { makeStyles } from "@material-ui/core/styles";
import { FormControlLabel, Switch, Toolbar, IconButton, Box, Typography, TextField, InputAdornment, Grid } from '@material-ui/core';
import { PersonOutlined, CreateOutlined, Add, ArrowBack, ArrowForward } from '@material-ui/icons';
import * as requests from "../../utils/requests"
import { createConnection, buildOptions } from "../../utils/jitsi"


// this component renders form to be passed to VideoChat.js
const CreateRoom = () => {
  const { JitsiMeetJS, userId, connecting, username, roomName, workout, handleSetRoom, handleUsernameChange, handleSetConnecting, handleSetOpenAuthDialog, makeCustomRoom, createTempUser, isLoggedIn, setLocalTracks } = useAppContext()
  const history = useHistory()
  const [connection, setConnection] = useState(null);

  // intialize custom room code
  useEffect(() => {
    makeCustomRoom();
  }, [makeCustomRoom]);

  useEffect(() => {
    const options = buildOptions(roomName.toLowerCase());
    const onConnectionSuccess = async () => {
      const room = connection.initJitsiConference(roomName.toLowerCase(), options.conference)
      handleSetRoom(room);
      room.setSenderVideoConstraint(720);

      // Sets Local Participants' property
      const tempUserId = (isLoggedIn) ? userId : (await createTempUser(username));
      room.setLocalParticipantProperty('displayName', username);
      room.setLocalParticipantProperty('userId', tempUserId);

      // Creates a room in the server
      const room_res = await requests.createRoom({ name: roomName.toLowerCase(), sid: '' }, workout.id, 'vid');
      if (!room_res.ok) { handleSetConnecting(false); return; }

      handleSetConnecting(false);
      history.push(`${RoutesEnum.Room}/${roomName.substring(0, 6).toUpperCase()}`)
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
    }

    if (JitsiMeetJS && connection) {
      connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, onConnectionSuccess);
      connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_FAILED, onConnectionFailed);
      connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED, disconnect);
      connection.connect()
      JitsiMeetJS.createLocalTracks({
        devices: [ 'audio', 'video' ],
        maxFps: 24,
        resolution: 720,
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
  }, [connection, JitsiMeetJS]);

  const handleSubmit = (event) => {
    event.preventDefault();
    handleSetConnecting(true);
    setConnection(createConnection(JitsiMeetJS, roomName.toLowerCase()));
  }

  const useStyles = makeStyles(theme => ({
    containedButton: {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      "&:hover, &.Mui-focusVisible": { backgroundColor: theme.palette.primary.dark }
    },
    blackButton: {
      color: "black"
    }
  }));
  const classes = useStyles();

  const handleAddWorkout = () => {
    if (isLoggedIn) {
      history.push(RoutesEnum.CreateWorkout);
    } else {
      handleSetOpenAuthDialog(true);
    }
  }

  return (
    <Box display="flex" alignItems="center" justifyContent="center" mx={12} my={6} data-test="createRoomComponent">
      <form onSubmit={handleSubmit} data-test="createRoomForm">
        <Toolbar />
        <Grid container justify="center" spacing={4} wrap="nowrap">
          <Grid item xs={1}>
            <IconButton className={classes.blackButton} onClick={() => { history.push(RoutesEnum.Home) }} data-test="backButton">
              <ArrowBack />
            </IconButton>
          </Grid>
          <Grid container item xs spacing={2}>
            <Grid item xs={12}>
              <Box mb={4}><Typography variant="h4">Custom Workout</Typography></Box>
            </Grid>
            <Grid item xs={5}>
              <TextField
                label="Room Code"
                variant="outlined"
                fullWidth
                value={roomName.substring(0, 6).toUpperCase()}
                readOnly
                disabled
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CreateOutlined />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={7} />
            <Grid item xs={5}>
              <TextField
                label="Display Name"
                variant="outlined"
                fullWidth
                value={username}
                onChange={handleUsernameChange}
                readOnly={connecting}
                required
                data-test="usernameField"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlined />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={7} />
            <Grid item>
              <Box my={3}>
                <FormControlLabel
                  control={
                    <Switch
                      color="primary"
                    />
                  }
                  labelPlacement="end"
                  label="Each participant must be approved before joining"
                />
              </Box>
            </Grid>
            <Grid container item justify="space-between" xs={12}>
              <Grid item>
                <Typography variant="h4" style={{ flexGrow: 1 }}>Workouts</Typography>
              </Grid>
              <Grid item>
                <IconButton onClick={handleAddWorkout} className={classes.blackButton} data-test="addWorkoutButton"><Add /></IconButton>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              {
                (isLoggedIn) ?
                  (<Box width="100%">
                    <WorkoutTable />
                  </Box>) : null
              }
            </Grid>
          </Grid>
          <Grid item xs={1}>
            <Box height="100%" display="flex" alignItems="flex-end">
              <IconButton
                color="primary"
                className={classes.containedButton}
                disabled={!roomName || connecting}
                type="submit">
                <ArrowForward />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default CreateRoom;