import React, { useState, useEffect, useContext } from "react";
import { sckt } from '../.././Socket';
import { AppContext } from "../../AppContext";
import Chat from './Chat/Chat';
import { Drawer, Typography, LinearProgress, IconButton, Box, Grid, Divider, Tab, Tabs } from '@material-ui/core';
import { PlayArrow, Pause, Link } from '@material-ui/icons';
import { makeStyles } from "@material-ui/core/styles";

const SideBar = ({
    currUser,
    users,
    isYoutube,
    drawerWidth,
    room
}) => {
    const { username, workout, openSideBar, sendRoomState, playWorkoutState, setPlayWorkoutState, workoutNumber, setWorkoutNumber, workoutCounter, setWorkoutCounter, workoutType, setWorkoutType, roomName } = useContext(AppContext)
    const [workoutTime, setWorkoutTime] = useState(workout.exercises[workoutNumber].time);
    const [nextUpExercise, setNextUpExercise] = useState(workout.exercises.map((workout, index) => { return workout.exercise }));
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [sideBarType, setSideBarType] = useState(0);

    useEffect(() => {
        const handler = (message) => setMessages(messages => [...messages, message]);
        sckt.socket.on('message', handler);
        return () => sckt.socket.off('message', handler);
    }, []);

    useEffect(() => {
        setWorkoutTime(workout.exercises[workoutNumber].time);
        if (workoutCounter == -1) setWorkoutCounter(workout.exercises[0].time);
        setNextUpExercise(workout.exercises.map((workout, index) => { return workout.exercise }));
    }, [workout]);

    useEffect(() => {
        if (playWorkoutState) {
            const timer = workoutCounter > 0 && setTimeout(() => setWorkoutCounter(workoutCounter - 1), 1000);
            if (workoutCounter <= 0 && workoutNumber < workout.exercises.length - 1) {
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
        setSideBarType(value);
    }

    const TimerProgressBarMarkup = isYoutube ? <></> : (
        <React.Fragment>
            <Box display="flex" justifyContent="flex-end" paddingTop={4} >
                <Typography variant="body1">{workoutCounter}s</Typography>
            </Box>
            <div><LinearProgress variant="determinate" value={workoutCounter / workoutTime * 100} /></div>
            <Box display="flex" justifyContent="flex-end">
                <IconButton
                    onClick={handleStartWorkout}>
                    {(playWorkoutState) ? <Pause /> : <PlayArrow />}
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

    const sideBarContentMarkup = sideBarType ?
        <Chat
            messages={messages}
            currUser={currUser}
            users={users}
        /> :
        <Grid item>
            {TimerProgressBarMarkup}
            {exerciseListMarkup}
        </Grid>


    const roomCode = roomName.substring(0, 6).toUpperCase();

    const copyRoomCodeButtonMarkup = (
        <IconButton color="primary" onClick={() => navigator.clipboard.writeText(roomCode)}>
            <Link />
        </IconButton>
    )


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
                <Grid container className={classes.fullHeight} wrap="wrap">
                    <Grid item style={{ height: "7%", width: "100%" }}>
                        <Typography variant="body1">{copyRoomCodeButtonMarkup}Room: {roomName.substring(0, 6).toUpperCase()}</Typography>
                        <Tabs
                            indicatorColor="primary"
                            textColor="primary"
                            value={sideBarType}
                            onChange={(event, value) => { handleChange(value) }}
                        >
                            <Tab value={0} label="Workout" />
                            <Tab value={1} label="Chat" />
                        </Tabs>
                    </Grid>
                    <Grid container item style={{ height: "90%", width: "100%" }} justify="space-between" direction="column">
                        {sideBarContentMarkup}
                    </Grid>
                </Grid>
            </Box>
        </Drawer>
    );
};

export default SideBar;
