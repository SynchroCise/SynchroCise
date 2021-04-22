const {db, timestamp} = require('./firebase.js');

const userFromDoc = (doc) => ({
    id: doc.id,
    name: doc.data().displayName,
    room: doc.data().twilioRoomSid,
    sid: doc.data().twilioUserSid,
    isLeader: doc.data().isLeader,
    socketId: doc.data().socketId,
    isTemp: doc.data().isTemp
});

const checkUser = ({ name, room }) => {
    name = name.trim().toLowerCase();
    room = room.trim().toLowerCase();
    // Check if username exists in this room already
    const duplicateUser = users.find((user) => user.room === room && user.name === name);
    if (duplicateUser) return { error: 'DUPLICATE_USER' };
    return {};
}

const addUser = async ({ socketId, name, room, sid }) => {
    isLeader = ((await getLeadersInRoom(room)).length > 0) ? false : true;
    // TODO: Check if the temporary user even exists first when implementing login
    const docRef = await db.collection('users').add({
        createdTime: timestamp.now(),
        displayName: name,
        twilioRoomSid: room,
        twilioUserSid: sid,
        isTemp: true,
        isLeader: isLeader,
        socketId: socketId
    }).catch(error => console.log(error));
    const user = await getUserById(docRef.id)
    return { user };
};

const removeUser = async (socketId) => {
    const usersToRemove = (await getUsersBySocketId(socketId));
    if (!usersToRemove) return usersToRemove
    const userToRemove = usersToRemove[0]
    const userRef = db.collection('users').doc(userToRemove.id);
    if (userToRemove.isTemp) {
        await userRef.delete();
    } else {
        await userRef.set({
            isLeader: false,
            twilioRoomSid: "",
            twilioUserSid: "",
            socketId: ""
        }, { merge: true }).catch( error => console.log(error));
    }
    const leaders = await getLeadersInRoom(userToRemove.room)
    const users = await getUsersInRoom(userToRemove.room)
    if (leaders.length == 0 && users.length > 0) {
        await setLeaderStatus(users[0].id, true);
    }
    return userToRemove;
};

const getUserById = async (id) => {
    const userRef =  db.collection('users').doc(id);
    const doc = await userRef.get()
    if (!doc.exists) {
        console.log('No such document!');
        return null;
    }
    const user = userFromDoc(doc)
    return user
};

const setLeaderStatus = async (id, isLeader) => {
    const userRef =  db.collection('users').doc(id);
    const doc = await userRef.set({
        isLeader: isLeader
    }, {merge: true});

}

const getUsersByX = async (key, value) => {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where(key, '==', value).orderBy('createdTime', 'desc').get();
    if (snapshot.empty) return []
    const users = snapshot.docs.map(userFromDoc);
    return users;
}

const getUsersBySocketId = async (id) => await getUsersByX('socketId', id);

const getUsersByName = async (name) => await getUsersByX('displayName', name);

const getUsersBySid = async (sid) => await getUsersByX('twilioUserSid', sid);

const getUsersInRoom = async (room) => await getUsersByX('twilioRoomSid', room);

const getLeadersInRoom = async (room) => {
    let users = await getUsersInRoom(room)
    return users.filter(user => user.isLeader === true)
}

module.exports = { 
    checkUser, 
    addUser, 
    removeUser, 
    getUserById, 
    getUsersInRoom,
    getUsersBySocketId,
    getUsersByName,
    getUsersBySid,
    getLeadersInRoom
};