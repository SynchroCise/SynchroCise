const express = require('express');
const { videoToken } = require('./tokens');
const config = require('./config');
const router = express.Router();

const { getWorkouts, addWorkout, getWorkoutByName } = require('./workouts.js');
const { addRoom, getRoomCode, getRoomsByCode} = require('./rooms.js');
;
const sendTokenResponse = (token, res) => {
  res.set('Content-Type', 'application/json');
  res.send(
    JSON.stringify({
      token: token.toJwt()
    })
  );
};

router.get('/api/greeting', (req, res) => {
  const name = req.query.name || 'World';
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({ greeting: `Hello ${name}!` }));
});

// TWILIO
router.get('/video/token', (req, res) => {
  const identity = req.query.identity;
  const room = req.query.room;
  const token = videoToken(identity, room, config);
  sendTokenResponse(token, res);

});
router.post('/video/token', (req, res) => {
  const identity = req.body.identity;
  const room = req.body.room;
  const token = videoToken(identity, room, config);
  sendTokenResponse(token, res);
});

// WORKOUTS
router.get('/api/workouts', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const workoutName = req.query.name;
  if (workoutName == undefined) {
    res.send(JSON.stringify(await getWorkouts()));
  } else {
    const newWorkout = await getWorkoutByName(workoutName)
    console.log(newWorkout)
    res.send(newWorkout);
  }
});

router.post('/api/workouts', async (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  const workout = req.body;
  const [code, msg] = await addWorkout(workout.workoutName, workout.exercises);
  res.status(code).send(msg);
});

// ROOMS
router.get('/api/rooms', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const roomCode = req.query.sid_or_name;
  room = (await getRoomsByCode(roomCode))[0];
  if (room != undefined){
    res.send(JSON.stringify(room));
  } else {
    res.status(400).send('Unable to find room')
  }
});

router.get('/api/roomCode', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  const roomCode = getRoomCode();
  if (roomCode){
    res.send(roomCode);
  } else {
    res.status(400).send('')
  }
});

router.post('/api/rooms', async (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  const room = req.body;
  const [code, roomCode] = await addRoom(room.name, room.sid, room.workoutID, room.workoutType);
  res.status(code).send(roomCode);
});

// SIGN IN/UP
router.post('/api/signin', (req, res) => {

});

router.post('/api/signup', (req, res) => {
  
});

module.exports = router;