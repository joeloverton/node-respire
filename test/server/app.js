var express 	= require('express');
var engines		= require('consolidate');
var path		= require('path');
var http		= require('http');
var respire		= require('../../index');


var app = express();
app.engine('hbs', engines.handlebars);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, './views'));
app.set('env', 'production');
app.enable('view cache');
app.enable('trust proxy');

app.server = http.createServer(app);

app.server.listen(8000);

app.use(express.query());

// Create your routes
require('./register-routes')(app);

// Error pages
app.use(respire.middleware.errorPages({
    debug: true,
    debugParam: 'wtf'
}));

module.exports = app;