import Router from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from './models/user';

function makeToken(id = undefined) {
  const token = jwt.sign({
    id: id
  }, global['secret'], {
    expiresIn: '24h'
  });
  return token;
}

let authentication = Router();

authentication.post('/user/create', async (req, res) => {
  console.log("ok")
  const user = req.body.user;
  let newUser = {};
  newUser._id = new mongoose.Types.ObjectId();
  newUser.type = user.type;
  if (newUser.type === 'Public') {
    newUser.firstName = user.firstName;
    newUser.lastName = user.lastName;
    newUser.fullName = user.firstName + ' ' + user.lastName;
  } else if (newUser.type === 'Eminent') {
    newUser.fullName = newUser.userName = user.userName;
  }
  newUser.email = user.email;
  newUser.password = user.password;
  newUser.reputation = {
    refresh: false,
    score: 0,
    rank: 0,
    tags: []
  };
  newUser.trustReputation = [];
  newUser.history = {
    flux: [],
    trusts: []
  };
  newUser.friends = [];
  newUser.friendsRequested = [];
  newUser.friendsRequesting = [];
  newUser.trustsOwned = [];
  newUser.trustsJoined = [];
  newUser.trustRequests = [];
  newUser.trustInvitations = [];
  console.log('new user', newUser);
  try {
    const createdUser = await User.create(newUser);
    return res.json({
      id: createdUser._id,
      token: makeToken(createdUser._id)
    });
  } catch(err) {
    console.log(err);
    return res.status(500).json('User already exists');
  }
});

authentication.get('/user/login', (req, res) => {
  return res.json({
    id: undefined,
    token: makeToken()
  });
});

authentication.post('/user/login', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(401).json('Wrong email or password');
  }
  try {
    const user = await User.findOne(req.body);
    if (!user) {
      return res.status(401).json('Wrong email or password');
    }
    return res.json({
      id: user._id,
      token: makeToken(user._id)
    });
  } catch(err) {
    return res.status(500).json('Error while finding user');
  }
});

export default authentication;
