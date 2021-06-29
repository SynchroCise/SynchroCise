import React from 'react';
import { shallow } from 'enzyme';
import { findByTestAttr } from '../../../../utils/test';
import ChatInput from './ChatInput';

const setUp = (props={}) => {
    const component = shallow(<ChatInput {...props} />);
    return component
}

describe('<ChatInput /> component tests', () => {
    let props;
    let component;
    beforeEach(() => {
        props = {
            message: '',
            setMessage: jest.fn(),
            sendMessage: jest.fn()
        }
    });
    it('Should render chatComponent, messageComponent, chatInputComponent', () => {
        component = setUp(props);
        expect(findByTestAttr(component, "chatInputComponent").length).toBe(1);
    });
    it('Should handleInputChange on change', () => {
        component = setUp(props);
        const textfield = findByTestAttr(component, 'chatInputComponent');
        textfield.simulate('change', { target: { value: 'hello world!' } });
        expect(props.setMessage).toHaveBeenCalledTimes(1);
    });
    it('Should sendMessage on enter key press', () => {
        component = setUp(props);
        const textfield = findByTestAttr(component, 'chatInputComponent');
        textfield.simulate('keypress', {key: 'Enter'});
        expect(props.sendMessage).toHaveBeenCalledTimes(1);
    });
});