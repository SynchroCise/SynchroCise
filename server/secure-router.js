const express = require('express');
const router = express.Router();
const { addWorkout, getUserWorkouts, setDeleteWorkout, getWorkoutById } = require('./workouts.js');
const { getUserById, getUsersById, changeEmail, changeUsername, changePassword, getWorkoutHistory } = require('./users.js');


router.get('/checkLoggedIn', async (req, res, next) => {
  res.json({
    message: 'You made it to the secure route',
    user: await getUserById(req.user.id),
    token: req.cookies['jwt']
  })
}
);

router.post(
  '/logout',
  async (req, res, next) => {
    res.status(202).clearCookie('jwt').send(JSON.stringify({ message: 'Cookie cleared' }))
  }
)

router.get('/getWorkouts', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const workouts = await getUserWorkouts(req.user.id);
  if (workouts.length > 10) return workouts
  const ids = workouts.map((workout) => workout.userId);
  const names_list = await getUsersById(ids)
  workouts.forEach((o, i, a) => a[i] = { ...o, "displayName": names_list[i].name })
  res.send(JSON.stringify(workouts));
});

router.get('/getWorkout', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const workout = await getWorkoutById(req.query.workoutId);
  res.send(JSON.stringify(workout));
});

router.get('/getWorkoutHistory', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const workout = await getWorkoutHistory(req.user.id);
  res.send(JSON.stringify(workout));
});

router.post('/addWorkout', async (req, res, next) => {
  res.setHeader('Content-Type', 'text/plain');
  const workout = req.body;
  const [code, msg] = await addWorkout(workout.workoutName, workout.exercises, req.user.id);
  res.status(code).send(JSON.stringify({ message: msg }));
});

router.post('/deleteWorkout', async (req, res) => {
  const workout = await getWorkoutById(req.body.workoutId);
  if (workout.userId !== req.user.id) return res.status(401);
  if (req.body.workoutId) setDeleteWorkout(req.body.workoutId);
  res.status(200);
});

router.put('/editWorkout', async (req, res, next) => {
  const workoutId = req.body.workoutId;
  if (workoutId) setDeleteWorkout(workoutId);
  const workout = req.body.newWorkout;
  const [code, msg] = await addWorkout(workout.workoutName, workout.exercises, req.user.id);
  res.status(code).send(JSON.stringify({ message: msg }));
});

router.put('/changeEmail', async (req, res, next) => {
  const [code, msg] = await changeEmail(req.body.email, req.user.id);
  res.status(code).send(JSON.stringify({ message: msg }));
});

router.put('/changeUsername', async (req, res, next) => {
  const [code, msg] = await changeUsername(req.body.username, req.user.id);
  res.status(code).send(JSON.stringify({ message: msg }));
});

router.put('/changePassword', async (req, res, next) => {
  const [code, msg] = await changePassword(req.body.password, req.user.id);
  res.status(code).send(JSON.stringify({ message: msg }));
});

module.exports = router;