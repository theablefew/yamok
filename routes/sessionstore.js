
// var _         = require('underscore');
var _         = require('lodash/dist/lodash.underscore');
var beautify  = require('js-beautify').js_beautify;
var fs        = require('fs');
var browserByOS = {}, browserByOSKeys = [], redis;

module.exports = function sessionStoreRouteInit(opts) {
  var routes = {};
  redis = opts.sessionStore.client

  routes.root = function(req, res) {

    redis.get('seleniumBrowsers', function(err, response){
      if(!err) {
        response = JSON.parse(response);
        console.log(response);
        var osList = _.chain(response).map(function(os){
          return os.os
        }).uniq()
        osList = osList['__wrapped__'];

        for(var i=0; i<osList.length; i++) {
          browserByOS[osList[i]] = _.chain(response).where({os: osList[i]}).reject(function(os){
            var apiName = os.api_name;
            return (apiName.match(/proxy/ig) || apiName.match(/^chrome$/) || apiName.match(/^iehta$/));
          });
        }

        browserByOSKeys = _.chain(browserByOS).keys().sort().reverse();

        res.render('index.jade', {
          browser: JSON.stringify(browserByOS),
          os: JSON.stringify(browserByOSKeys['__wrapped__'])
        });
      }
    });
  };

  routes.generate = function(req, res){
    createJsonFile(req.body, generateFile, res);
  };

  return routes;
}

function generateFile(file, res) {
  var output = beautify(JSON.stringify(file), { indent_size: 4 });
  var browserJson = parseJson(file);
  res.json({
    os: browserJson.os,
    browsers: browserJson.browsers,
    versions: browserJson.versions,
    output: output
  })
}

function createJsonFile(data, callback, res){
  var browser = '';
  var chosenBrowsers = [];
  var osList = '';
  var browserList = '';
  var output = {};

  if(data.browser) {
    if(typeof data.browser === 'string') {
      var tmpArr = [];
      tmpArr.push(data.browser);
      data.browser = tmpArr;
    }

    redis.get('seleniumBrowsers', function(err, response){
      if(!err) {
        response = JSON.parse(response);
        osList = _.chain(response).map(function(os){
          return os.os
        }).uniq()
        osList = osList['__wrapped__'].sort().reverse();

        if(data.browser.length > 1) {
          _.each(data.browser, function(b){
            browser = JSON.parse(b);
            var stuff = _.where(response, {os: browser.os, api_name: browser.api_name.match(/chrome/) ? 'googlechrome' : browser.api_name, long_version: browser.long_version});
            if(!stuff[0].short_version)
              stuff[0].short_version = stuff[0].long_version.split('.')[0];
            chosenBrowsers.push(stuff);
          });
        } else {
          browser = JSON.parse(data.browser);
          var stuff = _.where(response, {os: browser.os, api_name: browser.api_name, long_version: browser.long_version});
          if(!stuff.short_version)
            stuff.short_version = stuff.long_version.split('.')[0];
          chosenBrowsers.push(stuff);
        }

        _.each(osList, function(os){
          output[os] = {};

          _.each(chosenBrowsers, function(b){
            if(b[0]) {
              if(os === b[0].os) {
                var name = b[0].long_name;
                if(!output[os][name]) output[os][name] = [];
                var newObj = { "version": b[0].long_version, "short_version": b[0].short_version, "full_os": os }
                output[os][name].push(newObj);
              }
            }
          });
          if(Object.keys(output[os]).length === 0) {
            delete output[os];
          }
        })

        callback(output, res);
      }
    });

  }

}

function parseJson(json) {
  var out = {
    os: null,
    browsers: null,
    versions: {}
  };

  out.os = _.keys(json);

  out.browsers = _.chain(out.os).map(function(os){ return _.keys(json[os]) }).flatten().uniq();
  out.browsers = out.browsers['__wrapped__'];

  _.chain(json).each(function(j){

    _.each(out.os, function(os){
      out.versions[os] = {};

      _.each(out.browsers, function(browser){
        out.versions[os][browser] = [];
        if(json[os][browser]) {
          for(var i=0; i<json[os][browser].length; i++){
            out.versions[os][browser].push(json[os][browser][i].short_version);
          }
        }

      });
    })
  });

  return out;
}