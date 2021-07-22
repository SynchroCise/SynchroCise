import React, {useState, useEffect} from 'react'
import { Typography } from '@material-ui/core';

export default function Timer() {
  const [today, setToday] = useState(new Date());

  useEffect(()=>{
    const timer = setInterval(()=>{
      setToday(new Date());
    },60);
    return () =>{
      clearInterval(timer);
    }
  },[]);

  const time =
    String(today.getHours()).padStart(2, "0") +
    ":" +
    String(today.getMinutes()).padStart(2, "0") +
    ":" +
    String(today.getSeconds()).padStart(2, "0");

  return <Typography>{time}</Typography>;
}