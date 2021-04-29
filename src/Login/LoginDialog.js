import React from 'react';
import SignIn from './SignIn'
import SignUp from './SignUp'
import { Dialog } from '@material-ui/core';


export default function LoginDialog( {openDialog, handleSetOpenDialog, isSignUp, handleSetIsSignUp} ) {
    const handleClose = (value) => {
        handleSetOpenDialog(false);
    };

    return (
        <Dialog open={openDialog} onClose={handleClose}>
            {(isSignUp) ? <SignUp handleSetIsSignUp={handleSetIsSignUp}/> : <SignIn handleSetIsSignUp={handleSetIsSignUp}/>}
        </Dialog>
    );
}