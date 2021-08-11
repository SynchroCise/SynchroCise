import React from "react";
import { useAppContext } from "../../AppContext";
import { Typography, Toolbar, Grid, IconButton } from "@material-ui/core";
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
        alignItems="flex-end"
      >
        <Grid container justify="space-between" direction="row">
          <Grid item>
            <Grid container alignContent="center" style={{ height: "100%" }}>
              <IconButton>
                <LinkIcon
                  onClick={() => navigator.clipboard.writeText(roomCode)}
                  color="primary"
                />
              </IconButton>
              <Typography
                variant="body1"
                style={{ position: "relative", left: "5px",alignSelf:"center" }}
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
