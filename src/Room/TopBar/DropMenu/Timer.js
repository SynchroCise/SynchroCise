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

  let hour = today.getHours();
  hour = hour > 12 ? hour-12 : hour;
  
  let minutes = String(today.getMinutes()).padStart(2, "0");
  
  const toggleSemi = () => {
    if(today.getSeconds()%2){
      return " "
    }
    else{
      return ":"
    }
  };

  const amPm = () => {
    if (today.getHours() > 12) {
      return " PM";
    } else {
      return " AM";
    }
  };

  const time = hour + ":" + minutes + amPm();

  return <Typography>{time}</Typography>;
}