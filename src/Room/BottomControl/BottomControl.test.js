import React from 'react';
import { shallow } from 'enzyme';
import { findByTestAttr, initContext, initRoomObj, createParticipant } from '../../utils/test';
import BottomControl from './BottomControl';

jest.mock("../../utils/requests");

const setUp = (props = {}) => {
    const component = shallow(<BottomControl {...props} />);
    return component
}

describe('<BottomControl /> component tests', () => {
    let contextValues;
    let props;
    let component

    const participantJoins = (sids) => (
        sids.map((sid) => createParticipant(sid))
    )

    beforeEach(() => {

        contextValues = {
            room: initRoomObj(),
            sendRoomState: jest.fn(({ eventName, eventParams }, callback) => (callback())),
            workoutType: 'vid',
            setWorkoutType: jest.fn(),
            openSideBar: true,
            handleOpenSideBar: jest.fn(),
            sideBarType: 0,
            setSideBarType: jest.fn(),
            localTracks: [],
            participantIds: []
        };
        props = {
            participantPage: 0,
            setParticipantPage: jest.fn(),
            ppp: 4,
            getAllRemoteParticipants: jest.fn()
        }
    });
    it('Should handle videoButton click', () => {
        component = initContext(contextValues, setUp, props);
        const button = findByTestAttr(component, 'videoButton');
        // expect(findByTestAttr(component, 'vidOn').length).toBe(1);
        button.simulate('click');
        // expect(contextValues.room.localParticipant.videoTracks[0].track.disable).toHaveBeenCalledTimes(1);
        // expect(findByTestAttr(component, 'vidOff').length).toBe(1);
    });
    it('Should handle micButton click', () => {
        component = initContext(contextValues, setUp, props);
        const button = findByTestAttr(component, 'micButton');
        // expect(findByTestAttr(component, 'micOn').length).toBe(1);
        button.simulate('click');
        // expect(contextValues.room.localParticipant.audioTracks[0].track.disable).toHaveBeenCalledTimes(1);
        // expect(findByTestAttr(component, 'micOff').length).toBe(1);
    });
    it('Should changeWorkoutNavigation on change', () => {
        component = initContext(contextValues, setUp, props);
        const navigation = findByTestAttr(component, 'changeWorkoutNavigation');
        navigation.simulate('change', null, 1);
        navigation.simulate('change', null, 2);
        navigation.simulate('change', null, 0);
        expect(contextValues.setSideBarType).toHaveBeenCalledTimes(2);
        expect(contextValues.handleOpenSideBar).toHaveBeenCalledTimes(1);
    });
});