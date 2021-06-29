import React from 'react';
import { shallow } from 'enzyme';
import { findByTestAttr, createParticipant, initTrack, asyncUpdateComponent } from '../../utils/test';
import Participant from './Participant';

const setUp = (props={}) => {
    const component = shallow(<Participant {...props} />);
    return component
}

describe('<Participant /> component tests', () => {
    let props;
    let component;

    const runSubscriptionCallback = async (listenerName, trackType) => {
        const callback = props.participant.on.mock.calls.filter(call => call[0] == listenerName)[0][1]
        const track = initTrack(trackType)
        callback(track);
        await asyncUpdateComponent(component);
        return track
    }

    beforeEach(() => {
        props = {
            participant: createParticipant('local'),
            names: [],
            participantPage: 0
        }
    });
    it('Should render audio & video component', () => {
        component = setUp(props);
        expect(findByTestAttr(component, "audioComponent").length).toBe(1);
        expect(findByTestAttr(component, "videoComponent").length).toBe(1);
    })
    it('Should show correct displayName', async () => {
        props.names = [{sid: 'local', name: 'helloworld'}]
        component = setUp(props);
        await asyncUpdateComponent(component)
        expect(findByTestAttr(component, "displayNameComponent").text()).toBe('helloworld');
    });
    describe('Test participant listeners', () => {
        it('Should initialize all participant listeners', () => {
            component = setUp(props);
            expect(props.participant.on).toHaveBeenCalledWith('trackSubscribed', expect.any(Function));
            expect(props.participant.on).toHaveBeenCalledWith('trackUnsubscribed', expect.any(Function));
            expect(props.participant.on).toHaveBeenCalledTimes(2);
        });
        it('Should test video track subscription', async () => {
            // re-initialize video track
            props.participant.videoTracks = [];
            component = setUp(props);

            const videoTrack = await runSubscriptionCallback("trackSubscribed", "video")
            expect(videoTrack.attach).toHaveBeenCalledTimes(1);
        });
        it('Should test audio track subscription', async () => {
            // re-initialize video track
            props.participant.audioTracks = [];
            component = setUp(props);

            const audioTrack = await runSubscriptionCallback("trackSubscribed", "audio")
            expect(audioTrack.attach).toHaveBeenCalledTimes(1);
        });
        it('Should test video track unsubscription', async () => {
            component = setUp(props);

            const videoTrack = await runSubscriptionCallback("trackUnsubscribed", "video")
            expect(videoTrack.attach).toHaveBeenCalledTimes(0);
        });
        it('Should test audio track unsubscription', async () => {
            component = setUp(props);

            const audioTrack = await runSubscriptionCallback("trackUnsubscribed", "audio")
            expect(audioTrack.attach).toHaveBeenCalledTimes(0);
        });
    });
});