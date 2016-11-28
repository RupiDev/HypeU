const api = require('./api/index')
const web = require('./web/index')

api.runRestServer(9000)
web.runWebServer(8080)