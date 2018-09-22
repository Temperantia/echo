import React from 'react';
import config from 'react-global-configuration';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Close from '@material-ui/icons/Close';

import axios from 'axios';

class Echo extends React.Component {
  fluxRadio = pug`
    Radio(color='primary')
  `;

  constructor(props) {
    super(props);
    this.state = {
      flux: '',
      content: ''
    };
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value
    });
  };

  post = type => event => {
    const post = {
      originType: 'Flux',
      originName: this.state.flux,
      postType: type,
      content: this.state.content
    };
    axios.post(config.get('API_URL') + '/posting/posts/create', {post: post})
    .then(res => {
      this.props.changeTab('');
      this.props.refreshFlux();
    }).catch(error => {
      console.log('err', error.message)
    });
  };

  render() {
    return pug`
      .container-fluid.border
        .row
          .col-10
            RadioGroup(
              aria-label='Flux'
              name='flux'
              value=this.state.flux
              row=true
              onChange=this.handleChange('flux')
            )
              FormControlLabel(
                value='Tendance'
                control=this.fluxRadio
                label='Tendance'
                labelPlacement='start'
              )
              FormControlLabel(
                value='DailyLife'
                control=this.fluxRadio
                label='Daily Life'
                labelPlacement='start'
              )
              FormControlLabel(
                value='LifeStyle'
                control=this.fluxRadio
                label='Life Style'
                labelPlacement='start'
              )
              FormControlLabel(
                value='Friends'
                control=this.fluxRadio
                label='Friends'
                labelPlacement='start'
              )
          .col-2
            Button(
              variant='fab'
              color='primary'
              aria-label='Close'
              onClick=this.props.handleTab('')
              size='small'
            )
              Close
        .row
          .col-12
            TextField(
              multiline
              rows=5
              fullWidth
              value=this.state.content
              onChange=this.handleChange('content')
              margin='normal'
              placeholder='What\'s up ?'
              variant='outlined'
            )
        .row
          .col-3
            Button(
              variant='outlined'
              color='primary'
              aria-label='Echo'
              onClick=this.post("Echo")
            )
              ='Echo'
          .col-3
            Button(
              variant='outlined'
              color='primary'
              aria-label='Inquiry'
              onClick=this.post("Inquiry")
            )
              ='Inquiry'
          .col-3
            Button(
              variant='outlined'
              color='primary'
              aria-label='Outrage'
              onClick=this.post("Outrage")
            )
              ='Outrage'
          .col-3
            Button(
              variant='outlined'
              color='primary'
              aria-label='Rumour'
              onClick=this.post("Rumour")
            )
              ='Rumour'
    `;
  }
}

export default Echo;
