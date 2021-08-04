import { useEffect, useState } from 'react';

export const useJitsi = () => {
  const [lib, setLib] = useState({})

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

export const buildOptions = (roomName, tenant) => {
  return {
      connection: {
          hosts: {
              domain: 'meet.jit.si',
              muc: 'conference.meet.jit.si' // FIXME: use XEP-0030
          },
          bosh: '//meet.jit.si/http-bind', // FIXME: use xep-0156 for that      
          clientNode: 'http://jitsi.org/jitsimeet', // The name of client node advertised in XEP-0115 'c' stanza
      },
      conference: {
          enableLayerSuspension: true,
          p2p: {
              enabled: false
          }
      }
  };
}
