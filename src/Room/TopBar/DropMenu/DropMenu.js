import React from "react";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { FitnessCenter, YouTube, ArrowDropDown } from "@material-ui/icons";
import { useAppContext } from "../../../AppContext";
import {
  makeStyles,
  Grid,
  withStyles,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  dpMenu: {
    color: "white",
    borderRadius: "0",
  },
  dpList: {
    secondary: {
      color: "white",
    },
  },
  iconGap: {
    position: "relative",
    left: "5px",
  },
  dropArrow: {
    color: "white",
    position: "absolute",
    left: "125px",
    top: "20px",
  },
}));

const StyledMenu = withStyles({
  paper: {
    border: "1px solid #d3d4d5",
    backgroundColor: "rgba(0, 0, 0, 0.87)",
    borderRadius: "5px",
    width: "166px",
    color: "white",
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
  const { sendRoomState, setWorkoutType, workoutType } = useAppContext();

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
    <>
      <List component="nav" aria-label="Device settings" style={{ padding: 0}}>
        <ListItem
          button
          aria-controls="simple-menu"
          aria-haspopup="true"
          variant="contained"
          color="primary"
          disableElevation
          onClick={handleClick}
          style={{ width: "130px", padding: 0 }}
          className={classes.dpList}
        >
          <ListItemText
            disableTypography
            style={{borderBottom: 5 , marginLeft:"5px"}}
            primary={
              <Grid container>
                <Grid item xs={12}>
                  <Typography style={{ fontSize: "16px" }}>
                    Choose Workout
                  </Typography>
                </Grid>
              </Grid>
            }
            secondary={
              <>
                {workoutType === "yt" && (
                  <Grid container alignItems="center">
                    <Grid item xs={9}>
                      <Button
                        startIcon={<YouTube />}
                        size="small"
                        disabled
                        style={{
                          color: "white",
                          textTransform: "none",
                          fontSize: "16px",
                          padding: 0,
                        }}
                      >
                        YouTube
                      </Button>
                    </Grid>
                    <Grid item xs={3}>
                      <Grid container justify="center">
                        <ArrowDropDown />
                      </Grid>
                    </Grid>
                  </Grid>
                )}
                {workoutType === "vid" && (
                  <Grid container alignItems="center">
                    <Grid item xs={9}>
                      <Button
                        startIcon={<FitnessCenter />}
                        size="small"
                        disabled
                        style={{
                          color: "white",
                          textTransform: "none",
                          fontSize: "16px",
                          padding: 0,
                        }}
                      >
                        {" "}
                        Custom{" "}
                      </Button>
                    </Grid>
                    <Grid item xs={3}>
                      <Grid container justify="center">
                        <ArrowDropDown />
                      </Grid>
                    </Grid>
                  </Grid>
                )}
              </>
            }
          />
        </ListItem>
      </List>

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
            <FitnessCenter />
            <Typography className={classes.iconGap}>Custom</Typography>
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
            <Typography className={classes.iconGap}>YouTube</Typography>
          </MenuItem>
        </Grid>
      </StyledMenu>
    </>
  );
}
