var Q = require('q');
var respondTo = require('./respond-to');

Q.longStackSupport = true;

module.exports = function (opts) {
    var options = opts || {};
    var debug = options.debug;
    var debugParam = options.debugParam || 'debug';
    var errorDir = opts.errorDir || 'errors';
    var rethrow = opts.rethrowErrors;

    return function (err, req, res, next) {
        var respond = respondTo(req);
        debug && typeof req.query[debugParam] !== 'undefined'
            ? respond.withErrorJSON(err)
            : respond.withErrorPage(err, errorDir);
        rethrow && next(err);
    }
};