import React from "react";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import {
  FitnessCenter,
  YouTube,
  ArrowDropDown,
} from "@material-ui/icons";
import { useAppContext } from "../../../AppContext";
import {
  makeStyles,
  Grid,
  withStyles,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@material-ui/core";

const useStyles = makeStyles((theme)=>({
  dpMenu: {
    color: "white",
    borderRadius:"0"
  },
  dpList: {
    secondary:{
      color:"white"
    }
  },
  iconGap: {
    position: "relative", 
    left: "5px",
  },
  dropArrow: {
    color: "white", 
    position:"absolute", 
    left:"125px", 
    top:"20px",
  }
}));

const StyledMenu = withStyles({
  paper: {
    border: "1px solid #d3d4d5",
    backgroundColor:"rgba(0, 0, 0, 0.87)",
    borderRadius: "5px",
    width:"166px",
    color:"white",
  },
})((props) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "center",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "center",
    }}
    {...props}
  />
));

export default function SimpleMenu() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const {sendRoomState, setWorkoutType, workoutType} = useAppContext();
  
  const classes = useStyles();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChangeWorkoutType = (value) => {
    const newWorkoutType = value ? "yt" : "vid";
    sendRoomState(
      {
        eventName: "syncWorkoutType",
        eventParams: { workoutType: newWorkoutType },
      },
      () => {
        setWorkoutType(newWorkoutType);
      }
    );
  };

  return (
    <Grid style={{ width: "auto", height: "5vh" }} container>
      <List
        component="nav"
        aria-label="Device settings"
        style={{ height: "5vh"}}
      >
        <ArrowDropDown className={classes.dropArrow} />
        <ListItem
          button
          aria-controls="simple-menu"
          aria-haspopup="true"
          variant="contained"
          color="primary"
          disableElevation
          onClick={handleClick}
          style={{
            height: "5vh",
            position: "relative",
            top: "-8px",
            width:"8vw"
          }}
          className={classes.dpList}
        >
          <ListItemText
            disableTypography
            primary={
              <Grid>
                <Typography style={{ fontSize: "10px"}}>
                  Choose Workout
                </Typography>
              </Grid>
            }
            secondary={
              <>
                {workoutType === "yt" && (
                  <Grid container alignItems="center">
                    <YouTube />
                    <Typography
                      variant="h6"
                      className={classes.iconGap}
                    >
                      YouTube
                    </Typography>
                  </Grid>
                )}
                {workoutType === "vid" && (
                  <Grid container alignItems="center">
                    <FitnessCenter />
                    <Typography
                      variant="h6"
                      className={classes.iconGap}
                    >
                      Custom
                    </Typography>
                  </Grid>
                )}
              </>
            }
          />
          
        </ListItem>
      </List>
      
      <Grid
        container
        style={{ backgroundColor: "rgba(0, 0, 0, 0.87)"}}
      >
        <StyledMenu
          id="simple-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <Grid container justify="center" alignItems="center">
            <MenuItem
              onClick={() => {
                handleChangeWorkoutType(0);
                handleClose();
              }}
            >
              <FitnessCenter/>
              <Typography
                className={classes.iconGap}
              >
                Custom
              </Typography>
            </MenuItem>
          </Grid>
          <Grid container justify="center" alignItems="center">
            <MenuItem
              onClick={() => {
                handleChangeWorkoutType(1);
                handleClose();
              }}
            >
              <YouTube />
              <Typography
                className={classes.iconGap}
              >
                YouTube
              </Typography>
            </MenuItem>
          </Grid>
        </StyledMenu>
      </Grid>
    </Grid>
  );
}