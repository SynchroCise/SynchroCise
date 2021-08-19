import React from "react";
import { Box, Typography, ButtonBase, List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction, IconButton, Avatar } from '@material-ui/core';
import { PersonAddOutlined, Person, PushPin } from '@material-ui/icons';
import { useAppContext } from "../../../AppContext"
import { makeStyles } from "@material-ui/core/styles";

const People = () => {
    const { room, nameArray, setPinnedParticipantId, pinnedParticipantId, username } = useAppContext();
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
        let all_participants = [{ name: username, id: room.myUserId() }];
        room.getParticipants().forEach((p) => {
            all_participants.push({ name: p.getProperty("displayName"), id: p.getId() });
        });
        console.log(all_participants);
        return (all_participants.map((participant, index) => (
            <ListItem key={index}>
                <ListItemAvatar>
                    <Avatar>
                        <Person />
                    </Avatar>
                </ListItemAvatar>
                <ListItemText
                    primary={participant.name}
                />
                <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => setPinnedParticipantId(participant.id)}>
                        <PushPin className={(pinnedParticipantId === participant.id) ? classes.pinnedIcon : null} />
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
                    <Typography style={{ padding: "10px" }}>Add people</Typography>
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