import Fastify from 'fastify'
import fastifyRoutePreset from '../index.js'
import { printRoutes } from '../test/fixtures/utils.js'

const fastify = Fastify()

fastify.register(printRoutes)

const presetSchema = (routeOptions, presetOptions) => {
  if (presetOptions.schema) {
    routeOptions.schema = {
      ...presetOptions.schema,
      ...routeOptions.schema,
    }
  }
}

const presetConstraint = (routeOptions, presetOptions) => {
  if (presetOptions.constraints) {
    routeOptions.constraints = {
      ...presetOptions.constraints,
      ...routeOptions.constraints,
    }
  }
}

const presetPreHandler = (routeOptions, presetOptions) => {
  if (presetOptions.preHandler) {
    const existingPreHandler = routeOptions.preHandler || []
    routeOptions.preHandler = [
      ...(Array.isArray(existingPreHandler) ? existingPreHandler : [existingPreHandler]),
      ...(Array.isArray(presetOptions.preHandler)
        ? presetOptions.preHandler
        : [presetOptions.preHandler]),
    ]
  }
}

// Register the plugin
fastify.register(fastifyRoutePreset, {
  onPresetRoute: [
    // Handler 1: Apply schema defaults
    presetSchema,
    // Handler 2: Apply constraints
    presetConstraint,
    // Handler 3: Apply hooks
    presetPreHandler,
  ],
})

// Apply preset to route group
fastify.register(
  async function (fastify) {
    fastify.get('/admin/users', {
      handler: async () => {
        return { adminUsers: [] }
      },
    })

    fastify.delete('/admin/users/:id', {
      handler: async () => {
        return { deleted: true }
      },
    })
  },
  {
    preset: {
      schema: {
        tags: ['admin'],
        security: [{ adminAuth: [] }],
      },
      constraints: {
        version: '2.0.0',
      },
      preHandler: [
        async (request) => {
          // Admin authentication logic
          if (!request.user?.isAdmin) {
            throw new Error('Admin required')
          }
        },
      ],
    },
  },
)

await fastify.ready()

console.dir(fastify.routes(), { depth: null })
