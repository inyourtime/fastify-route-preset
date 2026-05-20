import { dirname, join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import fastifyAutoload from '@fastify/autoload'
import Fastify from 'fastify'
import fastifyRoutePreset from '../index.js'
import { presetSchema, presetVersion } from './fixtures/preset.js'
import { printRoutes } from './fixtures/utils.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

test('should work with @fastify/autoload', async (t) => {
  t.plan(9)
  const fastify = Fastify({ exposeHeadRoutes: false })

  fastify.register(printRoutes)
  fastify.register(fastifyRoutePreset, {
    onPresetRoute: [presetSchema, presetVersion],
  })

  fastify.register(fastifyAutoload, {
    dir: join(__dirname, 'fixtures/routes'),
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

  fastify.register(printRoutes)
  fastify.register(fastifyRoutePreset, {
    onPresetRoute: [presetSchema, presetVersion],
  })

  fastify.register(fastifyAutoload, {
    dir: join(__dirname, 'fixtures/users'),
    dirNameRoutePrefix: false,
    options: { prefix: '/user' },
  })
  fastify.register(fastifyAutoload, {
    dir: join(__dirname, 'fixtures/products'),
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
