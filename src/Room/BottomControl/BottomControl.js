import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory } from 'react-router-dom'
import { RoutesEnum } from '../../App'
import { useAppContext } from "../../AppContext";
import { Grid, Typography, Box, IconButton, BottomNavigation, BottomNavigationAction, withStyles, Badge } from '@material-ui/core';
import { CallEnd, Videocam, VideocamOff, Mic, MicOff, FitnessCenter, ChatOutlined, GroupOutlined } from '@material-ui/icons';

const BottomControl = ({ participantPage, setParticipantPage }) => {
    const { room, handleLeaveRoom, openSideBar, handleOpenSideBar, sideBarType, setSideBarType } = useAppContext();
    const [vid, setVid] = useState(true);
    const [mic, setMic] = useState(true);
    const history = useHistory()

    const handleSidebarNav = (value) => {
        if (!openSideBar) handleOpenSideBar();
        if (sideBarType === value) {
            handleOpenSideBar();
            return
        }
        setSideBarType(value);
    }

    const handleMic = () => {
        if (!room) return;
        room.localParticipant.audioTracks.forEach(track => {
            (mic) ? track.track.disable() : track.track.enable()
        });
        setMic(!mic);
    };

    const handleVid = () => {
        if (!room) return;
        room.localParticipant.videoTracks.forEach(track => {
            (vid) ? track.track.disable() : track.track.enable()
        });
        setVid(!vid);
    };

    const endCall = () => {
        handleLeaveRoom();
        history.push(RoutesEnum.Home);
    }

    const CustomBottomNavigationAction = withStyles({
        root: {
            backgroundColor: 'rgba(0, 0, 0, 0.87)',
            color: 'white'
        },
    })(BottomNavigationAction);


    const useStyles = makeStyles(theme => ({
        endCall: {
            backgroundColor: "red",
            color: "white",
            "&:hover, &.Mui-focusVisible": { backgroundColor: "#ea4335" }
        }
    }));

    const classes = useStyles();
    return (
        <Grid item container xs={12} style={{ width: "100%", height: "80px" }} alignItems="center" data-test="bottomControlComponent">
            <Grid item xs={4}>
                <Box display="flex" justifyContent="flex-start" alignItems="center">
                    <IconButton color="secondary" onClick={handleVid} data-test="videoButton">
                        {vid ? <Videocam data-test="vidOn" /> : <VideocamOff data-test="vidOff" />}
                    </IconButton>
                    <IconButton color="secondary" onClick={handleMic} data-test="micButton">
                        {mic ? <Mic data-test="micOn" /> : <MicOff data-test="micOff" />}
                    </IconButton>
                    <IconButton color="secondary" className={classes.endCall} onClick={endCall}>
                        <CallEnd />
                    </IconButton>
                </Box>
            </Grid>
            <Grid item xs={4}>
                <Box display="flex" justifyContent="center" alignItems="center" l={3} r={3}>
                    <Typography color="secondary"> Page {participantPage} </Typography>
                </Box>
            </Grid>
            <Grid item xs={4}>
                <Box display="flex" justifyContent="flex-end" alignItems="center">
                    <BottomNavigation
                        value={sideBarType}
                        onChange={(event, newValue) => {
                            handleSidebarNav(newValue);
                        }}
                        showLabels
                        color="secondary"
                        data-test="changeWorkoutNavigation"
                    >
                        <CustomBottomNavigationAction icon={<FitnessCenter />} />
                        <CustomBottomNavigationAction icon={<Badge badgeContent={room.participants.size + 1} color="primary"><GroupOutlined /></Badge>} />
                        <CustomBottomNavigationAction icon={<ChatOutlined />} />
                    </BottomNavigation>
                </Box>
            </Grid>
        </Grid>
    );
};

export default BottomControl;