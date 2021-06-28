import React from 'react';
import { shallow } from 'enzyme';
import { findByTestAttr, initContext, initRoomObj, createParticipant, asyncUpdateComponent } from '../../utils/test';
import BottomControl from './BottomControl';
import * as requests from "../../utils/requests"
import { sckt } from '../../Socket';

jest.mock("../../utils/requests");
jest.mock('../../Socket', () => ({
    sckt : {
        socket: {
            on: jest.fn(),
            off: jest.fn(),
            emit: jest.fn(),
        }
    }
}));

const setUp = (props={}) => {
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
            sendRoomState: jest.fn( ({ eventName, eventParams }, callback) => (callback()) ),
            workoutType: 'vid',
            setWorkoutType: jest.fn(),
            openSideBar: true,
            handleOpenSideBar: jest.fn()
        };
        props = {
            participants: [],
            participantPage: 0,
            setParticipantPage: jest.fn(),
            leaderParticipantIDs: ['local'],
            ppp: 4
        }
    });
    it('Should handle videoButton click', () => {
        component = initContext(contextValues, setUp, props);
        const button = findByTestAttr(component, 'videoButton');
        expect(findByTestAttr(component, 'vidOn').length).toBe(1);
        button.simulate('click');
        expect(contextValues.room.localParticipant.videoTracks[0].track.disable).toHaveBeenCalledTimes(1);
        expect(findByTestAttr(component, 'vidOff').length).toBe(1);
    });
    it('Should handle micButton click', () => {
        component = initContext(contextValues, setUp, props);
        const button = findByTestAttr(component, 'micButton');
        expect(findByTestAttr(component, 'micOn').length).toBe(1);
        button.simulate('click');
        expect(contextValues.room.localParticipant.audioTracks[0].track.disable).toHaveBeenCalledTimes(1);
        expect(findByTestAttr(component, 'micOff').length).toBe(1);
    });
    it('Should changeWorkoutNavigation on change', () => {
        component = initContext(contextValues, setUp, props);
        const navigation = findByTestAttr(component, 'changeWorkoutNavigation');
        navigation.simulate('change', null, 1);
        navigation.simulate('change', null, 0);
        expect(contextValues.sendRoomState).toHaveBeenCalledTimes(2);
        expect(contextValues.setWorkoutType).toHaveBeenCalledTimes(2);
    });
    it('Should handleOpenSideBar on change', () => {
        component = initContext(contextValues, setUp, props);
        const button = findByTestAttr(component, 'sidebarButton');
        button.simulate('click');
        expect(contextValues.handleOpenSideBar).toHaveBeenCalledTimes(1);
    });

    describe("Test PPButtons", () => {
        it('Should test forwardPPButtons and backPPButtons works with no participants', () => {
            component = initContext(contextValues, setUp, props);
            findByTestAttr(component, 'forwardPPButton').simulate('click');
            findByTestAttr(component, 'backPPButton').simulate('click');
            expect(props.setParticipantPage).toHaveBeenCalledTimes(0);
        });
        it('Should test forwardPPButtons and backPPButtons works with 4 remote participants', () => {
            props.participants = participantJoins(['1', '2', '3', '4']);
            component = initContext(contextValues, setUp, props);

            findByTestAttr(component, 'forwardPPButton').simulate('click');
            findByTestAttr(component, 'backPPButton').simulate('click')
            expect(props.setParticipantPage).toHaveBeenCalledTimes(0);
        });
        it('Should test forwardPPButtons works with 5 remote participants', () => {
            props.participants = participantJoins(['1', '2', '3', '4', '5']);
            component = initContext(contextValues, setUp, props);

            findByTestAttr(component, 'forwardPPButton').simulate('click');
            expect(props.setParticipantPage).toHaveBeenCalledWith(1);
        });
        it('Should test backPPButtons works with 5 remote participants', () => {
            props.participants = participantJoins(['1', '2', '3', '4', '5']);
            props.participantPage = 1;
            component = initContext(contextValues, setUp, props);

            findByTestAttr(component, 'backPPButton').simulate('click')
            expect(props.setParticipantPage).toHaveBeenCalledWith(0);
        });
    });
});