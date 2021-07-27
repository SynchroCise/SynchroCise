import React from "react";
import { Box, Typography, ButtonBase, List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction, IconButton, Avatar } from '@material-ui/core';
import { PersonAddOutlined, Person, PushPin } from '@material-ui/icons';
import { useAppContext } from "../../../AppContext"
import { makeStyles } from "@material-ui/core/styles";

const People = () => {
    const { room, nameArray, setPinnedParticipantId, pinnedParticipantId } = useAppContext();
    const useStyles = makeStyles(theme => ({
        buttonWide: {
            width: "100%",
            textALign: 'left',
            justifyContent: 'left',
            '&:hover': {
              backgroundColor: '#ECECEC',
            }
        },
        callHeader: {
            marginTop: "12px",
            marginBottom: "4px",
            padding: "0 24px" 
        },
        pinnedIcon: {
            color: theme.palette.primary.main
        },
        scrollContainer: {
            overflowY: "auto",
            minHeight: 0
        }
    }));
    const classes = useStyles();

    const getNameFromSid = (sid) => {
        const participantMapping = nameArray.find(x => x.sid === sid);
        if (!participantMapping) return ''
        return participantMapping.name
    }

    const participantsListMarkup = () => {
        const all_participants =  [room.localParticipant, ...room.participants.values()];
        // console.log(room.participants);
        // console.log(room.localParticipant);
        return (all_participants.map((participant, index) => (
            <ListItem key={index}>
                <ListItemAvatar>
                    <Avatar>
                        <Person />
                    </Avatar>
                </ListItemAvatar>
                <ListItemText
                    primary={getNameFromSid(participant.sid)}
                />
                <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => setPinnedParticipantId(participant.sid)}>
                        <PushPin className={(pinnedParticipantId === participant.sid) ? classes.pinnedIcon : null}/>
                    </IconButton>
                </ListItemSecondaryAction>
            </ListItem>
        )));
    }

    return (
        <Box display='flex' flexDirection="column" height="100%" className={classes.scrollContainer}>
            <ButtonBase className={classes.buttonWide}>
                <Box display="flex" alignItems="center" pl={2}>
                    <PersonAddOutlined></PersonAddOutlined>
                    <Typography style={{padding: "10px"}}>Add people</Typography>
                </Box>
            </ButtonBase>
            <Box display='flex' flexDirection="column" flexGrow={1} className={classes.scrollContainer}>
                <Typography variant="body1" className={classes.callHeader}>In call</Typography>
                <List >
                    {participantsListMarkup()}
                </List>
            </Box>
        </Box>

        
    );
}

export default People;