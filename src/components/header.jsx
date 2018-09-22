import React from 'react';
import { NavLink } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Settings from '@material-ui/icons/Settings';
import PowerSettingsNew from '@material-ui/icons/PowerSettingsNew';
import Echo from './echo';

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: ''
    };
  }

  handleTab = tab => event => {
    this.setState(state => ({tab: tab}));
  };

  changeTab = tab => {
    this.setState(state => ({tab: tab}));
  }

  render() {
    return pug`
      .row
        .col-2
          Button(
            variant='extendedFab'
            color='primary'
            size='small'
            aria-label='To Login page'
            onClick=this.props.logout
          )
            PowerSettingsNew
            ='Off'
        .col-2
          .text-center
            a(style={color: this.state.tab ? 'blue' : 'black'} onClick=this.handleTab('echo')).link
              ='Echo'
        .col-2
          .text-center
            NavLink(exact to='/profile' activeClassName='selected' style={color: 'black'} activeStyle={color: 'blue'})
              ='Profile'
        .col-2
          .text-center
            NavLink(exact to='/trusts' activeClassName='selected' style={color: 'black'} activeStyle={color: 'blue'})
              ='Trusts'
        .col-2
          .text-center
            NavLink(exact to='/flux' activeClassName='selected' style={color: 'black'} activeStyle={color: 'blue'})
              ='Flux'
        .col-2
          .text-center
            IconButton(color='primary' onClick=this.filter)
              Settings
      .row
        .col-12
          if this.state.tab === 'echo'
            Echo(handleTab=this.handleTab changeTab=this.changeTab refreshFlux=this.props.refreshFlux)

    `;
  }
}

export default Header;
