var _ = require('lodash');
var Q = require('q');

/**
 *  Partial application of _.extend
 */
module.exports = Q.promised(function () {
    return _.partialRight(_.bind(_.extend, _), [].slice.call(arguments));
})   