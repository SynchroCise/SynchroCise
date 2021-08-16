import React, { useState } from "react";
import { makeStyles } from '@material-ui/core/styles';
import { ListItemIcon, ListItemText, ListItem, Divider, IconButton, Typography, List, Link, Toolbar, CssBaseline, Drawer, Dialog, DialogTitle, DialogContent, DialogContentText, TextField, Button, DialogActions } from '@material-ui/core'
import EditIcon from '@material-ui/icons/Edit';
import { useAppContext } from "../AppContext";
import PersonIcon from '@material-ui/icons/Person';
import Add from '@material-ui/icons/Add';
import FitnessCenterIcon from '@material-ui/icons/FitnessCenter';
import * as requests from './../utils/requests'
import WorkoutTable from "../Home/CreateRoom/WorkoutTable"
import WorkoutHistoryTable from "./WorkoutHistoryTable"
import { RoutesEnum } from '../App'
import { useHistory } from 'react-router-dom'

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    zIndex: theme.zIndex.appBar - 1,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerContainer: {
    overflow: 'auto',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
}));

export default function Profile() {
  const history = useHistory()
  const { email, username, checkLoggedIn } = useAppContext();
  const [open, setOpen] = useState(false);
  const [changeOption, setOption] = useState(3);
  const [tabNumber, setTabNumber] = useState(0);
  const handleClickOpen = () => { setOpen(true) };
  const handleClose = () => { setOpen(false) };
  const classes = useStyles();

  const changeProfileDetails = async (option) => {
    handleClickOpen();
    setOption(option);
  }

  const handleRequest = async () => {
    let res;
    switch (changeOption) {
      case 0:
        res = await requests.changeEmail(document.getElementById("name").value);
        if (res.ok) {
          handleClose();
        }
        break;
      case 1:
        res = await requests.changeUsername(document.getElementById("name").value);
        if (res.ok) {
          handleClose();
        }
        break;
      case 2:
        res = await requests.changePassword(document.getElementById("name").value);
        if (res.ok) {
          handleClose();
        }
        break;
      default:
        break;
    }
    checkLoggedIn();
  }

  const popupChanger = () => {
    let type;
    switch (changeOption) {
      case 0:
        type = "Email"
        break;
      case 1:
        type = "Username"
        break;
      case 2:
        type = "Password"
        break;
      default:
        break;
    }
    return (
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Change {type}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To change your {type}, please enter in your new {type} below.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label={"New " + type}
            type="email"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleRequest} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>)
  };

  const mainContents = () => {
    switch (tabNumber) {
      case (0):
        return (
          <React.Fragment>
            {popupChanger()}
            <Typography>
              Email: {email} <Link component="button" onClick={() => changeProfileDetails(0)} style={{ fontSize: '10px' }}>change email</Link>
            </Typography>
            <Typography>
              Username: {username} <Link component="button" onClick={() => changeProfileDetails(1)} style={{ fontSize: '10px' }}>change username</Link>
            </Typography>
            <Typography>
              Password: <Link component="button" onClick={() => changeProfileDetails(2)} style={{ fontSize: '10px' }}>change password</Link>
            </Typography>
          </React.Fragment>
        )
      case (1):
        return (
          <WorkoutHistoryTable />)
      case (2):
        return (
          <React.Fragment>
            <WorkoutTable />
            <IconButton onClick={() => { history.push(RoutesEnum.CreateWorkout) }} ><Add /></IconButton>
          </React.Fragment >)
      default:
        break;
    }
  }

  return (
    <div className={classes.root}>
      <CssBaseline />
      <Drawer
        className={classes.drawer}
        variant="permanent"
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <Toolbar />
        <div className={classes.drawerContainer}>
          <List>
            <ListItem button key={"actOvrvw"} onClick={() => setTabNumber(0)}>
              <ListItemIcon ><PersonIcon /> </ListItemIcon>
              <ListItemText primary={"Account Overview"} />
            </ListItem>
            <ListItem button key={"wrkoutHist"} onClick={() => setTabNumber(1)}>
              <ListItemIcon><FitnessCenterIcon /> </ListItemIcon>
              <ListItemText primary={"Workout History"} />
            </ListItem>
            <ListItem button key={"edtwrkout"} onClick={() => setTabNumber(2)}>
              <ListItemIcon><EditIcon /> </ListItemIcon>
              <ListItemText primary={"Edit Your Workouts"} />
            </ListItem>
          </List>
          <Divider />
        </div>
      </Drawer>
      <main className={classes.content}>
        <Toolbar />
        {mainContents()}
      </main>
    </div>
  );
}
