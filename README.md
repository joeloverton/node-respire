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

### req.process

`req.process` simply wraps a function call using `Q.fcall(fn, req, res)`.


### res.renderInto

`res.renderInto` uses `res.render` under the hood, so templates work as they ever did.

The input to `res.renderInto` is the usual map of template fields, except they can all be promises.
The map itself can be promised too, if needs be. So `getUserData` might look like this:

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

The output of `res.renderInto` is a `RenderedContext`. It wraps the original data and a record of any failed promises. This is great for debugging, and can also be useful in template logic when composing subviews.


### res.respond

`res.respond` provides `withHTML`, `withJSON`, `withErrorPage` and `withErrorJSON`. 


## Error handling

I/O can be unreliable. Some types of failure might not be recoverable. For example, if the `userDetails` promise rejects, the user profile can't be rendered. To throw a tantrum if mandatory fields are missing, `respire.demand` can be used. It's backed by `object.demand` from the excellent [q-combinators](https://github.com/beamly/q-combinators) library by [Beamly](http://inside.beamly.com).

```javascript
app.get('/u/:username', function (req, res, next) {
  req.process(getUserData)                
    .then(respire.demand('userDetails', 'userFeed'))  // Rejects if a demanded key rejected
    .then(res.renderInto('pages/user'))   
    .then(res.respond.withHTML)           
    .catch(res.respond.withErrorPage)                 // If something goes wrong, serve an error page
    .done();                              
});
```

Problems of this nature usually call for an error page. `res.respond.withErrorPage` will serve one.
  - It expects `err.statusCode` to be an HTTP error code (e.g. `401`)
  - It expects a template to exist for that code in `<views>/errors` (e.g. `401.hbs` or, failing that, `4xx.hbs`)


### respire.middleware.errorPages

The error page middleware ensures that all types of unhandled error on all routes result in error pages being served. It also provides some options.

```javascript
app.use(respire.middleware.errorPages({
    debug: true,          // Enable the debug feature
    debugParam: 'debug',  // The query parameter which shows debug info
    errorDir: 'errors',   // The location of the error templates
    rethrowErrors: false  // Enable this if there is more error handling middleware to come
}));
```
The `?debug` feature gives you access to a stack trace for the error. If the error represents multiple failed required fields, they will all be listed.


## Composing views

It's common to render pages from multiple views. A template field can be a promise for another RenderedContext:

```javascript
function getUserData (req, res) {
  var userDetails;
  var username = req.params.username;

  return {
    username:           username,
    userDetails:        userDetails = getUserByUsername(username),
    renderedFollowing:  userDetails.get('id')
                          .then(getUserFollowing)
                          .then(res.renderInto('components/following')),
    renderedFeed:       userDetails.get('id')
                          .then(getUserFeed)
                          .then(res.renderInto('components/feed')) 
  };
}
```

It's also possible to render the output of one view straight into another:

```javascript
app.get('/u/:username', function (req, res, next) {
  req.process(getUserData)                
    .then(res.renderInto('pages/user'))  
    .then(res.renderInto('chrome/standard-page'))   // Input will be the RenderedContext from the previous view
    .then(res.respond.withHTML)           
    .catch(next)              
    .done();                              
});
```

Here's `chrome/standard-page.hbs`:

```html
<html>
  <head>
    <title>{{this.data.userDetails.displayName}}</title>
  </head>
  <body>
    {{{this}}}
  </body>
</html>
```

## Future plans

Next up:-
- Shorthand for render + respond (as you expect from res.render)
- Debugging rendered pages (i.e to see which promises rejected and why)
- Grouping other logging activity by the pageView which triggered it
- A good pattern for setting headers, serving redirects, etc.
