import * as AppContext from "../AppContext";
export const runAllPromises = () => new Promise(setImmediate)

export const asyncUpdateComponent = async (component) => {
    await new Promise(setImmediate)
    component.update();
}

export const findByTestAttr = (component, attr) => {
    const wrapper = component.find(`[data-test='${attr}']`);
    return wrapper;
};

export const initContext = (contextValues, setUp, props={}) => {
    jest
        .spyOn(AppContext, 'useAppContext')
        .mockImplementation(() => contextValues)
    return setUp(props);
}
