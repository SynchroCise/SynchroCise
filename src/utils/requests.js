import Video from "twilio-video";

const formatResults = async (res) => {
  let body = await res.text();
  try {
    body = JSON.parse(body);
  } catch (err) {
    body = { message: body };
  }
  if (!body.message) {
    body.message = res ? "Success" : "Failed";
  }
  return {
    ok: res.ok,
    body
  };
};

// Room related requests
export const getRoomByName = async (roomName) => {
  const res = await fetch(`/api/rooms?sid_or_name=${roomName}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return formatResults(res);
};

export const getRoomCode = async () => {
  const res = await fetch("/api/roomCode", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return formatResults(res);
};


export const createRoom = async (room, workoutId, workoutType = "vid") => {
  const res = await fetch("/api/rooms", {
    method: "POST",
    body: JSON.stringify({
      name: room.name,
      sid: room.sid,
      workoutID: workoutId,
      workoutType: workoutType,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return formatResults(res);
};

export const getDisplayNamesInRoom = async (roomSid) => {
  const res = await fetch(`/api/displayNameInRoom?rid=${roomSid}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return formatResults(res);
};

// User related requests
export const createTempUser = async (name) => {
  const res = await fetch(`/api/createTempUser`, {
    method: "POST",
    body: JSON.stringify({ name }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return formatResults(res);
};

export const checkLoggedIn = async () => {
  const res = await fetch("/user/checkLoggedIn", {
    method: "GET",
  });
  return formatResults(res);
};

export const userLogout = async () => {
  const res = await fetch("/user/logout", { method: "POST" });
  return formatResults(res);
};

export const changeEmail = async (email) => {
  const res = await fetch(`/user/changeEmail`, {
    method: "PUT",
    body: JSON.stringify({ email }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return formatResults(res);
};

export const changePassword = async (password) => {
  const res = await fetch(`/user/changePassword`, {
    method: "PUT",
    body: JSON.stringify({ password }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return formatResults(res);
};

export const changeUsername = async (username) => {
  const res = await fetch(`/user/changeUsername`, {
    method: "PUT",
    body: JSON.stringify({ username }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return formatResults(res);
};

export const userLogin = async (formData) => {
  const res = await fetch("/login", {
    method: "POST",
    body: formData,
  });
  return formatResults(res);
};

export const userSignUp = async (formData) => {
  const res = await fetch("/signup", {
    method: "POST",
    body: formData,
  });
  return formatResults(res);
};

// Workout related requests
export const getUserWorkouts = async () => {
  const res = await fetch("/user/getWorkouts", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return formatResults(res);
};

export const getUserWorkout = async (workoutId) => {
  const res = await fetch(`/user/getWorkout?workoutId=${workoutId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return formatResults(res);
};

export const addWorkout = async (newWorkout) => {
  const res = await fetch("/user/addWorkout", {
    method: "POST",
    body: JSON.stringify(newWorkout),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return formatResults(res);
};

export const editWorkout = async (newWorkout, workoutId) => {
  const res = await fetch("/user/editWorkout", {
    method: "PUT",
    body: JSON.stringify({ newWorkout: newWorkout, workoutId: workoutId }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return formatResults(res);
}

export const deleteWorkout = async (workoutId) => {
  const res = await fetch("/user/deleteWorkout", {
    method: "POST",
    body: JSON.stringify({ workoutId }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return formatResults(res);
};
// Twilio related requests
export const twilioToken = async (tempUserId, roomName) => {
  const res = await fetch("/video/token", {
    method: "POST",
    body: JSON.stringify({
      identity: tempUserId,
      room: roomName,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return formatResults(res);
};

export const createTwilioRoom = async (token, roomName) => {
  let vidPerm;
  let audPerm;
  let tracks = [];
  try {
    tracks.push(await Video.createLocalVideoTrack());
    vidPerm = true;
  } catch {
    vidPerm = false;
  }
  try {
    tracks.push(await Video.createLocalAudioTrack());
    audPerm = true;
  } catch {
    audPerm = false;
  }
  const room = await Video.connect(token, {
    video: vidPerm,
    audio: audPerm,
    name: roomName,
    tracks: tracks,
  });
  return room;
};

export const joinTwilioRoom = async (token, roomName, tracks) => {
  const room = await Video.connect(token, {
    audio: false,
    video: false,
    name: roomName,
    tracks: tracks,
  });
  return room;
};
