const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { videoToken } = require('./tokens');
const config = require('./config');
const router = express.Router();
require('./auth');

const { getUsersInRoom, getUserById, createTempUser } = require('./users.js');
const { getWorkouts, getWorkoutByName, setDeleteWorkout } = require('./workouts.js');
const { addRoom, getRoomCode, getRoomsByCode } = require('./rooms.js');
const { reservationsUrl } = require('twilio/lib/jwt/taskrouter/util');

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

router.post('/api/deleteWorkout', async (req, res) => {
  const workoutId = req.body.workoutId;
  if (workoutId) setDeleteWorkout(workoutId);
});

// ROOMS
router.get('/api/rooms', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const roomCode = req.query.sid_or_name;
  if (!roomCode) return res.status(400).send(JSON.stringify({message: 'Invalid sid_or_name'}))
  room = (await getRoomsByCode(roomCode))[0];
  if (room != undefined) {
    res.send(JSON.stringify(room));
  } else {
    const errMessage = JSON.stringify({message: 'Unable to find room'});
    res.status(400).send(errMessage);
  }
});

router.get('/api/roomCode', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const roomCode = getRoomCode();
  if (!roomCode) return res.status(400).send(JSON.stringify({message: 'Invalid roomCode'}))
  res.send(JSON.stringify({roomCode}));
});

router.post('/api/rooms', async (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  const room = req.body;
  const [code, roomCode] = await addRoom(room.name, room.sid, room.workoutID, room.workoutType);
  res.status(code).send(JSON.stringify({roomCode}));
});

router.post('/api/createTempUser', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const name = req.body.name;
  if (!name) return res.status(400).send(JSON.stringify({message: 'Invalid name'}));
  const userCode = await createTempUser(name)
  if (!userCode) return res.status(400).send(JSON.stringify({message: 'Invalid userCode'}));
  res.send(JSON.stringify({userCode}));
});

//OLD V
router.get('/api/displayName', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const id = req.query.id;
  if (!id) return res.status(400).send(JSON.stringify({message: 'Invalid id'}))
  const user = await getUserById(id);
  if (user) {
    res.send(JSON.stringify({ name: user.name }));
  } else {
    res.status(400).send(JSON.stringify({message: 'Unable to obtain display name'}));
  }
});

//GETS ALL DISPLAY NAMES IN ROOM
router.get('/api/displayNameInRoom', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const id = req.query.rid;
  let userArr = []
  if (!id) return res.status(400).send(JSON.stringify({message: 'Invalid id'}))
  const users = await getUsersInRoom(id);
  users.map((user) => userArr.push({ name: user.name, sid: user.sid }))
  if (users) {
    res.send(JSON.stringify(userArr));
  } else {
    res.status(400).send(JSON.stringify({message: 'Unable to obtain display name'}));
  }
});

// AUTHENTICATION
router.post(
  '/signup',
  (req, res, next) => {
    passport.authenticate('signup', (err, user, info) => {
      if (err) { return next(err) }
      if (info.error) { return res.status(401).send(JSON.stringify({message:info.message})) }
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
          if (info.error) { return res.status(401).send(JSON.stringify({message:info.message})) }
          if (err || !user) {
            const msg = (info.message) ? info.message : "";
            return res.status(401).send(JSON.stringify({message:msg}))
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