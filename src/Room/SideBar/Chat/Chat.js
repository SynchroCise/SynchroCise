import React, { useState } from "react";
import { sckt } from '../../../Socket';
import ChatInput from './ChatInput/ChatInput';
import Messages from './Messages/Messages';
import { Divider } from '@material-ui/core';
import { useAppContext } from "../../../AppContext"

const Chat = ({ messages, currUser, users }) => {
    const { room } = useAppContext();
    const [message, setMessage] = useState('');

    const sendMessage = (event) => {
        event.preventDefault();
        let trimmedMessage = message.trim();
        if (trimmedMessage.length > 0) {
            sckt.socket.emit('sendMessage', { message: trimmedMessage, userSid: room.localParticipant.sid }, () => setMessage(''));
        }
    }

    return (
        <div style={{ height: "100%", maxHeight: "100%" }} display="flex" data-test="chatComponent">
            <div style={{ height: "95%", maxHeight: "95%", overflowY: 'scroll' }} display="flex" id="chat">
                <Messages messages={messages} currUser={currUser} users={users} data-test="messageComponent"/>
                <Divider />
            </div>
            <ChatInput message={message} setMessage={setMessage} sendMessage={sendMessage} data-test="chatInputComponent" />
        </div>
    );
}

export default Chat;