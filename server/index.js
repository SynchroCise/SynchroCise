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
    addUser,
    removeUser,
    getUsersInRoom,
    getUsersBySid,
    getUserByName,
    getLeadersInRoom,
    getUsersBySocketId
} = require('./users.js');
const { getActiveRooms, getRoomsBySID, updateRoomData, removeRoom } = require('./rooms.js');
const { getWorkoutById } = require('./workouts.js');


const router = require('./router')
const secureRoute = require('./secure-router');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const cors = require('cors');

io.on('connection', (socket) => {
    console.log('New Connection');

    /** JOINING/LEAVING ROOMS */
    socket.on('getRoomData', ({ room }, callback) => {
        io.to(socket.id).emit('roomData', { room: room, users: getUsersInRoom(room) });
        // callback();
    });
    socket.on('checkUser', ({ name, room }, callback) => {
        const { error } = checkUser({ name, room });
        if (error) return callback(error);
        return callback();
    });
    socket.on('join', async ({ name, room, sid, userId }, callback) => {
        const { user, error } = await addUser({ socketId: socket.id, name, room, sid, userId });
        if (error) return callback('Firebase connection failed');

        io.to(user.room).emit('message', { user: { name: 'admin' }, text: `Hi ${user.name}! Welcome to your new room! You can invite your friends to watch with you by sending them the link to this page.` });

        // let roomData = (await getRoomsBySID(user.room))[0];
        // roomData['workout'] = await getWorkoutById(roomData.workoutId)
        // socket.emit('roomData', roomData);
        let roomUsers = await getUsersInRoom(user.room)
        let leaderList = roomUsers.filter(user => user.isLeader === true).map((obj) => obj.sid);
        // socket.emit('message', { user: { name: 'admin' }, text: `${process.env.CLIENT}/room/${user.room}` });

        socket.broadcast.to(user.room).emit('message', { user: { name: 'admin' }, text: `${user.name} has joined` });
        // gets video sync data from other user
        if (roomUsers.length > 1) {
            const otherUser = roomUsers.filter((roomUser) => user.id !== roomUser.id)[0]
            if (otherUser) {
                io.to(otherUser.socketId).emit('getRoomSync', { id: user.socketId });
                io.to(otherUser.socketId).emit('getVideoSync', { id: user.socketId });
                io.to(otherUser.socketId).emit('newUser', { name: name, sid: sid });
            }
        }


        io.to(user.room).emit('newUser', { name: name, sid: sid });

        socket.join(user.room);
        // io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

        callback({ id: user.id });
    });
    socket.on('disconnect', async () => {
        const user = await removeUser(socket.id);
        if (user.isLeader) {
            const room = await removeRoom(user.room);
            io.to(user.room).emit('killroom');
        }
        if (user && user.length > 0) {
            socket.broadcast.to(user.room).emit('message', { user: { name: 'admin' }, text: `${user.name} has left` });
            // socket.broadcast.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
            let leaderList = (await getLeadersInRoom(user.room)).map((obj) => obj.sid);
            io.to(user.room).emit('leader', leaderList);
        }
    });

    /** ROOM DATA */

    // TODO: Fix this for actual functionality
    socket.on('changeUsername', ({ oldName, newName }) => {
        const user = getUserByName(oldName);
        user.name = newName;
        if (user) {
            io.to(user.room).emit('message', { user: { name: 'admin' }, text: `${oldName} changed their name to ${newName}` });
            // io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
        }
    });
    socket.on('checkRoomExists', ({ room }, callback) => {
        let rooms = getActiveRooms(io);
        return callback(rooms.includes(room));
    });
    socket.on('updateRoomData', async ({ name, sid, workoutID, workoutType }) => {
        // update room data here
        // const oldRoom = await getRoomsBySID(sid)
        const room = await updateRoomData(name, workoutID, workoutType);
        // console.log(oldRoom)
        if (room) {
            room['workout'] = await getWorkoutById(room.workoutId);
            socket.broadcast.to(room.twilioRoomSid).emit('roomData', room);
        }
    })
    // socket.on('getAllRoomData', ({ }, callback) => {
    //     let rooms = getActiveRooms(io);
    //     let allRoomData = [];
    //     for (const currRoom of rooms) {
    //         let data = {
    //             room: currRoom,
    //             numUsers: getUsersInRoom(currRoom).length,
    //             currVideo: currVideo[currRoom]
    //         }
    //         allRoomData.push(data);
    //     }
    //     socket.emit('allRoomData', {
    //         allRoomData
    //     });
    // });

    /** SENDING MESSAGES */
    socket.on('sendMessage', async ({ message, userSid }, callback) => {
        const user = (await getUsersBySid(userSid))[0];
        let time = new Date();
        if (user) {
            io.to(user.room).emit('message', { user: user, text: message, time: time.getHours() + ":" + time.getMinutes() });
            // io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
        }
        callback();
    });

    /** VIDEO STATE CHANGES */
    socket.on('sendVideoSync', ({ id, ...videoProps }, callback) => {
        // console.log(videoProps);
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
        // console.log(admin_msg);
        io.in(room).emit('message', { user: { name: 'admin' }, text: admin_msg });
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
        io.in(room).emit('message', { user: { name: 'admin' }, text: admin_msg });
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
