import { v4 as uuidv4 } from 'uuid';
import redis from 'redis';
import userModel from './models/users';
import { validateToken } from './middleware/identity';

const clients = {};

const subscriber = redis.createClient();
const publisher = redis.createClient();

subscriber.on('message', (channel, message) => {
  const state = JSON.parse(message);
  Object.keys(clients[channel]).forEach( (uuid) => {
    const ws = clients[channel][uuid];
    if (state.uuid !== uuid) {
      ws.send(JSON.stringify({ type: 'update', parameters: [state] }));
    }
  });
});

const messageHandlers = {
  update(ws, message) {
    // FIXME: validate the message parameters
    const state = { uuid: ws.uuid };
    Object.assign(state, message.parameters[0]);
    publisher.publish(ws.origin, JSON.stringify(state));
  },
};

// FIXME: need to remove dead clients from list
function onConnection(ws, req) {
  ws.on('message', (msg) => {
    try {
      const message = JSON.parse(msg);

      if (typeof message === 'object') {
        if (ws.authorized !== true) {
          const { token } = message;

          validateToken(token, (err, user) => {
            if (err) {
              ws.send(JSON.stringify({ type: 'error', parameters: [err.toString()] }));
            } else if (user.domains.includes(req.headers.origin)) {
              ws.user = user;
              ws.authorized = true;
              ws.uuid = uuidv4();
              ws.origin = req.headers.origin;

              if (!(ws.origin in clients)) clients[ws.origin] = {};
              clients[ws.origin][ws.uuid] = ws;

              subscriber.subscribe(ws.origin);

              ws.send(JSON.stringify({ type: 'hello' }));
            } else {
              const e = new Error('User is not a member of Origin.');
              ws.send(JSON.stringify({ type: 'error', parameters: [e.toString()] }));
            }
          });
        } else if (typeof message.type === 'string') {
          if (messageHandlers[message.type]) {
            // call with this set to ws, and with message.parameters as the params
            (messageHandlers[message.type])(ws, message);
          } else {
            console.log('missing handler for', message);
          }
        } else {
          console.log('unknown message type', message);
        }
      } else {
        const e = new Error('typeof JSON.parse(payload) is not "object"');
        ws.send(JSON.stringify({ type: 'error', parameters: [e.toString()] }));
      }
    } catch (err) {
      ws.send(JSON.stringify({ type: 'error', parameters: [err.toString()] }));
    }
  });
}

export default onConnection;
