import React from 'react';
import { shallow } from 'enzyme';
import { findByTestAttr, initContext, runAllPromises } from '../utils/test';
import Home from './Home';
import * as requests from "../utils/requests"
import AOS from "aos";

const setUp = (props = {}) => {
    const component = shallow(<Home {...props} />);
    return component
}

jest.mock("../utils/requests");
const mockPush = jest.fn();
jest.mock('react-router-dom', () => ({
    useHistory: () => ({
        push: mockPush,
    }),
}));

describe('<Home />', () => {
    let component;
    let contextValues;

    const testClickAndCall = (componentName, expectedFunctionCalls = []) => {
        const button = findByTestAttr(component, componentName);
        expect(button.length).toBe(1);
        button.simulate('click');
        expectedFunctionCalls.forEach((mockFunc) => {
            expect(mockFunc).toHaveBeenCalledTimes(1);
        });
    }

    beforeEach(() => {
        contextValues = {
            isLoggedIn: false,
            joinRoom: jest.fn(),
            roomName: '',
            handleRoomNameChange: jest.fn(),
            handleSetOpenAuthDialog: jest.fn(),
            handleSetIsSignUp: jest.fn(),
            handleSetRoomName: jest.fn()
        }
    });
    it('Should render homeComponent', () => {
        component = initContext(contextValues, setUp);
        const wrapper = findByTestAttr(component, 'homeComponent');
        expect(wrapper.length).toBe(1);
    });
    it('Should render joinRoomForm and submit succeed', async () => {
        requests.getRoomByName.mockResolvedValue({ ok: true, body: { id: 'ROOMCODE' } });
        component = initContext(contextValues, setUp);

        // find and submit form
        const form = findByTestAttr(component, 'joinRoomForm');
        expect(form.length).toBe(1);
        form.simulate('submit', { preventDefault: jest.fn() });
        expect(requests.getRoomByName).toHaveBeenCalledTimes(1);

        // wait for component to update
        await runAllPromises();
        component.update();

        expect(contextValues.joinRoom).toHaveBeenCalledTimes(1);
        expect(mockPush).toHaveBeenCalledTimes(1);
    });
    it('Should render joinRoomForm and submit fail', async () => {
        requests.getRoomByName.mockResolvedValue({ ok: false, body: { message: 'error' } });
        component = initContext(contextValues, setUp);

        // find and submit form
        const form = findByTestAttr(component, 'joinRoomForm');
        expect(form.length).toBe(1);
        form.simulate('submit', { preventDefault: jest.fn() });

        // wait for component to update
        await runAllPromises();
        component.update();

        const input = findByTestAttr(component, 'roomCodeInput');
        expect(input.length).toBe(1);
        expect(input.prop('helperText')).toBe('error')
        expect(requests.getRoomByName).toHaveBeenCalledTimes(1);
        expect(contextValues.joinRoom).toHaveBeenCalledTimes(0);
        expect(mockPush).toHaveBeenCalledTimes(0);
    });
    it('Should render createRoomButton and click while logged out', () => {
        component = initContext(contextValues, setUp);
        testClickAndCall('createRoomButton', [mockPush])
    });
    it('Should render signUpButton and click while logged out', () => {
        component = initContext(contextValues, setUp);
        testClickAndCall('signUpButton', [contextValues.handleSetOpenAuthDialog, contextValues.handleSetIsSignUp])
    });
    it('Should render signInLink2 and click while logged out', () => {
        component = initContext(contextValues, setUp);
        testClickAndCall('signInLink2', [contextValues.handleSetOpenAuthDialog, contextValues.handleSetIsSignUp])
    });
    it('Should render signInLink and click while logged out', () => {
        component = initContext(contextValues, setUp);
        testClickAndCall('signInLink', [contextValues.handleSetOpenAuthDialog, contextValues.handleSetIsSignUp])
    });
    it('Should not render createRoomButton, signUpButton, signInLink2 and click while logged in', () => {
        contextValues.isLoggedIn = true;
        component = initContext(contextValues, setUp);
        expect(findByTestAttr(component, 'signInLink').length).toBe(0);
        expect(findByTestAttr(component, 'signUpButton').length).toBe(0);
        expect(findByTestAttr(component, 'signInLink2').length).toBe(0);
    });
    it('Should init AOS', async () => {
        const mockAOSInit = jest.spyOn(AOS, 'init');
        component = initContext(contextValues, setUp);
        expect(mockAOSInit).toHaveBeenCalledTimes(1);
    });
});