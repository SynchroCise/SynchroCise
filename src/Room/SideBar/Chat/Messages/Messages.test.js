import React from 'react';
import { shallow } from 'enzyme';
import { findByTestAttr, createParticipant } from '../../../../utils/test';
import Messages from './Messages';

const setUp = (props={}) => {
    const component = shallow(<Messages {...props} />);
    return component
}

describe('<Messages /> component tests', () => {
    let props;
    let component;
    beforeEach(() => {
        props = {
            messages: [],
            currUser: createParticipant('local'),
            users: [],
            times: []
        }
    });
    it('Should render messagesComponent', () => {
        component = setUp(props);
        expect(findByTestAttr(component, "messagesComponent").length).toBe(1);
        expect(findByTestAttr(component, "messageComponent").length).toBe(0);
    });
    it('Should render 5 messages', () => {
        props.messages = ['hello', 'world', 'i', 'am', 'message']
        component = setUp(props);
        const messages = findByTestAttr(component, "messageComponent")
        expect(messages.length).toBe(5);
    });
});