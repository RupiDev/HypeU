// Implements web server for testing

const http         = require('http')
const finalhandler = require('finalhandler')
const serveStatic  = require('serve-static')

const serve = serveStatic('srv')

const server = http.createServer((req, res) => {
    serve(req, res, finalhandler(req, res))
})

function runWebServer(port) {
    server.listen(port)
}

module.exports.runWebServer = runWebServer