import React from 'react';
import { shallow } from 'enzyme';
import { findByTestAttr } from '../../../../../utils/test';
import Message from './Message';

const setUp = (props={}) => {
    const component = shallow(<Message {...props} />);
    return component
}

describe('<Messages /> component tests', () => {
    let props;
    let component;
    beforeEach(() => {
        props = {
            message: { user: {name: 'test'}, text: 'hi', time: "01:00" },
            currUser: null,
            users: null
        }
    });
    it('Should render messagesComponent', () => {
        component = setUp(props);
        expect(findByTestAttr(component, "messageComponent").length).toBe(1);
    });
});