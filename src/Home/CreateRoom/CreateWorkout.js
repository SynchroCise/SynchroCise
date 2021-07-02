import React, { useCallback, useState, useEffect } from "react";
import { useHistory } from 'react-router-dom'
import { useAppContext } from "../../AppContext"
import { RoutesEnum } from '../../App'
import { makeStyles } from "@material-ui/core/styles";
import { IconButton, Box, Typography, TextField, InputAdornment, Grid, Button } from '@material-ui/core';
import { Table, TableBody, TableCell, TableRow } from '@material-ui/core';
import { ArrowForward, Close, CreateOutlined, Add } from '@material-ui/icons';
import * as requests from "../../utils/requests"

// this component renders form to be passed to VideoChat.js
const CreateWorkout = ({ initExercises = [{ 'exercise': '', 'time': '' }] }) => {
  const history = useHistory()
  const { connecting, handleSetConnecting } = useAppContext();
  const [workoutName, setWorkoutName] = useState('')
  const [title, setTitle] = useState('Create New Workout')
  const [exercises, setExercises] = useState(initExercises)
  const [selectedExercise, setSelectedExercise] = useState(0)
  const [badExerciseIndices, setBadExerciseIndices] = useState([])

  const useStyles = makeStyles(theme => ({
    containedButton: {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      "&:hover, &.Mui-focusVisible": { backgroundColor: theme.palette.primary.dark }
    },
    errorRow: {
      backgroundColor: theme.palette.error.light
    },
    blackButton: {
      color: "black",
    },
    addWorkout: {
      borderRadius: 10,
    },
  }));
  const classes = useStyles();
  const handleWorkoutName = useCallback((event) => {
    setWorkoutName(event.target.value);
  }, []);

  const editWorkout = async (id) => {
    const res = await requests.getUserWorkout(id);
    if (!res.ok) {
      return false;
    }
    console.log(res)
    setExercises(res.body.exercises);
    setWorkoutName(res.body.workoutName);
    setTitle("Edit Workout");
    return res;
  }

  const handleAddExercise = () => {
    // checks current selected exercise
    const exercise = { 'exercise': '', 'time': '' };
    setSelectedExercise(exercises.length);
    setExercises([...exercises, exercise]);
  }

  const handleExcerciseName = (event) => {
    let newArr = [...exercises];
    newArr[selectedExercise].exercise = event.target.value;
    setExercises(newArr);
  }

  const handleTime = (event) => {
    let newArr = [...exercises];
    newArr[selectedExercise].time = event.target.value;
    setExercises(newArr);
  }

  const handleSubmit = async (event) => {
    let res;
    event.preventDefault();
    handleSetConnecting(true);
    setSelectedExercise(null);
    if (!(exercises.length > 0 && badExerciseIndices.length === 0)) { handleSetConnecting(false); return; }
    const newWorkout = { workoutName, exercises }
    if (title === "Create New Workout") {
      res = await requests.addWorkout(newWorkout);
    } else {
      res = await requests.editWorkout(newWorkout, window.location.href.split("/")[4]);
    }
    if (!res.ok) {
      handleSetConnecting(false);
      alert(res.body.message);
      return;
    }
    handleSetConnecting(false);
    history.push(RoutesEnum.CreateRoom);
  }

  const handleSelected = (index) => {
    setSelectedExercise(index);
  }

  const handleRemoveRow = (index) => {
    const newArr = [...exercises];
    newArr.splice(index, 1);
    setExercises(newArr);
    if (selectedExercise === index) setSelectedExercise(null);
    else if (selectedExercise > index) setSelectedExercise(selectedExercise - 1);
  }
  // updates bad indices
  useEffect(() => {
    const newBadExerciseIndices = exercises.reduce((arr, e, i) => {
      if (!(e.time && e.exercise && !isNaN(parseInt(e.time)))) arr.push(i);
      return arr;
    }, [])
    setBadExerciseIndices(newBadExerciseIndices);
  }, [exercises]);

  //Checks to see if it is an edit workout or create workout and rebinds defaults
  useEffect(() => {
    let url = window.location.href.split("/");
    console.log(url[3])
    console.log(url[4])
    if (url[3] === "edit-workout") {
      editWorkout(url[4]);
    }
  }, []);

  return (
    <Box display="flex" alignItems="center" justifyContent="center" mx={12} my={6} data-test="createWorkoutComponent">
      <form onSubmit={handleSubmit} data-test="createWorkoutForm">
        <Grid container justify="center" spacing={4} wrap="nowrap">
          <Grid item xs={1}>
            <IconButton
              className={classes.blackButton}
              onClick={() => { history.push(RoutesEnum.CreateRoom) }}
              data-test="backButton">
              <Close />
            </IconButton>
          </Grid>
          <Grid item container xs spacing={2}>
            <Grid item xs={12}>
              <Box mb={4}><Typography variant="h4">{title}</Typography></Box>
            </Grid>
            <Grid item xs={5}>
              <TextField
                placeholder="Workout Name"
                variant="outlined"
                fullWidth
                value={workoutName}
                onChange={handleWorkoutName}
                readOnly={connecting}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CreateOutlined />
                    </InputAdornment>
                  ),
                }}
                data-test="workoutNameField"
              />
            </Grid>
            <Grid item xs={7} />
            <Grid item xs={12}>
              <Table>
                <TableBody>
                  {exercises.map((exerciseRow, index) => (
                    <TableRow key={index} hover selected={selectedExercise === index}
                      className={(badExerciseIndices.includes(index) ? classes.errorRow : '')} data-test="inputRow">
                      {
                        selectedExercise === index ? (
                          <React.Fragment>
                            <TableCell>
                              <TextField
                                margin='none'
                                label="Excercise Name"
                                value={exerciseRow.exercise}
                                onChange={handleExcerciseName}
                                required
                                data-test="exerciseNameField">
                              </TextField>
                            </TableCell>
                            <TableCell align="right">
                              <TextField
                                margin='none'
                                label="Seconds"
                                value={exerciseRow.time}
                                onChange={handleTime}
                                required
                                data-test="timeField">
                              </TextField>
                            </TableCell>
                          </React.Fragment>
                        ) : (
                          <React.Fragment>
                            <TableCell onClick={() => handleSelected(index)} data-test="exerciseCell">
                              <Typography variant="body1">{exerciseRow.exercise}</Typography>
                            </TableCell>
                            <TableCell align="right" onClick={() => handleSelected(index)} data-test="timeCell">
                              <Typography variant="body1">{exerciseRow.time}</Typography>
                            </TableCell>
                          </React.Fragment>
                        )
                      }
                      <TableCell padding="checkbox">
                        <IconButton onClick={() => handleRemoveRow(index)} data-test="removeButton"><Close /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Grid>
            <Grid item xs={12}>
              <Button
                fullWidth
                className={classes.addWorkout}
                variant="outlined"
                size="large"
                onClick={handleAddExercise}
                startIcon={<Add />}
                data-test="addWorkoutButton">
                Add New Workout
              </Button>
            </Grid>
          </Grid>
          <Grid item xs={1}>
            <Box height="100%" display="flex" alignItems="flex-end">
              <IconButton
                color="primary"
                className={classes.containedButton}
                type="submit">
                <ArrowForward />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  )
};

export default CreateWorkout;