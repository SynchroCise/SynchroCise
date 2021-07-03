import React from 'react';
import { shallow } from 'enzyme';
import { findByTestAttr, runAllPromises } from '../utils/test';
import SignIn from './SignIn';

const setUp = (props = {}) => {
    const component = shallow(<SignIn {...props} />)
    return component
}

describe('<SignIn />', () => {
    let component;
    let props
    let errMessage = "hello error!"
    beforeEach(() => {
        props = {
            handleSetIsSignUp: jest.fn(),
            handleSubmit: jest.fn()
        }
        props.handleSubmit.mockResolvedValue({ success: false, errMessage })
        component = setUp(props);
    });
    it('Should render signInComponent', () => {
        const wrapper = findByTestAttr(component, 'signInComponent');
        expect(wrapper.length).toBe(1);
    });
    it('Should emit handleSetIsSignUp on click', () => {
        const button = findByTestAttr(component, 'signUpLink');
        button.simulate('click');
        expect(props.handleSetIsSignUp.mock.calls.length).toBe(1);
    });
    it('Should submit form and fail', async () => {
        // create form
        const form = findByTestAttr(component, 'signInForm');
        expect(form.length).toBe(1);
        form.simulate('submit', { preventDefault: jest.fn() });

        // check button disabled and hit handleSubmit
        const preButton = findByTestAttr(component, 'signInSubmitButton')
        expect(preButton.prop('disabled')).toBe(true);
        expect(props.handleSubmit.mock.calls.length).toBe(1);

        // wait for component to update
        await runAllPromises();
        component.update();

        // check error and button undisabled
        const errWrapper = findByTestAttr(component, 'errMessage');
        expect(errWrapper.text()).toBe(errMessage);
        const postButton = findByTestAttr(component, 'signInSubmitButton')
        expect(postButton.prop('disabled')).toBe(false);
    });
});