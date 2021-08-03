import React, { useState } from "react";
import { sckt } from '../../../Socket';
import ChatInput from './ChatInput/ChatInput';
import Messages from './Messages/Messages';
import { useAppContext } from "../../../AppContext"

const Chat = ({ messages }) => {
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
        <div style={{ display:"flex" ,height: "100%", flexDirection:"column" }} data-test="chatComponent">
            <div style={{ overflowY: 'scroll', flexGrow: 1 }} id="chat">
                <Messages messages={messages} data-test="messageComponent" />
            </div>
            <div style={{margin: '16px'}}>
                <ChatInput message={message} setMessage={setMessage} sendMessage={sendMessage} data-test="chatInputComponent" />
            </div>
        </div>
    );
}

export default Chat;
