var QC = require('q-combinators');
var _ = require('lodash');

/**
 *  Returns a function which checks an object of promises for failures on required keys.
 *  The function will throw an error if any of the required keys are rejected.
 *  @param key Required keys are supplied as arguments
 */
module.exports = function demand () {
    var keys = [].slice.call(arguments);
    return function (objectOfPromises) {
        return QC.object.demand(keys, objectOfPromises)
            .then(function () {
                return QC.object.fulfilled(objectOfPromises);
            }, function (failures) {
                var messages = _.map(failures, getMessage);
                var error = _.minBy(_.toArray(failures), function (err) {
                    return err.statusCode || 500;
                });
                error.statusCode = error.statusCode || 500;
                error.allErrors = _.zipObject(_.keys(failures), messages)
                throw error;
            });
    }
}

function getMessage (error) {
    return '(' + (error.statusCode || '?') + '): ' + error.message;
}
