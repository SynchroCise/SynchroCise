import React from "react";
import { useAppContext } from "../../AppContext";
import { IconButton, Link, Typography, Toolbar, Grid } from "@material-ui/core";
import ControlledOpenSelect from "./DropMenu/DropMenu";
import Timer from "./DropMenu/Timer";

const TopBar = () => {
  const { roomName } = useAppContext();
  const roomCode = roomName.substring(0, 6).toUpperCase();

  return (
    <Toolbar width="100vw" style={{ minHeight: "5vh" }}>
      <Grid container flex justify="space-between" direction="row">
        <Grid
          container
          direction="row"
          alignContent="center"
          style={{ width: "15vw" }}
        >
          <IconButton
            onClick={() => navigator.clipboard.writeText(roomCode)}
            edge="start"
          >
            <Link />
          </IconButton>
          <Typography variant="body1">
            Room: {roomName.substring(0, 6).toUpperCase()}
          </Typography>
        </Grid>
        <ControlledOpenSelect />
        <Grid style={{ width: "4vw" }} container alignContent="center">
          <Timer/>
        </Grid>
      </Grid>
    </Toolbar>
  );
};

export default TopBar;
