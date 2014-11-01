var _ = require('lodash'),
    Q = require('q'),
    QC = require('q-combinators');

/**
 *    
 */
module.exports = Q.promised(function (template, res, fields) {
    var dataPromises = inventory(fields);
    var rendered = dataPromises.get('fulfilled').then(_.partial(doRender, template, res));
    return Q.spread([dataPromises, rendered], function (data, rendered) {
        return new RenderedContext(rendered, {
            data: data.fulfilled,
            rejected: data.rejected
        }); 
    });
});

function inventory (objectOfPromises) {
    return QC.object.fulfilled({
        fulfilled: QC.object.fulfilled(objectOfPromises),
        rejected: QC.object.rejected(objectOfPromises).then(getReasonStacks)    
    });
}

function getReasonStacks (reasons) {
    return _.mapValues(reasons, function (res) { return res.stack.split(/\n/) })
};

function doRender (templateName, res, data) {
    if (_.isFunction(templateName)) {
        return templateName(data);
    }
    return Q.ninvoke(res, 'render', templateName, data);
}

function RenderedContext(content, data) {
    var content = content;
    var attributes = {
        status: 200
    };
    _.extend(this, data);
    this.toString = function () {
        return content;
    };
    this.attr = function (key, val) {
        if (typeof val !== 'undefined') {
            attributes[key] = val;
            return this;
        } else {
            return attributes[key];
        }
    }
}