/**
    Respire: Expressive, Succinct Promise Interfaces for Routing in Express
*/

var Q = require('q');
var QC  = require('q-combinators');
var _   = require('lodash');
var render = require('./src/render');
var respondTo = require('./src/respond-to');

/**
    Middleware to add useful APIs to req and res
*/
module.exports = function respire (req, res, next) {
    req.process = function (fn) {
        return Q.fcall(fn, req, res);
    };
    res.renderInto = renderInto;
    res.respond = respondTo(req);
    next();
}

var api = {
    
    middleware: {
        // An error handling middleware for serving error pages from templates
        errorPages: require('./src/error')
    },

    demand: require('./src/demand'),
    extend: require('./src/extend')

};

_.extend(module.exports, api);

function renderInto (template) {
    return _.partial(render, template, this);       
}


