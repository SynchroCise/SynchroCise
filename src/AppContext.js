import React, { useState, createContext, useCallback, useEffect} from 'react';

const AppContext = createContext([{}, () => {}]);

const AppContextProvider = ({children}) => {
  // useEffect(() => {
    // localStorage.setItem("Room", room);
    // localStorage.setItem("Connecting", JSON.stringify(false));
    // localStorage.setItem("Username", JSON.stringify(""));
    // localStorage.setItem("Workout", JSON.stringify({"workoutName": "", "exercises": [{"time": 1, "exercise":""}]}));
    // localStorage.setItem("RoomName", JSON.stringify(''));
    // localStorage.setItem("RoomState", JSON.stringify(null));
    // localStorage.setItem("RoomTitle", JSON.stringify(""));
    // localStorage.setItem("UserId", JSON.stringify(null));
  // })

  const [room, setRoom] = useState(localStorage.getItem('Room') === null ? '' : JSON.parse(localStorage.getItem('Room')));
  const [connecting, setConnecting] = useState(localStorage.getItem('Connecting') === null ? false : JSON.parse(localStorage.getItem('Connecting')));
  const [username, setUsername] = useState(localStorage.getItem('Username') === null ? '' : localStorage.getItem('Username'));
  const [workout, setWorkout] = useState(localStorage.getItem('Workout') === null ? {"workoutName": "", "exercises": [{"time": 1, "exercise":""}]} : JSON.parse(localStorage.getItem('Workout')))
  const [roomName, setRoomName] = useState(localStorage.getItem('RoomName') === null ? '' : localStorage.getItem('RoomName'));
  const [roomState, setRoomState] = useState(localStorage.getItem('RoomState') === null ? '' : localStorage.getItem('RoomState'));
  const [roomTitle, setRoomTitle] = useState(localStorage.getItem('RoomTitle') === null ? '' : localStorage.getItem('RoomTitle'))
  const [openSideBar, setOpenSideBar] = useState(true)
  const [userId, setUserId] = useState(localStorage.getItem('UserId') === null ? '' : localStorage.getItem('UserId'))
  const [openAuthDialog, setOpenAuthDialog] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // useEffect(() => {
  //   localStorage.setItem("RoomName", JSON.stringify(roomName));
  // }, [roomName]);

  const handleSetRoom = (room) => {
    setRoom(room)
    localStorage.setItem("Room", JSON.stringify(room));
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
    localStorage.setItem("RoomName", roomCode);
    setUsername("Leader")
    localStorage.setItem("Username", "Leader");
    setRoomState('make_custom')
    localStorage.setItem("RoomState", "make_custom");
  }

  const handleRoomNameChange = useCallback((event) => {
    handleSetRoomName(event.target.value);
    localStorage.setItem("RoomName", JSON.stringify(event.target.value))
  }, []);

  const checkLoggedIn = async () => {
    const res = await fetch('/user/profile', {
      method: 'GET',
    });
    if (!res.ok) {
      setUserId('');
      localStorage.setItem("UserId", '')
      return false;
    }
    const resp = await res.json()
    setUserId(resp.user.id)
    localStorage.setItem("UserId", JSON.stringify(resp.user.id))
    return true;
  }
  const handleLogout = async () => {
    const res = await fetch('/user/logout', { method: "POST" });
    if (res.ok) {
      setUserId('');
      localStorage.setItem("UserId", '')
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
    console.log(room)
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
