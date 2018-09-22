import Router from 'express';
import Types from 'mongoose';
import User from './models/user';
import Trust from './models/trust';

let user = Router();

async function findUsers(thisUserId, name = undefined) {
  let options = {};
  if (name) {
    options = {$or: [
      {firstName: new RegExp('^' + name, 'i')},
      {lastName: new RegExp('^' + name, 'i')},
      {userName: new RegExp('^' + name, 'i')},
      {fullName: new RegExp('^' + name, 'i')},
    ]};
  }
  return await User.find(options)
  .where('_id').ne(thisUserId)
  .sort({
    'reputation.rank': -1
  })
  .select('fullName type')
  .lean();
}

user.get('/:user/profile', async (req, res) => {
  const thisUserId = req.decoded.id;
  const thatUserId = req.params.user;
  try {
    const thatUser = await User.findById(thatUserId)
    .select('type fullName reputation birth')
    .populate('friends');
    const friendIds = thatUser.friends.map(friend => { return friend._id; });
    if (thisUserId.indexOf(friendIds) === -1) {
      thatUser.friends = [];
    }
    return res.json(thatUser);
  } catch(err) {
    return res.status(500).json('Error while finding user');
  }
});

user.get('/users', async (req, res) => {
  try {
    const users = await findUsers(req.decoded.id, req.query.name);
    return res.json(users);
  } catch(err) {
    return res.status(500).json('Error while finding users : ' + err);
  }
});

user.get('/friendable-users', async (req, res) => {
  const thisUserId = req.decoded.id;
  try {
    const users = await findUsers(thisUserId);
    const thisUser = await User.findById(thisUserId)
    .select('friends friendsRequested');
    const thisUserFriends = thisUser.friends;
    const thisUserFriendsRequested = thisUser.friendsRequested;
    for (let user of users) {
      user.friendWith = (thisUserFriends.indexOf(user._id) > -1);
      user.friendRequested = (thisUserFriendsRequested.indexOf(user._id) > -1);
    }
    return res.json(users);
  } catch(err) {
    return res.status(500).json('Error while finding users : ' + err);
  }
});

user.get('/:user/trusts', async (req, res) => {
  const thisUserId = req.decoded.id;
  const thatUserId = req.params.user;
  try {
    const thatUser = await User.findById(thatUserId)
    .select('friends trustReputation')
    .populate('trustsOwned', 'name key')
    .populate('trustsJoined', 'name key');
    if (thisUserId !== thatUserId && thatUser.friends.indexOf(thisUserId) === -1) {
      return res.status(403).json('Forbidden access');
    }
    const trustReputation = thatUser.trustReputation;
    for (let trust of thatUser.trustsJoined) {
      const index = trustReputation.map(rep => rep.trust).indexOf(trust.name);
      trust.reputation = trustReputation[index].rank;
    }
    return res.json({
      trustsOwned: thatUser.trustsOwned,
      trustsJoined: thatUser.trustsJoined
    });
  } catch(err) {
    return res.status(500).json('Error while finding user : ' + err);
  }
});

function addRequests(requests, type, source) {
  for (let request of source) {
    request.type = type;
    requests.push(request);
  }
  return requests;
}

user.get('/requests', async (req, res) => {
  try {
    const thisUser = await User.findById(req.decoded.id)
    .populate('friendsRequested', 'fullName')
    .populate('friendsRequesting', 'fullName')
    .populate('trustRequests', 'name key')
    .populate('trustInvitations', 'name key')
    .lean();
    let requests = [];
    requests = addRequests(requests, 'friendRequestSent', thisUser.friendsRequested);
    requests = addRequests(requests, 'friendRequestReceived', thisUser.friendsRequesting);
    requests = addRequests(requests, 'trustRequest', thisUser.trustRequests);
    requests = addRequests(requests, 'trustInvitation', thisUser.trustInvitations);
    return res.json(requests);
  } catch(err) {
    return res.status(500).json('Error while finding user');
  }
});

user.get('/:user/friends', async (req, res) => {
  const thisUserId = req.decoded.id;
  const thatUserId = req.params.user;
  // check if the requiring user is friend with the required user
  try {
    const thatUser = await User.findById(thatUserId)
    .populate('friends', 'fullName reputation');
    if (thisUserId !== thatUserId
      && thatUser.friends.indexOf(thisUserId) === -1) {
      return res.status(403).json('Forbidden access');
    }
    return res.json(thatUser.friends);
  } catch(err) {
    return res.status(500).json('Error while finding friends : ' + err);
  }
});

export default user;
