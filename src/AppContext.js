import React, { useState, createContext, useCallback, useEffect, useContext } from 'react';
import { sckt } from './Socket';
import * as requests from './utils/requests'
import { useJitsi } from './utils/jitsi'

export const useAppContext = () => useContext(AppContext)

const AppContext = createContext([{}, () => { }]);

const AppContextProvider = ({ children }) => {
  const { JitsiMeetJS } = useJitsi();
  const [room, setRoom] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomState, setRoomState] = useState(null);
  const [roomTitle, setRoomTitle] = useState("")
  const [openSideBar, setOpenSideBar] = useState(true)
  const [userId, setUserId] = useState('')
  const [openAuthDialog, setOpenAuthDialog] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sideBarType, setSideBarType] = useState(0);
  const [participantIds, setParticipantIds] = useState([]);
  const [pinnedParticipantId, setPinnedParticipantId] = useState("");
  const [localTracks, setLocalTracks] = useState([]);
  const [roomProps, setRoomProps] = useState({
    workoutType: 'yt', // 'yt', 'custom',
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
      room: roomName,
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

  const setWorkoutType = useCallback((workoutType) => updateRoomProps({ workoutType }), []);

  const setPlayWorkoutState = useCallback((playWorkoutState) => updateRoomProps({ playWorkoutState }), []);

  const setWorkoutCounter = useCallback((workoutCounter) => updateRoomProps({ workoutCounter }), []);

  const setWorkoutNumber = useCallback((workoutNumber) => updateRoomProps({ workoutNumber }), []);

  const handleSetWorkout = useCallback((workout) => updateRoomProps({ workout }), []);

  const handleOpenSideBar = () => setOpenSideBar(!openSideBar)

  const joinRoom = (roomName) => {
    // check if room exists here TODO
    setRoomState('join');
    setRoomName(roomName)
  }

  const handleUsernameChange = useCallback((event) => {
    setUsername(event.target.value);
  }, []);

  const handleRoomTitle = useCallback((event) => {
    setRoomTitle(event.target.value);
  }, []);

  const makeCustomRoom = useCallback(async (event) => {
    const res = await requests.getRoomCode()
    if (!res.ok) return
    setRoomName(res.body.roomCode.toLowerCase())
    setRoomState('make_custom')
  }, []);

  const handleRoomNameChange = useCallback((event) => {
    setRoomName(event.target.value);
  }, []);

  const checkLoggedIn = useCallback(async () => {
    const res = await requests.checkLoggedIn();
    if (!res.ok) {
      setUserId('');
      setIsLoggedIn(false);
      return false;
    }
    setUserId(res.body.user.id)
    setUsername(res.body.user.name)
    setEmail(res.body.user.email)
    setIsLoggedIn(true);
    return true;
  }, []);

  const handleLogout = async () => {
    const res = await requests.userLogout();
    if (res.ok) {
      setUserId('');
      setIsLoggedIn(false);
    }
  }

  // ejects user from room and return them to lobby
  const handleLeaveRoom = useCallback(() => {
    setRoom((prevRoom) => {
      if (prevRoom) {
        prevRoom.getLocalTracks().forEach(track => {
          if (track.getType() === 'video') track.dispose();
          if (track.getType() === 'audio') track.dispose();
        });
        sckt.socket.emit("handleLeaveRoom");
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
      email,
      handleSetEmail: setEmail,
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
      joinRoom,
      handleUsernameChange,
      handleRoomTitle,
      makeCustomRoom,
      handleRoomNameChange,
      handleLeaveRoom,
      checkLoggedIn,
      handleLogout,
      roomProps,
      setVideoProps,
      updateRoomProps,
      videoProps,
      updateVideoProps,
      sendRoomState,
      sideBarType,
      setSideBarType,
      pinnedParticipantId,
      setPinnedParticipantId,
      participantIds,
      setParticipantIds,
      JitsiMeetJS,
      localTracks,
      setLocalTracks
    }}>
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppContextProvider };
