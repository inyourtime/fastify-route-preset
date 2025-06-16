import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import fastifyAutoload from '@fastify/autoload'
import Fastify from 'fastify'
import fastifyRoutePreset from '../index.js'
import { printRoutes } from '../test/fixtures/utils.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const fastify = Fastify({ exposeHeadRoutes: false })

fastify.register(printRoutes)

// Register the plugin
fastify.register(fastifyRoutePreset, {
  onPresetRoute: (routeOptions, presetOptions) => {
    // Merge preset schema with route schema
    routeOptions.schema = {
      ...presetOptions.schema,
      ...routeOptions.schema,
    }

    // Merge preset constraints with route constraints
    routeOptions.constraints = {
      ...presetOptions.constraints,
      ...routeOptions.constraints,
    }
  },
})

fastify.register(fastifyAutoload, {
  dir: join(__dirname, 'routes'),
  dirNameRoutePrefix: false,
})

await fastify.ready()

console.dir(fastify.routes(), { depth: null })
