import React from 'react';
import { shallow } from 'enzyme';
import { findByTestAttr, initContext, initRoomObj, createParticipant } from '../../../utils/test';
import Chat from './Chat';

const setUp = (props = {}) => {
    const component = shallow(<Chat {...props} />);
    return component
}

describe('<Chat /> component tests', () => {
    let props;
    let component;
    let contextValues;
    beforeEach(() => {
        props = {
            messages: [],
            currUser: createParticipant('local'),
            users: []
        }
        contextValues = { room: initRoomObj() }
    });
    it('Should render chatComponent, messageComponent, chatInputComponent', () => {
        component = initContext(contextValues, setUp, props);
        expect(findByTestAttr(component, "chatComponent").length).toBe(1);
        expect(findByTestAttr(component, "messageComponent").length).toBe(1);
        expect(findByTestAttr(component, "chatInputComponent").length).toBe(1);
    });
});