const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();
require('./auth');

const { getUsersInRoom } = require('./users.js');
const { getWorkouts, getWorkoutByName } = require('./workouts.js');
const { addRoom, getRoomCode, getRoomsByCode } = require('./rooms.js');

router.get('/api/greeting', (req, res) => {
  const name = req.query.name || 'World';
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({ greeting: `Hello ${name}!` }));
});


// WORKOUTS
router.get('/api/workouts', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const workoutName = req.query.name;
  if (workoutName == undefined) {
    res.send(JSON.stringify(await getWorkouts()));
  } else {
    const newWorkout = await getWorkoutByName(workoutName)
    res.send(newWorkout);
  }
});

// ROOMS
router.get('/api/rooms', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const roomCode = req.query.sid_or_name;
  if (!roomCode) return res.status(400).send(JSON.stringify({ message: 'Invalid sid_or_name' }))
  room = (await getRoomsByCode(roomCode))[0];
  if (room != undefined) {
    res.send(JSON.stringify(room));
  } else {
    const errMessage = JSON.stringify({ message: 'Unable to find room' });
    res.status(400).send(errMessage);
  }
});

router.get('/api/roomCode', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const roomCode = getRoomCode();
  if (!roomCode) return res.status(400).send(JSON.stringify({ message: 'Invalid roomCode' }))
  res.send(JSON.stringify({ roomCode }));
});

router.post('/api/rooms', async (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  const room = req.body;
  const [code, roomCode] = await addRoom(room.id, room.workoutID, room.workoutType);
  res.status(code).send(JSON.stringify({ roomCode }));
});

// AUTHENTICATION
router.post(
  '/signup',
  (req, res, next) => {
    passport.authenticate('signup', (err, user, info) => {
      if (err) { return next(err) }
      if (info.error) { return res.status(401).send(JSON.stringify({ message: info.message })) }
      res.json({
        message: 'Signup successful',
        user: user
      });
    })(req, res, next);
  });

router.post(
  '/login',
  async (req, res, next) => {
    passport.authenticate(
      'login',
      async (err, user, info) => {
        try {
          if (info.error) { return res.status(401).send(JSON.stringify({ message: info.message })) }
          if (err || !user) {
            const msg = (info.message) ? info.message : "";
            return res.status(401).send(JSON.stringify({ message: msg }))
          }
          req.login(
            user,
            { session: false },
            async (error) => {
              if (error) return next(error);
              const body = { id: user.id, email: user.email, displayName: user.name };
              const token = jwt.sign({ user: body }, process.env.JWT_SECRET);
              res.cookie('jwt', token, { httpOnly: true });
              return res.json({ token, userId: user.id, displayName: user.name });
            }
          );
        } catch (error) {
          return next(error);
        }
      }
    )(req, res, next);
  }
);


module.exports = router;