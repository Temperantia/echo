import Router from 'express';
import Types from 'mongoose';
import Trust from './models/trust';
import User from './models/user';

let trusting = Router();

// owner creates a trust
trusting.post('/trusts/create', async (req, res) => {
  console.log('BODY', req.body);
  const data = req.body.trust;
  const thisUserId = req.decoded.id;
  const newTrust = {
    _id: new mongoose.Types.ObjectId,
    name: data.name,
    key: encodeURIComponent(data.name),
    description: data.description,
    owner: thisUserId,
    moderators: [],
    members: [],
    policies: [],
    reputation: 0,
    createdOn: Date.now()
  };
  try {
    const trust = await Trust.create(newTrust);
    const update = {
       $push: {trustsOwned: newTrust._id}
    };
    await User.findByIdAndUpdate(thisUserId, update);
    return res.json(trust);
  } catch(err) {
    console.log(err);
    return res.status(500).json('Error while creating trust : ' + err);
  }
});

trusting.get('/trusts/get', async (req, res) => {
  try {
    const trusts = await Trust.find()
    .select('name key description owner moderators members reputation')
    .populate('owner', 'fullName reputation')
    .lean();
    const thisUser = await User.findById(req.decoded.id)
    .select('trustRequests');
    const trustRequests = thisUser.trustRequests;
    const id = mongoose.Types.ObjectId(req.decoded.id);
    for (let trust of trusts) {
      trust.partOf = false;
      if (checkIfMember(trust, id, trust.owner._id)) {
        trust.partOf = true;
      }
      trust.requested = false;
      if (trustRequests.find(element => {
        return element.equals(trust._id);
      })) {
        trust.requested = true;
      }
    }
    return res.json(trusts);
  } catch(err) {
    console.log(err);
    return res.status(500).json('Error while finding trusts : ' + err);
  }
});

// data from the trust
trusting.get('/trust/:key/get', async (req, res) => {
  try {
    const trust = await Trust.findOne({key: req.params.key})
    .select('name reputation')
    .populate('owner', 'fullName reputation')
    .populate('moderators', 'fullName reputation')
    .populate('members', 'fullName reputation');
    return res.json(trust);
  } catch(err) {
    console.log(err);
    return res.status(500).json('Error while finding trust');
  }
});

// owner changes the trust
trusting.put('/trust/:trust/update', (req, res) => {
});

// owner deletes the trust
trusting.delete('/trust/:trust/delete', (req, res) => {
});

function checkIfMember(trust, id, owner=trust.owner) {
  return owner.equals(id)
  || trust.moderators.find(element => { return element.equals(id); })
  || trust.members.find(element => { return element.equals(id); });
}

trusting.get('/trust/:trustId/requesting/send', async (req, res) => {
  const thisUserId = req.decoded.id;
  const trustId = req.params.trustId;
  try {
    const trust = await Trust.findById(trustId)
    .select('owner moderators members requests');
    if (checkIfMember(trust, thisUserId)) {
      return res.status(500).json('Already member');
    }
    await User.findByIdAndUpdate(thisUserId, {
      $push: {trustRequests: trustId}
    });
    await Trust.findByIdAndUpdate(trustId, {
      $push: {requests: thisUserId}
    });
    return res.json({});
  } catch(err) {
    console.log(err);
    return res.status(500).json('Error while finding and updating user');
  }
});

trusting.get('/trust/:trustId/requesting/cancel', async (req, res) => {
  const thisUserId = req.decoded.id;
  const trustId = req.params.trustId;
  try {
    const trust = await Trust.findById(trustId)
    .select('owner');
    return res.json({});
  } catch(err) {
    return res.status(500).json('Error while finding and updating user : ' + err);
  };
});

trusting.get('/trust/:trustId/requesting/accept/:userId', async (req, res) => {
  const thisUserId = req.decoded.id;
  const thatUserId = req.params.userId;
  const trustId = req.params.trustId;
  try {
    const trust = await Trust.findById(trustId)
    .select('name owner moderators members');
    if (!trust.owner.equals(thisUserId)) {
      return res.status(403).json('Forbidden access');
    }
    if (checkIfMember(trust, thatUserId)) {
      return res.status(500).json('Already member');
    }
    await User.findByIdAndUpdate(thatUserId, {
      $pull: {trustsRequested: trustId},
      $push: {
        trustsJoined: trustId,
        trustReputation: {
          trust: trust.name,
          refresh: false,
          score: 0,
          rank: 0
        }
      }
    });
    await Trust.findByIdAndUpdate(trustId, {
      $push: {members: thatUserId}
    });
    return res.json({});
  } catch(err) {
    return res.status(500).json('Error while finding trust : ' + err);
  }
});

trusting.get('/trust/:trustId/requesting/refuse/:userId', (req, res) => {
  const thisUserId = req.decoded.id;
  const trustId = req.params.trustId;
  const thatUserId = req.params.userId;
  return res.json({});
});

export default trusting;
