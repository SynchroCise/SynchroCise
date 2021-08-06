import React, { useEffect } from "react";
import { buildOptions } from "../utils/jitsi";
import { useAppContext } from "../AppContext";


const WorkoutDisplay = () => {
    useEffect(() => {
        let connection;
        let room;
        const roomName = 'hello';
        const tenant = 'world';
        const options = buildOptions(roomName, tenant)
        const onLocalTracks = () => {
          
        }
        const onConnectionSuccess = () => {
          console.log('jitsi success');
          room = connection.initJitsiConference(roomName, options.conference);
          room.join();
        }
        const onConnectionFailed = () => {
          console.log('jitsi failed');
        }
        const disconnect = () => {
          console.log('jitsi disconnect');
        }
        const startJitsi = async () => {
          await JitsiMeetJS.init()
          connection = new JitsiMeetJS.JitsiConnection(null, null, options.connection)
          connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, onConnectionSuccess);
          connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_FAILED, onConnectionFailed);
          connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED, disconnect);
          connection.connect()
          JitsiMeetJS.createLocalTracks({ devices: [ 'audio', 'video' ] })
            .then(onLocalTracks)
            .catch(error => {
                throw error;
            });
          console.log(connection)
        }
        if (JitsiMeetJS) {
          startJitsi()
        }
      }, [JitsiMeetJS]);
};

export default WorkoutDisplay;
