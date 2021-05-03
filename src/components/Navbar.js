import React, {useContext}from "react";// import "../media/CoLab.css";
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import ToolBar from '@material-ui/core/ToolBar';
import Button from '@material-ui/core/Button';
import AuthDialog from '../Auth/AuthDialog';
import {AppContext} from "../AppContext"


const Navbar = () => {
  const {userId, handleSetOpenAuthDialog, handleSetIsSignUp} = useContext(AppContext)

  const handleLoginDialogClick = (val) => {
    handleSetIsSignUp(val);
    handleSetOpenAuthDialog(true);
  }

  return (
    <AppBar position="static">
      <ToolBar>
        <Typography variant="h5" style={{flexGrow: 1}} color="secondary">
          SynchroCise
        </Typography>
        {(userId) ? (<div/>) : 
        (
          <div>
            <Button onClick={() => handleLoginDialogClick(false)}>Sign In</Button>
            <Button color="secondary" onClick={() => handleLoginDialogClick(true)}>Sign Up</Button>
          </div>
        )}
      </ToolBar>
      <AuthDialog/>
    </AppBar>
  );
};

export default Navbar;
