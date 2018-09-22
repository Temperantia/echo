import Router from 'express';
import jwt from 'jsonwebtoken';
import authentication from './authentication';
import user from './user';
import posting from './posting';
import trusting from './trusting';
import friends from './friends';

let api = Router();

global['secret'] = 'jsdjrfozej654541fkn';

api.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization,X-Requested-With,content-type,x-access-token');
  next();
});

api.use('/authentication', authentication);

api.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
      const headers = {
        'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS',
        'Access-Control-Max-Age': '86400', // 24 hours
        'Access-Control-Allow-Headers': 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, x-access-token',
        'Access-Control-Allow-Credentials': false
      };
      res.writeHead(200, headers);
      res.end();
  } else {
    const token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
      jwt.verify(token, global['secret'], (err, decoded) => {
         if (err) {
           return res.status(403).json('Failed to authenticate token.');
         } else {
           // if everything is good, save to request for use in other routes
           req.decoded = decoded;
           next();
         }
       });
    } else {
      return res.status(403).json('No token provided.');
    }
  }
});

api.use('/user', user);
api.use('/posting', posting);
api.use('/trusting', trusting);
api.use('/friends', friends);

export default api;
