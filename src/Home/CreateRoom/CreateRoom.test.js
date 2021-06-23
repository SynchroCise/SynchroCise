import React from 'react';
import { shallow } from 'enzyme';
import { findByTestAttr, initContext, asyncUpdateComponent } from '../../utils/test';
import CreateRoom from './CreateRoom';
import * as requests from "../../utils/requests";

const setUp = (props={}) => {
    const component = shallow(<CreateRoom {...props} />);
    return component
}

const mockPush = jest.fn();
jest.mock('react-router-dom', () => ({
    useHistory: () => ({
      push: mockPush,
    }),
}));
jest.mock("../../utils/requests");
jest.mock("twilio-video")

describe('<JoinRoom />', () => {
    let component;
    let contextValues;

    const submitFormAndUpdate = async (form) => {
        expect(form.length).toBe(1);
        form.simulate('submit', { preventDefault: jest.fn() });
        await asyncUpdateComponent(component)
    }
    
    beforeEach(() => {
        contextValues = {
            userId: 'testId',
            connecting : false,
            username: 'test',
            roomName: 'testRoom',
            workout: { "workoutName": "", "exercises": [{ "time": 1, "exercise": "" }], "id": "" },
            handleSetRoom: jest.fn(),
            handleUsernameChange: jest.fn(),
            handleSetConnecting: jest.fn(),
            handleSetWorkout: jest.fn(),
            handleSetOpenAuthDialog: jest.fn(),
            makeCustomRoom: jest.fn(),
            createTempUser: jest.fn(),
            isLoggedIn: false
        }
        requests.getUserWorkouts.mockResolvedValue({ok: true, body: ['workout!'] });
        jest.spyOn(window, 'alert').mockImplementation(() => {});
    });
    it('Should render createRoomComponent', () => {
        component = initContext(contextValues, setUp);
        const wrapper = findByTestAttr(component, 'createRoomComponent');
        expect(wrapper.length).toBe(1);
    });
    it('Should initialize custom room code', () => {
        component = initContext(contextValues, setUp);
        expect(contextValues.makeCustomRoom).toHaveBeenCalledTimes(1);
    });
    it('Should not initialize workouts (not logged in)', async () => {
        component = initContext(contextValues, setUp);
        await asyncUpdateComponent(component)

        expect(requests.getUserWorkouts).toHaveBeenCalledTimes(0);
        expect(contextValues.handleSetWorkout).toHaveBeenCalledTimes(0);
    });
    it('Should initialize workouts (logged in)', async () => {
        contextValues.isLoggedIn = true;
        component = initContext(contextValues, setUp);
        await asyncUpdateComponent(component);

        expect(requests.getUserWorkouts).toHaveBeenCalledTimes(1);
        expect(contextValues.handleSetWorkout).toHaveBeenCalledTimes(1);
    });
    it('Should render createRoomForm and submit succeed (not logged in)', async () => {
        contextValues.isLoggedIn = false
        component = initContext(contextValues, setUp);
        
        // mock values
        requests.twilioToken.mockResolvedValue({ok: true, body : {token: ''}});
        requests.createTwilioRoom.mockResolvedValue({localParticipant: { tracks: []}});
        requests.createRoom.mockResolvedValue({ok: true});

        // find and submit form
        const form = findByTestAttr(component, 'createRoomForm');
        await submitFormAndUpdate(form);
        expect(contextValues.createTempUser).toHaveBeenCalledTimes(1);
        expect(requests.twilioToken).toHaveBeenCalledTimes(1);
        expect(requests.createRoom).toHaveBeenCalledTimes(1);
        expect(contextValues.handleSetRoom).toHaveBeenCalledTimes(1);
        expect(contextValues.handleSetConnecting).toHaveBeenCalledTimes(2);
        expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it('Should render createRoomForm and submit succeed (logged in)', async () => {
        contextValues.isLoggedIn = true
        component = initContext(contextValues, setUp);
        
        // mock values
        requests.twilioToken.mockResolvedValue({ok: true, body : {token: ''}});
        requests.createTwilioRoom.mockResolvedValue({localParticipant: { tracks: []}});
        requests.createRoom.mockResolvedValue({ok: true});

        // find and submit form
        const form = findByTestAttr(component, 'createRoomForm');
        await submitFormAndUpdate(form);
        expect(contextValues.createTempUser).toHaveBeenCalledTimes(0);
        expect(requests.twilioToken).toHaveBeenCalledTimes(1);
        expect(requests.createRoom).toHaveBeenCalledTimes(1);
        expect(contextValues.handleSetRoom).toHaveBeenCalledTimes(1);
        expect(contextValues.handleSetConnecting).toHaveBeenCalledTimes(2);
        expect(mockPush).toHaveBeenCalledTimes(1);
    });
    it('Should test clicking add workout (logged in)', () => {
        contextValues.isLoggedIn = true
        component = initContext(contextValues, setUp);
        const button = findByTestAttr(component, 'addWorkoutButton');
        expect(button.length).toBe(1);
        button.simulate('click');
        expect(mockPush).toHaveBeenCalledTimes(1);
        expect(contextValues.handleSetOpenAuthDialog).toHaveBeenCalledTimes(0); 
    });
    it('Should test clicking add workout (not logged in)', () => {
        contextValues.isLoggedIn = false
        component = initContext(contextValues, setUp);
        const button = findByTestAttr(component, 'addWorkoutButton');
        expect(button.length).toBe(1);
        button.simulate('click');
        expect(mockPush).toHaveBeenCalledTimes(0);
        expect(contextValues.handleSetOpenAuthDialog).toHaveBeenCalledTimes(1); 
    });

    it('Should test back button', () => {
        component = initContext(contextValues, setUp);

        const button = findByTestAttr(component, 'backButton');
        button.simulate('click');
        expect(mockPush).toHaveBeenCalledTimes(1);
    });
    it('Should text fields in form', () => {
        component = initContext(contextValues, setUp);

        // test username field
        let usrField = findByTestAttr(component, 'usernameField');
        usrField.simulate('change', {target: { value: "newtestuser" }});
        expect(contextValues.handleUsernameChange).toHaveBeenCalledTimes(1);
    });
    it('Should see if workoutTableCompoment renders (logged in)', () => {
        contextValues.isLoggedIn = true
        component = initContext(contextValues, setUp);
        const wrapper = findByTestAttr(component, 'workoutTableComponent');
        expect(wrapper.length).toBe(1);
    });
    it('Should see if workoutTableCompoment renders (not logged in)', () => {
        contextValues.isLoggedIn = false
        component = initContext(contextValues, setUp);
        const wrapper = findByTestAttr(component, 'workoutTableComponent');
        expect(wrapper.length).toBe(0);
    });

});