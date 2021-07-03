import React from 'react';
import { shallow } from 'enzyme';
import { findByTestAttr, runAllPromises } from '../utils/test';
import SignUp, { SignUpMethods } from './SignUp';

const setUp = (props = {}) => {
    const component = shallow(<SignUp {...props} />)
    return component
}

describe('<SignUp />', () => {
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
    it('Should render signUpComponent', () => {
        const wrapper = findByTestAttr(component, 'signUpComponent');
        expect(wrapper.length).toBe(1);
    });
    it('Should emit handleSetIsSignUp on click', () => {
        const button = findByTestAttr(component, 'signInLink');
        button.simulate('click');
        expect(props.handleSetIsSignUp.mock.calls.length).toBe(1);
    });
    it('Should submit form and fail', async () => {
        // update email field
        const emailField = findByTestAttr(component, 'emailField')
        emailField.simulate('change', { target: { value: 'test@example.com' } })

        // create form
        const form = findByTestAttr(component, 'signUpForm');
        expect(form.length).toBe(1);
        form.simulate('submit', { preventDefault: jest.fn() });

        // check button disabled and hit handleSubmit
        const preButton = findByTestAttr(component, 'signUpSubmitButton')
        expect(preButton.prop('disabled')).toBe(true);
        expect(props.handleSubmit.mock.calls.length).toBe(1);

        // wait for component to update
        await runAllPromises();
        component.update();

        // check error and button undisabled
        const errWrapper = findByTestAttr(component, 'errMessage');
        const postButton = findByTestAttr(component, 'signUpSubmitButton')
        expect(errWrapper.text()).toBe(errMessage);
        expect(postButton.prop('disabled')).toBe(false);
    });
});

describe('SignUpnMethods()', () => {
    it('isEmailValid should return false if email is invalid', () => {
        expect(SignUpMethods().isValidEmail('notvalidemail')).toBeFalsy();
        expect(SignUpMethods().isValidEmail('notvalidemail.aswell')).toBeFalsy();
    });
    it('isEmailValid should return false if email is valid', () => {
        expect(SignUpMethods().isValidEmail('validemail@gmail.com')).toBeTruthy();
    });
});