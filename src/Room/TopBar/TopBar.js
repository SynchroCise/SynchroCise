import React from "react";
import { useAppContext } from "../../AppContext";
import { Link, Typography, Toolbar, Grid } from "@material-ui/core";
import DropMenu from "./DropMenu/DropMenu";
import Timer from "./DropMenu/Timer";
import LinkIcon from "@material-ui/icons/Link";

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
          style={{ width: "auto" }}
        >
          <Link>
            <LinkIcon
              onClick={() => navigator.clipboard.writeText(roomCode)}
            />
          </Link>
          <Typography variant="body1">
            Room: {roomName.substring(0, 6).toUpperCase()}
          </Typography>
        </Grid>
        <DropMenu />
        <Grid style={{ width: "auto" }} container alignContent="center">
          <Timer />
        </Grid>
      </Grid>
    </Toolbar>
  );
};

export default TopBar;
