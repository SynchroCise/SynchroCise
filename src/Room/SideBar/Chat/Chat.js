import React, { useEffect, useState, useContext } from "react";
import { sckt } from '../../../Socket';
import ChatInput from './ChatInput/ChatInput';
import Messages from './Messages/Messages';
import { Box, Divider, Typography } from '@material-ui/core';
import { AppContext } from "../../../AppContext"


const Chat = ({ messages, currUser, users }) => {
    const { room } = useContext(AppContext)
    const [message, setMessage] = useState('');

    const sendMessage = (event) => {
        event.preventDefault();
        let trimmedMessage = message.trim();
        if (trimmedMessage.length > 0) {
            sckt.socket.emit('sendMessage', { message: trimmedMessage, userSid: room.localParticipant.sid }, () => setMessage(''));
        }
    }

    return (
        <Box height="100%" style={{ maxHeight: "100%", overflowY: 'scroll' }} display="flex" flexDirection="column">
            <Messages messages={messages} currUser={currUser} users={users} />
            <Divider />
            <ChatInput message={message} setMessage={setMessage} sendMessage={sendMessage} />
        </Box>
    );
}

export default Chat;