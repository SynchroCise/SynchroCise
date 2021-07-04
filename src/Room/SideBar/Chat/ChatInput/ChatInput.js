import React, {useEffect} from 'react';
import { TextField } from '@material-ui/core';
import { getElementError } from '@testing-library/react';

// import './ChatInput.scss';

const ChatInput = React.memo(({ message, setMessage, sendMessage }) => {

    const handleInputChange = event => {
        let msg = event.target.value;
        setMessage(msg);
    }

    const handleInputSend = (event) => {
        sendMessage(event);
    }

    useEffect(() => {;
        document.getElementById("chatTextbox").focus();
    }, []);

    return (
        <React.Fragment>
            <TextField
                id="chatTextbox"
                fullWidth
                placeholder="Type a message here..."
                value={message}
                onChange={e => handleInputChange(e)}
                onKeyPress={e => e.key === 'Enter' ? handleInputSend(e) : null}
                data-test="chatInputComponent"
            ></TextField>
        </React.Fragment>
    )
});

export default ChatInput;