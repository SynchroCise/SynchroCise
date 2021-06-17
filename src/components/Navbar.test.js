import React from 'react';
import { shallow, configure } from 'enzyme';
import { findByTestAtrr, initContext } from '../utils/test';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Navbar from './Navbar';

configure({ adapter: new Adapter() });

const setUp = (props={}) => {
    const component = shallow(<Navbar {...props} />)
    return component
}


describe('<Navbar />', () => {
    describe('Logged out tests', () => {
        let component;
        let contextValues;
        beforeEach(() => {
            contextValues = {
                isLoggedIn: false,
                handleLogout: jest.fn(),
                handleSetIsSignUp: jest.fn(),
                handleSetOpenAuthDialog: jest.fn()
            }
        });
        it('Should render navbarComponent', () => {
            component = initContext(contextValues, setUp);
            const wrapper = findByTestAtrr(component, 'navbarComponent');
            expect(wrapper.length).toBe(1);
        });
        it('Should render signInButton and click', () => {
            component = initContext(contextValues, setUp);
            const button = findByTestAtrr(component, 'signInButton');
            expect(button.length).toBe(1);
            button.simulate('click')
            expect(contextValues.handleSetIsSignUp).toHaveBeenCalledTimes(1);
            expect(contextValues.handleSetOpenAuthDialog).toHaveBeenCalledTimes(1);
        });
        it('Should render signUpButton and click', () => {
            component = initContext(contextValues, setUp);
            const button = findByTestAtrr(component, 'signUpButton');
            expect(button.length).toBe(1);
            button.simulate('click')
            expect(contextValues.handleSetIsSignUp).toHaveBeenCalledTimes(1);
            expect(contextValues.handleSetOpenAuthDialog).toHaveBeenCalledTimes(1);
        });
        it('Should render logoutButton and click', () => {
            contextValues.isLoggedIn = true
            component = initContext(contextValues, setUp);
            const button = findByTestAtrr(component, 'logoutButton');
            expect(button.length).toBe(1);
            button.simulate('click')
            expect(contextValues.handleLogout).toHaveBeenCalledTimes(1);
        });
    });
});