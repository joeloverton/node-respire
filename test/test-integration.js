var Q = require('q');
var request = require('supertest');
var app = require('./server/app');
require('should');

describe('respire with express 4.0', function () {
    it('should render data into templates', function (done) {
        request(app)
            .get('/user/bob')
            .expect('content-type', /text\/html/)
            .expect(200, '<b>Hello bob</b>')
            .end(done);
    });

    it('should stringify JSON and serve it with the appropriate mime type', function (done) {
        request(app)
            .get('/json')
            .expect(200)
            .expect('{"name":"nigella"}')
            .expect('content-type', /application\/json/)
            .end(done); 
    });

    it('should render an error page when required data rejects', function (done) {
        request(app)
            .get('/user/')
            .expect(404, 'Error: 404 no name')
            .end(done);
    });

    it('should render the error with the least status code', function (done) {
        request(app)
            .get('/fail/?required=504&required2=401&required3=404')
            .expect(401, 'Error: 401 A 401 error.')
            .end(done);
    });

    it('should render a stack trace when the debug param is provided', function (done) {
        request(app)
            .get('/fail/?required=504&required2=401&required3=404&wtf')
            .expect(401, /register-routes/)
            .end(done);
    });

    it('should serve the given status code on a RenderedContext', function (done) {
        request(app)
            .get('/201/jane')
            .expect(201)
            .end(done);
    });

});
