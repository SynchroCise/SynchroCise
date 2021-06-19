import React from "react";// import "../media/CoLab.css";
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import AuthDialog from '../Auth/AuthDialog';
import {useAppContext} from "../AppContext";

const Navbar = () => {
  const { isLoggedIn, handleLogout, handleSetIsSignUp, handleSetOpenAuthDialog } = useAppContext();
  const handleLoginDialogClick = (val) => {
    handleSetIsSignUp(val);
    handleSetOpenAuthDialog(true);
  }
  return (
    <AppBar position="static" data-test="navbarComponent">
      <Toolbar>
        <Typography variant="h5" style={{flexGrow: 1}} color="secondary">
          SynchroCise
        </Typography>
        {(isLoggedIn) ? (<Button onClick={handleLogout} data-test="logoutButton">Logout</Button>) : 
        (
          <div>
            <Button onClick={() => handleLoginDialogClick(false)} data-test="signInButton">Sign In</Button>
            <Button color="secondary" onClick={() => handleLoginDialogClick(true)} data-test="signUpButton">Sign Up</Button>
          </div>
        )}
      </Toolbar>
      <AuthDialog />
    </AppBar>
  );
};

export default Navbar;
