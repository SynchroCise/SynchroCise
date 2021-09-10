const { UserBindingInstance } = require('twilio/lib/rest/chat/v2/service/user/userBinding');
const { db, timestamp } = require('./firebase.js');
const bcrypt = require('bcrypt');
const admin = require('firebase-admin');

const isValidPassword = async (user, password) => {
    return await bcrypt.compare(password, user.password);
}

const userFromDoc = (doc) => ((doc.data()) ? {
    id: doc.id,
    name: doc.data().displayName,
    email: doc.data().email,
    password: doc.data().password,
    workoutHistory: doc.data().workoutHistory
} : null);

const checkUser = ({ name, room }) => {
    name = name.trim().toLowerCase();
    room = room.trim().toLowerCase();
    // Check if username exists in this room already
    const duplicateUser = users.find((user) => user.room === room && user.name === name);
    if (duplicateUser) return { error: 'DUPLICATE_USER' };
    return {};
}

const createUserLogin = async ({ email, password, displayName }) => {
    const existUser = await getUserByEmail(email);
    if (existUser && existUser.length > 0) return false
    const hash = await bcrypt.hash(password, 10);
    const userRef = db.collection('users').doc()
    const user = { createdTime: timestamp.now(), email, password: hash, displayName }
    await userRef.set(user, { merge: true }).catch(error => console.log(error));
    user['id'] = userRef.id
    return { user, message: 'success' }
};

const getUserById = async (id) => {
    const userRef = db.collection('users').doc(id);
    const doc = await userRef.get()
    if (!doc.exists) {
        console.log('No such document!');
        return null;
    }
    const user = userFromDoc(doc)
    return user
};

const getUsersByX = async (key, value) => {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where(key, '==', value).orderBy('createdTime', 'desc').get();
    if (snapshot.empty) return []
    const users = snapshot.docs.map(userFromDoc);
    return users;
}

const getUsersBySocketId = async (id) => await getUsersByX('socketId', id);

const getUsersByName = async (name) => await getUsersByX('displayName', name);

const getUserByEmail = async (email, isAuth) => await getUsersByX('email', email);

const getLeadersInRoom = async (room) => {
    let users = await getUsersInRoom(room)
    return users.filter(user => user.isLeader === true)
}

const getUsersById = async (ids) => {
    if (ids.length > 10) {
        console.log('Greater than 10 documents!')
        return null;
    }
    if (ids.length == 0) return []
    const userRefs = ids.map((id) => db.collection('users').doc(id))
    const docs = await db.getAll(...userRefs)
    const users = docs.map((doc) => userFromDoc(doc))
    return users
};

const changeEmail = async (newEmail, id) => {
    const user = db.collection('users').doc(id);
    if (user) {
        await user.update({ email: newEmail });
        return [200, "Success"];
    } else {
        return [400, "Failed"];
    }
}

const changeUsername = async (newUsername, id) => {
    const user = db.collection('users').doc(id);
    if (user) {
        await user.update({ displayName: newUsername });
        return [200, "Success"];
    } else {
        return [400, "Failed"];
    }
}

const changePassword = async (newPassword, id) => {
    const hash = await bcrypt.hash(newPassword, 10);
    const user = db.collection('users').doc(id);
    if (user) {
        await user.update({ password: hash });
        return [200, "Success"];
    } else {
        return [400, "Failed"];
    }
}

const updateWorkoutHistory = async (id, time) => {
    await db.collection('users').where("socketId", "==", id).get().then(querySnapshot => {
        if (!querySnapshot.empty) {
            querySnapshot.forEach(function (document) {
                document.ref.update({ workoutHistory: admin.firestore.FieldValue.arrayUnion(time) });
            });
        }
    });
}

const getWorkoutHistory = async (id) => {
    return ((await getUserById(id)).workoutHistory);
}

module.exports = {
    checkUser,
    getUserById,
    getUsersBySocketId,
    getUsersByName,
    getLeadersInRoom,
    createUserLogin,
    getUserByEmail,
    isValidPassword,
    getUsersById,
    changeEmail,
    changeUsername,
    changePassword,
    updateWorkoutHistory,
    getWorkoutHistory
};