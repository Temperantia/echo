import cron from 'cron';
import User from './models/user';
import Post from './models/post';

async function reputationCalculation() {
  console.log('starting reputation calculation');
  let users = await User.find({'reputation.refresh': true})
  .select('reputation');
  for (const user of users) {
    const posts = await Post.find({author: user._id})
    .select('reputation');
    const upvotes = posts.map(post => post.reputation.upvotes);
    const downvotes = posts.map(post => post.reputation.downvotes);
    const upvoteSum = upvotes.reduce((a, b) => a + b, 0);
    const downvoteSum = downvotes.reduce((a, b) => a + b, 0);
    const score = upvoteSum + downvoteSum;
    const rank = (score === 0
      ? 0
      : upvoteSum > downvoteSum
        ? Math.trunc(Math.log(score))
        : Math.trunc(Math.log(score)) * -1
    );
    await User.findByIdAndUpdate(user._id, {
      $set: {
        'reputation.refresh': false,
        'reputation.score': score,
        'reputation.rank': rank
      }
    });
    console.log(user._id, score, rank);
  }
  users = await User.find({'trustReputation.refresh': true})
  .select('trustReputation');
  for (const user of users) {
    for (const trustReputation of user.trustReputation) {
      if (trustReputation.refresh) {
        const posts = await Post.find({
          author: user._id,
          originType: 'Trust',
          originName: trustReputation.trust
        }).select('reputation');
        const upvotes = posts.map(post => post.reputation.upvotes);
        const downvotes = posts.map(post => post.reputation.downvotes);
        const upvoteSum = upvotes.reduce((a, b) => a + b, 0);
        const downvoteSum = downvotes.reduce((a, b) => a + b, 0);
        const score = upvoteSum + downvoteSum;
        const rank = (score === 0
          ? 0
          : upvoteSum > downvoteSum
            ? Math.trunc(Math.log(score))
            : Math.trunc(Math.log(score)) * -1
        );
        await User.update({_id: user._id, 'trustReputation.trust': trustReputation.trust}, {
          $set: {
            'trustReputation.$.refresh': false,
            'trustReputation.$.score': score,
            'trustReputation.$.rank': rank
          }
        });
        console.log(user._id, score, rank);
      }
    }
  }
  console.log('completed reputation calculation');
}

new cron.CronJob('0 0 * * * *', reputationCalculation, null, true, null, null, true);
