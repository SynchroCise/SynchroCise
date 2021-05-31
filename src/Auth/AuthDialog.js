import React, {useContext} from 'react';
import SignIn from './SignIn'
import SignUp from './SignUp'
import { Dialog } from '@material-ui/core';
import {AppContext} from "../AppContext"



export default function LoginDialog() {
    const {openAuthDialog, handleSetOpenAuthDialog, isSignUp, handleSetIsSignUp, handleSetUserId, handleSetUsername, setIsLoggedIn} = useContext(AppContext)
    const handleClose = () => {
        handleSetOpenAuthDialog(false);
    };
    const signIn = async (formData) => {
        // attempt login
        const res = await fetch('/login', {
            method: 'POST',
            body: formData,
        });
        // failed login
        if (!res.ok) {
            const errMessage = await res.text();
            return {success: false, errMessage}
        }
        const resp = await res.json();
        handleSetUserId(resp.userId); // userId determines whether a person is logged in or not
        handleSetUsername(resp.displayName)
        handleSetOpenAuthDialog(false);
        setIsLoggedIn(true)
        return { success: true }
    }
    const signUp = async (formData) => {
        // attempt signup
        const res = await fetch('/signup', {
            method: 'POST',
            body: formData,
        });
        // failed signup
        if (!res.ok) {
            const errMessage = await res.text();
            return {success: false, errMessage}
        }
        console.log(await res.json())
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
            return {success, errMessage}
        }
        return {success, errMessage}
    }

    return (
        <Dialog open={openAuthDialog} onClose={handleClose}>
            {(isSignUp) ?
                <SignUp handleSetIsSignUp={() => handleSetIsSignUp(!isSignUp)} handleSubmit={handleSignUp}/> :
                <SignIn handleSetIsSignUp={() => handleSetIsSignUp(!isSignUp)} handleSubmit={handleSignIn}/>}
        </Dialog>
    );
}