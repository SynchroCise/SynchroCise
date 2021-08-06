import React, { useState, useEffect } from "react";
import { useHistory } from 'react-router-dom'
import { useAppContext } from "../../AppContext"
import { RoutesEnum } from '../../App'
import WorkoutTable from "./WorkoutTable"
import { makeStyles } from "@material-ui/core/styles";
import { FormControlLabel, Switch, Toolbar, IconButton, Box, Typography, TextField, InputAdornment, Grid } from '@material-ui/core';
import { PersonOutlined, CreateOutlined, Add, ArrowBack, ArrowForward } from '@material-ui/icons';
import * as requests from "../../utils/requests"


// this component renders form to be passed to VideoChat.js
const CreateRoom = () => {
  const { userId, connecting, username, roomName, workout, handleSetRoom, handleUsernameChange, handleSetConnecting, handleSetWorkout, handleSetOpenAuthDialog, makeCustomRoom, createTempUser, isLoggedIn } = useAppContext()
  const history = useHistory()

  // intialize custom room code
  useEffect(() => {
    makeCustomRoom();
  }, [makeCustomRoom]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    handleSetConnecting(true);
    const tempUserId = (isLoggedIn) ? userId : (await createTempUser(username));
    const tok_res = await requests.twilioToken(tempUserId, roomName);
    if (!tok_res.ok) { handleSetConnecting(false); return; }
    const token = tok_res.body.token;
    const room = await requests.createTwilioRoom(token, roomName);
    if (!room) { handleSetConnecting(false); return; }
    // Creates a room in the server
    const room_res = await requests.createRoom(room, workout.id, 'vid');
    if (!room_res.ok) { handleSetConnecting(false); return; }
    handleSetRoom(room);
    handleSetConnecting(false);
    history.push(`${RoutesEnum.Room}/${roomName.substring(0, 6).toUpperCase()}`)
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