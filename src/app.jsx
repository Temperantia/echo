import React from 'react';
import config from 'react-global-configuration';
import configuration from './config';
import { Switch, Route, Redirect } from 'react-router-dom';
import Login from './components/login';
import Register from './components/register';
import Flux from './components/flux';
import Profile from './components/profile';

import axios from 'axios';
import decode from 'jwt-decode';

config.set(configuration);
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.crossDomain = true;
axios.interceptors.request.use(
  cfg => {
    if (!cfg.headers['x-access-token']) {
      const token = getToken();
      if (token) {
        cfg.headers['x-access-token'] = token;
      }
    }
    return cfg;
  },
  error => Promise.reject(error)
);

function getToken() {
  const user = JSON.parse(localStorage.getItem('user'));
  return user ? user.token : undefined;
}

function getId() {
  const user = JSON.parse(localStorage.getItem('user'));
  return user ? user.id : undefined;
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: this.isLoggedIn()
    };
  }

  isLoggedIn = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user && !!user.token && !this.isTokenExpired(user.token);
  }

  isTokenExpired = token => {
    try {
      const decoded = decode(token);
      return decoded.exp < Date.now() / 1000;
    } catch (err) {
      return false;
    }
  }

  login = user => {
    localStorage.setItem('user', JSON.stringify(user));
    this.setState(state => ({ isLoggedIn: true }));
  }

  logout = () => {
    localStorage.setItem('user', null);
    this.setState(state => ({ isLoggedIn: false }));
  }

  loginComponent = () => pug`
    Login(login=this.login)
  `;

  registerComponent = () => pug`
    Register(login=this.login)
  `;

  fluxComponent = () => pug`
    Flux(logout=this.logout getId=getId)
  `;

  profileComponent = () => pug`
    Profile(logout=this.logout getId=getId)
  `;

  render () {
    return pug`
      Switch
        if this.state.isLoggedIn
          Redirect(exact from='/' to='/flux')
          Redirect(exact from='/login' to='/flux')
          Redirect(exact from='/register' to='/flux')
          Route(exact path='/flux' component=this.fluxComponent)
          Route(exact path='/profile' component=this.profileComponent)
        else
          Redirect(exact from='/' to='/login')
          Route(exact path='/login' component=this.loginComponent)
          Route(exact path='/register' component=this.registerComponent)
          Redirect(from='*' to='/login')
    `;
  }
}

export default App;
