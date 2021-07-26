import React from "react";
import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { FitnessCenter, YouTube } from "@material-ui/icons";
import { useAppContext } from "../../../AppContext";
import { makeStyles, Grid, withStyles } from "@material-ui/core";

const useStyles = makeStyles((theme)=>({
  dpMenu: {
    color: "white",
    borderRadius:"0"
  },
}));

const StyledMenu = withStyles({
  paper: {
    border: "1px solid #d3d4d5",
    backgroundColor:"rgba(0, 0, 0, 0.87)",
    borderRadius: "5px",
    width:"10vw",
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
    <Grid style={{ width: "auto" }}>
      <Button
        aria-controls="simple-menu"
        aria-haspopup="true"
        onClick={handleClick}
        variant="outlined"
        color="primary"
        style={{ color: "white" }}
        disableElevation
      >
        {workoutType === "yt" && <YouTube />}
        {workoutType === "vid" && <FitnessCenter />}
        Change Workout
      </Button>
      <Grid container style={{ backgroundColor: "rgba(0, 0, 0, 0.87)", color: "white" }}>
        <StyledMenu
          id="simple-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <Grid container justify="center">
            <MenuItem
              onClick={() => {
                handleChangeWorkoutType(0);
                handleClose();
              }}
            >
              <FitnessCenter /> Custom
            </MenuItem>
          </Grid>
          <Grid container justify="center">
            <MenuItem
              onClick={() => {
                handleChangeWorkoutType(1);
                handleClose();
              }}
            >
              <YouTube /> YouTube
            </MenuItem>
          </Grid>
        </StyledMenu>
      </Grid>
    </Grid>
  );
}