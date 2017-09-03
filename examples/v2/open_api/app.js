'use strict';

var SwaggerRestify = require('swagger-restify-mw');
var restify = require('restify');
var app = restify.createServer();
var winston = require('winston');
var fs = require('fs');
var yaml = require('js-yaml');
// This password and username are for sample purposes
var username = 'perrito', password = 'bonito';

module.exports = app;  // for testing

var config = {
  appRoot: __dirname  // required config
};

var swaggerDoc = yaml.safeLoad(
    fs.readFileSync(__dirname + '/api/swagger/swagger.yaml').toString());
SwaggerRestify.create(config, function(err, swaggerRestify) {
  if (err) {
    throw err;
  }
  app.use(restify.authorizationParser());
  app.pre(function(req, res, next) {
    winston.info('request', {
      url: req.url,
      headers: req.headers
    });
    next();
  });
  app.use(function(req, res, next) {
    // Allow swagger url to be available without credentials.
    if (req.url !== '/swagger') {
      if (!req.authorization || !req.authorization.basic ||
          !req.authorization.basic.username ||
          !req.authorization.basic.password) {
        return next(new restify.UnauthorizedError('Missing Credentials'));
      }
      if (req.authorization.basic.username !== username ||
          req.authorization.basic.password !== password) {
        return next(new restify.ForbiddenError('Bad Credentials'));
      }
    }
    next();
  });
  // Override swagger doc to use the host from which this endpoint was hit.
  app.get('/swagger', function(req, res, next) {
    swaggerDoc.host = req.headers.host;
    res.json(swaggerDoc);
  });
  swaggerRestify.register(app);
  var port = process.env.PORT || 8080;
  app.listen(port);
});
