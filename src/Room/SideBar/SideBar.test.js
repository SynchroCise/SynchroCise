import React from 'react';
import { shallow } from 'enzyme';
import { findByTestAttr, createParticipant, initContext } from '../../utils/test';
import SideBar from './SideBar';
import { sckt } from '../../Socket';

jest.mock('../../Socket', () => ({
    sckt: {
        socket: {
            on: jest.fn(),
            off: jest.fn(),
            emit: jest.fn(),
        }
    }
}));
jest.useFakeTimers();

const setUp = (props = {}) => {
    const component = shallow(<SideBar {...props} />);
    return component
}

describe('<SideBar /> component tests', () => {
    let props;
    let component;
    let contextValues;
    beforeEach(() => {
        contextValues = {
            workout: { "workoutName": "", "exercises": [{ "time": 1, "exercise": "" }], "id": "" },
            openSideBar: true,
            playWorkoutState: false,
            workoutNumber: 0,
            setWorkoutNumber: jest.fn(),
            workoutCounter: -1,
            setWorkoutCounter: jest.fn(),
            roomName: 'ROOMNAME'
        }
        props = {
            currUser: createParticipant('local'),
            users: [],
            isYoutube: 0,
            drawerWidth: 300
        }
    });
    it('Should render sidebarComponent, chatComponent, and exerciseListComponent', () => {
        component = initContext(contextValues, setUp, props);
        expect(findByTestAttr(component, "sidebarComponent").length).toBe(1);
        // expect(findByTestAttr(component, "chatComponent").length).toBe(1);
        // expect(findByTestAttr(component, "exerciseListComponent").length).toBe(1);
    });
    it('Should intialize message socket listener', () => {
        component = initContext(contextValues, setUp, props);
        expect(sckt.socket.on).toHaveBeenCalledWith('message', expect.any(Function));
        expect(sckt.socket.on).toHaveBeenCalledTimes(1);
    });
    it('Should initialize workoutTimer', () => {
        component = initContext(contextValues, setUp, props);
        expect(contextValues.setWorkoutCounter).toHaveBeenCalledTimes(1);
        expect(contextValues.setWorkoutCounter).toHaveBeenCalledWith(contextValues.workout.exercises[0].time);
    });
    it('Should test 1 second timer tick', () => {
        contextValues.workoutCounter = 1;
        contextValues.playWorkoutState = true;
        component = initContext(contextValues, setUp, props);

        jest.advanceTimersByTime(1000);
        expect(setTimeout).toHaveBeenCalledTimes(1);
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 100);
        expect(contextValues.setWorkoutNumber).toHaveBeenCalledTimes(0);
        expect(contextValues.setWorkoutCounter).toHaveBeenCalledTimes(0);
    });
    it('Should test exercise update after timer complete', () => {
        contextValues.workout = { "workoutName": "", "exercises": [{ "time": 1, "exercise": "1" }, { "time": 5, "exercise": "2" }], "id": "" }
        contextValues.workoutCounter = 0;
        contextValues.playWorkoutState = true;
        component = initContext(contextValues, setUp, props);

        jest.advanceTimersByTime(1000);
        expect(setTimeout).toHaveBeenCalledTimes(0);
        expect(contextValues.setWorkoutNumber).toHaveBeenCalledWith(1);
        expect(contextValues.setWorkoutCounter).toHaveBeenCalledWith(5);
    });
});