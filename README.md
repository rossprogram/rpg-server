## Running the server

To test this in a development environment, you should create a `.env`
file for [dotenv](https://www.npmjs.com/package/dotenv).  This might
look as follows for development.

```
PORT=4000
API_BASE=http://localhost:4000/
NODE_ENV=development

MONGODB_DATABASE=rossrpg
MONGODB_PASS=thepassword
MONGODB_USER=theuser
MONGODB_HOST=localhost
MONGODB_PORT=27017
```

In production, the backend is built via a [nix
expression](https://nixos.org/) called [default.nix](./default.nix)
which uses the pinned packages in [yarn.nix](./yarn.nix); this relies
on running [yarn2nix](https://github.com/moretea/yarn2nix), specifically

```
yarn2nix > yarn.nix
```

to capture the contents of `yarn.lock` in a format suitable for Nix.
