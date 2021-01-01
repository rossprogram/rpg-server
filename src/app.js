import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import router from './routes';

const app = express();

app.set('secretKey', process.env.SECRET);

app.set('trust proxy', 1);

app.use(morgan('dev'));

const allowedOrigins = [
  'http://localhost:4000',
  'http://localhost:8080',
  'https://rpg.rossprogram.org',
];

const myCors = cors({
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(null, new Error('Access not permitted from the given Origin'),
        false);
    }

    return callback(null, true);
  },
});

// preflight for all routes
app.options('*', myCors);
app.use(myCors);
app.post(myCors);

app.use(bodyParser.json({
  strict: false,
  verify: (req, res, buf) => {
    req.rawBody = buf; // needed for stripe
  },
}));

// cookies actually aren't used in light of CORS, but we do use them
// in the tests.  Indeed, "Response to preflight request doesn't pass
// access control check: The value of the
// 'Access-Control-Allow-Origin' header in the response must not be
// the wildcard '*' when the request's credentials mode is 'include'."
app.use(cookieParser());

app.use('/', router);

export default app;
