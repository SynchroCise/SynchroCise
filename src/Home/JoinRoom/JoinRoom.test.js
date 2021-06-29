import React from 'react';
import { shallow } from 'enzyme';
import { findByTestAttr, initContext, runAllPromises } from '../../utils/test';
import JoinRoom from './JoinRoom';
import * as requests from "../../utils/requests";
import Video from "twilio-video";

const setUp = (props={}) => {
    const component = shallow(<JoinRoom {...props} />);
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
    let props;

    const submitFormAndUpdate = async (form) => {
        expect(form.length).toBe(1);
        form.simulate('submit', { preventDefault: jest.fn() });

        // wait for component to update
        await runAllPromises();
        component.update();
    }
    
    beforeEach(() => {
        contextValues = {
            connecting: false,
            username: 'test',
            roomName: 'testRoom',
            handleUsernameChange: jest.fn(),
            handleSetRoom: jest.fn(),
            isLoggedIn: false,
            handleSetConnecting: jest.fn(),
            handleSetRoomName: jest.fn(),
            createTempUser: jest.fn(),
            userId: 'testId'
        }
        props = {match: {params: {roomCode: "ROOMCODE"}}}
        requests.getRoomByName.mockResolvedValue({ok: true ,body: {id: 'ROOMCODE'}});
        jest.spyOn(window, 'alert').mockImplementation(() => {});
    });
    it('Should render joinRoomComponent', () => {
        component = initContext(contextValues, setUp, props);
        const wrapper = findByTestAttr(component, 'joinRoomComponent');
        expect(wrapper.length).toBe(1);
    });
    it('Should render joinRoomForm and submit fail (no roomName)', async () => {
        contextValues.roomName = '';
        component = initContext(contextValues, setUp, props);

        // find and submit form
        const form = findByTestAttr(component, 'joinRoomForm');
        await submitFormAndUpdate(form);
        expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it('Should render joinRoomForm and submit success', async () => {
        component = initContext(contextValues, setUp, props);

        // mock requests
        requests.twilioToken.mockResolvedValue({ok: true, body : {token: ''}});
        requests.joinTwilioRoom.mockResolvedValue({localParticipant: { tracks: []}});

        // find and submit form
        const form = findByTestAttr(component, 'joinRoomForm');
        await submitFormAndUpdate(form);

        expect(contextValues.handleSetRoom).toHaveBeenCalledTimes(1);
        expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it('Should render mic icon and click to mute', () => {
        component = initContext(contextValues, setUp, props);
        const button = findByTestAttr(component, 'micButton');
        expect(findByTestAttr(component, 'micIcon').length).toBe(1);
        button.simulate('click');
        expect(findByTestAttr(component, 'micOffIcon').length).toBe(1);
    });

    it('Should render vid icon and click to turn off', () => {
        component = initContext(contextValues, setUp, props);
        const button = findByTestAttr(component, 'vidButton');
        expect(findByTestAttr(component, 'vidIcon').length).toBe(1);
        button.simulate('click');
        expect(findByTestAttr(component, 'vidOffIcon').length).toBe(1);
    });

    it('Should test room code initialization and userid (no room code)' , async () => {
        props.match.params.roomCode = ""
        component = initContext(contextValues, setUp, props);
        // wait for component to update
        await runAllPromises();
        component.update();
        expect(mockPush).toHaveBeenCalledTimes(1);
        expect(requests.getRoomByName).toHaveBeenCalledTimes(0);
        expect(contextValues.handleSetRoom).toHaveBeenCalledTimes(0);
    });

    it('Should test room code initialization and userid succeed' , async () => {
        component = initContext(contextValues, setUp, props);
        // wait for component to update
        await runAllPromises();
        component.update();
        expect(mockPush).toHaveBeenCalledTimes(0);
        expect(requests.getRoomByName).toHaveBeenCalledTimes(1);
        expect(contextValues.handleSetRoomName).toHaveBeenCalledTimes(1);
    });
    it('Should test local video track creation', async () => {
        component = initContext(contextValues, setUp, props);
        expect(Video.createLocalVideoTrack).toHaveBeenCalledTimes(1);
        expect(Video.createLocalAudioTrack).toHaveBeenCalledTimes(1);
    });
    it('Should text fields in form', () => {
        component = initContext(contextValues, setUp, props);

        // test username field
        const usrField = findByTestAttr(component, 'usernameField');
        usrField.simulate('change', {target: { value: "newtestuser" }});
        expect(contextValues.handleUsernameChange).toHaveBeenCalledTimes(1);
    });
    it('Should test back button', () => {
        component = initContext(contextValues, setUp, props);

        const button = findByTestAttr(component, 'backButton');
        button.simulate('click');
        expect(mockPush).toHaveBeenCalledTimes(1);
    })
});