import { useEffect, useState } from 'react';

export const useJitsi = () => {
  const [lib, setLib] = useState({});

  useEffect(() => {
    const script = document.createElement('script');
    const jQscript = document.createElement('script')
    const name = 'JitsiMeetJS'

    script.src = 'https://meet.jit.si/libs/lib-jitsi-meet.min.js'
    script.async = true;
    script.onload = () => setLib({ [name]: window[name] });
 
    jQscript.src = 'https://code.jquery.com/jquery-3.5.1.min.js';
    jQscript.async = true;

    document.body.appendChild(script);
    document.body.appendChild(jQscript);
    return () => {
      document.body.removeChild(script);
      document.body.removeChild(jQscript);
    }
  }, []);
  return lib
};

export const buildOptions = (roomName) => {
  return {
      connection: {
        hosts: {
          domain: 'meet.jit.si',
          muc: 'conference.meet.jit.si', 
          focus: 'focus.meet.jit.si',
        }, 
        externalConnectUrl: 'https://meet.jit.si/http-pre-bind', 
        enableP2P: true, 
        p2p: { 
          enabled: true, 
          preferH264: true, 
          disableH264: true, 
          useStunTurn: true,
        }, 
        useStunTurn: true, 
        bosh: `https://meet.jit.si/http-bind?room=${roomName}`, 
        websocket: 'wss://meet.jit.si/xmpp-websocket', 
        clientNode: 'http://jitsi.org/jitsimeet',
        deploymentInfo: {
          shard: 'shard1',
          region: 'NA'
        }
      },
      conference: {
          enableLayerSuspension: true,
          p2p: {
              enabled: false
          }
      }
  };
}

export const createConnection = (JitsiMeetJS, roomName) => {
  const options = buildOptions(roomName)
  JitsiMeetJS.init()
  const connection = new JitsiMeetJS.JitsiConnection(null, null, options.connection)
  return connection
};
