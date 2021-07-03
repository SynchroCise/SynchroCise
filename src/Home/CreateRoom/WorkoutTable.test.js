import React from 'react';
import { shallow } from 'enzyme';
import { findByTestAttr, initContext } from '../../utils/test';
import WorkoutTable, { Row } from './WorkoutTable';

jest.mock("../../utils/requests");
const mockPush = jest.fn();
jest.mock('react-router-dom', () => ({
    useHistory: () => ({
      push: mockPush,
    }),
}));

describe('<WorkoutTable />', () => {
    let component;
    let contextValues;
    let props;

    const setUp = (props={}) => {
        const component = shallow(<WorkoutTable {...props} />);
        return component
    }

    beforeEach(() => {
        contextValues = {
            handleSetWorkout: jest.fn()
        }
        props = {
            workoutList: [{ "workoutName": "", "exercises": [{ "time": 1, "exercise": "" }], "id": "" },
            { "workoutName": "", "exercises": [{ "time": 1, "exercise": "" }], "id": "" }],
            setWorkoutList: jest.fn(),
            selectedWorkout: 0,
            setSelectedWorkout: jest.fn()
        }
        component = initContext(contextValues, setUp, props);
    });
    it('Should render workoutTableComponent', () => {
        const wrapper = findByTestAttr(component, 'workoutTableComponent')
        expect(wrapper.length).toBe(1);
    });
    it('Should render two rows', () => {
        const wrapper = findByTestAttr(component, 'rowComponent')
        expect(wrapper.length).toBe(2);
    });
});

describe('<Row />', () => {
    let component;
    let contextValues;
    let props;

    const setUp = (props={}) => {
        const component = shallow(<Row {...props} />);
        return component
    }

    beforeEach(() => {
        contextValues = {
            handleSetWorkout: jest.fn()
        }
        props = {
            row: { "workoutName": "", "exercises": [{ "time": 1, "exercise": "" }], "id": "" },
            index: 0,
            handleSelect: jest.fn(),
            handleDeleteWorkout: jest.fn(),
            handleEditWorkout: jest.fn(),
            selectedWorkout: 0
        }
        jest.spyOn(window, 'confirm').mockImplementation(() => true);
        component = initContext(contextValues, setUp, props);
    });

    it('Should handleSelect on TableRow click', () => {
        const workoutName = findByTestAttr(component, 'workoutName');
        const displayName = findByTestAttr(component, 'displayName');
        const exercise = findByTestAttr(component, 'exercise');
        workoutName.simulate('click');
        displayName.simulate('click');
        exercise.simulate('click');

        expect(props.handleSelect).toHaveBeenCalledTimes(3);
    });
    it('Should handleDeleteWorkout on button click', () => {
        const button = findByTestAttr(component, 'deleteWorkoutButton');
        button.simulate('click');
        expect(props.handleDeleteWorkout).toHaveBeenCalledTimes(1);
    });
    it('Should collapse collapseComponent on click', async () => {
        let wrapper = findByTestAttr(component, 'collapseComponent');
        let button = findByTestAttr(component, 'collapseButton');
        expect(wrapper.prop('in')).toBe(false);
        expect(button.children().prop('data-test')).toBe("arrDown");

        button.simulate('click');
        component.update()

        wrapper = findByTestAttr(component, 'collapseComponent');
        button = findByTestAttr(component, 'collapseButton');
        expect(wrapper.prop('in')).toBe(true);
        expect(button.children().prop('data-test')).toBe("arrUp");
    });
    it('Should handleEditWorkout on button click', () => {
        const button = findByTestAttr(component, 'editWorkoutButton');
        button.simulate('click');
        expect(props.handleEditWorkout).toHaveBeenCalledTimes(1);
    });
});