import React, { useState, useEffect, useContext } from "react";
import ExerciseList from "./ExerciseList/ExerciseList.js"
import { sckt } from '../.././Socket';
import { AppContext } from "../../AppContext";
import Chat from './Chat/Chat';
import { Drawer, Typography, IconButton, Box, Grid, Tab, Tabs } from '@material-ui/core';
import { Link } from '@material-ui/icons';
import { makeStyles } from "@material-ui/core/styles";

const SideBar = ({
    currUser,
    users,
    isYoutube,
    drawerWidth
}) => {
    const { workout, openSideBar, playWorkoutState, workoutNumber, setWorkoutNumber, workoutCounter, setWorkoutCounter, roomName } = useContext(AppContext)
    const [workoutTime, setWorkoutTime] = useState(workout.exercises[workoutNumber].time);
    const [nextUpExercise, setNextUpExercise] = useState(workout.exercises.map((workout, index) => { return workout.exercise }));
    const [messages, setMessages] = useState([]);
    const [sideBarType, setSideBarType] = useState(0);

    useEffect(() => {
        const handler = (message) => setMessages(messages => [...messages, message]);
        sckt.socket.on('message', handler);
        return () => sckt.socket.off('message', handler);
    }, []);

    useEffect(() => {
        setWorkoutTime(workout.exercises[workoutNumber].time);
        if (workoutCounter === -1) setWorkoutCounter(workout.exercises[0].time);
        setNextUpExercise(workout.exercises.map((workout, index) => { return workout.exercise }));
    }, [workout]);

    useEffect(() => {
        if (!playWorkoutState) return;
        const timer = workoutCounter > 0 && setTimeout(() => setWorkoutCounter(workoutCounter - 1), 1000);
        if (!(workoutCounter <= 0 && workoutNumber < workout.exercises.length - 1)) return;
        setWorkoutNumber(workoutNumber + 1)
        setWorkoutTime(workout.exercises[workoutNumber].time);
        setWorkoutCounter(workout.exercises[workoutNumber].time);
        return () => clearTimeout(timer)
    }, [workoutCounter, playWorkoutState, workoutNumber, workoutTime]);

    const handleChange = (value) => {
        setSideBarType(value);
    }

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
            {!isYoutube && <ExerciseList workoutTime={workoutTime} nextUpExercise={nextUpExercise} />}
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
