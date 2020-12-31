import userModel from './models/users';
import realmModel from './models/realms';
import { validateToken } from './middleware/identity';

const messageHandlers = {
};

function onConnection(ws) {
  ws.on('message', function incoming(message) {
    if (ws.authorized !== true) {
      let token = message.token;

      validateToken( token, function(err, user) {
        if (err) {
          ws.send(JSON.stringify({ type: 'error', parameters: [err] }));
        } else {
          // should put the user into the appropriate realms here and everything
          // announce this user has connected
          ws.user = user;
          ws.authorized = true;
        }
      });
    } else {
      if (typeof message.type === 'string') {
        if (messageHandlers[message.type]) {
          // call with this set to ws, and with message.parameters as the params
          (messageHandlers[message.type])(ws, message);
        } else {
          console.log('missing handler for',message);        
        }
      } else {
        console.log('unknown message type',message);
      }
    }
  });
}

export default onConnection;
