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
      <Grid
        container
        justify="space-between"
        direction="row"
        alignItems="flex-end"
      >
        <Grid container style={{ width: "auto"}} >
          <Link>
            <LinkIcon onClick={() => navigator.clipboard.writeText(roomCode)} />
          </Link>
          <Typography variant="body1">
            Room: {roomName.substring(0, 6).toUpperCase()}
          </Typography>
        </Grid>
        <DropMenu />
        <Grid style={{ width: "auto"}} container>
          <Timer />
        </Grid>
      </Grid>
    </Toolbar>
  );
};

export default TopBar;
