import React from 'react';
import { Grid, Box, Typography } from '@material-ui/core';

const Message = ({ message: { user, text, time } }) => {

    return (
        <Box width="100%" data-test="messageComponent">
            <Grid container justify="space-between">
                <Typography variant="body1" align="left" color="primary">{user.name}</Typography>
                <Typography variant="body2" align="right" color="textSecondary">{time}</Typography>
            </Grid>
            <Typography variant="body2">{text}</Typography>
        </Box>
    );
};

export default Message;