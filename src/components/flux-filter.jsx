import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import dateFormat from 'dateformat';

class FluxFilter extends React.Component {
  constructor(props) {
    super(props);
    let from = new Date();
    from.setDate(from.getDate() - 7);
    from = dateFormat(from, 'yyyy-mm-dd');
    let to = new Date();
    to = dateFormat(to, 'yyyy-mm-dd');
    this.state = {
      origin: [],
      postType: [],
      sort: '',
      tags: '',
      from: from,
      to: to
    };
  }

  handleSwapFilter = (field, value) => event => {
    if (this.state[field].includes(value)) {
      this.setState(state => ({
        [field]: state[field].filter(element => element !== value)
      }));
    } else {
      this.setState(state => ({
        [field]: [...state[field], value]
      }));
    }
  };

  handleChangeFilter = (field, value) => event => {
    let newValue;
    if (field === 'tags') {
      newValue = event.target.value;
    } else {
      newValue = value;
    }
    this.setState(state => ({
      [field]: newValue
    }));
  }

  handleGo = () => async event => {
    await this.setState(state => ({
      origin: state.origin.join('+'),
      postType: state.postType.join('+')
    }));
    this.props.filterPosts(this.state);
    this.props.changeTab('');
  };

  isActive = (field, value) => {
    if (field === 'sort') {
      return this.state.sort === value;
    }
    return this.state[field].includes(value);
  };

  render() {
    return pug`
      .container-fluid.border
        .row
          .col-3.text-center
            Button(
              fullWidth
              variant='contained'
              color=(this.isActive('origin', 'Tendance') ? 'primary' : 'default')
              size='small'
              aria-label='Filter on Tendance'
              onClick=this.handleSwapFilter('origin', 'Tendance')
            )
              ='Tendance'
          .col-3.text-center
            Button(
              fullWidth
              variant='contained'
              color=(this.isActive('origin', 'DailyLife') ? 'primary' : 'default')
              size='small'
              aria-label='Filter on Daily Life'
              onClick=this.handleSwapFilter('origin', 'DailyLife')
            )
              ='Daily Life'
          .col-3.text-center
            Button(
              fullWidth
              variant='contained'
              color=(this.isActive('origin', 'LifeStyle') ? 'primary' : 'default')
              size='small'
              aria-label='Filter on Life Style'
              onClick=this.handleSwapFilter('origin', 'LifeStyle')
            )
              ='Life Style'
          .col-3.text-center
            Button(
              fullWidth
              variant='contained'
              color=(this.isActive('origin', 'Friends') ? 'primary' : 'default')
              size='small'
              aria-label='Filter on Friends'
              onClick=this.handleSwapFilter('origin', 'Friends')
            )
              ='Friends'
        .row
          .col-3.text-center
            Button(
              fullWidth
              variant='contained'
              color=(this.isActive('postType', 'Echo') ? 'primary' : 'default')
              size='small'
              aria-label='Filter on Echo'
              onClick=this.handleSwapFilter('postType', 'Echo')
            )
              ='Echo'
          .col-3.text-center
            Button(
              fullWidth
              variant='contained'
              color=(this.isActive('postType', 'Inquiry') ? 'primary' : 'default')
              size='small'
              aria-label='Filter on Inquiry'
              onClick=this.handleSwapFilter('postType', 'Inquiry')
            )
              ='Inquiry'
          .col-3.text-center
            Button(
              fullWidth
              variant='contained'
              color=(this.isActive('postType', 'Outrage') ? 'primary' : 'default')
              size='small'
              aria-label='Filter on Outrage'
              onClick=this.handleSwapFilter('postType', 'Outrage')
            )
              ='Outrage'
          .col-3.text-center
            Button(
              fullWidth
              variant='contained'
              color=(this.isActive('postType', 'Rumour') ? 'primary' : 'default')
              size='small'
              aria-label='Filter on Rumour'
              onClick=this.handleSwapFilter('postType', 'Rumour')
            )
              ='Rumour'
        .row
          .col-4.text-center
            Button(
              fullWidth
              variant='contained'
              color=(this.isActive('sort', 'Popular') ? 'primary' : 'default')
              size='small'
              aria-label='Filter on Popular'
              onClick=this.handleChangeFilter('sort', 'Popular')
            )
              ='Popular'
          .col-4.text-center
            Button(
              fullWidth
              variant='contained'
              color=(this.isActive('sort', 'Strife') ? 'primary' : 'default')
              size='small'
              aria-label='Filter on Strife'
              onClick=this.handleChangeFilter('sort', 'Strife')
            )
              ='Strife'
          .col-4.text-center
            Button(
              fullWidth
              variant='contained'
              color=(this.isActive('sort', 'Celebs') ? 'primary' : 'default')
              size='small'
              aria-label='Filter on Celebs'
              onClick=this.handleChangeFilter('sort', 'Celebs')
            )
              ='Celebs'
        .row
          .col-12.text-center
            TextField(
              label='Look for specific authors and tags'
              value=this.state.tags
              onChange=this.handleChangeFilter('tags', 'tags')
              margin='normal'
              fullWidth
            )
        .row
          .col-6.text-center
            TextField(
              label='From'
              defaultValue=this.state.from
              type='date'
              InputLabelProps={
                shrink: true,
              }
            )
          .col-6.text-center
            TextField(
              label='To'
              defaultValue=this.state.to
              type='date'
              InputLabelProps={
                shrink: true,
              }
            )
        .row
          .offset-4.col-4.text-center
            Button(
              variant='fab'
              color='primary'
              size='small'
              aria-label='Go'
              onClick=this.handleGo()
            )
              ='Go'
    `;
  }
}

export default FluxFilter;
