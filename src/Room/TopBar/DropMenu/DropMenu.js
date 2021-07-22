import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { FitnessCenter, YouTube } from "@material-ui/icons";
import { Grid, makeStyles } from "@material-ui/core";
import { useAppContext } from "../../../AppContext";

  const useStyles = makeStyles((theme) => ({
    smItem: {
      backgroundColor: "rgba(0, 0, 0, 0.87)",
    },
  }));

const StyledMenu = withStyles({
  paper: {
    border: "1px solid #d3d4d5",
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

const StyledMenuItem = withStyles((theme) => ({
  root: {
    "&:focus": {
      backgroundColor: "rgba(0, 0, 0, 0.87)",
      "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
        color: theme.palette.common.white,
      },
    },
  },
}))(MenuItem);


export default function DropMenu() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const {sendRoomState, setWorkoutType} = useAppContext();
  
  const classes = useStyles();
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };



  const handleChangeWorkoutType = (value) => {
    const newWorkoutType = value ? 'yt' : 'vid';
    sendRoomState({
        eventName: 'syncWorkoutType',
        eventParams: { workoutType: newWorkoutType }
    }, () => { setWorkoutType(newWorkoutType) });
  }

  return (
    <Grid style={{width:"20vw"}}>
      <Button
        aria-controls="customized-menu"
        aria-haspopup="true"
        variant="contained"
        color="primary"
        onClick={handleClick}
      >
        CHOOSE WORKOUT
      </Button>
      <StyledMenu
        id="customized-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <StyledMenuItem button onClick={()=>handleChangeWorkoutType(0)}> 
          <ListItemIcon>
            <FitnessCenter fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Custom" />
        </StyledMenuItem>
        <StyledMenuItem button onClick={()=>handleChangeWorkoutType(1)}> 
          <ListItemIcon>
            <YouTube fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Youtube" />
        </StyledMenuItem>
      </StyledMenu>
    </Grid>
  );
}