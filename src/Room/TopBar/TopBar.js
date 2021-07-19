import React from 'react'
import { useAppContext } from '../../AppContext';
import { IconButton, Link, Typography, Toolbar } from "@material-ui/core";


const TopBar = () =>{

  const { roomName } = useAppContext();
  const roomCode = roomName.substring(0, 6).toUpperCase();

  const copyRoomCodeButtonMarkup = (
      <IconButton color="secondary" onClick={() => navigator.clipboard.writeText(roomCode)}>
          <Link />
      </IconButton>
  )

  return (
    <Toolbar width="100vw" style={{ minHeight: "5vh" }}>
      <Typography variant="body1">
        {copyRoomCodeButtonMarkup}Room: {roomName.substring(0, 6).toUpperCase()}
      </Typography>
    </Toolbar>
  );
};

export default TopBar;