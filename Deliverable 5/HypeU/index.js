const api = require('./api/index')
const web = require('./web/index')

api.runRestServer()
web.runWebServer(8080)