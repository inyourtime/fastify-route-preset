'use strict'

const fp = require('fastify-plugin')

const printRoutes = fp((fastify, _options, next) => {
  const routes = []

  fastify.decorate('routes', () => routes)

  fastify.addHook('onRoute', (routeOptions) => {
    routes.push(routeOptions)
  })

  next()
})

module.exports = {
  printRoutes,
}
