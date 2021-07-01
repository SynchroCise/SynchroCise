import React, {useState} from "react";
import { useAppContext } from "../../AppContext";
import {Grid, Typography, Box, IconButton, BottomNavigation, BottomNavigationAction, withStyles} from '@material-ui/core';
import { ArrowForward, ArrowBack, Videocam, VideocamOff, Mic, MicOff, ChevronLeft, ChevronRight, YouTube, FitnessCenter} from '@material-ui/icons';

const BottomControl = ({participants, participantPage, setParticipantPage, leaderParticipantIDs, ppp}) => {
    const { room, sendRoomState, workoutType, setWorkoutType, openSideBar, handleOpenSideBar } = useAppContext();
    const [vid, setVid] = useState((room) ? room.localParticipant.videoTracks.values().next().value.isTrackEnabled : false);
    const [mic, setMic] = useState((room) ? room.localParticipant.audioTracks.values().next().value.isTrackEnabled : false);

    const handleChangeWorkoutType = (value) => {
        const newWorkoutType = value ? 'yt' : 'vid';
        sendRoomState({
            eventName: 'syncWorkoutType',
            eventParams: { workoutType: newWorkoutType }
        }, () => {setWorkoutType(newWorkoutType)});
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

    const handleParticipantPage = (pageDelta) => {
        if (!room) return;
        let all_participants = [...participants, room.localParticipant];
        all_participants = (workoutType === 'yt') ? all_participants : all_participants.filter((participant) => participant.sid !== leaderParticipantIDs[0])
        const newPageNum = participantPage + pageDelta;
        if (all_participants.slice(newPageNum * ppp, newPageNum * ppp + ppp).length > 0) {
            setParticipantPage(newPageNum)
        }
    }

    const CustomBottomNavigationAction = withStyles({
        root: {
            backgroundColor: 'rgba(0, 0, 0, 0.87)',
            color: 'white'
        },
    })(BottomNavigationAction);

    return (
        <Grid item container xs={12} style={{width:"100%"}} alignItems="center" data-test="bottomControlComponent">
            <Grid item xs={4}>
                <Box display="flex" justifyContent="flex-start" alignItems="center">
                    <IconButton color="secondary" onClick={handleVid} data-test="videoButton">
                        {vid ? <Videocam data-test="vidOn"/> : <VideocamOff data-test="vidOff"/>}
                    </IconButton>
                    <IconButton color="secondary" onClick={handleMic} data-test="micButton">
                        {mic ? <Mic data-test="micOn"/> : <MicOff data-test="micOff"/>}
                    </IconButton>
                        {/* <IconButton>
                        <CallEnd></CallEnd>
                        </IconButton> */}
                </Box>
                </Grid>
            <Grid item xs={4}>
                <Box display="flex" justifyContent="center" alignItems="center" l={3} r={3}>
                    <IconButton color="secondary" onClick={() => handleParticipantPage(-1)} data-test="backPPButton">
                    <ArrowBack style={{fill: "white"}}/>
                    </IconButton>
                    <Typography color="secondary"> {participants.length + leaderParticipantIDs.length}/{participants.length + leaderParticipantIDs.length} participants {participantPage} </Typography>
                    <IconButton color="secondary" onClick={() => handleParticipantPage(1)} data-test="forwardPPButton">
                    <ArrowForward style={{fill: "white"}}/>
                    </IconButton>
                </Box>
            </Grid>
            <Grid item xs={4}>
                <Box display="flex" justifyContent="flex-end" alignItems="center">
                    {/* <IconButton color="secondary" size="medium">
                    <Apps/>
                    </IconButton>
                    <IconButton color="secondary" size="medium">
                    <Fullscreen/>
                    </IconButton> */}

                    <BottomNavigation
                        value={workoutType === 'yt' ? 1 : 0}
                        onChange={(event, newValue) => {
                            handleChangeWorkoutType(newValue);
                        }}
                        showLabels
                        // className={classes.root}
                        color="secondary" 
                        data-test="changeWorkoutNavigation"
                    >
                    <CustomBottomNavigationAction label="Custom" icon={<FitnessCenter />} />
                    <CustomBottomNavigationAction color="secondary" label="Youtube" icon={<YouTube/>} />
                    </BottomNavigation>
                    <IconButton color="secondary" onClick={handleOpenSideBar} data-test="sidebarButton">
                    {openSideBar ? <ChevronRight /> : <ChevronLeft />}
                    </IconButton>
                </Box>
            </Grid>
        </Grid>
    );
};

export default BottomControl;