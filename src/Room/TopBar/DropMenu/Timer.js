import React, { useState } from "react";
import { Typography } from "@material-ui/core";

export default function Timer() {
  const [today] = useState(new Date());

  let hour = today.getHours();
  hour = hour > 12 ? hour - 12 : hour;

  let minutes = String(today.getMinutes()).padStart(2, "0");

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
