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

  const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

  return <Typography>{time}</Typography>;
}