# RPG API

## Users

### GET /users/:user

Get information about a user.

### PUT /users/:user
### PATCH /users/:user

Update a user.

### GET /users/:user/token

Log in as the given user.  Password is sent in the `Authorization:
Basic` header.  Responds by returning a token in the body containing a
JWT.

### GET /users/anonymous/token

Log in as an anonymous user.  Responds by returning a token in the
body containing a JWT.

