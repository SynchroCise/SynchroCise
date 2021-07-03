import io from 'socket.io-client';
require('dotenv').config()

const ENDPOINT = 'http://localhost:3001/';

function Socket() {
  console.log(process.env.NODE_ENV);
  if (process.env.NODE_ENV === 'production') {
    this.socket = io();
  } else {
    this.socket = io(ENDPOINT);
  }
  
};

const sckt = new Socket();

export { sckt };