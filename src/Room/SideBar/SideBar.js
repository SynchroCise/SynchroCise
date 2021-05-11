import React, {useState, useEffect, useContext} from "react";
import TimerProgressBar from "./TimerProgressBar/TimerProgressBar"
import { defaultWorkout } from "../CustomWorkout/DefaultWorkout"
import { AppContext } from "../../AppContext";
import Chat from './Chat/Chat';
import pause from "../../media/pause.png";
import play from "../../media/play.png";
import { Drawer, Typography, LinearProgress, IconButton, Box, Grid , Divider} from '@material-ui/core';
import {PlayArrow, Pause} from '@material-ui/icons';
import { makeStyles } from "@material-ui/core/styles";
import { sckt } from '../../Socket';

const SideBar = ({
    currUser,
    users,
    isYoutube,
    drawerWidth,
    room
}) => {
    const {workout, openSideBar, sendRoomState, playWorkoutState, setPlayWorkoutState, workoutNumber, setWorkoutNumber, workoutCounter, setWorkoutCounter} = useContext(AppContext)
    const [workoutTime, setWorkoutTime] = useState(workout.exercises[workoutNumber].time);
    const [nextUpExercise, setNextUpExercise] = useState(workout.exercises.map((workout, index) => { return workout.exercise }));

    useEffect(() => {
        setWorkoutTime(workout.exercises[workoutNumber].time);
        if (workoutCounter == -1) setWorkoutCounter(workout.exercises[0].time);
        setNextUpExercise(workout.exercises.map((workout, index) => { return workout.exercise }));
    }, [workout]);

    useEffect(() => {
        if(playWorkoutState){
            workoutCounter > 0 && setTimeout(() => setWorkoutCounter(workoutCounter - 1), 1000);
            if(workoutCounter <= 0 && workoutNumber < workout.exercises.length-1) {
                setWorkoutNumber(workoutNumber + 1)
                setWorkoutTime(workout.exercises[workoutNumber].time);
                setWorkoutCounter(workout.exercises[workoutNumber].time);
            }
        }
    }, [workoutCounter, playWorkoutState, workoutNumber, workoutTime]);


    const exerciseListMarkup = isYoutube ? <></> : (
        <React.Fragment>
            <Typography variant="body1">Now</Typography>
            <Typography variant="h5">{workout.exercises[workoutNumber].exercise}</Typography>
            <Typography variant="body1">Next Up</Typography>
            {
                nextUpExercise && nextUpExercise.length > 1 && typeof nextUpExercise != 'string' ? (
                    nextUpExercise.map((exercise, index) => {
                        if (index > workoutNumber) {
                            return (<Typography key={index} variant="body2">{exercise}</Typography>)
                        }
                    })
                ) : (
                    <Typography variant="body2">{nextUpExercise}</Typography>
                )
            }
        </React.Fragment>
    )
    
    const handleStartWorkout = () => {
        var startWorkoutState = !playWorkoutState;
        sendRoomState({
            eventName: 'syncWorkoutState',
            eventParams: { playWorkoutState: startWorkoutState }
        }, () => setPlayWorkoutState(startWorkoutState));
    }

    const TimerProgressBarMarkup = isYoutube ? <></> : (
        <React.Fragment>
            <Box display="flex" justifyContent="flex-end"><Typography variant="body1">{workoutCounter}s</Typography></Box>
            <div><LinearProgress variant="determinate" value={workoutCounter/workoutTime * 100} /></div>
            <Box display="flex" justifyContent="flex-end">
                <IconButton
                    onClick={handleStartWorkout}>
                    {(playWorkoutState) ? <Pause/> : <PlayArrow/>}
                </IconButton>
            </Box>
        </React.Fragment>
    )
    const useStyles = makeStyles(theme => ({
        drawerPaper: {
            width: drawerWidth,
        },
        drawer: {
            width: drawerWidth,
            flexShrink: 0,
        },
        fullWidth: {
            width: "100%"
        },
        fullHeight: {
            height: "100%"
        },
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
        <Drawer
        variant="persistent"
        anchor="right"
        open={openSideBar}
        className={classes.drawer}
        classes={{
            paper: classes.drawerPaper,
          }}>
            <Box mx={2} my={2} height="100%">
                <Grid container className={classes.fullHeight}  wrap="wrap">
                    <Grid container item style={{height:"40%", width: "100%"}} justify="space-between" direction="column">
                        <Grid item>
                            {TimerProgressBarMarkup}
                            {exerciseListMarkup}
                        </Grid>
                        <Grid item><Divider /></Grid>
                    </Grid>
                    <Grid item style={{height:"60%", width:"100%"}}>
                        <Chat
                            currUser={currUser}
                            users={users}
                        />
                    </Grid>
                </Grid>
            </Box>
        </Drawer>
    );
};

export default SideBar;
