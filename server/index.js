const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const bodyParser = require('body-parser');
const passport = require('passport');
const pino = require('express-pino-logger')();
var cookieParser = require('cookie-parser');
const path = require('path');

const {
    checkUser,
    updateWorkoutHistory
} = require('./users.js');
const { removeRoom } = require('./rooms.js');
const getTime = () => {
    let time = new Date();
    let mins = (time.getMinutes() < 10 ? '0' : '') + time.getMinutes();
    return time.getHours() + ":" + mins
}


const router = require('./router')
const secureRoute = require('./secure-router');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const cors = require('cors');

io.on('connection', (socket) => {
    //refactor
    const leaveRoom = async (room, leader = false) => {
        if (leader) {
            const room = await removeRoom(user.room);
            io.to(room).emit('killroom');
        }
        if (user) {
            socket.broadcast.to(room).emit('message', { user: 'admin', text: `user has left`, time: getTime() });
            io.to(room).emit('leaver', user);
        }
    }

    /** JOINING/LEAVING ROOMS */
    socket.on('checkUser', ({ name, room }, callback) => {
        const { error } = checkUser({ name, room });
        if (error) return callback(error);
        return callback();
    });

    socket.on('join', async ({ room, uid, displayName }, callback) => {
        io.to(room).emit('getRoomSync', { id: uid });
        io.to(room).emit('getVideoSync', { id: uid });
        socket.broadcast.to(room).emit('message', { user: 'admin', text: `${displayName} has joined`, time: getTime() });
        socket.join(room);
    });

    //ONCE WILL RELY ON NEW METHOD OF VIDEO SHARING COMPLETION BEFORE THIS CAN BE FULLY IMPLEMENTED
    //TODO: Make it not based on socketid if possible
    socket.on('disconnect', () => {
        let time = new Date();
        updateWorkoutHistory(socket.id, time);
        //leaveRoom();
    });

    socket.on('handleLeaveRoom', () => {
        let time = new Date();
        updateWorkoutHistory(socket.id, time);
        //leaveRoom();
    });

    /** SENDING MESSAGES */
    socket.on('sendMessage', async ({ message, username, room }, callback) => {
        io.to(room).emit('message', { user: username, text: message, time: getTime() });
        callback();
    });

    /** VIDEO STATE CHANGES */
    socket.on('sendVideoSync', ({ id, ...videoProps }, callback) => {
        io.to(id).emit('startVideoSync', videoProps);
        callback();
    });

    socket.on('sendVideoState', (params, callback) => {
        const { name, room, eventName, eventParams } = params;
        socket.to(room).emit('receiveVideoState', params);
        let admin_msg;
        switch (eventName) {
            case 'syncPlay':
                admin_msg = `${name} played the video`; break;
            case 'syncSeek':
                admin_msg = `${name} jumped to ${new Date(eventParams.seekTime * 1000).toISOString().substr(11, 8)}.`; break;
            case 'syncPause':
                admin_msg = `${name} paused the video.`; break;
            case 'videoStartBuffer':
                admin_msg = `${name} is buffering.`; break;
            case 'videoFinishBuffer':
                admin_msg = `${name} finished buffering.`; break;
            case 'syncRateChange':
                admin_msg = `${name} changed the playback rate to ${eventParams.playbackRate}.`; break;
            case 'syncLoad':
                admin_msg = `${name} changed the video.`; break;
            case 'syncLoadFromQueue':
                admin_msg = `${name} loaded next video on the queue.`; break;
            case 'syncQueue':
                if (eventParams.type === "add")
                    admin_msg = `${name} added a video to the queue.`
                else if (eventParams.type === "remove")
                    admin_msg = `${name} removed a video from the queue.`;
                break;
            default:
                admin_msg = ''; break;
        }

        io.in(room).emit('message', { user: 'admin', text: admin_msg, time: getTime() });
        callback();
    });

    /** ROOM STATE CHANGES */
    socket.on('sendRoomState', (params, callback) => {
        const { name, room, eventName, eventParams } = params;
        socket.to(room).emit('receiveRoomState', params);
        let admin_msg;
        switch (eventName) {
            case 'syncWorkoutState':
                admin_msg = `${name} has paused/played the custom workout`
            case 'syncWorkoutType':
                admin_msg = `${name} has changed the workout type`
            case 'syncWorkout':
                admin_msg = `${name} has changed the workout`
        }
        io.in(room).emit('message', { user: 'admin', text: admin_msg, time: getTime() });
        callback();
    });
    socket.on('sendRoomSync', ({ id, ...roomProps }, callback) => {
        io.to(id).emit('startRoomSync', roomProps);
        callback();
    });
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(pino);
app.use(cors())
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../server/build')));
app.use('/', router);
app.use('/user', passport.authenticate('jwt', { session: false }), secureRoute);
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../server/build/index.html'));
});

server.listen(3001, () =>
    console.log('Express server is running on localhost:3001')
);
