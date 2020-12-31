import jwt from 'jsonwebtoken';
import userModel from '../models/users';

function getToken(req) {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    // Handle token presented as a Bearer token in the Authorization header
    return req.headers.authorization.split(' ')[1];
  } if (req.query && req.query.token) {
    // Handle token presented as URI param
    return req.query.token;
  } if (req.cookies && req.cookies.token) {
    // Handle token presented as a cookie parameter
    return req.cookies.token;
  }

  // If we return null, we couldn't find a token.  In this case, the
  // JWT middleware will return a 401 (unauthorized) to the client for
  // this request
  return null;
}

function validateUser(req, res, next) {
  const token = getToken(req);
  if (token) {
    jwt.verify(token, req.app.get('secretKey'), (err, decoded) => {
      if (err) {
        res.status(401).json({ status: 'error', message: err.message, data: null });
      } else {
        userModel.findById(decoded.id, (err, user) => {
          if (user) {
            delete user.password;
            req.jwt = { user };
          }
          next();
        });
      }
    });
  } else {
    next();
  }
}

export default validateUser;
