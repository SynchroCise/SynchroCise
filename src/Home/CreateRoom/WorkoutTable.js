
import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useAppContext } from "../../AppContext";
import { fancyTimeFormat } from "../../utils/utils";
import { Table, TableBody, TableCell, TableHead, TableRow, Collapse, IconButton, Typography } from '@material-ui/core';
import { KeyboardArrowDown, KeyboardArrowUp, Close, Create } from '@material-ui/icons';
import * as requests from "../../utils/requests"
import { RoutesEnum } from '../../App'
import { useHistory } from 'react-router-dom'

const WorkoutTable = () => {
  const { handleSetWorkout, isLoggedIn, setWorkoutType } = useAppContext();
  const history = useHistory();
  const [selectedWorkout, setSelectedWorkout] = useState(0);
  const [workoutList, setWorkoutList] = useState([]);

  useEffect(() => {
    const initWorkouts = async () => {
      if (!isLoggedIn) return setWorkoutList([]);
      const res = await requests.getUserWorkouts();
      if (!res.ok) return setWorkoutList([]);
      setWorkoutList(res.body);
      if (res.body.length > 0) {
        setWorkoutType('vid')
        handleSetWorkout(res.body[0]);
      }
    }
    initWorkouts();
  }, [isLoggedIn, handleSetWorkout, setWorkoutType]);

  const handleSelect = value => () => {
    setSelectedWorkout(value)
    handleSetWorkout(workoutList[value])
  }

  const handleDeleteWorkout = (workoutId) => {
    const result = window.confirm("Are you sure you want to delete this workout?")
    if (!result) return;
    requests.deleteWorkout(workoutId)
    const i = workoutList.findIndex(element => element.id === workoutId);
    const array = [...workoutList];
    if (i === -1) return;
    array.splice(i, 1)
    setWorkoutList(array)
  };

  const handleEditWorkout = (workout) => {
    history.push(`${RoutesEnum.EditWorkout}/${workout.id}`);
  }
  return (
    <Table data-test="workoutTableComponent">
      <TableHead>
        <TableRow>
          <TableCell />
          <TableCell><b>Workout</b></TableCell>
          <TableCell align="right"><b>Created By</b></TableCell>
          <TableCell align="right"><b>Time</b></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {workoutList.map((row, index) =>
          <Row key={index}
            row={row}
            index={index}
            handleSelect={handleSelect}
            handleDeleteWorkout={handleDeleteWorkout}
            handleEditWorkout={handleEditWorkout}
            selectedWorkout={selectedWorkout}
            data-test="rowComponent" />)
        }
      </TableBody>
    </Table>
  );
}

export const Row = ({ row, index, handleSelect, handleDeleteWorkout, selectedWorkout, handleEditWorkout }) => {
  const [open, setOpen] = useState(false);
  // https://stackoverflow.com/questions/3733227/javascript-seconds-to-minutes-and-seconds
  const useStyles = makeStyles(theme => ({
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
  return (
    <React.Fragment>
      <TableRow
        key={index}
        classes={{ hover: classes.hover, selected: classes.selected }}
        className={classes.tableRow}
        hover
        selected={index === selectedWorkout}>
        <TableCell padding='checkbox'>
          <IconButton onClick={() => setOpen(!open)} data-test="collapseButton">
            {open ? <KeyboardArrowUp data-test="arrUp" /> : <KeyboardArrowDown data-test="arrDown" />}
          </IconButton>
        </TableCell>
        <TableCell className={classes.tableCell} onClick={handleSelect(index)} data-test="workoutName">{row.workoutName}</TableCell>
        <TableCell className={classes.tableCell} onClick={handleSelect(index)} align="right" data-test="displayName">{row.displayName}</TableCell>
        <TableCell className={classes.tableCell} onClick={handleSelect(index)} align="right" data-test="exercise">{fancyTimeFormat(row.exercises.reduce((a, b) => a + parseInt(b.time), 0))}</TableCell>
        <TableCell padding='checkbox'>
          <IconButton onClick={() => handleDeleteWorkout(row.id)} data-test="deleteWorkoutButton">
            <Close />
          </IconButton>
        </TableCell>
        <TableCell padding='checkbox'>
          <IconButton onClick={() => handleEditWorkout(row)} data-test="editWorkoutButton">
            <Create />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit data-test="collapseComponent">
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

export default WorkoutTable;