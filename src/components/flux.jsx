import React from 'react';
import config from 'react-global-configuration';
import Card from '@material-ui/core/Card';
import Avatar from '@material-ui/core/Avatar';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Button from '@material-ui/core/Button';
import Badge from '@material-ui/core/Badge';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import ExposureNeg2 from '@material-ui/icons/ExposureNeg2';
import ExposureNeg1 from '@material-ui/icons/ExposureNeg1';
import ExposurePlus1 from '@material-ui/icons/ExposurePlus1';
import ExposurePlus2 from '@material-ui/icons/ExposurePlus2';

import axios from 'axios';
import pluralize from 'pluralize';

import Header from './header';

class Flux extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: [],
      filter: {
        origin: 'Tendance+DailyLife+LifeStyle+Friends',
        postType: 'Echo+Inquiry+Outrage+Rumour',
      }
    };
  }

  async componentDidMount() {
    this.getPosts();
  }

  getPosts = async () => {
    const posts = (await axios.get(config.get('API_URL') + '/posting/posts/get?' + this.buildRequest())).data;
    for (let post of posts) {
      const date = new Date(post.createdOn);
      post.createdOn = date.toLocaleDateString('en-US', {
        year: '2-digit', month: '2-digit', day: '2-digit'
      }) + ' ' + date.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit'
      });
    }
    this.setState(state => ({ posts: posts }));
  };

  buildRequest = () => {
    let request = 'type=Flux'
    + "&origin=" + this.state.filter.origin
    + "&postType=" + this.state.filter.postType;
    if (this.state.filter.sort) {
      request += "&sort=" + this.state.filter.sort;
    }
    if (this.state.filter.tags) {
      request += "&tags=" + this.state.filter.tags;
    }
    if (this.state.filter.from) {
      request += "&from=" + this.state.filter.from;
    }
    if (this.state.filter.to) {
      request += "&to=" + this.state.filter.to;
    }
    return request;
  }

  filterPosts = async filter => {
    await this.setState(state => ({ filter: filter }));
    this.getPosts();
  }

  vote = (id, coefficient) => async event => {
    const url = config.get('API_URL') + '/posting/post/' + id + '/'
    + (coefficient > 0
      ? 'upvote?type=' + (coefficient - 1)
      : 'downvote?type=' + (coefficient + 2));
    await axios.get(url);
    this.getPosts();
  };

  cancelVote = id => async event => {
    await axios.get(config.get('API_URL') + '/posting/post/' + id + '/cancel');
    this.getPosts();
  };

  avatar = post => pug`
    Avatar
      =post.author.reputation.rank
  `;

  render() {
    return pug`
      .container-fluid
        Header(logout=this.props.logout refreshFlux=this.getPosts filterPosts=this.filterPosts)
        .row
          .col-12
            each post in this.state.posts
              Card(key=post._id).m-3
                CardHeader(avatar=this.avatar(post) title=post.author.fullName subheader=post.createdOn)
                CardContent
                  Typography
                    =post.content
                  Button(variant='fab' mini color='primary' size='small')
                    =post.reputation.upvotes
                  Button(variant='fab' mini color='secondary' size='small')
                    =post.reputation.downvotes
                CardActions
                  if post.author._id !== this.props.getId()
                    if !post.vote
                      IconButton(onClick=this.vote(post._id, -2)).bg-primary.text-white
                        ExposureNeg2
                      IconButton(onClick=this.vote(post._id, -1)).bg-primary.text-white
                        ExposureNeg1
                      IconButton(onClick=this.vote(post._id, 1)).bg-primary.text-white
                        ExposurePlus1
                      IconButton(onClick=this.vote(post._id, 2)).bg-primary.text-white
                        ExposurePlus2
                    else
                      IconButton(color='primary' onClick=this.cancelVote(post._id)).bg-primary.text-white
                        if post.vote.vote === 'positive'
                          if post.vote.voteType === 0
                            ExposurePlus1
                          else
                            ExposurePlus2
                        else
                          if post.vote.voteType === 0
                            ExposureNeg2
                          else
                            ExposureNeg1


    `;
  }
}

export default Flux;
