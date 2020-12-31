import realmModel from '../models/realms';

export function get(req, res, next) {
  realmModel.findById(req.params.realm, function(err, realm) {
    if (err) {
      res.status(404).send('Could not load realm');
    } else {
      if (req.jwt.user.canViewRealm(realm)) {
        delete realm.users;
        res.json(realm.toJSON());
      } else {
        res.status(403).send('Not permitted to view');        
      }
    }
  });
}

export function getUsers(req, res, next) {
  realmModel.findById(req.params.realm, function(err, realm) {
    if (err) {
      res.status(404).send('Could not load realm');
    } else {
      if (req.jwt.user.canViewRealmUsers(realm)) {
        res.json(realm.users);
      } else {
        res.status(403).send('Not permitted to view');        
      }
    }
  });
}

export function getAll(req, res, next) {
  realmModel.find({}, 'name')
    .exec((err, realms) => {
      if (err) return res.status(500).send('Error fetching realms');
      return res.json(realms.map((r) => r.toJSON()));
    });
}
