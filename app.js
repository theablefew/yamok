/**
 * Module dependencies.
 */
var express   = require('express');
var crypto    = require('crypto');
var http      = require('http');
var colors    = require('colors');
var fs        = require('fs');

var app = express();
var configuration = require('./config/environment');
var server = http.createServer(app);
var RedisStore = require('connect-redis')(express);
var sessionStore = new RedisStore;
var redis = sessionStore.client;
var randomBytes = crypto.randomBytes(100);
var randSecret = crypto.createHash('sha1').update(randomBytes).digest('hex');
var fs = require('fs');
var logFile = fs.createWriteStream('./log/'+ process.env.NODE_ENV + '.log', {flags: 'a'});

if(process.env.NODE_ENV == 'development') {
  var cp = require('child_process');
  var grunt = cp.spawn('grunt', ['--force', 'run']);
  grunt.stdout.on('data', function(data) {
    console.log("%s", data);
  });
}

app.configure(function () {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.cookieParser());
  app.use(express.session({ secret: randSecret }));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
  app.use(express.logger({format: 'dev', stream:logFile}));
  app.use(app.router);
  server.listen(configuration.app.port);
});

app.configure('development', function () {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function () {
  app.use(express.errorHandler());
});

app.configure('sandbox', function() {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

require('./routes/init')(app)
