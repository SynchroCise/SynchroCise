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

export const initContext = (contextValues, setUp, props = {}) => {
    jest
        .spyOn(AppContext, 'useAppContext')
        .mockImplementation(() => contextValues)
    return setUp(props);
}

export const initTrack = (kind) => ({
    isTrackEnabled: true,
    track: {
        enable: jest.fn(),
        disable: jest.fn(),
        attach: jest.fn(),
        detach: jest.fn()
    },
    attach: jest.fn(),
    detach: jest.fn(),
    kind,
    on: jest.fn()
})

export const createParticipant = (sid) => ({
    sid,
    tracks: [],
    videoTracks: [initTrack('video')],
    audioTracks: [initTrack('audio')],
    removeAllListeners: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    removeAllListeners: jest.fn()
})

export const initRoomObj = () => ({
    sid: 'room',
    localParticipant: createParticipant('local'),
    participants: new Map(),
    on: jest.fn(),
    off: jest.fn()
});
