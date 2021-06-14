import React, { useEffect, useContext, useCallback } from "react";
import { sckt } from '../../Socket';
import { insert } from '../../utils/video';
import { AppContext } from "../../AppContext";
import { getVideoType } from '../../utils/video';
import VideoSearch from './Search/Search';
import VideoPlayer from "./Player/Player";



const Video = ({ playerRef }) => {
    const { username, room, videoProps, updateVideoProps } = useContext(AppContext);

    const sendVideoState = useCallback(({ eventName, eventParams }) => {
        if (!room) return;
        let params = {
          name: username,
          room: room.sid,
          eventName: eventName,
          eventParams: eventParams
        };
        sckt.socket.emit('sendVideoState', params, (error) => { });
    }, [room, username]);

    const loadVideo = useCallback((searchItem, sync) => {
        const { playing, seekTime, initVideo } = videoProps;
        if ((playerRef.current !== null || !initVideo) && searchItem) {
            if (!initVideo) updateVideoProps({ initVideo: true });
            let videoUrl = searchItem.video.url;
            if (sync) {
            updateVideoProps({ url: videoUrl });
            updateVideoProps({ playing });
            updateVideoProps({ receiving: false });
            playerRef.current.seekTo(seekTime, 'seconds');
            } else {
            updateVideoProps({ url: videoUrl });
            updateVideoProps({ playing: true });
            updateVideoProps({ receiving: false });
            }
            // sckt.socket.emit('updateRoomData', { video: searchItem }, (error) => { });
        }
    }, [playerRef, updateVideoProps, videoProps]);
    
    const playVideoFromSearch = useCallback((searchItem) => {
        const url = searchItem.video.url;
        const videoType = getVideoType(url);
        if (videoType !== null) {
            updateVideoProps({ videoType });
        }
        // Handle playing video immediately
        const { history } = videoProps;
        loadVideo(searchItem, false);
        sendVideoState({
            eventName: "syncLoad",
            eventParams: { searchItem, history: [searchItem, ...history] }
        });
        updateVideoProps({ history: [searchItem, ...history] });
    }, [loadVideo, sendVideoState, videoProps, updateVideoProps]);

    const loadFromQueue = useCallback((queue, sync = false) => {
        let nextVideo = queue.shift(); // Remove from beginning of queue
        if (nextVideo !== undefined) {
            loadVideo(nextVideo, sync);
            updateVideoProps({ queue });
            updateVideoProps({ history: [nextVideo, ...videoProps.history] });
        }
    }, [loadVideo, updateVideoProps, videoProps.history]);
    const modifyVideoState = useCallback((paramsToChange) => {
        if (playerRef.current !== null) {
            const { playing, seekTime } = paramsToChange;
            if (playing !== undefined) {
                updateVideoProps({ playing });
                // } else if (playbackRate !== undefined) {
                //     player.setPlaybackRate(playbackRate);
            }
            if (seekTime !== undefined) {
                playerRef.current.seekTo(seekTime);
            }
        }
    }, [playerRef, updateVideoProps]);
    const addVideoToQueue = useCallback((searchItem) => {
        let { queue } = videoProps;
        let updatedQueue = insert(queue, queue.length, searchItem)
        sendVideoState({
            eventName: "syncQueue",
            eventParams: {
                queue: updatedQueue,
                type: "add"
            }
        });
        updateVideoProps({ queue: updatedQueue });
    }, [sendVideoState, updateVideoProps, videoProps]);

    useEffect(() => {
        // Update single value in videoProps from other user
        const receiveVideoStateHandler = ({ name, room, eventName, eventParams = {} }) => {
            const { seekTime, playbackRate, queue, searchItem, history } = eventParams;
            updateVideoProps({ receiving: true });
            switch (eventName) {
                case 'syncPlay':
                    updateVideoProps({ playing: true });
                    modifyVideoState({ playing: true });
                    break;
                case 'syncSeek':
                    updateVideoProps({ seekTime });
                    modifyVideoState({ seekTime });
                    break;
                case 'syncPause':
                    updateVideoProps({ playing: false, seekTime });
                    modifyVideoState({ playing: false, seekTime });
                    break;
                case 'syncRateChange':
                    updateVideoProps({ playbackRate });
                    modifyVideoState({ playbackRate });
                    break;
                case 'syncLoad':
                    loadVideo(searchItem, false);
                    updateVideoProps({ history });
                    break;
                case 'syncLoadFromQueue':
                    loadFromQueue(queue);
                    break;
                case 'syncQueue':
                    updateVideoProps({ queue });
                    break;
                default:
                    break;
            }
        };

        sckt.socket.on("receiveVideoState", receiveVideoStateHandler);
        return () => {
            sckt.socket.off('receiveVideoState', receiveVideoStateHandler);
        };
    }, [loadFromQueue, loadVideo, modifyVideoState, updateVideoProps]);

    // useEffect(() => {
    //     console.log(videoProps.playing);
    // }, [videoProps.playing])

    return (
        <div style={{display: "flex", height:"100%", flexDirection: "column", justifyContent: "center"}}>
            <VideoSearch
                addVideoToQueue={addVideoToQueue}
                playVideoFromSearch={playVideoFromSearch}
                updateVideoProps={updateVideoProps}
            />
            <VideoPlayer
                videoProps={videoProps}
                sendVideoState={sendVideoState}
                updateVideoProps={updateVideoProps}
                playerRef={playerRef}
                loadVideo={loadVideo}
                loadFromQueue={loadFromQueue}
            />
            {/*
            <Segment placeholder>
                <Grid columns={2} stackable textAlign='center'>
                    <Divider vertical>Or</Divider>

                    <Grid.Row verticalAlign='middle'>
                        <Grid.Column>
                            <Header icon>
                                <Icon name='search' />
                                Search for a YouTube video
                            </Header>
                            <Button onClick={() => { document.getElementById("searchInput").focus(); }}>Search above!</Button>
                        </Grid.Column>

                        <Grid.Column>
                            <Header icon>
                                <div className="actionIcons">
                                    <Icon name='youtube' onClick={() => { window.open('https://youtube.com', '_blank'); }} />
                                    <Icon name='vimeo' onClick={() => { window.open('https://vimeo.com/search', '_blank'); }} />
                                    <Icon name='twitch' onClick={() => { window.open('https://twitch.tv', '_blank'); }} />
                                </div>
                                Paste a video link
                            </Header>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Segment>
            */}
        </div>
    );
}

export default Video;