import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  type: {
    type: String,
    enum: ['Moderator', 'Public', 'Eminent'],
  },
  firstName: String,
  lastName: String,
  userName: String,
  fullName: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  reputation: {
    refresh: Boolean,
    score: Number,
    rank: Number,
    tags: [{
      name: String,
      refresh: Boolean,
      score: Number,
      rank: Number
    }]
  },
  trustReputation: [{
    trust: String,
    refresh: Boolean,
    score: Number,
    rank: Number
  }],
  history: {
    flux: [String],
    trusts: [String]
  },
  birth: Date,
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  trustsOwned: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trust'
  }],
  trustsJoined: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trust'
  }],
  friendsRequested: [mongoose.Schema.Types.ObjectId],
  friendsRequesting: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  trustRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trust'
  }],
  trustInvitations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trust'
  }],
  password: String,
  createdOn: Date,
  updatedOn: {
    type: Date,
    default: Date.now
  },
});
const User = mongoose.model('User', userSchema);

export default User;
