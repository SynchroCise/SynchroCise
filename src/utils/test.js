import * as AppContext from "../AppContext";
export const runAllPromises = () => new Promise(setImmediate)

export const findByTestAttr = (component, attr) => {
    const wrapper = component.find(`[data-test='${attr}']`);
    return wrapper;
};

export const initContext = (contextValues, setUp) => {
    jest
        .spyOn(AppContext, 'useAppContext')
        .mockImplementation(() => contextValues)
    return setUp();
}
