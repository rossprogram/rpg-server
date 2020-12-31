#!/usr/bin/env node

import "@babel/polyfill";
import app from './app';
import mongoose from './config/mongoose';

process.on('uncaughtException', (err, origin) => {
  console.log(err);
  console.log(err.stack);
  process.exit(1);
});

process.on('unhandledRejection', function(err){
  console.log(err.stack);
  process.exit(1);
});

mongoose.connection.on('error', err => {
  console.log(err);
});

mongoose.connection.on('connected', function () {
  const server = app.listen(process.env.PORT, () => {
    console.log(`Node server listening on port ${process.env.PORT}`);
  });
});
