var levelup = require('level');
var db = levelup('/tmp/res', {keyEncoding: 'binary', valueEncoding: 'json'});
module.exports = db;
