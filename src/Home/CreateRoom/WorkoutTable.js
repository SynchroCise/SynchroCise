
import React, {useState} from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useAppContext } from "../../AppContext";
import { Table, TableBody, TableCell, TableHead, TableRow, Collapse, IconButton, Typography } from '@material-ui/core';
import { KeyboardArrowDown, KeyboardArrowUp, Close } from '@material-ui/icons';
import * as requests from "../../utils/requests"

const WorkoutTable = ({workoutList, setWorkoutList, selectedWorkout, setSelectedWorkout}) => {
  const {handleSetWorkout} = useAppContext()
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

    return (
        <Table data-test="workoutTableComponent">
            <TableHead>
                <TableRow>
                    <TableCell/>
                    <TableCell><b>Workout</b></TableCell>
                    <TableCell align="right"><b>Created By</b></TableCell>
                    <TableCell align="right"><b>Time</b></TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                { workoutList.map((row, index) => 
                <Row key={index}
                  row={row}
                  index={index}
                  handleSelect={handleSelect}
                  handleDeleteWorkout={handleDeleteWorkout}
                  selectedWorkout={selectedWorkout}
                  data-test="rowComponent"/>) 
                }
            </TableBody>
        </Table>
    );
}

export const Row = ({row, index, handleSelect, handleDeleteWorkout, selectedWorkout}) => {
  const [open, setOpen] = useState(false);
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
            {open ? <KeyboardArrowUp data-test="arrUp" /> : <KeyboardArrowDown  data-test="arrDown"/>}
          </IconButton>
        </TableCell>
        <TableCell className={classes.tableCell} onClick={handleSelect(index)} data-test="workoutName">{row.workoutName}</TableCell>
        <TableCell className={classes.tableCell} onClick={handleSelect(index)} align="right" data-test="displayName">{row.displayName}</TableCell>
        <TableCell className={classes.tableCell} onClick={handleSelect(index)} align="right" data-test="exercise">{fancyTimeFormat(row.exercises.reduce((a, b) => a + parseInt(b.time), 0))}</TableCell>
        <TableCell padding='checkbox'>
          <IconButton onClick={() => handleDeleteWorkout(row.id)} data-test="deleteWorkoutButton">
            <Close/>
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