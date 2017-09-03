var chai = require('chai');
var should = require('should');
var expect = chai.expect;
var request = require('supertest');
var server = require('../../../app');
var uuid = require('node-uuid');
chai.use(require('chai-string'));

var inputName = 'input-' + uuid.v1();
var username = 'perrito', password = 'bonito';

var parameters = [
  {
    type: 'named_resource',
  },
  {type: 'server_named_resource'}, {
    type: 'body_named_resource',
  }
];
describe('Resource APIs', function() {
  parameters.forEach(function(parameter) {
    describe('API ' + parameter.type, function() {
      describe('Not found gives 404', function() {
        it('Get -> 404', function(done) {
          request(server)
              .get('/' + parameter.type + '/not_found')
              .set('Accept', 'application/json')
              .auth(username, password)
              .expect('Content-Type', /json/)
              .expect(404)
              .end(function(err, res) {
                should.not.exist(err);
                expect(res.body.body).to.deep.equal({
                  code: 'NotFoundError',
                  message: 'not_found is not found'
                });
                done();
              });
        });
        it('Delete -> 404', function(done) {
          request(server)
              .delete('/' + parameter.type + '/not_found')
              .set('Accept', 'application/json')
              .auth(username, password)
              .expect('Content-Type', /json/)
              .expect(404)
              .end(function(err, res) {
                should.not.exist(err);
                expect(res.body.body).to.deep.equal({
                  code: 'NotFoundError',
                  message: 'not_found is not found'
                });
                done();
              });
        });
        it('Update -> 404', function(done) {
          request(server)
              .put('/' + parameter.type + '/not_found')
              .send({message: 'something'})
              .set('Accept', 'application/json')
              .auth(username, password)
              .expect('Content-Type', /json/)
              .expect(404)
              .end(function(err, res) {
                should.not.exist(err);
                expect(res.body.body).to.deep.equal({
                  code: 'NotFoundError',
                  message: 'not_found is not found'
                });
                done();
              });
        });
      });
      describe('No credentials 401', function() {
        it('Get -> 401', function(done) {
          request(server)
              .get('/' + parameter.type + '/not_found')
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(401)
              .end(function(err, res) {
                should.not.exist(err);
                expect(res.body).to.deep.equal({
                  code: 'UnauthorizedError',
                  message: 'Missing Credentials'
                });
                done();
              });
        });
        it('Create -> 401', function(done) {
          var postPath = '/' + parameter.type;
          if (parameter.type === 'named_resource') {
            postPath += '/a_resource';
          }
          request(server)
              .post(postPath)
              .set('Accept', 'application/json')
              .send({message: 'something'})
              .expect('Content-Type', /json/)
              .expect(401)
              .end(function(err, res) {
                should.not.exist(err);
                expect(res.body).to.deep.equal({
                  code: 'UnauthorizedError',
                  message: 'Missing Credentials'
                });
                done();
              });
        });
        it('Update -> 401', function(done) {
          request(server)
              .put('/' + parameter.type + '/not_found')
              .set('Accept', 'application/json')
              .send({message: 'something'})
              .expect('Content-Type', /json/)
              .expect(401)
              .end(function(err, res) {
                should.not.exist(err);
                expect(res.body).to.deep.equal({
                  code: 'UnauthorizedError',
                  message: 'Missing Credentials'
                });
                done();
              });
        });
        it('Delete -> 401', function(done) {
          request(server)
              .delete('/' + parameter.type + '/not_found')
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(401)
              .end(function(err, res) {
                should.not.exist(err);
                expect(res.body).to.deep.equal({
                  code: 'UnauthorizedError',
                  message: 'Missing Credentials'
                });
                done();
              });
        });
      });
      describe('Bad credentials 403', function() {
        it('Get -> 403', function(done) {
          request(server)
              .get('/' + parameter.type + '/not_found')
              .set('Accept', 'application/json')
              .auth('gato', 'feo')
              .expect('Content-Type', /json/)
              .expect(401)
              .end(function(err, res) {
                expect(res.body).to.deep.equal({
                  code: 'ForbiddenError',
                  message: 'Bad Credentials'
                });
                done();
              });
        });
        it('Create -> 403', function(done) {
          var postPath = '/' + parameter.type;
          if (parameter.type === 'named_resource') {
            postPath += '/a_resource';
          }
          request(server)
              .post(postPath)
              .auth('gato', 'feo')
              .set('Accept', 'application/json')
              .send({message: 'something'})
              .expect('Content-Type', /json/)
              .expect(401)
              .end(function(err, res) {
                expect(res.body).to.deep.equal({
                  code: 'ForbiddenError',
                  message: 'Bad Credentials'
                });
                done();
              });
        });
        it('Update -> 403', function(done) {
          request(server)
              .put('/' + parameter.type + '/not_found')
              .auth('gato', 'feo')
              .set('Accept', 'application/json')
              .send({message: 'something'})
              .expect('Content-Type', /json/)
              .expect(403)
              .end(function(err, res) {
                expect(res.body).to.deep.equal({
                  code: 'ForbiddenError',
                  message: 'Bad Credentials'
                });
                done();
              });
        });
        it('Delete -> 403', function(done) {
          request(server)
              .delete('/' + parameter.type + '/not_found')
              .auth('gato', 'feo')
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(401)
              .end(function(err, res) {
                expect(res.body).to.deep.equal({
                  code: 'ForbiddenError',
                  message: 'Bad Credentials'
                });
                done();
              });
        });
      });
      describe('Create & Update tests', function() {
        var name;
        var path;
        var returnedName;
        var resource;
        before(function(done) {
          name = parameter.type + '-' + uuid.v1();
          var body = {message: 'My first message'};
          var postPath = '/' + parameter.type;
          if (parameter.type === 'body_named_resource') {
            body.name = name;
          }
          if (parameter.type === 'named_resource') {
            postPath += '/' + name;
          }
          request(server)
              .post(postPath)
              .set('Content-Type', 'application/json')
              .auth(username, password)
              .send(body)
              .expect('Content-Type', /json/)
              .expect(200)
              .end(function(err, res) {
                should.not.exist(err);
                should.exist(res.body.name);
                res.body.message.should.eql('My first message');
                should.exist(res.body.fingerprint);
                returnedName = res.body.name;
                if (parameter.type === 'server_named_resource') {
                  expect(returnedName).to.startsWith('server-');
                } else {
                  expect(returnedName).to.equal(name);
                }
                path = '/' + parameter.type + '/' + returnedName;
                resource = res.body;
                done();
              });
        });
        after(function(done) {
          request(server)
              .delete(path)
              .set('Accept', 'application/json')
              .auth(username, password)
              .expect('Content-Type', /json/)
              .expect(200)
              .end(function(err, res) {
                should.not.exist(err);
                request(server)
                    .get(path)
                    .auth(username, password)
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(404)
                    .end(function(err, res) {
                      should.not.exist(err);
                      expect(res.body.body).to.deep.equal({
                        code: 'NotFoundError',
                        message: returnedName + ' is not found'
                      });
                      done();
                    });
              });
        });
        it('Update no fingerprint gives 412', function(done) {
          request(server)
              .put(path)
              .auth(username, password)
              .send({message: 'My second message'})
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(412)
              .end(function(err, res) {
                should.not.exist(err);
                expect(res.body.message)
                    .to.contain('Fingerprint does not match');
                done();
              });
        });
        it('Update bad fingerprint gives 412', function(done) {
          request(server)
              .put(path)
              .auth(username, password)
              .send(
                  {message: 'My second message', fingerprint: 'bad fingerpint'})
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(412)
              .end(function(err, res) {
                should.not.exist(err);
                expect(res.body.message)
                    .to.contain('Fingerprint does not match');
                done();
              });
        });
        it('Update changes fingerprint and get, gets new value', function(
                                                                     done) {
          request(server)
              .put(path)
              .auth(username, password)
              .send({
                message: 'My second message',
                fingerprint: resource.fingerprint
              })
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(200)
              .end(function(err, res) {
                should.not.exist(err);
                res.body.message.should.eql('My second message');
                should.exist(res.body.fingerprint);
                expect(res.body.fingerprint)
                    .to.not.be.equal(resource.fingerprint);
                request(server)
                    .get(path)
                    .auth(username, password)
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function(err, getRes) {
                      should.not.exist(err);
                      getRes.body.message.should.eql('My second message');
                      should.exist(getRes.body.fingerprint);
                      // Fingerprint must change!
                      expect(res.body.fingerprint)
                          .to.not.be.equal(resource.fingerprint);
                      expect(getRes.fingerprint).to.be.equal(res.fingerprint);
                      done();
                    });
              });
        });
      });
    });
  });
});
