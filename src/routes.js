import express from 'express';
import rateLimit from 'express-rate-limit';
import * as userController from './controllers/users';
import identity from './middleware/identity';

const router = express.Router();

const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 250,
  message: 'Too many API requests from this IP; please try again after a few minutes.',
});
router.use(apiLimiter);

// ## GET /users/:user/authorize
//
// Log in as the given user.  Password is sent in the `Authorization:
// Basic` header.  Responds by setting a cookie containing a JWT or
// sending the token.
router.get('/users/anonymous/token', userController.anonymousToken);
router.get('/users/:user/token', userController.findUser, userController.token);
router.get('/users/:user/authorize', userController.findUser, userController.authorize);

router.use(identity);

router.get('/users', userController.getAll);
router.get('/users/:user', userController.findUser, userController.get);

router.put('/users/:user', userController.findUser, userController.put);
router.patch('/users/:user', userController.findUser, userController.put);

export default router;
