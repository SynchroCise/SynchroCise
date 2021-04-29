const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const bodyParser = require('body-parser');
const pino = require('express-pino-logger')();

const {
    checkUser,
    addUser,
    removeUser,
    getUsersInRoom,
    getUsersBySid,
    getUserByName,
    getLeadersInRoom
} = require('./users.js');
const { getActiveRooms, getRoomsBySID, updateRoomData } = require('./rooms.js');
const { getWorkoutById } = require('./workouts.js');


const router = require('./router')
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
        const { user, error } = await addUser({ socketId:socket.id, name, room, sid, userId });
        if (error) return callback('Firebase connection failed');

        socket.emit('message', { user: { name: 'admin' }, text: `Hi ${user.name}! Welcome to your new room! You can invite your friends to watch with you by sending them the link to this page.` });

        let roomData = (await getRoomsBySID(user.room))[0];
        roomData['workout'] = await getWorkoutById(roomData.workoutId)
        socket.emit('roomData', roomData);
        let roomUsers = await getUsersInRoom(user.room)
        let leaderList = roomUsers.filter(user => user.isLeader === true).map((obj) => obj.sid);
        socket.emit('leader', leaderList);
        // socket.emit('message', { user: { name: 'admin' }, text: `${process.env.CLIENT}/room/${user.room}` });

        socket.broadcast.to(user.room).emit('message', { user: { name: 'admin' }, text: `${user.name} has joined` });
        // gets video sync data from other user
        if (roomUsers.length > 1) {
            const otherUser = roomUsers.filter((roomUser) => user.id !== roomUser.id)[0]
            if (otherUser) socket.to(otherUser.socketId).emit('getSync', { id: user.socketId });
        }

        socket.join(user.room);
        // io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

        callback({id: user.id});
    });
    socket.on('disconnect', async () => {
        const user = await removeUser(socket.id);
        if (user) {
            socket.broadcast.to(user.room).emit('message', { user: { name: 'admin' }, text: `${user.name} has left` });
            // socket.broadcast.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
            let leaderList = (await getLeadersInRoom(user.room)).map((obj) => obj.sid);
            io.to(user.room).emit('leader', leaderList);
        }
    });
    socket.on('leaveRoom', async ({ room }) => {
        const user = await removeUser(socket.id);
        if (user) {
            socket.broadcast.to(user.room).emit('message', { user: { name: 'admin' }, text: `${user.name} has left` });
            // socket.broadcast.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

            let leaderList = (await getLeadersInRoom(user.room)).map((obj) => obj.sid);
            io.to(user.room).emit('leader', leaderList);
        }
        socket.leave(room);
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
    socket.on('sendMessage', async ({message, userSid}, callback) => {
        const user = (await getUsersBySid(userSid))[0];
        if (user) {
            io.to(user.room).emit('message', { user: user, text: message });
            // io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
        }
        callback();
    });

    /** VIDEO STATE CHANGES */
    socket.on('sendSync', ({ id, ...videoProps }, callback) => {
        // console.log(videoProps);
        socket.to(id).emit('startSync', videoProps);
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
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(pino);
app.use(router);
app.use(cors())


server.listen(3001, () =>
  console.log('Express server is running on localhost:3001')
);
