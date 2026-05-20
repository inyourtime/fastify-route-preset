const { test } = require('node:test')
const Fastify = require('fastify')
const fastifyRoutePreset = require('../index.js')

test('should support requiring the ESM entry from CommonJS', async (t) => {
  t.plan(1)
  const fastify = Fastify()

  fastify.register(fastifyRoutePreset, {
    onPresetRoute: [],
  })

  await fastify.ready()

  t.assert.ok(fastify.hasPlugin('fastify-route-preset'))
})
