import React, { useState, useEffect } from "react";
import ExerciseList from "./ExerciseList/ExerciseList.js"
import { sckt } from '../.././Socket';
import { useAppContext } from "../../AppContext";
import Chat from './Chat/Chat';
import { Drawer, Typography, IconButton, Box, Grid, Tab, Tabs } from '@material-ui/core';
import { Link } from '@material-ui/icons';
import { makeStyles } from "@material-ui/core/styles";
import PropTypes from 'prop-types';
function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box style={{ height: "100%" }}>
                    <div style={{ height: "100%" }}>{children}</div>
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

// const useStyles = makeStyles((theme) => ({
//     root: {
//         flexGrow: 1,
//         backgroundColor: theme.palette.background.paper,
//     },
// }));

const SideBar = ({
    currUser,
    users,
    isYoutube,
    drawerWidth
}) => {
    const { workout, openSideBar, playWorkoutState, workoutNumber, setWorkoutNumber, workoutCounter, setWorkoutCounter, roomName } = useAppContext();
    const [workoutTime, setWorkoutTime] = useState(workout.exercises[workoutNumber].time);
    const [nextUpExercise, setNextUpExercise] = useState(workout.exercises.map((workout, index) => { return workout.exercise }));
    const [messages, setMessages] = useState([]);
    const [sideBarType, setSideBarType] = useState(0);

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

    // const sideBarContentMarkup = sideBarType ?
    //    :

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
            }}
            data-test="sidebarComponent">
            <Box mx={2} my={2} height="95%">
                <Typography variant="body1">{copyRoomCodeButtonMarkup}Room: {roomName.substring(0, 6).toUpperCase()}</Typography>
                <Tabs
                    indicatorColor="primary"
                    textColor="primary"
                    value={sideBarType}
                    onChange={(event, value) => { handleChange(value) }}
                    data-test="tabsComponent"
                >
                    <Tab value={0} label="Workout"  {...a11yProps(0)} />
                    <Tab value={1} label="Chat"  {...a11yProps(1)} />
                </Tabs>
                <TabPanel value={sideBarType} index={0}>
                    <Grid item>
                        {!isYoutube && <ExerciseList workoutTime={workoutTime} nextUpExercise={nextUpExercise} data-test="exerciseListComponent" />}
                    </Grid>
                </TabPanel>
                <TabPanel value={sideBarType} index={1} style={{ height: "85%" }} id="TabPanelChat">
                    <Chat
                        messages={messages}
                        currUser={currUser}
                        users={users}
                        data-test="chatComponent"
                    />
                </TabPanel>
            </Box>
        </Drawer>
    );
};

export default SideBar;
