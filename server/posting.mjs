import Router from 'express';
import mongoose from 'mongoose';
import Post from './models/post';
import User from './models/user';
import { postReplies } from '../environments/dev';

let posting = Router();

posting.post('/posts/create', async (req, res) => {
  const post = req.body.post;
  const newPost = {
    _id: new mongoose.Types.ObjectId,
    originType: post.originType,
    originName: post.originName,
    postType: post.postType,
    content: post.content,
    author: req.decoded.id,
    reputation: {
      upvotes: 0,
      downvotes: 0
    },
    votes: [],
    createdOn: Date.now()
  };
  console.log('new Post :', newPost);
  try {
    await Post.create(newPost);
    return res.json({});
  } catch(err) {
    return res.status(500).json('Error while creating post');
  }
});

posting.get('/posts/get', async (req, res) => {
  const type = req.query.type;
  const user = req.query.user;
  let posts;
  try {
    if (type) {
      if (type === 'Flux') {
        posts = await findPostsFromFluxes(req.query, req.decoded.id);
      } else if (type === 'Trust') {
        posts = await findPostsFromTrust(req.query.origin);
      }
    } else if (user) {
      posts = await findPostsFromUser(user);
    }
    return res.json(posts);
  } catch(err) {
    console.log(err);
    return res.status(500).json('Error while finding posts');
  }
});

posting.get('/post/:postId/get', async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
    .select('originType originName content reputation createdOn')
    .populate('author', 'fullName reputation');
    // check if member inside trust
    return res.json(post);
  } catch(err) {
    console.log(err);
    res.status(500).json('fail');
  }
});

posting.get('/post/:postId/upvote', async (req, res) => {
  console.log(req);
  const error = await vote(req.decoded.id, req.params.postId, req.query.type, 'positive')
  return error ? res.status(500).json(error) : res.json({});
});

posting.get('/post/:postId/downvote', async (req, res) => {
  const error = await vote(req.decoded.id, req.params.postId, req.query.type, 'negative');
  return error ? res.status(500).json(error) : res.json({});
});

posting.get('/post/:postId/cancel', async (req, res) => {
  const thisUserId = req.decoded.id;
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId)
    .select('author votes reputation');
    const vote = post.votes.find(vote => vote.voter.equals(thisUserId));
    if (!vote) {
      return res.status(500).json('Logical error');
    }
    await Post.findByIdAndUpdate(postId, {
      $pull: {votes: {
        voter: mongoose.Types.ObjectId(thisUserId)
      }},
      $inc: vote.vote === 'positive'
      ? {'reputation.upvotes': -1}
      : {'reputation.downvotes': -1}
    });
    return res.json({});
  } catch(err) {
    console.log(err);
    return res.status(500).json('DB error');
  }
});

async function vote(voterId, postId, voteType, vote) {
  try {
    console.log(voterId, postId, voteType, vote);
    const post = await Post.findById(postId);
    if (post.author.equals(voterId)) {
      throw 'Cannot upvote your own post';
    }
    if (post.votes.find(vote => vote.voter.equals(voterId))) {
      throw 'Cannot upvote anymore';
    }
    await Post.findByIdAndUpdate(postId, {
      $push: {votes: {
        voter: mongoose.Types.ObjectId(voterId),
        vote: vote,
        voteType: Number(voteType)
      }},
      $inc: vote === 'positive'
      ? {'reputation.upvotes': 1}
      : {'reputation.downvotes': 1}
    });
    if (post.originType === 'Flux') {
      await User.findByIdAndUpdate(post.author, {
        $set: {'reputation.refresh': true}
      });
      const voter = await User.findByIdAndUpdate(voterId);
      await User.findByIdAndUpdate(voterId, {
        $push: {'history.flux': postReplies[post.postType][vote][Number(voteType)]}
      });
    } else {
      console.log('refresh trust rep on next', post.author, post.originName)
      await User.update({_id: post.author, 'trustReputation.trust': post.originName}, {
        $set: {'trustReputation.$.refresh': true}
      });
    }
    return undefined;
  } catch(err) {
    return 'Error while finding post : ' + err;
  }
}

async function findPostsFromFluxes(request, thisUserId) {
  console.log(request)
  let filter = {
    originType: 'Flux',
    originName: {$in: request.origin.split(' ')},
    postType: {$in: request.postType.split(' ')}
  };
  if (request.tags !== '') {

  }
  let sort = {};
  if (request.sort === 'Popular') {
    sort['reputation.upvotes'] = -1;
    sort['createdOn'] = -1;
  } else if (request.sort === 'Strife') {
    /*
    filter['approval'] = {
      $lt: 0.75
    };
    sort['reputation.upvotes'] = -1;
    sort['createdOn'] = -1;
    pipeline = Post.aggregate([])
    .addFields({
      sum: {
        $add: ['$reputation.upvotes', '$reputation.downvotes']
      }
    })
    .addFields({
      approval: {
        $cond: [
          {
            $eq: ['$sum', 0]
          },
          0.5,
          {
            $divide: ['$reputation.upvotes', '$sum']
          }
        ]
      }
    })
    .pipeline();
    */
  } else if (request.sort === 'Celebs') {
    sort['user.reputation.rank'] = -1;
    sort['createdOn'] = -1;
  } else {
    sort['createdOn'] = -1;
  }
  const posts = await Post.aggregate()
  .lookup({
    from: 'users',
    localField: 'author',
    foreignField: '_id',
    as: 'user'
  })
  .match(filter)
  .sort(sort)
  .addFields({
    vote: {
      $arrayElemAt: [{
        $filter: {
          input: '$votes',
          as: 'vote',
          cond: {$eq: ['$$vote.voter', mongoose.Types.ObjectId(thisUserId)]}
        }},
        0
      ]
    }
  })
  .project('originName postType content author createdOn reputation vote');
  console.log("posts", posts);
  return User.populate(posts, {path: 'author', select: 'fullName reputation'});
}

function findPostsFromUser(user) {
  return Post.find({author: user})
  .select('originType originName postType content createdOn reputation');
}

async function findPostsFromTrust(trustKey) {
  const filter = {
    originType: 'Trust',
    originName: trustKey
  };
  return await Post.find(filter)
  .select('postType content createdOn reputation')
  .populate('author', 'fullName reputation');
}

export default posting;
