import React from "react";
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import AuthDialog from '../Auth/AuthDialog';
import { useHistory } from 'react-router-dom'
import { RoutesEnum } from '../App'
import { useAppContext } from "../AppContext";

const Navbar = () => {
  const history = useHistory();
  const { isLoggedIn, handleLogout, handleSetIsSignUp, handleSetOpenAuthDialog } = useAppContext();
  const handleLoginDialogClick = (val) => {
    handleSetIsSignUp(val);
    handleSetOpenAuthDialog(true);
  }
  return (
    <AppBar position="fixed" data-test="navbarComponent">
      <Toolbar>
        <Typography variant="h5" style={{ flexGrow: 1 }}>
          <Link component="button" style={{ textDecoration: 'none' }} color="secondary" onClick={() => history.push(RoutesEnum.Home)} >SynchroCise</Link>
        </Typography>
        {(isLoggedIn) ? (
          <Box>
            <Button onClick={() => history.push(RoutesEnum.Profile)}>Profile</Button>
            <Button onClick={handleLogout} data-test="logoutButton">Logout</Button>
          </Box>) :
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
