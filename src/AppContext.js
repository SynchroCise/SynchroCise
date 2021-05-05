import React, { useState, createContext, useCallback, useEffect} from 'react';

const AppContext = createContext([{}, () => {}]);

const AppContextProvider = ({children}) => {
  const [room, setRoom] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [username, setUsername] = useState("");
  const [workout, setWorkout] = useState({"workoutName": "", "exercises": [{"time": 1, "exercise":""}]})
  const [roomName, setRoomName] = useState("");
  const [roomState, setRoomState] = useState(null);
  const [roomTitle, setRoomTitle] = useState("")
  const [openSideBar, setOpenSideBar] = useState(true)
  const [userId, setUserId] = useState('')
  const [openAuthDialog, setOpenAuthDialog] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSetRoom = (room) => {
    setRoom(room)
  }
  const handleSetConnecting = (connecting) => {
    setConnecting(connecting)
  }
  const handleSetUsername = (username) => {
    setUsername(username)
  }
  const handleSetRoomName = (roomname) => {
    setRoomName(roomname)
  }
  const handleSetRoomState = (roomState) => {
    setRoomState(roomState)
  }
  const handleSetRoomTitle = (roomTitle) => {
    setRoomTitle(roomTitle)
  }
  const handleSetWorkout = (workout) => {
    setWorkout(workout)
  }
  const handleOpenSideBar = () => {
    setOpenSideBar(!openSideBar)
  }
  const handleSetUserId = (userId) => {
    setUserId(userId)
  }
  const handleSetOpenAuthDialog = (val) => {
    setOpenAuthDialog(val);
  }
  const handleSetIsSignUp = (val) => {
    setIsSignUp(val);
  }

  // const createRoom = (room_code) => {
  //   setRoomName(room_code)
  //   setUsername("Leader")
  //   setRoomState('make_custom')
  // }

  const disconnectRoom = () => {
    setRoomName("")
    setUsername("")
    setRoomState(null)
  }

  const joinRoom = () => {
    // check if room exists here TODO
    setRoomState('join')
  }

  const handleUsernameChange = useCallback((event) => {
    handleSetUsername(event.target.value);
  }, []);

  const handleRoomTitle = useCallback((event) => {
    setRoomTitle(event.target.value);
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
    setRoomState('make_custom')
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
    setUsername(resp.user.displayName)
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
