import React from 'react';
import { shallow } from 'enzyme';
import { findByTestAttr, initContext, asyncUpdateComponent } from '../../utils/test';
import CreateWorkout from './CreateWorkout';
import * as requests from "../../utils/requests";

const setUp = (props = {}) => {
    const component = shallow(<CreateWorkout {...props} />);
    return component
}

const mockPush = jest.fn();
const mockGoBack = jest.fn();
jest.mock('react-router-dom', () => ({
    useHistory: () => ({
        push: mockPush,
        goBack: mockGoBack
    }),
}));
jest.mock("../../utils/requests");
const realLocation = window.location;

describe('<CreateWorkout />', () => {
    let component;
    let contextValues;
    let props;
    let location;

    const testSubmitForm = async (initExercises) => {
        component = initContext(contextValues, setUp, props = { initExercises });
        const form = findByTestAttr(component, 'createWorkoutForm');
        expect(form.length).toBe(1);
        form.simulate('submit', { preventDefault: jest.fn() });
        await asyncUpdateComponent(component);
    }

    const testInputField = ({ text, fieldName }) => {
        let field = findByTestAttr(component, fieldName);
        field.simulate('change', { target: { value: text } });
        component.update()
        field = findByTestAttr(component, fieldName);
        expect(field.prop('value')).toBe(text);
    }
    const testWorkoutTitle = (url) => {
        const mockLocation = new URL(url);
        delete window.location;
        window.location = mockLocation;
        component = initContext(contextValues, setUp);
        return findByTestAttr(component, "workoutTitle").text()
    }

    beforeEach(() => {
        location = window.location;
        contextValues = {
            connecting: false,
            handleSetConnecting: jest.fn()
        };
        requests.getUserWorkout.mockResolvedValue({ ok: false });
    });
    afterEach(() => {
        window.location = location;
    });

    it('Should render createWorkoutComponent', () => {
        component = initContext(contextValues, setUp);
        const wrapper = findByTestAttr(component, 'createWorkoutComponent');
        expect(wrapper.length).toBe(1);
    });

    it('Should handleSubmit with no exercises', async () => {
        await testSubmitForm();
        expect(contextValues.handleSetConnecting).toHaveBeenCalledTimes(2);
        expect(requests.addWorkout).toHaveBeenCalledTimes(0);
        expect(requests.editWorkout).toHaveBeenCalledTimes(0);
        expect(mockPush).toHaveBeenCalledTimes(0);
    });

    it('Should handleSubmit with exercises', async () => {
        // init
        requests.addWorkout.mockResolvedValue({ ok: true });
        const exercises = [{ 'exercise': '1', 'time': '1' }]

        // submit
        await testSubmitForm(exercises);
        expect(contextValues.handleSetConnecting).toHaveBeenCalledTimes(2);
        expect(requests.addWorkout).toHaveBeenCalledTimes(1);
        expect(requests.editWorkout).toHaveBeenCalledTimes(0);
        expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it('Should handleSubmit with exercises & edit-workout', async () => {
        // init
        requests.getUserWorkout.mockResolvedValue({ ok: false });
        requests.editWorkout.mockResolvedValue({ ok: true });
        const exercises = [{ 'exercise': '1', 'time': '1' }]
        const mockLocation = new URL("https://synchrocise.com/edit-workout/asdf");
        delete window.location;
        window.location = mockLocation;

        // submit
        await testSubmitForm(exercises);
        expect(contextValues.handleSetConnecting).toHaveBeenCalledTimes(2);
        expect(requests.addWorkout).toHaveBeenCalledTimes(0);
        expect(requests.editWorkout).toHaveBeenCalledTimes(1);
        expect(mockPush).toHaveBeenCalled();
    });


    it('Should return to CreateRoom on click', () => {
        component = initContext(contextValues, setUp);
        const button = findByTestAttr(component, 'backButton');
        expect(button.length).toBe(1);
        button.simulate('click');
        expect(mockGoBack).toHaveBeenCalledTimes(1);
    });

    it('Should update workoutNameField on change', () => {
        component = initContext(contextValues, setUp);
        testInputField({ text: 'New name!', fieldName: 'workoutNameField' });
    });

    it('Should add row on addWorkoutButton click', () => {
        component = initContext(contextValues, setUp);
        const button = findByTestAttr(component, 'addWorkoutButton');
        expect(button.length).toBe(1);
        const rowLength = findByTestAttr(component, 'inputRow').length
        button.simulate('click');
        component.update();
        expect(findByTestAttr(component, 'inputRow').length).toBe(rowLength + 1);
    });

    it('Should update exerciseNameField on change', () => {
        component = initContext(contextValues, setUp);
        testInputField({ text: 'New exercise!', fieldName: 'exerciseNameField' });
    });

    it('Should update timeField on change', () => {
        component = initContext(contextValues, setUp);
        testInputField({ text: '2', fieldName: 'timeField' });
    });

    it('Should handleSelected on click', () => {
        const initExercises = [{ 'exercise': '1', 'time': '1' }, { 'exercise': '2', 'time': '2' }]
        component = initContext(contextValues, setUp, props = { initExercises });

        expect(findByTestAttr(component, 'inputRow').at(0).prop('selected')).toBe(true);
        expect(findByTestAttr(component, 'inputRow').at(1).prop('selected')).toBe(false);

        findByTestAttr(component, 'exerciseCell').at(0).simulate('click');
        expect(findByTestAttr(component, 'inputRow').at(0).prop('selected')).toBe(false);
        expect(findByTestAttr(component, 'inputRow').at(1).prop('selected')).toBe(true);

        findByTestAttr(component, 'timeCell').at(0).simulate('click');
        expect(findByTestAttr(component, 'inputRow').at(0).prop('selected')).toBe(true);
        expect(findByTestAttr(component, 'inputRow').at(1).prop('selected')).toBe(false);
    });

    it('Should handleRemoveRow on click', () => {
        const initExercises = [{ 'exercise': '1', 'time': '1' }, { 'exercise': '2', 'time': '2' }]
        component = initContext(contextValues, setUp, props = { initExercises });

        expect(findByTestAttr(component, 'inputRow').length).toBe(2);
        findByTestAttr(component, 'removeButton').at(0).simulate('click');
        expect(findByTestAttr(component, 'inputRow').length).toBe(1);
    });

    it('Should show bad input on click', () => {
        const initExercises = [{ 'exercise': '1', 'time': '1' }]
        component = initContext(contextValues, setUp, props = { initExercises });
        expect(findByTestAttr(component, 'inputRow').prop('className')).toBe('');


        testInputField({ text: 'New exercise!', fieldName: 'exerciseNameField' });
        testInputField({ text: '', fieldName: 'timeField' });
        expect(findByTestAttr(component, 'inputRow').prop('className')).toMatch(/errorRow/);

        testInputField({ text: '', fieldName: 'exerciseNameField' });
        testInputField({ text: 'hello', fieldName: 'timeField' });
        expect(findByTestAttr(component, 'inputRow').prop('className')).toMatch(/errorRow/);

        testInputField({ text: 'New exercise!', fieldName: 'exerciseNameField' });
        testInputField({ text: '5', fieldName: 'timeField' });
        expect(findByTestAttr(component, 'inputRow').prop('className')).toBe('');
    });
    describe("testing workoutTitle", () => {
        it('Should test workoutTitle renders as expected when edit-workout', () => {
            expect(testWorkoutTitle("https://synchrocise.com/edit-workout/")).toBe("Edit Workout");
        });
        it('Should test workoutTitle renders as expected when edit-workout', () => {
            expect(testWorkoutTitle("https://synchrocise.com/edit-workout/asdf")).toBe("Edit Workout");

        });
        it('Should test workoutTitle renders as expected when create-workout', () => {
            expect(testWorkoutTitle("https://synchrocise.com/create-workout/")).toBe("Create Workout");
        });
        it('Should test workoutTitle renders as expected when create-workout', () => {
            expect(testWorkoutTitle("https://synchrocise.com/create-workout/asdf")).toBe("Create Workout");
        });
    });
    it('Should call getUserWorkouts on initial render if edit-workout', () => {
        const mockLocation = new URL("https://synchrocise.com/edit-workout/asdf");
        delete window.location;
        window.location = mockLocation;
        component = initContext(contextValues, setUp);

        expect(requests.getUserWorkout).toHaveBeenCalled();
    });
    it('Should not call getUserWorkouts on initial render if create-workout', () => {
        const mockLocation = new URL("https://synchrocise.com/create-workout/asdf");
        delete window.location;
        window.location = mockLocation;
        component = initContext(contextValues, setUp);

        expect(requests.getUserWorkout).toHaveBeenCalledTimes(0);
    });
});