const { db, timestamp } = require('./firebase.js');

const getRoomCode = () => db.collection('rooms').doc().id;

const roomFromDoc = (doc) => ({
    id: doc.id,
    workoutId: doc.data().workoutId,
    workoutType: doc.data().workoutType,
});

const addRoom = async (roomId, workoutId, workoutType) => {
    // TODO: Add error handling when adding users
    const docRef = db.collection('rooms').doc(roomId)
    const res = await docRef.set({
        createdTime: timestamp.now(),
        roomCode: docRef.id.substring(0, 6).toUpperCase(),
        workoutId: workoutId,
        workoutType: workoutType,
    }).catch(error => { return [400, 'ERROR'] });
    return [200, 'Success']
};

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

const updateRoomData = async (name, workoutID, workoutType) => {
    const rooms = await getRoomsByCode(name);
    const roomObj = rooms[0]
    if (roomObj && !(roomObj.workoutType == workoutType && roomObj.workoutId == workoutID)) {
        const docRef = db.collection('rooms').doc(roomObj.id);
        const res = await docRef.set({
            workoutType: workoutType
        }, { merge: true }).catch(error => { return [400, 'ERROR'] });
        roomObj['workoutType'] = workoutType;
    }
    return roomObj
}

const getRoomsByCode = async (roomCode) => await getRoomsByX('roomCode', roomCode.substring(0, 6).toUpperCase());


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
    await db.collection('rooms').doc(roomToRemove.id).delete();
    return roomToRemove
}

module.exports = { getActiveRooms, addRoom, getRoomById, getRoomsByCode, updateRoomData, getRoomCode, removeRoom };