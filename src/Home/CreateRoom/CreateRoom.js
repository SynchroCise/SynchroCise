import React, {useContext, useCallback, useState, useEffect} from "react";
import {useHistory} from 'react-router-dom'
// import "../../media/CoLab.css";
import youtubeimg from "../../media/workout.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import {AppContext} from "../../AppContext"
import { RoutesEnum } from '../../App'
import Video from "twilio-video";
// import { defaultWorkout } from "../../Room/CustomWorkout/DefaultWorkout"
import { makeStyles } from "@material-ui/core/styles";
import { FormControlLabel, Switch, IconButton, ListItem, ListItemText, Box, Typography, TextField, InputAdornment, Grid,} from '@material-ui/core';
import { Table, TableBody, TableCell, TableHead, TableRow, Collapse } from '@material-ui/core';

import { PersonOutlined, CreateOutlined, Add, ArrowBack, ArrowForward, KeyboardArrowDown, KeyboardArrowUp } from '@material-ui/icons';
import { FixedSizeList } from 'react-window';
import moment from 'moment'


// this component renders form to be passed to VideoChat.js
const CreateRoom = () => {
  const {userId, connecting, username, roomName, workout, handleSetRoom, handleUsernameChange, handleSetConnecting, handleSetWorkout, handleSetOpenAuthDialog} = useContext(AppContext)
  const history = useHistory()
  const [selectedWorkout, setSelectedWorkout] = useState(0);
  const [defaultWorkout, setDefaultWorkout] = useState([]);

  useEffect(() => {
    fetch("/api/workouts", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json()).then((res) => {
      setDefaultWorkout(res)
      handleSetWorkout(res[selectedWorkout])
    });
  }, []);
   
  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      handleSetConnecting(true);
  
      const data = await fetch("/video/token", {
        method: "POST",
        body: JSON.stringify({
          identity: username,
          room: roomName,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.json());
      Video.connect(data.token, {
        name: roomName,
        bandwidthProfile: {
          mode: 'collaboration',
          maxSubscriptionBitrate: 2400000,
          renderDimensions: {
            high: {width: 1080, height: 720},
            standard: {width: 640, height: 480},
            low: {width: 320, height: 240}
          }
        }
      })
        .then((room) => {
          room.localParticipant.tracks.forEach(localTracks => {
            localTracks.setPriority('high')
          });

          // Creates a room in the server
          fetch("/api/rooms", {
            method: "POST",
            body: JSON.stringify({
              name: room.name,
              sid: room.sid,
              workoutID: workout.id,
              workoutType: 'vid',
            }),
            headers: {
              "Content-Type": "application/json",
            },
          }).then((res) => res.text().then((res) => {
            handleSetRoom(room);
            handleSetConnecting(false);
            history.push(RoutesEnum.Room)
          })).catch((err) => {
            console.error(err);
            handleSetConnecting(false);
          });
        })
        .catch((err) => {
          console.error(err);
          handleSetConnecting(false);
        });
    },
    [roomName, username, workout]
  );

  const handleSelect = value => () => {
    setSelectedWorkout(value)
    handleSetWorkout(defaultWorkout[value])
  }

  useEffect(() => {
 }, [selectedWorkout]);

  const Row = ({row, index}) => {
    const [open, setOpen] = useState(false);
    return (
      <React.Fragment>
        <TableRow
          key={index}
          classes={{ hover: classes.hover, selected: classes.selected }}
          className={classes.tableRow}
          hover
          selected={index == selectedWorkout}>
          <TableCell padding='checkbox'>
            <IconButton onClick={() => setOpen(!open)}>
              {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          </TableCell>
          <TableCell className={classes.tableCell} onClick={handleSelect(index)}>{row.workoutName}</TableCell>
          <TableCell className={classes.tableCell} onClick={handleSelect(index)} align="right">{row.userId}</TableCell>
          <TableCell className={classes.tableCell} onClick={handleSelect(index)} align="right">{fancyTimeFormat(row.exercises.reduce((a, b) => a + parseInt(b.time), 0))}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Typography variant="h6" gutterBottom component="div">
                Exercises
              </Typography>
              <Table>
                <TableBody>
                  {row.exercises.map((exerciseRow, exerciseIndex) => (
                    <TableRow key={exerciseIndex}>
                      <TableCell>{exerciseRow.exercise}</TableCell>
                      <TableCell align="right">{fancyTimeFormat(exerciseRow.time)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Collapse>
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  }

  // https://stackoverflow.com/questions/3733227/javascript-seconds-to-minutes-and-seconds
  const fancyTimeFormat = (duration) =>
  {   
      // Hours, minutes and seconds
      var hrs = ~~(duration / 3600);
      var mins = ~~((duration % 3600) / 60);
      var secs = ~~duration % 60;

      // Output like "1:01" or "4:03:59" or "123:03:59"
      var ret = "";

      if (hrs > 0) {
          ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
      }

      ret += "" + mins + ":" + (secs < 10 ? "0" : "");
      ret += "" + secs;
      return ret;
  }

  const useStyles = makeStyles(theme => ({
    containedButton: {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      "&:hover, &.Mui-focusVisible": { backgroundColor: theme.palette.primary.dark }
    },
    blackButton: {
      color: "black"
    },
    tableRow: {
      "&$selected, &$selected:hover": {
        backgroundColor: theme.palette.primary.main
      },
      '& > *': {
        borderBottom: 'unset',
      },
    },
    tableCell: {
      "$selected &": {
        color: theme.palette.primary.contrastText,
      }
    },
    hover: {},
    selected: {}
  }));
  const classes = useStyles();

  const workoutListMarkup = (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell/>
          <TableCell><b>Workout</b></TableCell>
          <TableCell align="right"><b>Created By</b></TableCell>
          <TableCell align="right"><b>Time</b></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        { defaultWorkout.map((row, index) => <Row key={index} row={row} index={index}/>) }
      </TableBody>
    </Table>
  )

  const handleAddWorkout = () => {
    if (userId) {
      history.push(RoutesEnum.CreateWorkout);
    } else {
      handleSetOpenAuthDialog(true);
    }
  }

  return (
    <Box display="flex" alignItems="center" justifyContent="center" mx={12} my={6}>
      <form onSubmit={handleSubmit}>
        <Grid container justify="center" spacing={4} wrap="nowrap">
          <Grid item xs={1}>
            <IconButton className={classes.blackButton} onClick={()=>{history.push(RoutesEnum.Home)}}>
              <ArrowBack/>
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
            <Grid item xs={7}/>
            <Grid item xs={5}>
              <TextField
                label="Display Name"
                variant="outlined"
                fullWidth
                value={username}
                onChange={handleUsernameChange}
                readOnly={connecting}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlined />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={7}/>
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
                <Typography variant="h4" style={{flexGrow: 1}}>Workouts</Typography>
              </Grid>
              <Grid item>
                <IconButton onClick={handleAddWorkout} className={classes.blackButton}><Add /></IconButton>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Box width="100%">{workoutListMarkup}</Box>
            </Grid>
          </Grid>
          <Grid item xs={1}>
            <Box height="100%" display="flex" alignItems="flex-end">
              <IconButton
                color="primary"
                className={classes.containedButton}
                type="submit">
                <ArrowForward/>
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default CreateRoom;