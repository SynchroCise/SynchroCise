import React from 'react';
import SignIn from './SignIn'
import SignUp from './SignUp'
import { Dialog } from '@material-ui/core';
import { useAppContext } from "../AppContext"
import * as requests from '../utils/requests'



export default function LoginDialog() {
    const { openAuthDialog, handleSetOpenAuthDialog, isSignUp, handleSetIsSignUp, handleSetUserId, handleSetUsername, setIsLoggedIn } = useAppContext();
    const handleClose = () => {
        handleSetOpenAuthDialog(false);
    };
    const signIn = async (formData) => {
        // attempt login
        const res = await requests.userLogin(formData);
        // failed login
        if (!res.ok) {
            const errMessage = res.body.message
            return { success: false, errMessage }
        }
        handleSetUserId(res.body.userId); // userId determines whether a person is logged in or not
        handleSetUsername(res.body.displayName)
        handleSetOpenAuthDialog(false);
        setIsLoggedIn(true)
        return { success: true }
    }
    const signUp = async (formData) => {
        // attempt signup
        const res = await requests.userSignUp(formData);
        // failed signup
        if (!res.ok) {
            const errMessage = res.body.message
            return { success: false, errMessage }
        }
        return { success: true }
    }
    const handleSignIn = async (event) => {
        event.preventDefault()
        const data = new URLSearchParams(new FormData(event.target));
        return await signIn(data);
    }
    const handleSignUp = async (event) => {
        event.preventDefault()
        const data = new URLSearchParams(new FormData(event.target));
        // attemp signup
        const { success, errMessage } = await signUp(data)
        if (success) {
            const { success, errMessage } = await signIn(data)
            return { success, errMessage }
        }
        return { success, errMessage }
    }

    return (
        <Dialog open={openAuthDialog} onClose={handleClose} data-test="authDialogComponent">
            {(isSignUp) ?
                <SignUp handleSetIsSignUp={() => handleSetIsSignUp(!isSignUp)} handleSubmit={handleSignUp} data-test="signUpComponent" /> :
                <SignIn handleSetIsSignUp={() => handleSetIsSignUp(!isSignUp)} handleSubmit={handleSignIn} data-test="signInComponent" />}
        </Dialog>
    );
}