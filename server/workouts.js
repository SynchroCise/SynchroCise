const workouts = require('./defaultWorkouts.json')
const {db, timestamp} = require('./firebase.js');


const workoutFromDoc = (doc) => ({
    id: doc.id,
    workoutName: doc.data().workoutName,
    exercises: doc.data().exercises,
    userId: doc.data().userId,
});

const getWorkouts = async () => {
    const workoutRef = db.collection('workouts');
    const snapshot = await workoutRef.orderBy('createdTime', 'desc').limit(5).get();
    if (snapshot.empty) return []
    const workouts = snapshot.docs.map((doc) => workoutFromDoc(doc));
    return (workouts) ? workouts : null;
}

const getWorkoutById = async (id) => {
    const workoutRef =  db.collection('workouts').doc(id);
    const doc = await workoutRef.get()
    if (!doc.exists) {
        console.log('No such document!');
        return null;
    }
    const workout = workoutFromDoc(doc)
    return workout
};

const addWorkout = async (workoutName, exercises, userId) => {
    if (workoutName == undefined || exercises == undefined || exercises.length == 0) {
        return [400, 'Invalid Workout']
    }
    if (workouts.some(e => e.workoutName == workoutName)) {
        return [400, 'Workout Already Exists']
    }
    // TODO: Add userId once we implement login
    const docRef = db.collection('workouts').doc()
    const res = await docRef.set({
        createdTime: timestamp.now(),
        exercises: exercises,
        workoutName: workoutName,
    }).catch(error => {return [400, 'ERROR']});
    return [200, 'Success']
};

const getWorkoutByName = async (name) => {
    const workoutRef = db.collection('workouts');
    const snapshot = await workoutRef.where('workoutName', '==', name).orderBy('createdTime', 'desc').limit(5).get();
    if (snapshot.empty) return []
    const workouts = snapshot.docs.map((doc) => workoutFromDoc(doc));
    console.log(workouts)
    return (workouts) ? workouts : null;
}

module.exports = { 
    getWorkoutByName,
    getWorkouts,
    addWorkout,
    getWorkoutById
};