'use strict'

const { test } = require('node:test')
const Fastify = require('fastify')
const fastifyRoutePreset = require('..')
const path = require('node:path')
const fastifyAutoload = require('@fastify/autoload')

test('should work with @fastify/autoload', async (t) => {
  t.plan(9)
  const fastify = Fastify({ exposeHeadRoutes: false })

  fastify.register(require('./fixtures/utils').printRoutes)
  fastify.register(fastifyRoutePreset, {
    onPresetRoute: [
      require('./fixtures/preset').presetSchema,
      require('./fixtures/preset').presetVersion,
    ],
  })

  fastify.register(fastifyAutoload, {
    dir: path.join(__dirname, 'fixtures/routes'),
    dirNameRoutePrefix: false,
  })

  await fastify.ready()

  const routes = fastify.routes()

  t.assert.strictEqual(routes.length, 4)

  for (const route of routes) {
    t.assert.strictEqual(route.constraints.version, '1.0.0')

    if (route.url.startsWith('/user')) {
      t.assert.deepStrictEqual(route.schema.tags, ['user'])
    } else if (route.url.startsWith('/product')) {
      t.assert.deepStrictEqual(route.schema.tags, ['product'])
    }
  }
})

test('should work with @fastify/autoload (multiple instances)', async (t) => {
  t.plan(9)
  const fastify = Fastify({ exposeHeadRoutes: false })

  fastify.register(require('./fixtures/utils').printRoutes)
  fastify.register(fastifyRoutePreset, {
    onPresetRoute: [
      require('./fixtures/preset').presetSchema,
      require('./fixtures/preset').presetVersion,
    ],
  })

  fastify.register(fastifyAutoload, {
    dir: path.join(__dirname, 'fixtures/users'),
    dirNameRoutePrefix: false,
    options: { prefix: '/user' },
  })
  fastify.register(fastifyAutoload, {
    dir: path.join(__dirname, 'fixtures/products'),
    dirNameRoutePrefix: false,
    options: { prefix: '/product' },
  })

  await fastify.ready()

  const routes = fastify.routes()

  t.assert.strictEqual(routes.length, 4)

  for (const route of routes) {
    t.assert.strictEqual(route.constraints.version, '1.0.0')

    if (route.url.startsWith('/user')) {
      t.assert.deepStrictEqual(route.schema.tags, ['user'])
    } else if (route.url.startsWith('/product')) {
      t.assert.deepStrictEqual(route.schema.tags, ['product'])
    }
  }
})
