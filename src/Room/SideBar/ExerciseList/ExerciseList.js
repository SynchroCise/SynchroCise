import React, { useState, useEffect } from "react";
import { useAppContext } from "../../../AppContext"
import { fancyTimeFormat } from "../../../utils/utils";
import { Typography, LinearProgress, CircularProgress, Box, Button, Divider } from '@material-ui/core';
import { PlayArrow, Pause } from '@material-ui/icons';


const ExerciseList = ({ workoutTime, nextUpExercise }) => {
    const { workout, sendRoomState, playWorkoutState, setPlayWorkoutState, workoutNumber, workoutCounter } = useAppContext();
    const [workoutPerc, setWorkoutPerc] = useState(0);

    const handleStartWorkout = () => {
        var startWorkoutState = !playWorkoutState;
        sendRoomState({
            eventName: 'syncWorkoutState',
            eventParams: { playWorkoutState: startWorkoutState }
        }, () => setPlayWorkoutState(startWorkoutState));
    }

    useEffect(() => {
        const sumTime =  (a, b) => a + parseInt(b.time)
        const total = workout.exercises.reduce(sumTime, 0);
        const finishedExercises = [...workout.exercises].splice(0, workoutNumber);
        const current =  (parseInt(workout.exercises[workoutNumber].time) -
            workoutCounter +
            ((finishedExercises.length > 0) ? finishedExercises.reduce(sumTime, 0) : 0 ));
        setWorkoutPerc(Math.round((current / total) * 100))
    }, [workout, workoutNumber, workoutCounter]);

    function CircularProgressWithLabel(props) {
        return (
          <Box position="relative" display="flex" justifyContent="center" width="100%">
            <CircularProgress variant="determinate" {...props}  size="100%" />
            <Box
              top={0}
              left={0}
              bottom={0}
              right={0}
              position="absolute"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Typography variant="h5" component="div" color="textSecondary">{fancyTimeFormat(Math.ceil(workoutCounter))}</Typography>
            </Box>
          </Box>
        );
      }

    return (
        <Box px={2} display="flex" flexDirection="column" height="100%">
            <Box display="flex" flexDirection="row" mb={1}>
                <Box display="flex" flexGrow={1} flexDirection="column" pl={1}>
                    <Typography variant="body1">Now</Typography>
                    <Typography variant="h4" style={{wordWrap: "break-word"}}>{workout.exercises[workoutNumber].exercise}</Typography>
                </Box>
                <Box display="flex" flexDirection="column" justifyContent="center" mx={2} width="80px">
                    <CircularProgressWithLabel value={workoutCounter / workoutTime * 100} thickness={1.5}/>
                    <Box display="flex" justifyContent="left" mt={1}>
                        <Button
                            variant="contained"
                            color="primary"
                            endIcon={(playWorkoutState) ? <Pause /> : <PlayArrow />}
                            onClick={handleStartWorkout}
                            size="small"
                            data-test="startWorkoutButton"
                        >
                            {(playWorkoutState) ? "Pause" : "Play"}
                        </Button>
                    </Box>
                </Box>
            </Box>
            <Divider/>
            <Box p={1} style={{overflowY: "auto", minHeight: 0}} flexGrow={1}>
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
            </Box>
            <Box display="flex" alignItems="center" flexShrink={0} py={1}>
                <Typography variant="body1">{workoutPerc}%</Typography>
                <Box flexGrow={1} px={2}>
                    <LinearProgress variant="determinate" value={workoutPerc} />
                </Box>
            </Box>
        </Box>
    );
};

export default ExerciseList;