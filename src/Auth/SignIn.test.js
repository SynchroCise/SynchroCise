import React from 'react';
import { shallow, configure } from 'enzyme';
import { findByTestAtrr, runAllPromises } from '../utils/test';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import SignIn from './SignIn';

configure({ adapter: new Adapter() });

const setUp = (props={}) => {
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
        props.handleSubmit.mockResolvedValue({success: false, errMessage})
        component = setUp(props);
    });
    it('Should render signInComponent', () => {
        const wrapper = findByTestAtrr(component, 'signInComponent');
        expect(wrapper.length).toBe(1);
    });
    it('Should emit handleSetIsSignUp on click', () => {
        const button = findByTestAtrr(component, 'signUpLink');
        button.simulate('click');
        expect(props.handleSetIsSignUp.mock.calls.length).toBe(1);
    });
    it('Should submit form and fail', async () => {
        // create form
        const form = findByTestAtrr(component, 'signInForm');
        expect(form.length).toBe(1);
        form.simulate('submit', { preventDefault: jest.fn() });

        // check button disabled and hit handleSubmit
        const preButton = findByTestAtrr(component, 'signInSubmitButton')
        expect(preButton.prop('disabled')).toBe(true);
        expect(props.handleSubmit.mock.calls.length).toBe(1);

        // wait for component to update
        await runAllPromises();
        component.update();

        // check error and button undisabled
        const errWrapper = findByTestAtrr(component, 'errMessage');
        expect(errWrapper.text()).toBe(errMessage);
        const postButton = findByTestAtrr(component, 'signInSubmitButton')
        expect(postButton.prop('disabled')).toBe(false);
    });
});