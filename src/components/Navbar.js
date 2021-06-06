import React, {useContext}from "react";// import "../media/CoLab.css";
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import AuthDialog from '../Auth/AuthDialog';
import {AppContext} from "../AppContext"


const Navbar = () => {
  const {isLoggedIn, handleSetOpenAuthDialog, handleSetIsSignUp, handleLogout} = useContext(AppContext)

  const handleLoginDialogClick = (val) => {
    handleSetIsSignUp(val);
    handleSetOpenAuthDialog(true);
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h5" style={{flexGrow: 1}} color="secondary">
          SynchroCise
        </Typography>
        {(isLoggedIn) ? (<Button onClick={handleLogout}>Logout</Button>) : 
        (
          <div>
            <Button onClick={() => handleLoginDialogClick(false)}>Sign In</Button>
            <Button color="secondary" onClick={() => handleLoginDialogClick(true)}>Sign Up</Button>
          </div>
        )}
      </Toolbar>
      <AuthDialog/>
    </AppBar>
  );
};

export default Navbar;
