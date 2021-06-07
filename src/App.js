import React from "react";
import { BrowserRouter as Router, Switch, Route} from "react-router-dom";
// import "./App.css";
import Navbar from "./components/Navbar";
import Home from "./Home/Home";
// import "./media/CoLab.css";
import {AppContextProvider} from "./AppContext"
import CreateRoom from "./Home/CreateRoom/CreateRoom";
import CreateWorkout from "./Home/CreateRoom/CreateWorkout";
import JoinRoom from "./Home/JoinRoom/JoinRoom";
import Room from "./Room/Room";
import theme from './theme'
import { ThemeProvider } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'

const RoutesEnum = {
  Home: '/',
  Room: '/room',
  CreateRoom: '/create-room',
  JoinRoom: '/join-room',
  CreateWorkout: '/create-workout'
}

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app">
        <main>
          <AppContextProvider>
            <Router>
              <Switch>
                <Route path={`${RoutesEnum.Room}/:roomCode?`} component={Room}/>
                <>
                  <Navbar />
                  <Route path={RoutesEnum.Home} exact component={Home} />
                  <Route path={`${RoutesEnum.CreateRoom}`} component={CreateRoom} />
                  <Route path={`${RoutesEnum.JoinRoom}/:roomCode?`} component={JoinRoom} />
                  <Route path={RoutesEnum.CreateWorkout} component={CreateWorkout} />
                </>
              </Switch>
            </Router>
          </AppContextProvider>
        </main>
      </div>
    </ThemeProvider>
  );
};

export { App, RoutesEnum };
