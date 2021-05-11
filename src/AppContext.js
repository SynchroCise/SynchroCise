import React, { useState, createContext, useCallback, useEffect} from 'react';

const AppContext = createContext([{}, () => {}]);

const AppContextProvider = ({children}) => {
  // useEffect(() => {
    localStorage.setItem("Room", null);
    localStorage.setItem("Connecting", JSON.stringify(false));
    localStorage.setItem("Username", JSON.stringify(""));
    localStorage.setItem("Workout", JSON.stringify({"workoutName": "", "exercises": [{"time": 1, "exercise":""}]}));
    localStorage.setItem("RoomState", JSON.stringify(null));
    localStorage.setItem("RoomTitle", JSON.stringify(""));
    localStorage.setItem("UserId", JSON.stringify(null));
  // })

  const [room, setRoom] = useState(JSON.parse(localStorage.getItem('Room')));
  const [connecting, setConnecting] = useState(JSON.parse(localStorage.getItem('Connecting')));
  const [username, setUsername] = useState(JSON.parse(localStorage.getItem('Username')));
  const [workout, setWorkout] = useState(JSON.parse(localStorage.getItem('Workout')))
  const [roomName, setRoomName] = useState(JSON.parse(localStorage.getItem('RoomName')));
  const [roomState, setRoomState] = useState(JSON.parse(localStorage.getItem('RoomName')));
  const [roomTitle, setRoomTitle] = useState("")
  const [openSideBar, setOpenSideBar] = useState(true)
  const [userId, setUserId] = useState('')
  const [openAuthDialog, setOpenAuthDialog] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // useEffect(() => {
  //   localStorage.setItem("RoomName", JSON.stringify(roomName));
  // }, [roomName]);

  // useEffect(() => {
  //   localStorage.setItem("RoomState", JSON.stringify(roomState));
  // }, [roomState]);

  // useEffect(() => {
  //   localStorage.setItem("roomTitle", JSON.stringify(roomTitle));
  // }, [roomTitle]);

  const handleSetRoom = (room) => {
    setRoom(room)
    localStorage.setItem("Room", JSON.stringify(
      // {
      // name: room.name,
      // sid: room.sid,
      // workoutID: room.workoutId,
      // workoutType: room.workoutType,
      // localParticipant: {
      //   audioTracks: room.localParticipant.audioTracks,
      //   dataTracks: room.localParticipant.dataTracks,
      //   tracks: room.localParticipant.tracks,
      //   videoTracks: room.localParticipant.videoTracks,
      //   signalingRegion: room.localParticipant.signalingRegion,
      // }
    // }
    room
    ));
  }
  const handleSetConnecting = (connecting) => {
    setConnecting(connecting)
    localStorage.setItem("Connecting", JSON.stringify(connecting));
  }
  const handleSetUsername = (username) => {
    setUsername(username)
    localStorage.setItem("Username", JSON.stringify(username));
  }
  const handleSetRoomName = (roomname) => {
    setRoomName(roomname)
    localStorage.setItem("RoomName", JSON.stringify(roomname));
  }
  const handleSetRoomState = (roomState) => {
    setRoomState(roomState)
    localStorage.setItem("RoomState", JSON.stringify(roomState));
  }
  const handleSetRoomTitle = (roomTitle) => {
    setRoomTitle(roomTitle)
    localStorage.setItem("RoomTitle", JSON.stringify(roomTitle));
  }
  const handleSetWorkout = (workout) => {
    setWorkout(workout)
    localStorage.setItem("Workout", JSON.stringify(workout));
  }
  const handleOpenSideBar = () => {
    setOpenSideBar(!openSideBar)
  }
  const handleSetUserId = (userId) => {
    setUserId(userId)
    localStorage.setItem("UserId", JSON.stringify(userId));
  }
  const handleSetOpenAuthDialog = (val) => {
    setOpenAuthDialog(val);
  }
  const handleSetIsSignUp = (val) => {
    setIsSignUp(val);
    localStorage.setItem("IsSignUp", JSON.stringify(val));
  }

  // const createRoom = (room_code) => {
  //   setRoomName(room_code)
  //   setUsername("Leader")
  //   setRoomState('make_custom')
  // }

  const disconnectRoom = () => {
    setRoomName("")
    localStorage.setItem("RoomName", "");
    setUsername("")
    localStorage.setItem("Username", "");
    setRoomState(null)
    localStorage.setItem("RoomState", "");
  }

  const joinRoom = () => {
    // check if room exists here TODO
    setRoomState('join')
    localStorage.setItem("RoomState", "join");
  }

  const handleUsernameChange = useCallback((event) => {
    handleSetUsername(event.target.value);
    localStorage.setItem("Username", JSON.stringify(event.target.value));
  }, []);

  const handleRoomTitle = useCallback((event) => {
    setRoomTitle(event.target.value);
    localStorage.setItem("RoomTitle", JSON.stringify(event.target.value));
  }, []);

  const makeCustomRoom = async (event) => {
    const res = await fetch('/api/roomCode', { 
      method: "GET", 
      headers: {
        "Content-Type": "text/plain",
      },
    });
    const roomCode = await res.text();
    setRoomName(roomCode)
    localStorage.setItem("RoomName", JSON.stringify(roomCode));
    setUsername("Leader")
    localStorage.setItem("Username", "Leader");
    setRoomState('make_custom')
    localStorage.setItem("RoomStae", "make_custom");
  }

  const handleRoomNameChange = useCallback((event) => {
    handleSetRoomName(event.target.value);
  }, []);

  const checkLoggedIn = async () => {
    const res = await fetch('/user/profile', {
      method: 'GET',
    });
    if (!res.ok) {
      setUserId('');
      return false;
    }
    const resp = await res.json()
    setUserId(resp.user.id)
    return true;
  }
  const handleLogout = async () => {
    const res = await fetch('/user/logout', { method: "POST" });
    if (res.ok) {
      setUserId('');
    }
  }

  // ejects user from room and return them to lobby
  const handleLeaveRoom = useCallback(() => {
    handleSetRoom((prevRoom) => {
      if (prevRoom) {
        prevRoom.localParticipant.tracks.forEach((trackPub) => {
          trackPub.track.stop();
        });
        prevRoom.disconnect();
      }
      return null;
    });
  }, []);

  useEffect(() => {
    if (room) {
      const tidyUp = (event) => {
        if (event.persisted) {
          return;
        }
        if (room) {
          handleLeaveRoom();
        }
      };
      window.addEventListener("pagehide", tidyUp);
      window.addEventListener("beforeunload", tidyUp);
      return () => {
        window.removeEventListener("pagehide", tidyUp);
        window.removeEventListener("beforeunload", tidyUp);
      };
    }
  }, [room, handleLeaveRoom]);

  useEffect(() => {
    if (!userId) {
      checkLoggedIn()
    }
  }, [])


  return (
      <AppContext.Provider value={{
        room,
        handleSetRoom,
        connecting,
        handleSetConnecting,
        username,
        handleSetUsername,
        roomName,
        handleSetRoomName,
        roomState,
        handleSetRoomState,
        roomTitle,
        handleSetRoomTitle,
        workout,
        handleSetWorkout,
        openSideBar,
        handleOpenSideBar,
        userId,
        openAuthDialog,
        handleSetOpenAuthDialog,
        isSignUp,
        handleSetIsSignUp,
        handleSetUserId,
        disconnectRoom,
        joinRoom,
        handleUsernameChange,
        handleRoomTitle,
        makeCustomRoom,
        handleRoomNameChange,
        handleLeaveRoom,
        checkLoggedIn,
        handleLogout
      }}>
          {children}
      </AppContext.Provider>
  );
};

export { AppContext, AppContextProvider };
