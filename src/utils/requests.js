import Video from "twilio-video";

const formatResults = async (res) => {
  let body = await res.text();
  try {
    body = JSON.parse(body);
  } catch (err) {
    body = { message: body };
  }
  if (!body.message) {
    body.message = (res) ? "Success" : "Failed"
  }
  return {
    ok: res.ok,
    body
  }
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
  const res = await fetch('/api/roomCode', {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return formatResults(res);
};

export const createRoom = async (room, workoutId, workoutType = 'vid') => {
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
}

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
}

export const getUserProfile = async () => {
  const res = await fetch('/user/profile', {
    method: 'GET',
  });
  return formatResults(res);
};

export const userLogout = async () => {
  const res = await fetch('/user/logout', { method: "POST" });
  return formatResults(res);
}

export const userLogin = async (formData) => {
  const res = await fetch('/login', {
    method: 'POST',
    body: formData,
  });
  return formatResults(res);
}

export const userSignUp = async (formData) => {
  const res = await fetch('/signup', {
    method: 'POST',
    body: formData,
  });
  return formatResults(res);
}

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
}

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
  const res = await fetch('/user/deleteWorkout', {
    method: "POST",
    body: JSON.stringify({ workoutId }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return formatResults(res);
}
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
}

export const createTwilioRoom = async (token, roomName) => {
  const room = await Video.connect(token, {
    name: roomName,
    bandwidthProfile: {
      mode: 'collaboration',
      maxSubscriptionBitrate: 2400000,
      renderDimensions: {
        high: { width: 1080, height: 720 },
        standard: { width: 640, height: 480 },
        low: { width: 320, height: 240 }
      }
    }
  });
  return room
};

export const joinTwilioRoom = async (token, roomName, tracks) => {
  const room = await Video.connect(token, {
    name: roomName,
    tracks: tracks
  });
  return room;
}

