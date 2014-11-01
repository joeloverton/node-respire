node-respire
============

Respire: Expressive, Succinct Promise Interfaces for Routing in Express

## Usage

The middleware adds some promise-friendly sugar to req and res.

```javascript
var respire = require('respire');
app.use(respire);
```

A promise chain helps to organise the route function into steps.

```javascript
app.get('/u/:username', function (req, res, next) {
  req.process(getUserData)              // Grab all the async stuff needed to render this page
    .then(res.renderInto('pages/user')) // Render it into a template
    .then(res.respond.withHTML)         // Serve it up
    .catch(next)                        // If something goes wrong, explode
    .done();                            // Thank you Q, that will be all
});
```

res.renderInto uses res.render under the hood, so templates work exactly as you would expect.

The input to res.renderInto is the usual map of template fields, except they can all be promises.
The map itself can be promised too, if needs be. getUserData might look like this:

```javascript
function getUserData (req) {
  var userDetails;
  var username = req.params.username;

  return {
    username:       username,
    userDetails:    userDetails = getUserByUsername(username),
    userFollowing:  userDetails.get('id').then(getUserFollowing),
    userFeed:       userDetails.get('id').then(getUserFeed) 
  };
}
```
