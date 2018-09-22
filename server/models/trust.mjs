import mongoose from 'mongoose';

const trustSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    unique: true
  },
  key: {
    type: String,
    unique: true
  },
  description: String,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  requests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  invitations: [{
    invitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    invited: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  policies: [String],
  reputation: Number,
  createdOn: Date,
  updatedOn: {
    type: Date,
    default: Date.now
  }
});
const Trust = mongoose.model('Trust', trustSchema);

export default Trust;
