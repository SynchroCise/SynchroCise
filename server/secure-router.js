const express = require('express');
const router = express.Router();
const { addWorkout } = require('./workouts.js');

router.get(
  '/profile',
  (req, res, next) => {
    res.json({
      message: 'You made it to the secure route',
      user: req.user,
      token: req.cookies['jwt']
    })
  }
);

router.post(
  '/logout',
  async (req, res, next) => {
    res.status(202).clearCookie('jwt').send('Cookie cleared')
  }
)

router.post('/addWorkout', async (req, res, next) => {
  res.setHeader('Content-Type', 'text/plain');
  const workout = req.body;
  const [code, msg] = await addWorkout(workout.workoutName, workout.exercises, req.user.id);
  res.status(code).send(msg);
});

module.exports = router;