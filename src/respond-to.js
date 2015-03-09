var Q = require('q');
var _ = require('lodash');
var render = require('./render');
var path = require('path');
var extend = require('./extend');


module.exports = respondTo;

function respondTo (reqOrRes) {

    var res = reqOrRes.res || reqOrRes;
    var req = res.req;

    var respondWith = function (headers, renderedContext) {
        var statusCode = renderedContext.attr && renderedContext.attr('status') || '200';
        res.set(headers || {})
            .status(statusCode)
            .send(renderedContext.toString());
        return res;
    };

    var respond  = {

        withJSON: _.partial(respondWith, {'Content-Type': 'application/json'}),

        withHTML: _.partial(respondWith, {'Content-Type': 'text/html'}),

        with: function (headers) {
            return _.partial(respondWith, headers);
        },

        withErrorJSON: function (err) {
            return Q({
                error: {
                    message: err.message,
                    status: err.statusCode,
                    stack: err.stack.split(/\n/)
                }
            })
                .then(res.renderInto(JSON.stringify))
                .invoke('attr', 'status', err.statusCode || '500')
                .then(res.respond.withJSON);
        },

        withErrorPage: function (err, errorPath) {
            
            errorPath = errorPath || 'errors';

            var errCode = err.statusCode || 500;
            var fields = {
                code: errCode,
                message: err.message
            };
            var exactTemplate = path.join(errorPath, errCode+'');
            var generalTemplate = path.join(errorPath, Math.floor(errCode / 100) + 'xx');

            return render(exactTemplate, res, fields)
                .fail(_.partial(render, generalTemplate, res, fields))
                .invoke('attr', 'status', errCode)
                .then(respond.withHTML) 
                .fail(respond.withError);

        }
    };

    return respond;
}

function getValue (val) {
    if (_.isFunction(val)) {
        return val();
    } else {
        return val;
    }
}