const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { videoToken } = require('./tokens');
const config = require('./config');
const router = express.Router();
require('./auth');

const { getWorkouts, getWorkoutByName } = require('./workouts.js');
const { addRoom, getRoomCode, getRoomsByCode} = require('./rooms.js');
const { reservationsUrl } = require('twilio/lib/jwt/taskrouter/util');
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
    res.send(newWorkout);
  }
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

// AUTHENTICATION
router.post(
  '/signup',
  (req, res, next) => {
    passport.authenticate('signup', (err, user, info) => {
      if (err) { return next(err) }
      if (info.error) { return res.status(401).send(info.message) }
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
          if (info.error) {
            res.status(401).send(info.message)
          }
           if (err || !user) {
            const error = new Error('An error occurred.');
            return next(error);
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