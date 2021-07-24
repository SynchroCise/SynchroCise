import React, { useState, useEffect } from "react";
import ExerciseList from "./ExerciseList/ExerciseList.js"
import { sckt } from '../.././Socket';
import { useAppContext } from "../../AppContext";
import Chat from './Chat/Chat';
import { Typography, IconButton, Box, Slide, Card } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import { makeStyles } from "@material-ui/core/styles";

const SideBar = ({
    currUser,
    users,
    isYoutube,
    drawerWidth
}) => {
    const { workout, openSideBar, playWorkoutState, workoutNumber, setWorkoutNumber, workoutCounter, setWorkoutCounter, sideBarType, handleOpenSideBar } = useAppContext();
    const [workoutTime, setWorkoutTime] = useState(workout.exercises[workoutNumber].time);
    const [nextUpExercise, setNextUpExercise] = useState(workout.exercises.map((workout, index) => { return workout.exercise }));
    const [messages, setMessages] = useState([]);
    const [sideBarTitle, setSideBarTitle] = useState('');
    const [sideBarContent, setSideBarContent] = useState(null);

    //Also does scrolliung
    useEffect(() => {
        const handler = (message) => {
            setMessages(messages => [...messages, message]);
            let cht = document.getElementById("chat");
            if (cht) cht.scrollTop = cht.scrollHeight;
        }
        sckt.socket.on('message', handler);
        return () => sckt.socket.off('message', handler);
    }, []);

    // initialize workout
    useEffect(() => {
        setWorkoutTime(workout.exercises[workoutNumber].time);
        if (workoutCounter === -1) setWorkoutCounter(workout.exercises[0].time);
        setNextUpExercise(workout.exercises.map((workout, index) => { return workout.exercise }));
    }, [workout, workoutCounter, setWorkoutCounter, workoutNumber]);

    // countdown workout counter
    useEffect(() => {
        if (!playWorkoutState) return;
        const timer = workoutCounter > 0 && setTimeout(() => setWorkoutCounter((Math.floor((workoutCounter - 0.1)*10)/10).toFixed(1)), 100);
        if (!(workoutCounter <= 0 && workoutNumber < workout.exercises.length - 1)) return;
        setWorkoutNumber(workoutNumber + 1)
        setWorkoutTime(workout.exercises[workoutNumber].time);
        setWorkoutCounter(workout.exercises[workoutNumber].time);
        return () => clearTimeout(timer)
    }, [workoutCounter, playWorkoutState, workoutNumber, workoutTime, setWorkoutCounter, setWorkoutNumber, workout.exercises]);

    const useStyles = makeStyles(theme => ({
        drawerPaper: {
            width: drawerWidth,
        },
        drawer: {
            position: "absolute",
            width: drawerWidth,
            top: 0,
            right: 0,
            bottom: 80,
            marginRight: 16,
            marginTop: 16,
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

    // const sideBarContentMarkup = sideBarType ?
    //    :

    // const roomCode = roomName.substring(0, 6).toUpperCase();

    // const copyRoomCodeButtonMarkup = (
    //     <IconButton color="primary" onClick={() => navigator.clipboard.writeText(roomCode)}>
    //         <Link />
    //     </IconButton>
    // )
    useEffect(() => {
        switch (sideBarType) {
            case 0:
                setSideBarTitle('Workout');
                setSideBarContent(<ExerciseList workoutTime={workoutTime} nextUpExercise={nextUpExercise} data-test="exerciseListComponent" />);
                break;
            case 1:
                setSideBarTitle('People');
                setSideBarContent(null);
                break;
            case 2:
                setSideBarTitle('In-call messages');
                setSideBarContent(
                    <Chat
                        messages={messages}
                        currUser={currUser}
                        users={users}
                        data-test="chatComponent"
                    />
                );
                break;
            default:
                setSideBarTitle('');
                setSideBarContent(null);
        }
    }, [sideBarType, currUser, messages, nextUpExercise, users, workoutTime]);

    return (
        <Slide
            direction="left"
            in={openSideBar}
            data-test="sidebarComponent"
            className={classes.drawer}
            mountOnEnter
            unmountOnExit
        >
            <Card>
                <Box py={1} height="100%" display="flex" flexDirection="column">
                    <Box pl={3} display="flex" flexDirection="row" alignItems="center">
                        <Box flexGrow={1}>
                            <Typography variant="h6">{sideBarTitle}</Typography>
                        </Box>
                        <Box mr={1}>
                            <IconButton onClick={handleOpenSideBar}><Close /></IconButton>
                        </Box>
                    </Box>
                    <Box flexGrow={1}>
                        {sideBarContent}
                    </Box>
                </Box>
            </Card>
        </Slide>
    );
};

export default SideBar;
