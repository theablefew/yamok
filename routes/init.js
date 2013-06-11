module.exports = function (app, opts) {
  var sessionRoutes = require('./sessionstore')(opts)

  app.get('/', sessionRoutes.root)
  app.post('/generate', sessionRoutes.generate)
  // app.get('/generate', sessionRoutes.generate)
}
