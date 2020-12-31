import mongoose from 'mongoose';

const { MONGODB_DATABASE } = process.env;
const { MONGODB_HOST } = process.env;
const { MONGODB_PASS } = process.env;
const { MONGODB_PORT } = process.env;
const { MONGODB_USER } = process.env;

let mongoDB = 'mongodb://';

if (MONGODB_USER) {
  mongoDB += MONGODB_USER;
  if (MONGODB_PASS) {
    mongoDB = `${mongoDB}:${MONGODB_PASS}`;
  }
  mongoDB += '@';
}

if (MONGODB_HOST) {
  mongoDB += MONGODB_HOST;
} else {
  mongoDB += 'localhost';
}

if (MONGODB_PORT) {
  mongoDB = `${mongoDB}:${MONGODB_PORT}`;
}

if (MONGODB_DATABASE) {
  mongoDB = `${mongoDB}/${MONGODB_DATABASE}`;
}

mongoose.set('useUnifiedTopology', true);
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

mongoose.Promise = global.Promise;

mongoose.connect(mongoDB, { useNewUrlParser: true })
  .catch((error) => { console.log(error); });

export default mongoose;
