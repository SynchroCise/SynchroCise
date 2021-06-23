import axios from 'axios';
import React, { useRef, useState } from 'react';
import {
    youtube_parser,
    getVideoType,
    isValidURL
} from '../../../utils/video';
import { store } from 'react-notifications-component';
import { Box, TextField, withStyles } from '@material-ui/core';
import moment from 'moment'

require('dotenv').config()

const VideoSearch = ({ addVideoToQueue, playVideoFromSearch, updateVideoProps }) => {
    const [loading, setLoading] = useState(false);
    const [errSearch, setErrSearch] = useState("")
    const baseURL = 'https://www.googleapis.com/youtube/v3/videos';
    const lastSearch = useRef('');

    const handlePlay = async (url) => {
        let trimInput = url.trim();
        if (trimInput === '' || trimInput === lastSearch.current) return;
        lastSearch.current = trimInput;
        if (isValidURL(trimInput)) {
            setErrSearch("")
            const videoType = getVideoType(trimInput);
            updateVideoProps({ videoType });
            switch (videoType) {
                case 'yt': getYTVideo(trimInput); break;
                default:
                    store.addNotification({
                        title: "Oh no!",
                        message: "We apologize. At the moment, only YouTube, Vimeo, and Twitch links are supported.",
                        type: "info",
                        insert: "top",
                        container: "bottom-right",
                        animationIn: ["animated", "fadeInUp"],
                        animationOut: ["animated", "fadeOut"],
                        dismiss: {
                            duration: 5000,
                            onScreen: false
                        }
                    });
                    break;
            }
        } else {
            setErrSearch('Invalid Youtube URL')
            // Search phrase on Youtub
            // search({ term: trimInput, page: 1 });
            // updateVideoProps({ videoType: 'yt' });
        }
    };
    /*
    const search = async ({ term, page = 1 }) => {
        const limit = (window.matchMedia('(max-width: 960px)').matches) ? 8 : 9;
        setLoading(true);
        axios.get(`${baseURL}/ytsearch`, {
            params: {
                query: term,
                page: page,
                limit: limit
            }
        }).then(response => {
            setSearchResults(response.data.results);
            setPage(page);
            setLoading(false);
        });
    };
    */
    const getYTVideo = async (ytUrl) => {
        const part = 'id,snippet,statistics'
        const id = youtube_parser(ytUrl);
        const key = process.env.REACT_APP_YOUTUBE_API_KEY
        setLoading(true);
        axios.get(`${baseURL}`, {
            params: { part, id, key }
        }).then(response => {
            setLoading(false);
            const searchItem = {
                "channel": {
                    "url": `https://www.youtube.com/channel/${response.data.items[0].snippet.channelId}`,
                    "username": response.data.items[0].snippet.channelTitle,
                    "verified": false
                },
                "video": {
                    "id": response.data.items[0].id,
                    "thumbnails": response.data.items[0].snippet.thumbnails.default.url,
                    "title": response.data.items[0].snippet.title,
                    "url": `https://www.youtube.com/watch?v=${response.data.items[0].id}`,
                    "upload_date": moment(response.data.items[0].snippet.publishedAt).fromNow(),
                    "views": response.data.items[0].statistics.viewCount
                }
            }
            playVideoFromSearch(searchItem);
        });
    }

    const CustomTextField = withStyles({
        root: {
            '& .MuiInputBase-root': {
                color: 'white',
            },
            "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                borderColor: "gray"
            },
        },

    })(TextField);

    return (
        <div className="videoSearchContainer">
            <Box width="75%">
                <CustomTextField
                    placeholder='Paste Youtube Link Here!'
                    onKeyPress={e => e.key === 'Enter' ? handlePlay(e.target.value) : null}
                    disabled={loading}
                    error={errSearch !== ''}
                    helperText={errSearch}
                    variant="outlined"
                    fullWidth
                />
            </Box>

        </div>
    )
};

export default VideoSearch;