import React from 'react';
import { shallow } from 'enzyme';
import { findByTestAttr, initContext } from '../../../utils/test';
import ExerciseList from './ExerciseList';

const setUp = (props={}) => {
    const component = shallow(<ExerciseList {...props} />);
    return component
}

describe('<ExerciseList /> component tests', () => {
    let props;
    let component;
    let contextValues;
    beforeEach(() => {
        props = {
            workoutTime: 1,
            nextUpExercise: []
        }
        contextValues = {
            workout: { "workoutName": "", "exercises": [{ "time": 1, "exercise": "" }, { "time": 1, "exercise": "" }], "id": "" },
            sendRoomState: jest.fn(({eventName, eventParams}, callback) => callback()),
            playWorkoutState: false, 
            setPlayWorkoutState: jest.fn(),
            workoutNumber: 0,
            workoutCounter: -1
        }
    });
    it('Should test startWorkoutButton onClick', () => {
        component = initContext(contextValues, setUp, props);
        const button = findByTestAttr(component, "startWorkoutButton");
        button.simulate('click');
        expect(contextValues.sendRoomState).toHaveBeenCalledTimes(1);
        expect(contextValues.setPlayWorkoutState).toHaveBeenCalledTimes(1);
    });
    it('Should test nextUpExercise with 0 exercises', () => {
        props.nextUpExercise = [];
        component = initContext(contextValues, setUp, props);
        expect(findByTestAttr(component, "nextUpExerciseComponent").length).toBe(1);
    });
    it('Should test nextUpExercise with 3 exercises and workoutNumber=1', () => {
        props.nextUpExercise = ['hello', 'hi', 'hey'];
        contextValues.workoutNumber = 1
        component = initContext(contextValues, setUp, props);
        expect(findByTestAttr(component, "nextUpExerciseComponent").length).toBe(1);
    });
    it('Should test nextUpExercise with 1 (string) exercise', () => {
        props.nextUpExercise = 'hello';
        component = initContext(contextValues, setUp, props);
        expect(findByTestAttr(component, "nextUpExerciseComponent").length).toBe(1);
    });
});