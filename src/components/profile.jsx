import React from 'react';
import Header from './header';

class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return pug`
      .container-fluid
        Header(handleTab=this.handleTab changeTab=this.changeTab logout=this.props.logout)
    `;
  }
}

export default Profile;
