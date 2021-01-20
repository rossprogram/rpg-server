import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import userModel from '../models/users';

import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';

const customConfig = {
  dictionaries: [adjectives, animals],
  separator: ' ',
  length: 2,
};
 
function randomName() {
  return uniqueNamesGenerator(customConfig);
}

export function findUser(req, res, next) {
  function handleUser(err, user) {
    if (err) {
      next(err);
    } else if (user) {
      req.user = user;
      next();
    } else {
      res.status(404).send('User not found');
    }
  }

  if (req.params.user) {
    if (req.params.user == 'me') {
      // BADBAD: deal with the jwt user
      if (req.jwt && req.jwt.user) {
        req.user = req.jwt.user;
      }
      next();
    } else {
      // if we are searching by email
      if (req.params.user.indexOf('@') >= 0) {
        userModel.findOne({ email: req.params.user }, handleUser);
      } else {
        // otherwise we are searching by user id
        userModel.findById(req.params.user, handleUser);
      }
    }
  } else {
    res.status(404).send('User not found');
  }
}

export function get(req, res, next) {
  if (req.user) {
    if (req.jwt && req.jwt.user) {
      if (req.jwt.user.canView(req.user)) {
        res.json(req.user.toJSON());
      } else {
        res.status(403).send('Not permitted to view');
      }
    } else {
      res.status(401).send('Unauthenticated');
    }
  } else {
    res.status(404).send('User not found');
  }
}

export function getAll(req, res, next) {
  if (req.jwt && req.jwt.user) {
    let origin = req.get('origin');
    const query = { domains: origin };
    
    userModel.find(query, 'location')
      .exec((err, users) => {
        if (err) return res.status(500).send('Error fetching users');
        return res.json(users.map((u) => u.toJSON()));
      });
  } else {
    res.status(401).send('Unauthenticated');
  }
}

export function put(req, res, next) {
  if (req.user) {
    if (req.jwt && req.jwt.user) {
      if (req.jwt.user.canEdit(req.user)) {
        if (req.body.displayName !== undefined) {
          req.user.displayName = req.body.displayName;
        }

        if (req.body.linkedIn !== undefined) {
          req.user.linkedIn = req.body.linkedIn;
        }

        if (req.body.twitter !== undefined) {
          req.user.twitter = req.body.twitter;
        }                
        
        // FIXME missing edits
        req.user.save()
          .then(() => {
            delete req.user.password;
            res.json(req.user);
          })
          .catch((err) => {
            res.sendStatus(500);
          });
      } else {
        res.status(403).send('Not permitted to edit');
      }
    } else {
      res.status(401).send('Unauthenticated');
    }
  } else {
    res.status(404).send('User not found');
  }
}

function generateJWT(req, res, callback) {
  const token = jwt.sign({ id: req.user._id }, req.app.get('secretKey'), { expiresIn: '1y' });

  var ip = (req.headers['x-forwarded-for'] || '').split(',').pop() || 
      req.connection.remoteAddress || 
      req.socket.remoteAddress || 
      req.connection.socket.remoteAddress;

  req.user.update( { '$addToSet': { 'ipAddresses': ip } }, function() { return; });

  delete req.user.password;
  callback(null, token);  
}

function generateValidJWT(req, res, callback) {
  const auth = (req.headers.authorization || '').split(' ')[1] || '';
  const [login, password] = Buffer.from(auth, 'base64').toString().split(':');
  
  if (login != req.params.user) {
    res.sendStatus(500);
  } else if (req.user && req.user.password) {
    if (bcrypt.compareSync(password, req.user.password)) {
      generateJWT( req, res, callback );
    } else {
      res.status(401).send('Invalid credentials');
    }
  }
}

export function authorize(req, res, next) {
  generateValidJWT(req, res, (err, token) => {
    if (err) res.status(500).send('Could not generate JWT');
    // express records maxAge in milliseconds to be consistent with javascript mroe generally
    else {
      res.cookie('token', token, { maxAge: 604800000, httpOnly: true });
      res.json(req.user.toJSON());
    }
  });
}

export function token(req, res) {
  generateValidJWT(req, res, (err, aToken) => {
    if (err) res.status(500).send('Could not generate JWT');
    else res.json({ token: aToken, user: req.user.toJSON() });
  });
}

export function anonymousToken(req, res) {
  let origin = req.get('origin');
  const displayName = randomName();
  const avatar = 'mary';

  userModel.create({ displayName, avatar, domains: [origin] }, (err, user) => {
    if (err) {
      console.log(err);
      res.status(500).send('Could not create user');
    } else {
      req.user = user;
      generateJWT(req, res, (err, aToken) => {
        if (err) res.status(500).send('Could not generate JWT');
        else res.json({ token: aToken, user: req.user.toJSON() });
      });
    }
  });
}
