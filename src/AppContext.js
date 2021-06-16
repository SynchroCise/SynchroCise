import React, { useState, createContext, useCallback, useEffect } from 'react';
import { sckt } from './Socket';


const AppContext = createContext([{}, () => { }]);

const AppContextProvider = ({ children }) => {
  const [room, setRoom] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [username, setUsername] = useState("");
  // const [workout, setWorkout] = useState({"workoutName": "", "exercises": [{"time": 1, "exercise":""}]})
  const [roomName, setRoomName] = useState("");
  const [roomState, setRoomState] = useState(null);
  const [roomTitle, setRoomTitle] = useState("")
  const [openSideBar, setOpenSideBar] = useState(true)
  const [userId, setUserId] = useState('')
  const [openAuthDialog, setOpenAuthDialog] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [roomProps, setRoomProps] = useState({
    workoutType: 'vid', // 'yt', 'custom',
    workout: { "workoutName": "", "exercises": [{ "time": 1, "exercise": "" }], "id": "" },
    playWorkoutState: false,
    workoutNumber: 0,
    workoutCounter: -1
  });
  const [videoProps, setVideoProps] = useState({
    queue: [],
    history: [],
    playing: true,
    seekTime: 0,
    receiving: false,
    initVideo: false,
    videoType: 'yt'
  });

  const sendRoomState = ({ eventName, eventParams }, callback) => {
    let params = {
      name: username,
      room: room.sid,
      eventName: eventName,
      eventParams: eventParams
    };
    sckt.socket.emit('sendRoomState', params, callback);
  }

  const updateRoomProps = (paramsToChange) => {
    setRoomProps((prev) => ({ ...prev, ...paramsToChange }));
  }

  const updateVideoProps = (paramsToChange) => {
    setVideoProps((prev) => ({ ...prev, ...paramsToChange }));
  }

  const setWorkoutType = (workoutType) => updateRoomProps({ workoutType });

  const setPlayWorkoutState = (playWorkoutState) => updateRoomProps({ playWorkoutState });

  const setWorkoutCounter = (workoutCounter) => updateRoomProps({ workoutCounter });

  const setWorkoutNumber = (workoutNumber) => updateRoomProps({ workoutNumber });

  const handleSetWorkout = (workout) => updateRoomProps({ workout });

  const handleOpenSideBar = () => setOpenSideBar(!openSideBar)

  const disconnectRoom = () => {
    setRoomName("")
    setUsername("")
    setRoomState(null)
  }

  const joinRoom = () => {
    // check if room exists here TODO
    setRoomState('join');
  }

  const handleUsernameChange = useCallback((event) => {
    setUsername(event.target.value);
  }, []);

  const handleRoomTitle = useCallback((event) => {
    setRoomTitle(event.target.value);
  }, []);

  const makeCustomRoom = useCallback(async (event) => {
    const res = await fetch('/api/roomCode', {
      method: "GET",
      headers: {
        "Content-Type": "text/plain",
      },
    });
    const roomCode = await res.text();
    setRoomName(roomCode)
    setRoomState('make_custom')
  }, []);

  const createTempUser = useCallback(async (name) => {
    const res = await fetch(`/api/createTempUser`, {
      method: "POST",
      body: JSON.stringify({ name }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) return null
    const userCode = await res.text();
    setUserId(userCode)
    return userCode
  }, []);

  const handleRoomNameChange = useCallback((event) => {
    setRoomName(event.target.value);
  }, []);

  const checkLoggedIn = useCallback(async () => {
    const res = await fetch('/user/profile', {
      method: 'GET',
    });
    if (!res.ok) {
      setUserId('');
      setIsLoggedIn(false);
      return false;
    }
    const resp = await res.json()
    setUserId(resp.user.id)
    setUsername(resp.user.displayName)
    setIsLoggedIn(true);
    return true;
  }, []);
  const handleLogout = async () => {
    const res = await fetch('/user/logout', { method: "POST" });
    if (res.ok) {
      setUserId('');
      setIsLoggedIn(false);
    }
  }

  // ejects user from room and return them to lobby
  const handleLeaveRoom = useCallback(() => {
    setRoomName((prevRoom) => {
      if (prevRoom) {
        prevRoom.localParticipant.tracks.forEach((trackPub) => {
          trackPub.track.stop();
        });
        prevRoom.disconnect();
        window.location.reload();
        window.removeEventListener("popstate", handleLeaveRoom);
      }
      return null;
    });
  }, []);

  useEffect(() => {
    window.addEventListener("popstate", handleLeaveRoom);
  }, [room, handleLeaveRoom]);

  useEffect(() => {
    if (!isLoggedIn) {
      checkLoggedIn()
    }
  }, [checkLoggedIn, isLoggedIn])


  return (
    <AppContext.Provider value={{
      room,
      handleSetRoom: setRoom,
      connecting,
      handleSetConnecting: setConnecting,
      username,
      handleSetUsername: setUsername,
      roomName,
      handleSetRoomName: setRoomName,
      roomState,
      handleSetRoomState: setRoomState,
      roomTitle,
      handleSetRoomTitle: setRoomTitle,
      workout: roomProps.workout,
      handleSetWorkout,
      workoutType: roomProps.workoutType,
      setWorkoutType,
      playWorkoutState: roomProps.playWorkoutState,
      setPlayWorkoutState,
      workoutCounter: roomProps.workoutCounter,
      setWorkoutCounter,
      workoutNumber: roomProps.workoutNumber,
      setWorkoutNumber,
      openSideBar,
      handleOpenSideBar,
      userId,
      openAuthDialog,
      handleSetOpenAuthDialog: setOpenAuthDialog,
      isSignUp,
      handleSetIsSignUp: setIsSignUp,
      handleSetUserId: setUserId,
      isLoggedIn,
      setIsLoggedIn,
      disconnectRoom,
      joinRoom,
      handleUsernameChange,
      handleRoomTitle,
      makeCustomRoom,
      handleRoomNameChange,
      handleLeaveRoom,
      checkLoggedIn,
      handleLogout,
      roomProps,
      updateRoomProps,
      videoProps,
      updateVideoProps,
      sendRoomState,
      createTempUser
    }}>
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppContextProvider };
