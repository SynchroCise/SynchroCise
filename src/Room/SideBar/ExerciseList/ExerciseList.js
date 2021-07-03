import React from "react";
import { useAppContext } from "../../../AppContext"
import { Typography, LinearProgress, IconButton, Box } from '@material-ui/core';
import { PlayArrow, Pause } from '@material-ui/icons';


const ExerciseList = ({ workoutTime, nextUpExercise }) => {
    const { workout, sendRoomState, playWorkoutState, setPlayWorkoutState, workoutNumber, workoutCounter } = useAppContext();

    const handleStartWorkout = () => {
        var startWorkoutState = !playWorkoutState;
        sendRoomState({
            eventName: 'syncWorkoutState',
            eventParams: { playWorkoutState: startWorkoutState }
        }, () => setPlayWorkoutState(startWorkoutState));
    }

    const TimerProgressBarMarkup = (
        <React.Fragment>
            <Box display="flex" justifyContent="flex-end" paddingTop={4} >
                <Typography variant="body1">{workoutCounter}s</Typography>
            </Box>
            <div><LinearProgress variant="determinate" value={workoutCounter / workoutTime * 100} /></div>
            <Box display="flex" justifyContent="flex-end">
                <IconButton
                    onClick={handleStartWorkout}
                    data-test="startWorkoutButton">
                    {(playWorkoutState) ? <Pause /> : <PlayArrow />}
                </IconButton>
            </Box>
        </React.Fragment>
    )
    const exerciseListMarkup = (
        <React.Fragment>
            <Typography variant="body1">Now</Typography>
            <Typography variant="h5">{workout.exercises[workoutNumber].exercise}</Typography>
            <Typography variant="body1">Next Up</Typography>
            {
                nextUpExercise && nextUpExercise.length > 1 && typeof nextUpExercise != 'string' ? (
                    nextUpExercise.filter((exercise, index) => { return index > workoutNumber }).map((exercise, index) => {
                        return (<Typography key={index} variant="body2" data-test="nextUpExerciseComponent">{exercise}</Typography>)
                    })
                ) : (
                    <Typography variant="body2" data-test="nextUpExerciseComponent">{nextUpExercise}</Typography>
                )
            }
        </React.Fragment>
    )

    return (
        <React.Fragment>
            {TimerProgressBarMarkup}
            {exerciseListMarkup}
        </React.Fragment>
    );
};

export default ExerciseList;