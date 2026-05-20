const { test } = require('node:test')
const Fastify = require('fastify')
const fastifyRoutePresetModule = require('../index.js')

test('should support requiring the ESM entry from CommonJS', async (t) => {
  t.plan(3)

  const fastifyRoutePreset = fastifyRoutePresetModule.default
  const fastify = Fastify()

  fastify.register(fastifyRoutePreset, {
    onPresetRoute: [],
  })

  await fastify.ready()

  t.assert.strictEqual(typeof fastifyRoutePreset, 'function')
  t.assert.strictEqual(fastifyRoutePreset, fastifyRoutePresetModule.fastifyRoutePreset)
  t.assert.ok(fastify.hasPlugin('fastify-route-preset'))
})
