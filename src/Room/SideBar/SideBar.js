import React, {useState, useEffect, useContext} from "react";

import { AppContext } from "../../AppContext";
import Chat from './Chat/Chat';
import { Drawer, Typography, LinearProgress, IconButton, Box, Grid , Divider, Tab, Tabs} from '@material-ui/core';
import {PlayArrow, Pause} from '@material-ui/icons';
import { makeStyles } from "@material-ui/core/styles";

const SideBar = ({
    currUser,
    users,
    isYoutube,
    drawerWidth,
    room
}) => {
    const {username, workout, openSideBar, sendRoomState, playWorkoutState, setPlayWorkoutState, workoutNumber, setWorkoutNumber, workoutCounter, setWorkoutCounter, workoutType, setWorkoutType, roomName} = useContext(AppContext)
    const [workoutTime, setWorkoutTime] = useState(workout.exercises[workoutNumber].time);
    const [nextUpExercise, setNextUpExercise] = useState(workout.exercises.map((workout, index) => { return workout.exercise }));

    useEffect(() => {
        setWorkoutTime(workout.exercises[workoutNumber].time);
        if (workoutCounter == -1) setWorkoutCounter(workout.exercises[0].time);
        setNextUpExercise(workout.exercises.map((workout, index) => { return workout.exercise }));
    }, [workout]);

    useEffect(() => {
        if(playWorkoutState){
            const timer = workoutCounter > 0 && setTimeout(() => setWorkoutCounter(workoutCounter - 1), 1000);
            if(workoutCounter <= 0 && workoutNumber < workout.exercises.length-1) {
                setWorkoutNumber(workoutNumber + 1)
                setWorkoutTime(workout.exercises[workoutNumber].time);
                setWorkoutCounter(workout.exercises[workoutNumber].time);
            }
            return () => clearTimeout(timer)
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
    const handleChange = (value) => {
        const newWorkoutType = value ? 'yt' : 'vid';
        sendRoomState({
          eventName: 'syncWorkoutType',
          eventParams: { workoutType: newWorkoutType }
        }, () => {setWorkoutType(newWorkoutType)});
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
                    <Grid item style={{height:"10%", width:"100%"}}>
                        <Typography variant="body1">Room: {roomName.substring(0, 6).toUpperCase()}, User: {username}</Typography>
                        <Tabs
                            indicatorColor="primary"
                            textColor="primary"
                            value={workoutType == 'yt' ? 1 : 0}
                            onChange={(event, value) => { handleChange(value) }}
                            aria-label="disabled tabs example"
                        >
                            <Tab value={0} label="Custom"/>
                            <Tab value={1} label="Youtube"/>
                        </Tabs>
                    </Grid>
                    <Grid container item style={{height:"40%", width: "100%"}} justify="space-between" direction="column">
                        <Grid item>
                            {TimerProgressBarMarkup}
                            {exerciseListMarkup}
                        </Grid>
                        <Grid item><Divider /></Grid>
                    </Grid>
                    <Grid item style={{height:"50%", width:"100%"}}>
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
