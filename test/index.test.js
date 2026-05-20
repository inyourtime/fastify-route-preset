import { test } from 'node:test'
import Fastify from 'fastify'
import fastifyRoutePreset, { fastifyRoutePreset as namedFastifyRoutePreset } from '../index.js'
import { presetSchema, presetVersion } from './fixtures/preset.js'
import routePlugin from './fixtures/route.js'
import route2Plugin from './fixtures/route2.js'
import { printRoutes } from './fixtures/utils.js'

test('register plugin success', async (t) => {
  t.plan(2)
  const fastify = Fastify()

  fastify.register(fastifyRoutePreset, {
    onPresetRoute: [],
  })

  await fastify.ready()

  t.assert.ok(fastify.hasPlugin('fastify-route-preset'))
  t.assert.strictEqual(fastifyRoutePreset, namedFastifyRoutePreset)
})

test('should require "onPresetRoute"', async (t) => {
  t.plan(2)
  const fastify = Fastify()

  fastify.register(fastifyRoutePreset).after((err) => {
    t.assert.ok(err)
    t.assert.strictEqual(err.message, '"onPresetRoute" must be a function or array of functions')
  })

  await fastify.ready()
})

test('"onPresetRoute" must be a function', async (t) => {
  t.plan(2)
  const fastify = Fastify()

  fastify
    .register(fastifyRoutePreset, {
      onPresetRoute: 1,
    })
    .after((err) => {
      t.assert.ok(err)
      t.assert.strictEqual(err.message, '"onPresetRoute" must be a function or array of functions')
    })

  await fastify.ready()
})

test('"onPresetRoute" must be a array of functions', async (t) => {
  t.plan(2)
  const fastify = Fastify()

  fastify
    .register(fastifyRoutePreset, {
      onPresetRoute: [null, 1],
    })
    .after((err) => {
      t.assert.ok(err)
      t.assert.strictEqual(err.message, '"onPresetRoute" must be a function or array of functions')
    })

  await fastify.ready()
})

test('should run "onPresetRoute"', async (t) => {
  t.plan(15)
  const fastify = Fastify()

  let runner = 0

  fastify.register(fastifyRoutePreset, {
    onPresetRoute: (routeOptions, presetOptions) => {
      runner++

      t.assert.ok(routeOptions)
      t.assert.ok(routeOptions.method)
      t.assert.ok(routeOptions.url)
      t.assert.ok(routeOptions.path)
      t.assert.ok(routeOptions.handler)

      if (routeOptions.method === 'POST') {
        t.assert.strictEqual(routeOptions.url, '/example/post')
      } else if (routeOptions.method === 'PUT') {
        t.assert.strictEqual(routeOptions.url, '/example/put')
      }

      t.assert.deepStrictEqual(presetOptions, {
        constraints: { version: '1.0.0' },
      })
    },
  })

  fastify.register(routePlugin, {
    preset: {
      constraints: { version: '1.0.0' },
    },
  })

  await fastify.ready()

  t.assert.strictEqual(runner, 2)
})

test('should apply presetOptions to routeOptions', async (t) => {
  t.plan(3)
  const fastify = Fastify()

  fastify.register(printRoutes)
  fastify.register(fastifyRoutePreset, {
    onPresetRoute: (routeOptions, presetOptions) => {
      routeOptions.constraints = {
        ...presetOptions.constraints,
        ...routeOptions.constraints,
      }
    },
  })

  fastify.register(routePlugin, {
    preset: {
      constraints: { version: '1.0.0' },
    },
  })

  await fastify.ready()

  const routes = fastify.routes()

  t.assert.strictEqual(routes.length, 2)
  t.assert.strictEqual(routes[0].constraints.version, '1.0.0')
  t.assert.strictEqual(routes[1].constraints.version, '1.0.0')
})

test('should apply schema to routeOptions', async (t) => {
  t.plan(3)
  const fastify = Fastify()

  fastify.register(printRoutes)
  fastify.register(fastifyRoutePreset, {
    onPresetRoute: (routeOptions, presetOptions) => {
      routeOptions.schema = {
        ...presetOptions.schema,
        ...routeOptions.schema,
      }
    },
  })

  fastify.register(routePlugin, {
    preset: {
      schema: { tags: ['example'] },
    },
  })

  await fastify.ready()

  const routes = fastify.routes()

  t.assert.strictEqual(routes.length, 2)
  t.assert.deepStrictEqual(routes[0].schema.tags, ['example'])
  t.assert.deepStrictEqual(routes[1].schema.tags, ['example'])
})

test('should work with multiple presets', async (t) => {
  t.plan(5)
  const fastify = Fastify()

  fastify.register(printRoutes)
  fastify.register(fastifyRoutePreset, {
    onPresetRoute: (routeOptions, presetOptions) => {
      routeOptions.schema = {
        ...presetOptions.schema,
        ...routeOptions.schema,
      }
    },
  })

  fastify.register(routePlugin, {
    prefix: '/route1',
    preset: {
      schema: { tags: ['route1'] },
    },
  })
  fastify.register(route2Plugin, {
    prefix: '/route2',
    preset: {
      schema: { tags: ['route2'] },
    },
  })

  await fastify.ready()

  const routes = fastify.routes()

  t.assert.strictEqual(routes.length, 4)
  t.assert.deepStrictEqual(routes[0].schema.tags, ['route1'])
  t.assert.deepStrictEqual(routes[1].schema.tags, ['route1'])
  t.assert.deepStrictEqual(routes[2].schema.tags, ['route2'])
  t.assert.deepStrictEqual(routes[3].schema.tags, ['route2'])
})

test('should work with array of "onPresetRoute"', async (t) => {
  t.plan(5)
  const fastify = Fastify()

  fastify.register(printRoutes)
  fastify.register(fastifyRoutePreset, {
    onPresetRoute: [presetSchema, presetVersion],
  })

  fastify.register(routePlugin, {
    preset: {
      schema: { tags: ['example'] },
      constraints: { version: '1.0.0' },
    },
  })

  await fastify.ready()

  const routes = fastify.routes()

  t.assert.strictEqual(routes.length, 2)
  t.assert.deepStrictEqual(routes[0].schema.tags, ['example'])
  t.assert.strictEqual(routes[0].constraints.version, '1.0.0')
  t.assert.deepStrictEqual(routes[1].schema.tags, ['example'])
  t.assert.strictEqual(routes[1].constraints.version, '1.0.0')
})

test('should ignore route preset if "skipPreset" config are true', async (t) => {
  t.plan(4)
  const fastify = Fastify({ exposeHeadRoutes: false })

  let presetCalls = 0

  fastify.register(printRoutes)
  fastify.register(fastifyRoutePreset, {
    onPresetRoute: (routeOptions, presetOptions) => {
      routeOptions.schema = {
        ...presetOptions.schema,
        ...routeOptions.schema,
      }

      presetCalls++
    },
  })

  fastify.register(
    async (fastify) => {
      fastify.get('/', async () => {
        return { users: [] }
      })

      fastify.get('/ignore', { config: { skipPreset: true } }, async () => {
        return { users: [] }
      })
    },
    {
      preset: {
        schema: { tags: ['users'] },
      },
    },
  )

  await fastify.ready()
  const routes = fastify.routes()

  t.assert.strictEqual(presetCalls, 1)
  t.assert.strictEqual(routes.length, 2)
  t.assert.deepStrictEqual(routes[0].schema.tags, ['users'])
  t.assert.strictEqual(routes[1].schema, undefined)
})

test('should work with "skipHeadRoutes" config (default)', async (t) => {
  t.plan(2)
  const fastify = Fastify({ exposeHeadRoutes: true })

  let presetCalls = 0
  const methods = []

  fastify.register(fastifyRoutePreset, {
    onPresetRoute: (routeOptions, _presetOptions) => {
      presetCalls++
      methods.push(routeOptions.method)
    },
  })

  fastify.register(
    async (fastify) => {
      fastify.get('/', async () => {
        return { users: [] }
      })
    },
    {
      preset: {
        schema: { tags: ['users'] },
      },
    },
  )

  await fastify.ready()

  t.assert.strictEqual(presetCalls, 2)
  t.assert.deepStrictEqual(methods.sort(), ['GET', 'HEAD'])
})

test('should work with "skipHeadRoutes" config is false', async (t) => {
  t.plan(2)
  const fastify = Fastify({ exposeHeadRoutes: true })

  let presetCalls = 0
  const methods = []

  fastify.register(fastifyRoutePreset, {
    skipHeadRoutes: false,
    onPresetRoute: (routeOptions, _presetOptions) => {
      presetCalls++
      methods.push(routeOptions.method)
    },
  })

  fastify.register(
    async (fastify) => {
      fastify.get('/', async () => {
        return { users: [] }
      })
    },
    {
      preset: {
        schema: { tags: ['users'] },
      },
    },
  )

  await fastify.ready()

  t.assert.strictEqual(presetCalls, 2)
  t.assert.deepStrictEqual(methods.sort(), ['GET', 'HEAD'])
})

test('should work with "skipHeadRoutes" config is true', async (t) => {
  t.plan(2)
  const fastify = Fastify({ exposeHeadRoutes: true })

  let presetCalls = 0
  const methods = []

  fastify.register(fastifyRoutePreset, {
    skipHeadRoutes: true,
    onPresetRoute: (routeOptions, _presetOptions) => {
      presetCalls++
      methods.push(routeOptions.method)
    },
  })

  fastify.register(
    async (fastify) => {
      fastify.get('/', async () => {
        return { users: [] }
      })
    },
    {
      preset: {
        schema: { tags: ['users'] },
      },
    },
  )

  await fastify.ready()

  t.assert.strictEqual(presetCalls, 1)
  t.assert.deepStrictEqual(methods, ['GET'])
})
