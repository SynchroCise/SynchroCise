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
    <Toolbar width="100vw">
      <Grid
        container
        width="100vw"
        style={{ height: "5vh" }}
        alignItems="flex-end"
      >
        <Grid container justify="space-between" direction="row">
          <Grid item>
            <Grid container alignContent="center" style={{ height: "100%" }}>
              <Link>
                <LinkIcon
                  onClick={() => navigator.clipboard.writeText(roomCode)}
                />
              </Link>
              <Typography
                variant="body1"
                style={{ position: "relative", left: "5px" }}
              >
                Room: {roomName.substring(0, 6).toUpperCase()}
              </Typography>
            </Grid>
          </Grid>
          <Grid item>
            <Grid container>
              <DropMenu />
            </Grid>
          </Grid>
          <Grid item>
            <Grid alignContent="center" style={{ height: "100%" }} container>
              <Timer />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Toolbar>
  );
};

export default TopBar;