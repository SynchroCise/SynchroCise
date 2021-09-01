import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory } from 'react-router-dom'
import { RoutesEnum } from '../../App'
import { useAppContext } from "../../AppContext";
import { Grid, Box, IconButton, BottomNavigation, BottomNavigationAction, withStyles, Badge } from '@material-ui/core';
import { CallEnd, Videocam, VideocamOff, Mic, MicOff, FitnessCenter, ChatOutlined, GroupOutlined } from '@material-ui/icons';

const BottomControl = () => {
    const { participantIds, localTracks, handleLeaveRoom, openSideBar, handleOpenSideBar, sideBarType, setSideBarType } = useAppContext();
    const [isVidMute, setIsVidMute] = useState(true);
    const [isMicMute, setIsMicMute] = useState(true);
    const history = useHistory()

    const handleSidebarNav = (value) => {
        if (!openSideBar) handleOpenSideBar();
        if (sideBarType === value) {
            handleOpenSideBar();
            return
        }
        setSideBarType(value);
    }

    // initialize video muted state
    useEffect(() => {
        const initVid = () => {
            localTracks.forEach(track => {
                if (track.getType() === 'video') {
                    return setIsVidMute(track.isMuted());
                }
            });
        }
        const initMic = () => {
            localTracks.forEach(track => {
                if (track.getType() === 'audio') {
                    return setIsMicMute(track.isMuted());
                }
            });
        }
        initVid();
        initMic();
    }, [localTracks]);

    const handleMic = () => {
        if (!localTracks) return;
        localTracks.forEach(track => {
            if (track.getType() === 'audio') {
                (isMicMute) ? track.unmute() : track.mute()
            }
        });
        setIsMicMute(!isMicMute);
    };

    const handleVid = () => {
        if (!localTracks) return;
        localTracks.forEach(track => {
            if (track.getType() === 'video') {
                (isVidMute) ? track.unmute() : track.mute()
            }
        });
        setIsVidMute(!isVidMute);
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
        },
        notSelected: {
            '&.Mui-selected': {
                color: 'white'
            }
        }
    }));

    const classes = useStyles();
    return (
        <Grid item container xs={12} style={{ width: "100%", height: "80px" }} alignItems="center" data-test="bottomControlComponent">
            <Grid item xs={4}>
                <Box display="flex" justifyContent="flex-start" alignItems="center">
                    <IconButton color="secondary" onClick={handleVid} data-test="videoButton">
                        {!isVidMute ? <Videocam data-test="vidOn" /> : <VideocamOff data-test="vidOff" />}
                    </IconButton>
                    <IconButton color="secondary" onClick={handleMic} data-test="micButton">
                        {!isMicMute ? <Mic data-test="micOn" /> : <MicOff data-test="micOff" />}
                    </IconButton>
                    <IconButton color="secondary" className={classes.endCall} onClick={endCall}>
                        <CallEnd />
                    </IconButton>
                </Box>
            </Grid>
            <Grid item xs={4}>
                <Box display="flex" justifyContent="center" alignItems="center" l={3} r={3}>
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
                        <CustomBottomNavigationAction className={!openSideBar ? classes.notSelected: ""} icon={<FitnessCenter />} />
                        <CustomBottomNavigationAction className={!openSideBar ? classes.notSelected: ""} icon={<Badge badgeContent={participantIds.length} color="primary"><GroupOutlined /></Badge>} />
                        <CustomBottomNavigationAction className={!openSideBar ? classes.notSelected: ""} icon={<ChatOutlined />} />
                    </BottomNavigation>
                </Box>
            </Grid>
        </Grid>
    );
};

export default BottomControl;