const rooms = [];
const { WorkOutlineRounded } = require('@material-ui/icons');
const { db, timestamp } = require('./firebase.js');

const getRoomCode = () => db.collection('rooms').doc().id;

const roomFromDoc = (doc) => ({
    id: doc.id,
    workoutId: doc.data().workoutId,
    workoutType: doc.data().workoutType,
    roomCode: doc.data().twilioRoomSid,
    twilioRoomSid: doc.data().twilioRoomSid,
});

const addRoom = async (roomId, roomSid, workoutId, workoutType) => {
    // TODO: Add error handling when adding users
    const docRef = db.collection('rooms').doc(roomId)
    const res = await docRef.set({
        createdTime: timestamp.now(),
        roomCode: docRef.id.substring(0, 6).toUpperCase(),
        twilioRoomSid: roomSid,
        workoutId: workoutId,
        workoutType: workoutType,
    }).catch(error => { return [400, 'ERROR'] });
    return [200, 'Success']
};

// const getRoom = async (sid_or_name) => {
//     if (!room) {
//         room = await getRoomsBySID(sid_or_name);
//     }
//     if (!room) {
//         const roomCode = sid_or_name.substring(0, 6).toUpperCase()
//         room = await getRoomsByCode(roomCode);
//     }
//     return room
// };

const getRoomById = async (id) => {
    const roomRef = db.collection('rooms').doc(id);
    const doc = await roomRef.get()
    if (!doc.exists) {
        console.log('No such document!');
        return null;
    }
    const roomObj = roomFromDoc(doc)
    return roomObj
};

const getRoomsByX = async (key, value) => {
    const roomsRef = db.collection('rooms');
    const snapshot = await roomsRef.where(key, '==', value).orderBy('createdTime', 'desc').get();
    if (snapshot.empty) return []
    const rooms = snapshot.docs.map(roomFromDoc);
    return (rooms) ? rooms : null;
}

// const setLeadersInRoom = async (leaderIds, roomSid) => {
//     const roomObj = await getRoomsBySID(roomSid)
//     const roomId = roomObj[0].id
//     const docRef = db.collection('rooms').doc(roomId);
//     const res = await docRef.set({
//         leaderIds: leaderIds
//     }, { merge: true }).catch(error => {return [400, 'ERROR']});
// };

const updateRoomData = async (name, workoutID, workoutType) => {
    const rooms = await getRoomsByCode(name);
    const roomObj = rooms[0]

    if (roomObj && !(roomObj.workoutType == workoutType && roomObj.workoutId == workoutID)) {
        const docRef = db.collection('rooms').doc(roomObj.id);
        const res = await docRef.set({
            workoutId: workoutID,
            workoutType: workoutType
        }, { merge: true }).catch(error => { return [400, 'ERROR'] });
        roomObj['workoutId'] = workoutID;
        roomObj['workoutType'] = workoutType;
    }
    return roomObj
}

const getRoomsBySID = async (sid) => await getRoomsByX('twilioRoomSid', sid);

const getRoomsByCode = async (roomCode) => await getRoomsByX('roomCode', roomCode.substring(0, 6).toUpperCase());

// const getLeadersInRoom = async (roomSid) => {
//     const rooms = await getRoomsBySID(roomSid)
//     return rooms ? rooms[0].leaderIds : null
// }

function getActiveRooms(io) {
    let activeRooms = [];
    Object.keys(io.sockets.adapter.rooms).forEach(room => {
        let isRoom = true;
        Object.keys(io.sockets.adapter.sids).forEach(id => {
            isRoom = (id === room) ? false : isRoom;
        });
        if (isRoom) activeRooms.push(room);
    });
    return activeRooms;
}

const removeRoom = async (roomId) => {
    let roomToRemove = (await getRoomsBySID(roomId));
    if (!roomToRemove || roomToRemove.length == 0) return roomToRemove
    roomToRemove = roomToRemove[0]
    const roomref = await db.collection('rooms').doc(roomToRemove.id).delete();
    console.log(roomToRemove.id)
    await roomref.delete();
    return roomToRemove
}

module.exports = { getActiveRooms, addRoom, getRoomsBySID, getRoomById, getRoomsByCode, updateRoomData, getRoomCode, removeRoom };