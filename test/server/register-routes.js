var Q = require('q');
var respire = require('../../index');
var _ = require('lodash');

module.exports = function (app) {
    app.use(respire);
    app.get('/user', renderUserPage);
    app.get('/user/:name', renderUserPage);
    app.get('/json', renderSomeData);
    app.get('/fail', failSpectacularly);
    app.get('/201/:name', serve201)
    app.get('/201', serve201)

};

function renderUserPage(req, res, next) {
    req.process(getUserData)                // Get a bunch of template keys
        .then(respire.demand('name'))       // Make sure the 'name' key is set
        .then(res.renderInto('user'))       // Render the users page
        .then(res.renderInto('chrome'))     // Place the users page inside the page template
        .then(res.respond.withHTML)         // Serve the page to the user
        .catch(next)                        // Throw to the error middleware on error
        .done();                            // Humour Q
}

function renderSomeData (req, res, next) {
    Q({name: 'nigella'})               
        .then(res.renderInto(JSON.stringify))
        .then(res.respond.withJSON)
        .catch(next).done();
}

function failSpectacularly (req, res, next) {
    req.process(generateFailures)
        .then(respire.demand('required', 'required2', 'required3'))
        .then(res.respond.withJSON)
        .catch(next).done();
}

function generateFailures (req) {
    return _.zipObject(_.keys(req.query), _.map(req.query, function (n) {
        var e = new Error('A ' + n + ' error.');
        e.statusCode = parseInt(n, 10);
        return Q.reject(e);
    }));
}

function serve201 (req, res, next) {
    req.process(getUserData)  
        .then(respire.demand('name'))             
        .then(res.renderInto(JSON.stringify))
        .invoke('attr', 'status', 201)
        .then(res.respond.withJSON)
        .catch(res.respond.withErrorJSON)
        .catch(next)
        .done();
}

function getUserData (req) {
    var notFound = new Error('no name');
    notFound.statusCode = 404;
    return {
        name: req.params.name || Q.reject(notFound)
    }
}
