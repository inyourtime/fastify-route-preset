import Fastify from 'fastify'
import fastifyRoutePreset from '../index.js'
import { printRoutes } from '../test/fixtures/utils.js'

const fastify = Fastify()

fastify.register(printRoutes)

// Register the plugin
fastify.register(fastifyRoutePreset, {
  onPresetRoute: (routeOptions, presetOptions) => {
    // Merge preset schema with route schema
    routeOptions.schema = {
      ...presetOptions.schema,
      ...routeOptions.schema,
    }
  },
})

// Apply preset to route group
fastify.register(
  async function (fastify) {
    fastify.get('/users', async () => {
      return { users: [] }
    })

    fastify.post('/users', async () => {
      return { created: true }
    })
  },
  {
    preset: {
      schema: {
        tags: ['users'],
        security: [{ bearerAuth: [] }],
      },
    },
  },
)

await fastify.ready()

console.dir(fastify.routes(), { depth: null })
