import React, {useState}from "react";// import "../media/CoLab.css";
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import ToolBar from '@material-ui/core/ToolBar';
import Button from '@material-ui/core/Button';
import LoginDialog from '../Login/LoginDialog';

const Navbar = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSetOpenDialog = (val) => {
    setOpenDialog(val);
  }

  const handleLoginDialogClick = (val) => {
    setIsSignUp(val);
    setOpenDialog(true);
  }

  const handleSetIsSignUp = () => {
    setIsSignUp(!isSignUp);
  }

  return (
    <AppBar position="static">
      <ToolBar>
        <Typography variant="h5" style={{flexGrow: 1}} color="secondary">
          SynchroCise
        </Typography>
        <Button onClick={() => handleLoginDialogClick(false)}>Sign In</Button>
        <Button color="secondary" onClick={() => handleLoginDialogClick(true)}>Sign Up</Button>
      </ToolBar>
      <LoginDialog
        openDialog={openDialog}
        isSignUp={isSignUp}
        handleSetOpenDialog={handleSetOpenDialog}
        handleSetIsSignUp={handleSetIsSignUp}
      />
    </AppBar>
  );
};

export default Navbar;
