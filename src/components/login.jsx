import React from 'react';
import config from 'react-global-configuration';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import AccountCircle from '@material-ui/icons/AccountCircle';
import VpnKey from '@material-ui/icons/VpnKey';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

import axios from 'axios';

class Login extends React.Component {
  nameAdornment = pug`
    InputAdornment(position='start')
      AccountCircle
  `;

  passwordAdornment = pug`
    InputAdornment(position='start')
      VpnKey
  `;

  passwordVisibilityAdorment = () => pug`
    InputAdornment(position='end')
      IconButton(aria-label='Toggle password visibility' onClick=this.handleClickShowPassword)
        if this.state.showPassword
          VisibilityOff
        else
          Visibility
  `;

  constructor(props) {
    super(props);
    this.state = {
      showPassword: false,
      name: '',
      password: ''
    };
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value
    });
  }

  handleClickShowPassword = () => {
    this.setState(state => ({ showPassword: !state.showPassword }));
  };

  login = () => {
    axios.post(config.get('API_URL') + '/authentication/user/login', {
      email: this.state.name,
      password: this.state.password
    }).then(res => {
      this.props.login({id: res.data.id, token: res.data.token});
    }).catch(error => {
      console.log('err', error.message)
    });
  }

  loginAnonymously = () => {
    axios.get(config.get('API_URL') + '/authentication/user/login')
    .then(res => {
      this.props.login({id: res.data.id, token: res.data.token});
    }).catch(error => {
      console.log('err', error.message)
    });
  }

  render() {
    return pug`
      .container-fluid
        form(noValidate)
          .row
            .offset-3.col-6
              TextField(
                margin='normal'
                value=this.state.name
                onChange=this.handleChange('name')
                autoComplete='username'
                InputProps={
                  startAdornment: this.nameAdornment
                }
              )
          .row
            .offset-3.col-6
              TextField(
                margin='normal'
                type=this.state.showPassword ? 'text' : 'password'
                value=this.state.password
                onChange=this.handleChange('password')
                autoComplete='current-password'
                InputProps={
                  startAdornment: this.passwordAdornment,
                  endAdornment: this.passwordVisibilityAdorment()
                }
              )
          .row
            .offset-3.col-6
              Button(variant='contained' color='primary' onClick=this.login)
                ='Continue'
        .row
          .offset-3.col-6.mt-4
            Button(variant='fab' color='primary' onClick=this.loginAnonymously)
              ='Try'
        .row
          .offset-3.col-6.mt-4
            Button(variant='outlined' color='primary' href='/register')
              ='Begin'
    `;
  }
}

export default Login;
