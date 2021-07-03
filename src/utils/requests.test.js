import Video from "twilio-video";
import * as requests from "./requests"
import { runAllPromises } from './test';

jest.mock("twilio-video")

describe("test requests.js", () => {
    describe('test createTwilioRoom', () => {
        it('Should test createTwilioRoom with failed createLocalAudioTrack', async () => {
            Video.createLocalAudioTrack.mockImplementation(() => {
                throw new Error();
            });
            Video.createLocalVideoTrack.mockResolvedValue([]);
            requests.createTwilioRoom();
            await runAllPromises();
            expect(Video.connect).toHaveBeenCalledWith(undefined, expect.objectContaining({
                "video": true,
                "audio": false
            }));
        });
        it('Should test createTwilioRoom with failed createLocalVideoTrack', async () => {
            Video.createLocalVideoTrack.mockImplementation(() => {
                throw new Error();
            });
            Video.createLocalAudioTrack.mockResolvedValue([]);
            requests.createTwilioRoom();
            await runAllPromises();
            expect(Video.connect).toHaveBeenCalledWith(undefined, expect.objectContaining({
                "video": false,
                "audio": true
            }));
        });
        it('Should test createTwilioRoom with failed createLocalVideoTrack and createLocalAudioTrack', async () => {
            Video.createLocalVideoTrack.mockImplementation(() => {
                throw new Error();
            });
            Video.createLocalAudioTrack.mockImplementation(() => {
                throw new Error();
            });
            requests.createTwilioRoom();
            await runAllPromises();
            expect(Video.connect).toHaveBeenCalledWith(undefined, expect.objectContaining({
                "video": false,
                "audio": false
            }));
        });
        afterEach(() => {
            expect(Video.createLocalVideoTrack).toHaveBeenCalledTimes(1);
            expect(Video.createLocalAudioTrack).toHaveBeenCalledTimes(1);
            expect(Video.connect).toHaveBeenCalledTimes(1);
        });
    });
});