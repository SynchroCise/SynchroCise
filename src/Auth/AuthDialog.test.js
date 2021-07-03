import React from 'react';
import { shallow } from 'enzyme';
import { findByTestAttr, initContext } from '../utils/test';
import AuthDialog from './AuthDialog';

const setUp = (props = {}) => {
    const component = shallow(<AuthDialog {...props} />)
    return component
}

describe('<AuthDialog />', () => {
    let component;
    let contextValues;
    beforeEach(() => {
        contextValues = {
            isSignUp: true,
            openAuthDialog: true,
            handleSetOpenAuthDialog: jest.fn(),
            handleSetIsSignUp: jest.fn(),
            handleSetUserId: jest.fn(),
            handleSetUsername: jest.fn(),
            setIsLoggedIn: jest.fn()
        }
    });
    it('Should render authDialogComponent', () => {
        component = initContext(contextValues, setUp);
        const wrapper = findByTestAttr(component, 'authDialogComponent');
        expect(wrapper.length).toBe(1);
    });
    it('Should render signUpComponent', () => {
        component = initContext(contextValues, setUp);
        const wrapper = findByTestAttr(component, 'signUpComponent');
        expect(wrapper.length).toBe(1);
    });
    it('Should render signInComponent', () => {
        contextValues.isSignUp = false
        component = initContext(contextValues, setUp);
        const wrapper = findByTestAttr(component, 'signInComponent');
        expect(wrapper.length).toBe(1);
    });
});