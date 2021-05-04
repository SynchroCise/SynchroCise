import React, {useContext} from 'react';
import SignIn from './SignIn'
import SignUp from './SignUp'
import { Dialog } from '@material-ui/core';
import {AppContext} from "../AppContext"



export default function LoginDialog() {
    const {openAuthDialog, handleSetOpenAuthDialog, isSignUp, handleSetIsSignUp, handleSetUserId} = useContext(AppContext)
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
            console.log(await res.text());
            return false
        }
        const resp = await res.json();
        handleSetUserId(resp.userId); // userId determines whether a person is logged in or not
        handleSetOpenAuthDialog(false);
        
        return true
    }
    const signUp = async (formData) => {
        // attemp signup
        const res = await fetch('/signup', {
            method: 'POST',
            body: formData,
        });
        // failed signup
        if (!res.ok) {
            console.log(await res.text());
            return false
        }
        console.log(await res.json())
        return true
    }
    const handleSignIn = async (event) => {
        event.preventDefault()
        const data = new URLSearchParams(new FormData(event.target));
        await signIn(data);
    }
    const handleSignUp = async (event) => {
        event.preventDefault()
        const data = new URLSearchParams(new FormData(event.target));
        // attemp signup
        const success = await signUp(data)
        if (success) {
            await signIn(data)
        }
    }

    return (
        <Dialog open={openAuthDialog} onClose={handleClose}>
            {(isSignUp) ?
                <SignUp handleSetIsSignUp={() => handleSetIsSignUp(!isSignUp)} handleSubmit={handleSignUp}/> :
                <SignIn handleSetIsSignUp={() => handleSetIsSignUp(!isSignUp)} handleSubmit={handleSignIn}/>}
        </Dialog>
    );
}