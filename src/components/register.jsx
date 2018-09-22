import React from 'react';
import config from 'react-global-configuration';
import TextField from '@material-ui/core/TextField';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Button from '@material-ui/core/Button';
import Undo from '@material-ui/icons/Undo';

import axios from 'axios';

class Register extends React.Component {
  populationRadio = pug`
    Radio(color='primary')
  `;

  constructor(props) {
    super(props);
    this.state = {
      population: 'Public',
      publicName: '',
      username: '',
      email: '',
      password: '',
      passwordConfirmation: ''
    };
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value
    });
  }

  register = () => {
    axios.post(config.get('API_URL') + '/authentication/user/create', {
      user: {
        type: this.state.population,
        firstName: this.state.publicName,
        lastName: this.state.publicName,
        userName: this.state.username,
        email: this.state.email,
        password: this.state.password
      }
    }).then(res => {
      this.props.login({id: res.data.id, token: res.data.token});
    });
  }

  render() {
    return pug`
      .container-fluid
        .row
          .col-3
            Button(
              variant='extendedFab'
              color='primary'
              size='small'
              aria-label='To Login page'
              href='/login'
            )
              Undo
              ='To Login page'
          .col-6
            RadioGroup(
              aria-label='Population'
              name='population'
              value=this.state.population
              row=true
              onChange=this.handleChange('population')
            )
              FormControlLabel(
                value='Public'
                control=this.populationRadio
                label='Public'
                labelPlacement='start'
              )
              FormControlLabel(
                value='Eminent'
                control=this.populationRadio
                label='Eminent'
                labelPlacement='start'
              )

        if this.state.population === 'Public'
          .row
            .offset-3.col-6
              TextField(
                label='IRL name'
                margin='normal'
                value=this.state.publicName
                onChange=this.handleChange('publicName')
              )
        .row
          .offset-3.col-6
            TextField(
              label='Username'
              margin='normal'
              value=this.state.username
              onChange=this.handleChange('username')
            )
        .row
          .offset-3.col-6
            TextField(
              label='Email'
              margin='normal'
              value=this.state.email
              onChange=this.handleChange('email')
            )
        .row
          .offset-3.col-6
            TextField(
              label='Password'
              margin='normal'
              value=this.state.password
              onChange=this.handleChange('password')
            )
        .row
          .offset-3.col-6
            TextField(
              label='Confirm Password'
              margin='normal'
              value=this.state.passwordConfirmation
              onChange=this.handleChange('passwordConfirmation')
            )
        .row
          .offset-3.col-6
            Button(
              variant='contained'
              margin='normal'
              color='primary'
              onClick=this.register
            )
              ='Join'

    `;
  }
}

export default Register;
