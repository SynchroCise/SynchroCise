import React, { useState, useContext } from "react";
import { sckt } from '../../../Socket';
import ChatInput from './ChatInput/ChatInput';
import Messages from './Messages/Messages';
import { Divider } from '@material-ui/core';
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
        <div style={{ height: "100%", maxHeight: "100%" }} display="flex">
            <div style={{ height: "95%", maxHeight: "95%", overflowY: 'scroll' }} display="flex" flexDirection="column" id="chat">
                <Messages messages={messages} currUser={currUser} users={users} />
                <Divider />
            </div>
            <ChatInput message={message} setMessage={setMessage} sendMessage={sendMessage} />
        </div>
    );
}

export default Chat;