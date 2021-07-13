import React from 'react';
import { shallow, mount } from 'enzyme';
import { findByTestAttr, initContext, createParticipant, initRoomObj } from '../utils/test';
import { withoutHooks } from 'jest-react-hooks-shallow';
import Room from './Room';
import * as requests from "../utils/requests"
import { sckt } from '../Socket';

const mockPush = jest.fn();
jest.mock('react-router-dom', () => ({
    useHistory: () => ({
        push: mockPush,
    }),
    Redirect: jest.fn(({ to }) => `Redirected to ${to}`),
}));
jest.mock("../utils/requests");
jest.mock('../Socket', () => ({
    sckt: {
        socket: {
            on: jest.fn(),
            off: jest.fn(),
            emit: jest.fn(),
        }
    }
}));

const setUp = (props = {}) => {
    const component = shallow(<Room {...props} />);
    return component
}

const setUpMount = (props = {}) => {
    let component
    withoutHooks(() => {
        component = mount(<Room {...props} />);
    });
    return component
}

describe('<Room /> component tests', () => {
    let component;
    let contextValues;
    let props;

    const participantJoins = (sids) => {
        const participantConnectedCallBack = contextValues.room.on.mock.calls.filter(call => call[0] == "participantConnected")[0][1];
        sids.forEach((sid) => {
            participantConnectedCallBack(createParticipant(sid));
        });
        component.update()
    }

    const participantLeaves = (sids) => {
        const participantDisconnectedCallBack = contextValues.room.on.mock.calls.filter(call => call[0] == "participantDisconnected")[0][1];
        sids.forEach((sid) => {
            participantDisconnectedCallBack(createParticipant(sid));
        });
        component.update()
    }

    beforeEach(() => {
        contextValues = {
            username: "",
            room: initRoomObj(),
            handleLeaveRoom: jest.fn(),
            userId: "",
            openSideBar: true,
            roomProps: {
                workoutType: 'vid', // 'yt', 'custom',
                workout: { "workoutName": "", "exercises": [{ "time": 1, "exercise": "" }], "id": "" },
                playWorkoutState: false,
                workoutNumber: 0,
                workoutCounter: -1
            },
            roomName: 'ROOMNAME',
            updateRoomProps: jest.fn(),
            workoutType: 'vid',
            videoProps: {
                queue: [],
                history: [],
                playing: true,
                seekTime: 0,
                receiving: false,
                initVideo: false,
                videoType: 'yt'
            },
            updateVideoProps: jest.fn()
        };
        props = { match: { params: { roomCode: "ROOMCODE" } } }
        requests.getDisplayNamesInRoom.mockResolvedValue({ ok: false });
        jest.spyOn(window, 'alert').mockImplementation(() => { });
    });
    it('Should render roomComponent', () => {
        component = initContext(contextValues, setUp, props);
        expect(findByTestAttr(component, 'roomComponent').length).toBe(1);
        expect(findByTestAttr(component, 'redirectComponent').length).toBe(0);
    });
    it('Should not render roomComponent', () => {
        contextValues.room = null;
        component = initContext(contextValues, setUp, props);
        expect(findByTestAttr(component, 'roomComponent').length).toBe(0);
        expect(findByTestAttr(component, 'redirectComponent').length).toBe(1);
    });
    it('Should ensure that youtube workouts have youtubeComponent', () => {
        contextValues.workoutType = 'yt'
        component = initContext(contextValues, setUp, props);
        expect(findByTestAttr(component, 'youtubeComponent').length).toBe(1);
        expect(findByTestAttr(component, 'leaderParticipantComponent').length).toBe(0);
    });
    it('Should setPinnedParticipantId on click', () => {
        component = initContext(contextValues, setUp, props);
        participantJoins(['1']);
        expect(findByTestAttr(component, 'leaderParticipantComponent').prop('participant').sid).toBe('1')
        expect(findByTestAttr(component, 'remoteParticipantComponent').prop('participant').sid).toBe('local')
        findByTestAttr(component, 'remoteParticipantComponent').prop('setPinnedParticipantId')('local')
        expect(findByTestAttr(component, 'leaderParticipantComponent').prop('participant').sid).toBe('local')
        expect(findByTestAttr(component, 'remoteParticipantComponent').prop('participant').sid).toBe('1')
    });

    describe('Test socket listeners', () => {
        it('Should initialize all sockets listeners', () => {
            component = initContext(contextValues, setUp, props);

            expect(sckt.socket.on).toHaveBeenCalledWith('getRoomSync', expect.any(Function));
            expect(sckt.socket.on).toHaveBeenCalledWith('getVideoSync', expect.any(Function));
            expect(sckt.socket.on).toHaveBeenCalledWith('receiveRoomState', expect.any(Function));
            expect(sckt.socket.on).toHaveBeenCalledWith('startRoomSync', expect.any(Function));
            expect(sckt.socket.on).toHaveBeenCalledWith('startVideoSync', expect.any(Function));
            expect(sckt.socket.on).toHaveBeenCalledWith('newUser', expect.any(Function));
            expect(sckt.socket.on).toHaveBeenCalledWith('killroom', expect.any(Function));
            expect(sckt.socket.on).toHaveBeenCalledWith('leaver', expect.any(Function));
            expect(sckt.socket.on).toHaveBeenCalledTimes(8);
        });
        it('Should ensure getVideoSync callback works', () => {
            component = initContext(contextValues, setUp, props);
            const callback = sckt.socket.on.mock.calls.filter(call => call[0] == "getRoomSync")[0][1];
            callback({ id: 'id' });
            expect(sckt.socket.emit).toHaveBeenCalledWith('sendRoomSync', expect.anything(), expect.any(Function));
        });
        it('Should ensure getVideoSync callback works', () => {
            contextValues.workoutType = 'yt';
            component = initContext(contextValues, setUp, props);
            const callback = sckt.socket.on.mock.calls.filter(call => call[0] == "getVideoSync")[0][1];
            findByTestAttr(component, "youtubeComponent").prop('playerRef').current = { getCurrentTime: jest.fn() };
            callback({ id: 'id' });
            expect(sckt.socket.emit).toHaveBeenCalledWith('sendVideoSync', expect.anything(), expect.any(Function));
        });
        it('Should ensure killroom callback works', () => {
            component = initContext(contextValues, setUp, props);
            const killroom = sckt.socket.on.mock.calls.filter(call => call[0] == "killroom")[0][1]
            killroom();
            expect(mockPush).toHaveBeenCalledTimes(1);
        });
        it('Should ensure startRoomSync callback works', () => {
            component = initContext(contextValues, setUp, props);
            const callback = sckt.socket.on.mock.calls.filter(call => call[0] == "startRoomSync")[0][1]
            callback({});
            expect(contextValues.updateRoomProps).toHaveBeenCalledTimes(1);
        });
        it('Should ensure startVideoSync callback works', () => {
            component = initContext(contextValues, setUp, props);
            const callback = sckt.socket.on.mock.calls.filter(call => call[0] == "startVideoSync")[0][1]
            callback({});
            expect(contextValues.updateVideoProps).toHaveBeenCalledTimes(1);
        });
        it('Should ensure receiveRoomState callback works', () => {
            component = initContext(contextValues, setUp, props);
            const callback = sckt.socket.on.mock.calls.filter(call => call[0] == "receiveRoomState")[0][1];
            callback({ eventName: 'syncWorkoutState' });
            callback({ eventName: 'syncWorkoutType' });
            callback({ eventName: 'syncWorkout' });
            callback({ eventName: '' });
            expect(contextValues.updateRoomProps).toHaveBeenCalledTimes(3);
        });
        it('Should ensure newUser callback works', () => {
            component = initContext(contextValues, setUp, props);
            const callback = sckt.socket.on.mock.calls.filter(call => call[0] == "newUser")[0][1];
            const nameMapping = { name: 'hi', sid: 'hello' }
            participantJoins(['1']);
            callback(nameMapping);
            expect(findByTestAttr(component, 'leaderParticipantComponent').prop('names')).toContainEqual(nameMapping);
            expect(findByTestAttr(component, 'remoteParticipantComponent').prop('names')).toContainEqual(nameMapping);
        });
    });
    describe('Test room listeners', () => {
        // room listeners
        it('Should initialize all room listeners', () => {
            component = initContext(contextValues, setUp, props);
            expect(contextValues.room.on).toHaveBeenCalledWith('participantConnected', expect.any(Function));
            expect(contextValues.room.on).toHaveBeenCalledWith('participantDisconnected', expect.any(Function));
            expect(contextValues.room.on).toHaveBeenCalledTimes(2);
        });
        it('Should ensure that participant join/leave, adds/removes additional participants', () => {
            component = initContext(contextValues, setUp, props);

            expect(findByTestAttr(component, 'leaderParticipantComponent').length).toBe(1);
            expect(findByTestAttr(component, 'remoteParticipantComponent').length).toBe(0);
            expect(findByTestAttr(component, 'leaderParticipantComponent').prop('participant').sid).toBe('local')

            // have 1 participant join
            participantJoins(['1']);
            expect(findByTestAttr(component, 'leaderParticipantComponent').length).toBe(1);
            expect(findByTestAttr(component, 'remoteParticipantComponent').length).toBe(1);
            expect(findByTestAttr(component, 'leaderParticipantComponent').prop('participant').sid).toBe('1')
            expect(findByTestAttr(component, 'remoteParticipantComponent').prop('participant').sid).toBe('local')

            // have 1 participant leave
            participantLeaves(['1']);
            expect(findByTestAttr(component, 'leaderParticipantComponent').length).toBe(1);
            expect(findByTestAttr(component, 'remoteParticipantComponent').length).toBe(0);
            expect(findByTestAttr(component, 'leaderParticipantComponent').prop('participant').sid).toBe('local')
        });

        it('Should ensure that participant max remoteParticipants are 4', () => {
            component = initContext(contextValues, setUp, props);
            // have 9 participants join
            participantJoins(['1', '2', '3', '4', '5', '6', '7', '8', '9']);

            expect(findByTestAttr(component, 'leaderParticipantComponent').length).toBe(1);
            expect(findByTestAttr(component, 'remoteParticipantComponent').length).toBe(4);
        });
    });

    describe('<Room /> Integration tests with <BottomControl />', () => {
        beforeAll(() => {
            // https://stackoverflow.com/a/65338472/13659833
            Object.defineProperty(HTMLMediaElement.prototype, "muted", {
                set: jest.fn(),
            });
        });
        beforeEach(() => {
            contextValues.workout = { "workoutName": "", "exercises": [{ "time": 1, "exercise": "" }], "id": "" };
            contextValues.workoutNumber = 0;
        });
        it('Should render bottomControlComponent', () => {
            component = initContext(contextValues, setUpMount, props);
            expect(findByTestAttr(component, 'bottomControlComponent').hostNodes().length).toBe(1);
        });
    });
});
// INTEGRATION TEST TODOS (Investigate later):
// test if remote participants if they leave midway through and there are no participants in participants page
// Should test gathering displayNames from server
// should test the resetting of participantsPage
// should test clicking off all buttons in BottomControl
// should test the sidebar clicking and stuff