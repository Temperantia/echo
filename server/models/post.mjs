import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  originType: {
    type: String,
    enum: ['Trust', 'Flux'],
  },
  originName: String,
  postType: {
    type: String,
    enum: ['Echo', 'Rumour', 'Inquiry', 'Outrage']
  },
  content: String,
  author: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'User'
  },
  reputation: {
    upvotes: Number,
    downvotes: Number
  },
  votes: [{
    voter: mongoose.Schema.Types.ObjectId,
    vote: String,
    voteType: Number
  }],
  reports: Number,
  createdOn: Date,
  updatedOn: {
    type: Date,
    default: Date.now
   }
});
const Post = mongoose.model('Post', postSchema);

export default Post;
